import { useNavigate } from "react-router-dom";

export default function Profile({ user, cart, orders }) {
  const navigate = useNavigate();

  const address =
    localStorage.getItem("address") || "No address saved yet";

  return (
    <div className="profile-container">

      <h2 className="profile-title">👤 My Profile</h2>

      {/* Account */}
      <div className="profile-card">
        <h3>Account</h3>
        <p><b>Email:</b> {user?.email}</p>
      </div>

      {/* Address */}
      <div className="profile-card">
        <h3>📍 Delivery Address</h3>
        <p className="profile-address">{address}</p>
        <button
          className="profile-btn primary"
          onClick={() => navigate("/checkout")}
        >
          Edit Address
        </button>
      </div>

      {/* Cart */}
      <div className="profile-card">
        <h3>🧺 Cart</h3>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            <p>{cart.length} item(s) in cart</p>
            <button
              className="profile-btn primary"
              onClick={() => navigate("/cart")}
            >
              Go to Cart
            </button>
          </>
        )}
      </div>

      {/* Orders */}
      <div className="profile-card">
        <h3>📦 My Orders</h3>

        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <div className="orders-list">
            {orders.map((o) => (
              <div key={o.id} className="order-item">
                <div>
                  <b>Order #{o.id}</b>
                  <p>₹{o.total} • {o.status}</p>
                </div>

                {o.invoice_url && (
                  <a
                    href={o.invoice_url}
                    target="_blank"
                    rel="noreferrer"
                    className="invoice-link"
                  >
                    🧾 Invoice
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}