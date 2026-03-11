import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar({ user, onLogout, cartCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/cart", label: "Cart", badge: cartCount },
    { to: "/profile", label: "Profile" },
    { to: "/admin", label: "Admin" },
  ];

  return (
    <header className={`site-navbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-navbar-inner">
        <button className="site-brand" onClick={() => navigate("/")}>
          <img src="/faslogo.png" alt="Friends Auto Spares" className="site-brand-logo" />
          <span className="site-brand-copy">
            <strong>Friends Auto Spares</strong>
            <small>Bike parts and service essentials</small>
          </span>
        </button>

        <button
          className="site-menu-toggle"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav ${open ? "open" : ""}`}>
          <div className="site-nav-links">
            {navItems.map((item) => {
              const active = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`site-nav-link ${active ? "active" : ""}`}
                >
                  {item.label}
                  {item.badge > 0 && <span className="site-nav-badge">{item.badge}</span>}
                </Link>
              );
            })}
          </div>

          <div className="site-nav-actions">
            <button className="site-profile-pill" onClick={() => navigate("/profile")}>
              <span className="site-profile-avatar">
                {(user?.email || user?.name)?.[0]?.toUpperCase() || "U"}
              </span>
              <span className="site-profile-text">
                {user?.name || user?.email || "User"}
              </span>
            </button>

            <button
              className="site-logout-btn"
              onClick={() => {
                onLogout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
