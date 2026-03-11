import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";

export default function Cart({ cart, setCart, vehicle }) {
  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState(null);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (!cart.length) {
    return (
      <div className="cart-page-shell">
        <section className="empty-surface">
          <span className="page-kicker">Your cart</span>
          <h2>Your cart is empty</h2>
          <p>Add products from the shop to start building your order.</p>
          <button className="surface-primary-btn" onClick={() => navigate("/shop")}>
            Continue shopping
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="cart-page-shell">
      <section className="cart-hero-panel">
        <div>
          <span className="page-kicker">Cart overview</span>
          <h1>Review your selected bike parts before checkout.</h1>
          <p>
            Update quantities, remove extras, and make sure every item is ready
            before delivery.
          </p>
        </div>

        <div className="cart-hero-stats">
          <div className="cart-stat-card">
            <strong>{totalItems}</strong>
            <span>items</span>
          </div>
          <div className="cart-stat-card">
            <strong>Rs. {subtotal}</strong>
            <span>subtotal</span>
          </div>
        </div>
      </section>

      <div className="cart-layout-v2">
        <section className="cart-items-surface">
          {cart.map((item) => (
            <article
              key={item.id}
              className={`cart-item-v2 ${removingId === item.id ? "slide-out" : ""}`}
            >
              <div className="cart-item-media">
                <img
                  src={item.image || item.image_url || "/images/placeholder.png"}
                  alt={item.name}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/images/placeholder.png";
                  }}
                />
              </div>

              <div className="cart-item-content">
                <div className="cart-item-head">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.brand || item.category || "Bike accessory"}</p>
                  </div>
                  <strong>Rs. {item.price * item.qty}</strong>
                </div>

                {vehicle && (
                  <span className="cart-fit-pill">
                    {item.compatible?.model === vehicle.model
                      ? `Fits your ${vehicle.model}`
                      : "Check bike compatibility"}
                  </span>
                )}

                <div className="cart-item-actions">
                  <div className="qty-controls-v2">
                    <button
                      onClick={() =>
                        setCart((prev) =>
                          prev.map((product) =>
                            product.id === item.id
                              ? { ...product, qty: Math.max(1, product.qty - 1) }
                              : product
                          )
                        )
                      }
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() =>
                        setCart((prev) =>
                          prev.map((product) =>
                            product.id === item.id
                              ? { ...product, qty: product.qty + 1 }
                              : product
                          )
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="cart-remove-btn"
                    onClick={() => {
                      setRemovingId(item.id);
                      window.setTimeout(() => {
                        setCart((prev) => prev.filter((product) => product.id !== item.id));
                        setRemovingId(null);
                      }, 280);
                    }}
                  >
                    <FiTrash2 />
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="cart-summary-v2">
          <span className="page-kicker">Order summary</span>
          <h2>Ready for checkout</h2>

          <div className="cart-summary-list">
            <div>
              <span>Items</span>
              <strong>{totalItems}</strong>
            </div>
            <div>
              <span>Subtotal</span>
              <strong>Rs. {subtotal}</strong>
            </div>
            <div>
              <span>Shipping</span>
              <strong>Calculated in checkout</strong>
            </div>
          </div>

          <button
            className="surface-primary-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to checkout
          </button>
          <button
            className="surface-secondary-btn"
            onClick={() => navigate("/shop")}
          >
            Continue shopping
          </button>
        </aside>
      </div>
    </div>
  );
}
