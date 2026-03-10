import { Link, useLocation } from "react-router-dom";
import "./BottomNav.css";

export default function BottomNav({ cartCount }) {
  const { pathname } = useLocation();

  const isActive = (path) => (pathname === path ? "active" : "");

  return (
    <div className="bottom-nav">
      <Link to="/" className={isActive("/")}>
        🏠<br />
        Home
      </Link>

      <Link to="/shop" className={isActive("/shop")}>
        🛒<br />
        Shop
      </Link>

      <Link to="/profile" className={isActive("/profile")}>
        👤<br />
        Profile
      </Link>

      <Link to="/cart" className={isActive("/cart")} style={{ position: "relative" }}>
        🧺<br />
        Cart
        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
      </Link>
    </div>
  );
}
