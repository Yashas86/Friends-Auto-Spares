import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { supabase } from "../supabase";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


const isMobile = () => window.innerWidth <= 768;

// Smooth fly animation
function FlyToLocation({ pos }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();      // ✅ FIX
    map.flyTo(pos, 16, { duration: 1.5 });
  }, [pos, map]);

  return null;
}

function DraggableMarker({ pos, setPos, setAddress, setCity, setPincode }) {
  return (
    <Marker
      position={pos}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          setPos([lat, lng]);
          fetchAddress(lat, lng, setAddress, setCity, setPincode);
        },
      }}
    >
      <Popup>Drag me</Popup>
    </Marker>
  );
}

async function fetchAddress(lat, lng, setAddress, setCity, setPincode) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    const data = await res.json();

    const fullAddress = data.display_name || "";

    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.state ||
      "";

    const pincode = data.address?.postcode || "";

    setAddress(fullAddress);
    setCity(city);
    setPincode(pincode);

  } catch (err) {
    console.error(err);
    alert("Failed to fetch address");
  }
}

export default function Checkout({ cart,setCart, currentUser }) {
  const navigate = useNavigate();

  const savedAddress = JSON.parse(
    localStorage.getItem(`address_${currentUser.email}`) || "null"
  );

  const [pos, setPos] = useState([12.9716, 77.5946]);
  const [address, setAddress] = useState(savedAddress?.address || "");
  const [city, setCity] = useState(savedAddress?.city || "");
  const [pincode, setPincode] = useState(savedAddress?.pincode || "");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [fullMap, setFullMap] = useState(false);

  useEffect(() => {
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
  }, 300);
}, [fullMap]);

  useEffect(() => {
    if (!cart.length) navigate("/cart");
  }, [cart, navigate]);

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.price, 0),
    [cart]
  );

  const getLiveLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (geo) => {
      const { latitude, longitude } = geo.coords;

      // ✅ Fullscreen ONLY on mobile
      if (isMobile()) {
        setFullMap(true);
      }

      setPos((currentPos) => {
        let [startLat, startLng] = currentPos;
        let steps = 20;
        let i = 0;

        const animate = setInterval(() => {
          i++;
          const lat = startLat + (latitude - startLat) * (i / steps);
          const lng = startLng + (longitude - startLng) * (i / steps);
          setPos([lat, lng]);

          if (i === steps) {
            clearInterval(animate);
            fetchAddress(latitude, longitude, setAddress, setCity, setPincode);
          }
        }, 20);

        return currentPos;
      });
    },
    () => alert("Location permission denied"),
    { enableHighAccuracy: true, timeout: 15000 }
  );
};

const placeOrder = async () => {
  // 1️⃣ Save order in DB
  const { data: orderData, error } = await supabase
    .from("orders")
    .insert({
      user_email: currentUser.email,
      total: totalAmount,
      status: "Pending",
    })
    .select()
    .single();
     console.log("order insert:", orderData, error);

  if (error) {
    alert("Order failed");
    return;
  };

  const order = orderData;

  // 2️⃣ Insert order items ✅ MOVED INSIDE ASYNC FUNCTION
  const items = cart.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    name: item.name,
    price: item.price,
    qty: item.qty,
    image_url: item.image_url,
  }));

 await supabase.from("order_items").insert(items);

  // 3️⃣ Generate PDF
  const doc = new jsPDF();
  doc.text("Friends Auto Spares - Invoice", 20, 20);
  doc.text(`Order ID: ${order.id}`, 20, 35);
  doc.text(`Customer: ${currentUser.email}`, 20, 45);
  doc.text(`Total: ₹${order.total}`, 20, 55);

  let y = 70;
  cart.forEach((item) => {
    doc.text(`${item.name} x ${item.qty} = ₹${item.price * item.qty}`, 20, y);
    y += 10;
  });

  const pdfBlob = doc.output("blob");

  // 4️⃣ Upload PDF to Supabase Storage (invoices bucket)
  const fileName = `invoice-${order.id}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("invoices")
    .upload(fileName, pdfBlob, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    alert("Invoice upload failed");
    console.error(uploadError);
    return;
  }

  // 5️⃣ Get public URL
  const { data: publicData } = supabase.storage
    .from("invoices")
    .getPublicUrl(fileName);

  const invoiceUrl = publicData.publicUrl;

 const { error: updateError } = await supabase
  .from("orders")
  .update({ invoice_url: invoiceUrl })
  .eq("id", order.id);

if (updateError) {
  console.error(updateError);
  alert("Failed to save invoice URL");
  return;
}

console.log("Invoice URL saved:", invoiceUrl);
};


const placeOrderCOD = async () => {
  if (!address) return alert("Please select address");

  const orderPayload = {
    id: Date.now(),
    user: currentUser.email,
    items: cart,
    total: totalAmount,
    method: "COD",
    address,
    city,
    pincode,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
  };

await fetch("https://friends-auto-backend.onrender.com/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });

  // 1️⃣ Insert order
  const { data: orderRow, error: insertError } = await supabase
    .from("orders")
    .insert({
      user_email: currentUser.email,
      total: totalAmount,
      status: "Confirmed",
    })
    .select()
    .single();

 console.log("insertError:", insertError);
console.log("orderRow:", orderRow);

if (insertError || !orderRow) {
  alert("Order insert failed. Check console.");
  return;
}

  // 2️⃣ Generate PDF
  const doc = new jsPDF();
  doc.text("Friends Auto Spares - Invoice", 20, 20);
  doc.text(`Customer: ${currentUser.email}`, 20, 35);
  doc.text(`Total: ₹${totalAmount}`, 20, 45);

  let y = 60;
  cart.forEach((item) => {
    doc.text(`${item.name} x ${item.qty} = ₹${item.price * item.qty}`, 20, y);
    y += 10;
  });

  const pdfBlob = doc.output("blob");
  const fileName = `invoice-${orderRow.id}.pdf`;

  // 3️⃣ Upload
 const { error: uploadError } = await supabase.storage
  .from("invoices")
  .upload(fileName, pdfBlob, {
    contentType: "application/pdf",
    upsert: true,
  });

if (uploadError) {
  console.error("Invoice upload failed:", uploadError);
  alert("Invoice upload failed");
  return;
}

  // 4️⃣ Get URL
  const { data: publicData } = supabase.storage
    .from("invoices")
    .getPublicUrl(fileName);

  if (!publicData?.publicUrl) {
    return alert("Failed to get invoice URL");
  }

  // 5️⃣ Save URL
  const { error: updateError } = await supabase
    .from("orders")
    .update({ invoice_url: publicData.publicUrl })
    .eq("id", orderRow.id);

  if (updateError) {
    console.error("Invoice URL save failed:", updateError);
    return alert("Failed to save invoice URL");
  }

  console.log("Invoice saved:", publicData.publicUrl);

  localStorage.setItem(
    `address_${currentUser.email}`,
    JSON.stringify({ address, city, pincode })
  );

  navigate("/order-success", {
    state: { order: orderPayload },
  });
};

const payWithRazorpay = async () => {
  if (!address) return alert("Please select address");

  const [lat,lon] = pos;

 const res = await fetch("https://friends-auto-backend.onrender.com/create-order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ amount: totalAmount }),
});

const order = await res.json();

  const options = {
    key: "rzp_test_SHdoRZz35PXXFp",
    amount: order.amount,
    currency: "INR",
    name: "Friends Auto Spares",
    description: "Bike Parts Order",
    order_id: order.id,

    handler: async function (response) {
      const orderpayload = {
        id: response.razorpay_payment_id,
        user: currentUser.email,
        items: cart,
        total: totalAmount,
        method: "ONLINE",
        paymentId: response.razorpay_payment_id,
        address,
        city,
        pincode,
        status: "Paid",
        createdAt: new Date().toISOString(),
      };

     await fetch("https://friends-auto-backend.onrender.com/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderpayload),
      });

      // 1️⃣ Insert order
const { data: orderRow, error } = await supabase
  .from("orders")
  .insert({
    user_email: currentUser.email,
    total: totalAmount,
    status: "Confirmed",
  })
  .select()
  .single();

    if (error) return alert("Order insert failed");

// 2️⃣ Generate PDF
const doc = new jsPDF();
doc.text("Friends Auto Spares - Invoice", 20, 20);
doc.text(`Customer: ${currentUser.email}`, 20, 35);
doc.text(`Total: ₹${totalAmount}`, 20, 45);

let y = 60;
cart.forEach((item) => {
  doc.text(`${item.name} x ${item.qty} = ₹${item.price * item.qty}`, 20, y);
  y += 10;
});

const pdfBlob = doc.output("blob");
const fileName = `invoice-${orderRow.id}.pdf`;
// ...



// Upload PDF
const { error: uploadError } = await supabase.storage
  .from("invoices")
  .upload(fileName, pdfBlob, { upsert: true });

if (uploadError) {
  console.error(uploadError);
  return alert("Invoice upload failed");
}

// Get public URL
const { data: publicData } = supabase.storage
  .from("invoices")
  .getPublicUrl(fileName);

if (!publicData?.publicUrl) {
  return alert("Failed to get invoice URL");
}

// Save URL in DB
const { error: updateError } = await supabase
  .from("orders")
  .update({ invoice_url: publicData.publicUrl })
  .eq("id", orderRow.id);

if (updateError) {
  console.error("UPDATE FAILED:", updateError);
  alert("Failed to save invoice URL");
  return;
}

console.log("invoice url saved in db:", publicData.publicUrl);

      localStorage.setItem(
        `address_${currentUser.email}`,
        JSON.stringify({ address, city, pincode })
      );

      // ✅ Navigate ONLY after successful payment
      navigate("/order-success", {
        state: { order: orderpayload },
      });
    },
    prefill: { email: currentUser?.email },
    theme: { color: "#2563eb" },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

 return (
  <div className="checkout-container">

    {/* LEFT SIDE */}
    <div className="checkout-card left-card">

      <h2 className="checkout-title">📦 Checkout</h2>

      <textarea
        placeholder="Full address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="input-large"
      />

      <div className="grid-2">
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          placeholder="Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />
      </div>

      <button className="location-btn" onClick={getLiveLocation}>
        📍 Use Live Location
      </button>

      <div className={fullMap ? "map-fullscreen" : "checkout-map"}>
        <MapContainer
          center={pos}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FlyToLocation pos={pos} />
          <DraggableMarker
            pos={pos}
            setPos={setPos}
            setAddress={setAddress}
            setCity={setCity}
            setPincode={setPincode}
          />
        </MapContainer>

        <div className="map-actions">
          {!fullMap && isMobile() && (
            <button onClick={() => setFullMap(true)}>🗺 Fullscreen</button>
          )}
          {fullMap && (
            <button onClick={() => setFullMap(false)}>❌ Close</button>
          )}
        </div>
      </div>

      {/* Payment Section */}
      <div className="payment-toggle">
<button
  className={`pay-option ${paymentMethod === "COD" ? "active-pay" : ""}`}
  onClick={() => {
    setPaymentMethod("COD");
    placeOrderCOD();
  }}
>
  💵 Cash on Delivery
</button>

<button
  className={`pay-option ${paymentMethod === "ONLINE" ? "active-pay" : ""}`}
  onClick={() => {
    setPaymentMethod("ONLINE");
    payWithRazorpay();
  }}
>
  💳 Razorpay
</button>

</div>



        <button
          className="danger-btn"
          onClick={() => {
            setAddress("");
            setCity(""); 
            setPincode("");
            localStorage.removeItem(`address_${currentUser.email}`);
          }}
        >
          ❌ Clear Saved Address
        </button>

      </div>
  


    {/* RIGHT SIDE */}
<div className="checkout-card summary-card">

  <div className="summary-header">
    <span className="summary-icon">🧾</span>
    <h3>Order Summary</h3>
  </div>

  <div className="summary-items">
    {cart.map((item) => (
      <div key={item.id} className="summary-row">
        <span>{item.name} × {item.qty}</span>
        <b>₹{item.price * item.qty}</b>
      </div>
    ))}
  </div>

  <div className="summary-divider"></div>

  <div className="summary-total">
    <span>Total</span>
    <h2>₹{totalAmount}</h2>
  </div>

</div>

  </div>
);
}