import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile({ user, cart, orders }) {
  const navigate = useNavigate();

  const savedAddress = useMemo(() => {
    if (!user?.email) {
      return null;
    }

    const raw = localStorage.getItem(`address_${user.email}`);
    return raw ? JSON.parse(raw) : null;
  }, [user]);

  const orderList = Array.isArray(orders) ? orders : [];

  return (
    <div className="profile-page-shell">
      <section className="profile-hero-panel">
        <div>
          <span className="page-kicker">Account center</span>
          <h1>Manage your profile, saved address, and order history.</h1>
          <p>
            Keep your delivery details, cart progress, and invoices in one place
            with a clearer account dashboard.
          </p>
        </div>

        <div className="profile-hero-card">
          <span className="profile-avatar-lg">
            {(user?.email || user?.name)?.[0]?.toUpperCase() || "U"}
          </span>
          <div>
            <strong>{user?.name || "Friends Auto Spares customer"}</strong>
            <p>{user?.email}</p>
          </div>
        </div>
      </section>

      <div className="profile-grid-v2">
        <section className="profile-surface-card">
          <span className="page-kicker">Account</span>
          <h2>Profile details</h2>
          <div className="profile-detail-list">
            <div>
              <span>Email</span>
              <strong>{user?.email || "Not available"}</strong>
            </div>
            <div>
              <span>Provider</span>
              <strong>{user?.provider || "Local account"}</strong>
            </div>
          </div>
        </section>

        <section className="profile-surface-card">
          <span className="page-kicker">Saved address</span>
          <h2>Delivery details</h2>
          <p className="profile-address-copy">
            {savedAddress?.address || "No delivery address saved yet."}
          </p>
          <div className="profile-detail-list compact">
            <div>
              <span>City</span>
              <strong>{savedAddress?.city || "-"}</strong>
            </div>
            <div>
              <span>Pincode</span>
              <strong>{savedAddress?.pincode || "-"}</strong>
            </div>
          </div>
          <button
            className="surface-primary-btn"
            onClick={() => navigate("/checkout")}
          >
            Update address
          </button>
        </section>

        <section className="profile-surface-card">
          <span className="page-kicker">Current cart</span>
          <h2>Shopping progress</h2>
          <p className="profile-cart-copy">
            {cart.length
              ? `${cart.length} product(s) are waiting in your cart.`
              : "Your cart is empty right now."}
          </p>
          <button
            className="surface-secondary-btn"
            onClick={() => navigate(cart.length ? "/cart" : "/shop")}
          >
            {cart.length ? "Open cart" : "Browse products"}
          </button>
        </section>

        <section className="profile-surface-card profile-orders-card">
          <span className="page-kicker">Orders</span>
          <h2>Recent orders and invoices</h2>

          {orderList.length === 0 ? (
            <div className="profile-empty-state">
              <p>No orders yet. Your upcoming purchases will appear here.</p>
            </div>
          ) : (
            <div className="profile-order-list-v2">
              {orderList.map((order) => (
                <div key={order.id} className="profile-order-row-v2">
                  <div>
                    <strong>Order #{order.id}</strong>
                    <p>
                      Rs. {order.total} • {order.status}
                    </p>
                  </div>

                  {order.invoice_url ? (
                    <a
                      href={order.invoice_url}
                      target="_blank"
                      rel="noreferrer"
                      className="surface-link-btn"
                    >
                      View invoice
                    </a>
                  ) : (
                    <span className="profile-order-muted">Invoice pending</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
