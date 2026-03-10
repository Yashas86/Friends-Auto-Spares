const fetch = require("node-fetch");
const express = require("express");

const app = express();
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");

app.use(cors());
app.use(express.json());

const ORDERS_FILE = "./orders.json";
const JWT_SECRET = "super_secret_key_change_this";

// ✅ Replace with your REAL test keys
const razorpay = new Razorpay({
  key_id: "rzp_test_SHdoRZz35PXXFp",
  key_secret: "kvfqbWomnqVsY60duf07nShO",
});

// Fake admin
const ADMIN = {
  email: "yashaskrishna22@gmail.com",
  passwordHash: bcrypt.hashSync("admin123", 10),
};

if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
}

// 🔐 Admin Login
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN.email) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, ADMIN.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
});

// 🛡️ Middleware
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") throw new Error();
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// 🧾 Save order (public)
app.post("/orders", (req, res) => {
  const newOrder = {
    id: Date.now(),
    user: req.body.user,
    items: req.body.items,
    total: req.body.total,
    method: req.body.method,
    paymentId: req.body.paymentId || null,
    address: req.body.address,
    city: req.body.city,
    pincode: req.body.pincode,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
  };

  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  orders.push(newOrder);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

  res.json({ success: true, order: newOrder });
});


// 🔐 Admin-only: Get all orders
app.get("/orders", requireAdmin, (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  res.json(orders);
});

// 🔐 Admin-only: Update status
app.put("/orders/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  const order = orders.find((o) => o.id === id);

  if (!order) return res.status(404).send("Not found");

  order.status = req.body.status;
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  res.json({ success: true });
});

// 💳 Razorpay Order API
app.post("/create-order", async (req, res) => {
  const { amount } = req.body; // ₹

  if (!amount) return res.status(400).json({ error: "Amount required" });

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // ₹ to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
    console.error("Razorpay Error:", err);
    res.status(500).json({ error: "Razorpay order failed" });
  }
});




// reverse geocode route
app.get("/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "friends-auto-spares-app"
      }
    });

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch address" });
  }
});

