import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

export default function Cart({ cart, setCart, vehicle }) {
  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState(null);

  if (!cart.length) {
    return (
      <div>
        <h2>🧺 Your Cart</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="cart-page cart-layout">
      <h2>🧺 Your Cart</h2>

       <div className="cart-items">
      {cart.map((item) => (
        <div
  key={item.id}
  className={`cart-item ${removingId === item.id ? "slide-out" : ""}`}
>
       <img
  src={item.image || item.image_url || "/images/placeholder.png"}
  alt={item.name}
  className="cart-image"
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "/images/placeholder.png";
  }}
/>

          <div style={{ flex: 1 }}>
            <b>{item.name}</b>

                   {vehicle && (
  <span
    style={{
      display: "inline-block",
      marginTop: 4,
      padding: "4px 8px",
      borderRadius: 999,
      fontSize: 12,
      background:
        item.compatible?.model === vehicle.model ? "#dcfce7" : "#fee2e2",
      color:
        item.compatible?.model === vehicle.model ? "#166534" : "#991b1b",
    }}
  >
    {item.compatible?.model === vehicle.model
      ? `Fits your ${vehicle.model}`
      : "May not fit your bike"}
  </span>
)}

            <p>₹{item.price}</p>
            <div className="qty-controls">
              <button
                onClick={() =>
                  setCart((prev) =>
                    prev.map((p) =>
                      p.id === item.id
                        ? { ...p, qty: Math.max(1, p.qty - 1) }
                        : p
                    )
                  )
                }
              >
                −
              </button>

              <b>{item.qty}</b>

              <button
                onClick={() =>
                  setCart((prev) =>
                    prev.map((p) =>
                      p.id === item.id ? { ...p, qty: p.qty + 1 } : p
                    )
                  )
                }
              >
                +
              </button>
            </div>
          </div>

<button
  className="trash-btn"
  onClick={() => {
    setRemovingId(item.id);
    setTimeout(() => {
      setCart((prev) => prev.filter((p) => p.id !== item.id));
      setRemovingId(null);
    }, 300);
  }}
>
  <FiTrash2 />
</button>
        </div>
      ))}
      </div>

      {/* Amazon-style summary */}
<div className="cart-summary">
        <h3>Order Summary</h3>
        <p>Items: {cart.reduce((s, i) => s + i.qty, 0)}</p>
        <h2 className="animated-total">Total: ₹{total}</h2>
<button
  onClick={() => navigate("/checkout")}
  className="checkout-btn"
>
  Proceed to Checkout →
</button>
      </div>
    </div>
  );
}