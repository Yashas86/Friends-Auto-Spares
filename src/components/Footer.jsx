import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-brand">
          <img src="/faslogo.png" alt="Friends Auto Spares" className="site-footer-logo" />
          <div>
            <strong>Friends Auto Spares</strong>
            <p>Quality bike parts, service essentials, and smoother ordering.</p>
          </div>
        </div>

        <div className="site-footer-column">
          <span className="site-footer-label">Explore</span>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/profile">Profile</Link>
        </div>

        <div className="site-footer-column">
          <span className="site-footer-label">Support</span>
          <a href="tel:+919449721304">+91 9449721304</a>
          <a href="mailto:friendsautospares@example.com">friendsautospares@example.com</a>
          <span>Bengaluru, India</span>
        </div>

        <div className="site-footer-column">
          <span className="site-footer-label">Policies</span>
          <span>Secure checkout</span>
          <span>Returns and replacements</span>
          <span>Copyright 2026 Friends Auto Spares</span>
        </div>
      </div>
    </footer>
  );
}
