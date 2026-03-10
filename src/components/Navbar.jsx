import { Link, useNavigate, useLocation } from "react-router-dom";
import {useEffect, useState } from "react";

export default function Navbar({ user, onLogout, cartCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 20);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  return (
   <div className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>

      {/* Logo */}
    <div className="navbar-logo">
  <img src="/faslogo.png" alt="logo" className="logo-img" />
  <span className="brand-text">FRIENDS AUTO SPARES</span>
</div>

      {/* Hamburger */}
      <div className="hamburger" onClick={() => setOpen(!open)}>
        ☰
      </div>

      {/* Links */}
      <div className={`navbar-links ${open ? "open" : ""}`}>

        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>

        <Link
          to="/shop"
          className={`nav-link ${location.pathname === "/shop" ? "active" : ""}`}
        >
          Shop
        </Link>

        <Link
          to="/cart"
          className={`nav-link cart-link ${location.pathname === "/cart" ? "active" : ""}`}
        >
          Cart
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </Link>

        <Link
          to="/admin"
          className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}
        >
          Admin
        </Link>

        <div
          className="profile-circle"
          onClick={() => navigate("/profile")}
        >
          {(user?.email || user?.name)?.[0]?.toUpperCase() || "U"}
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            onLogout();
            navigate("/login");
          }}
        >
          Logout
        </button>

      </div>
    </div>
  );
}