// Load environment variables if dotenv is available
try {
  require("dotenv").config();
} catch (e) {
  // In production, environment variables are injected directly by the host (Render)
}

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const fetch = require("node-fetch");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const ORDERS_FILE = "./orders.json";
const PORT = Number(process.env.PORT) || 10000;
const HOST = "0.0.0.0";
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_change_this";

// Razorpay Credentials read exclusively from process.env (NO hardcoded fallback)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn("⚠️ Warning: Razorpay credentials are not set in environment variables.");
}

// Admin configuration from environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "yashaskrishna22@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const adminPasswordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);

// Helper functions for safe orders.json read and write
function readOrdersSafe() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(ORDERS_FILE, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Failed to read orders file:", err.message);
    return [];
  }
}

function writeOrdersSafe(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return true;
  } catch (err) {
    console.error("Failed to write orders file:", err.message);
    return false;
  }
}

// Ensure orders file exists on startup
if (!fs.existsSync(ORDERS_FILE)) {
  writeOrdersSafe([]);
}

// 🩺 Simple Health Check Endpoints
app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", message: "Friends Auto Spares Backend Running" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// 🔐 Admin Login
app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, adminPasswordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// 🛡️ Admin Middleware
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") throw new Error("Not authorized");
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// 🧾 Save order (public)
app.post("/orders", (req, res) => {
  try {
    const newOrder = {
      id: req.body.id || Date.now(),
      user: req.body.user,
      items: req.body.items,
      total: req.body.total,
      method: req.body.method,
      paymentId: req.body.paymentId || null,
      address: req.body.address,
      city: req.body.city,
      pincode: req.body.pincode,
      status: req.body.status || "Confirmed",
      createdAt: req.body.createdAt || new Date().toISOString(),
    };

    const orders = readOrdersSafe();
    orders.push(newOrder);
    writeOrdersSafe(orders);

    res.json({ success: true, order: newOrder });
  } catch (err) {
    console.error("Order save error:", err.message);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// 🔐 Admin-only: Get all orders
app.get("/orders", requireAdmin, (_req, res) => {
  try {
    const orders = readOrdersSafe();
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 🔐 Admin-only: Update status
app.put("/orders/:id", requireAdmin, (req, res) => {
  try {
    const id = Number(req.params.id);
    const orders = readOrdersSafe();
    const order = orders.find((o) => o.id === id);

    if (!order) return res.status(404).send("Not found");

    order.status = req.body.status;
    writeOrdersSafe(orders);
    res.json({ success: true });
  } catch (err) {
    console.error("Order update error:", err.message);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// 💳 Razorpay Order API
app.post("/create-order", async (req, res) => {
  const { amount } = req.body || {};

  if (!amount) return res.status(400).json({ error: "Amount required" });

  if (!razorpay) {
    return res.status(500).json({ error: "Razorpay is not configured on the server" });
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // ₹ to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    res.json({
      ...order,
      key: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order creation error:", err.message || err);
    res.status(500).json({ error: "Razorpay order failed" });
  }
});

// 💳 Razorpay Payment Verification API (HMAC SHA-256)
app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing required payment verification parameters" });
  }

  if (!RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: "Razorpay secret key not configured on server" });
  }

  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.json({ success: true, verified: true });
    } else {
      return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }
  } catch (err) {
    console.error("Payment verification error:", err.message);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

// 🗺️ Reverse geocode route
app.get("/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query || {};

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon parameters are required" });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "friends-auto-spares-app",
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Reverse geocode error:", err.message);
    res.status(500).json({ error: "Failed to fetch address" });
  }
});

// Prevent crash on uncaught errors
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

app.listen(PORT, HOST, () => {
  console.log(`Backend running on port ${PORT}`);
});
