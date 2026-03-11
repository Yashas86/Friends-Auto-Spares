import { motion } from "framer-motion";

export default function Login({
  onLogin,
  onSignup,
  onGoogleLogin,
  setEmail,
  setPassword,
}) {
  const highlights = [
    "Fast reorders for engine oils, chains, brake kits, and service parts",
    "Track workshop orders, saved addresses, and delivery updates in one place",
    "Switch between local login and Google sign-in without losing your cart",
  ];

  const stats = [
    { value: "OEM", label: "Bike-ready inventory" },
    { value: "Fast", label: "Repeat checkout" },
    { value: "24/7", label: "Rider access" },
  ];

  const categories = ["Engine Oils", "Brake Kits", "Chain Care", "Rider Essentials"];

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      onLogin();
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <motion.section
          className="login-showcase"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="login-chip">Premium rider access</div>
          <h1 className="bike-title">Friends Auto Spares</h1>
          <p className="login-tagline">
            Professional access for riders, garages, and repeat service orders.
            Buy trusted motorcycle parts with a cleaner, faster login flow.
          </p>

          <div className="login-category-strip">
            {categories.map((item) => (
              <span key={item} className="login-category-pill">
                {item}
              </span>
            ))}
          </div>

          <div className="bike-stage">
            <div className="bike-road" />
            <div className="bike-speed bike-speed-one" />
            <div className="bike-speed bike-speed-two" />
            <div className="bike-speed bike-speed-three" />

            <motion.div
              className="bike-float-card bike-float-card-top"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            >
              Service-ready inventory
            </motion.div>

            <motion.div
              className="bike-float-card bike-float-card-bottom"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
            >
              Built for daily riders
            </motion.div>

            <svg
              className="bike-graphic"
              viewBox="0 0 520 220"
              aria-hidden="true"
              role="presentation"
            >
              <defs>
                <linearGradient id="bikeStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
                <linearGradient id="bikeAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>

              <line className="bike-road-line" x1="40" y1="184" x2="480" y2="184" />

              <g className="bike-wheel bike-wheel-left">
                <circle cx="156" cy="158" r="42" className="bike-wheel-rim" />
                <circle cx="156" cy="158" r="6" className="bike-wheel-core" />
                <path d="M156 116 L156 200 M114 158 L198 158 M128 130 L184 186 M184 130 L128 186" className="bike-spokes" />
              </g>

              <g className="bike-wheel bike-wheel-right">
                <circle cx="356" cy="158" r="42" className="bike-wheel-rim" />
                <circle cx="356" cy="158" r="6" className="bike-wheel-core" />
                <path d="M356 116 L356 200 M314 158 L398 158 M328 130 L384 186 M384 130 L328 186" className="bike-spokes" />
              </g>

              <path
                className="bike-frame"
                d="M156 158 L215 103 L268 158 L210 158 L247 83 L317 83 L356 158 L268 158"
              />
              <path className="bike-accent" d="M208 92 L247 83 L238 109" />
              <path className="bike-accent" d="M305 83 L339 63 L357 81" />
              <line className="bike-handle" x1="317" y1="83" x2="348" y2="61" />
              <line className="bike-seat" x1="205" y1="101" x2="183" y2="92" />
              <path className="bike-engine" d="M242 118 L284 118 L294 144 L251 144 Z" />
              <path className="bike-engine-detail" d="M252 124 L280 124 M256 132 L284 132" />
              <path className="bike-tail" d="M132 132 L163 120 L176 136" />
              <path className="bike-front-fork" d="M320 87 L344 132" />
              <path className="bike-rider" d="M258 44 C274 44 286 56 286 71 C286 86 274 98 258 98 C242 98 230 86 230 71 C230 56 242 44 258 44 Z" />
              <path className="bike-rider-body" d="M246 97 L220 123 L247 135 L282 116 L300 137" />
            </svg>
          </div>

          <div className="login-stat-row">
            {stats.map((item) => (
              <div key={item.label} className="login-stat-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="login-highlights">
            {highlights.map((item) => (
              <div key={item} className="login-highlight-item">
                <span className="login-highlight-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="login-right"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          <motion.div
            className="login-card"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="login-card-head">
              <span className="login-kicker">Member sign in</span>
              <h2 className="login-title">Welcome back</h2>
              <p className="login-copy">
                Access your cart, bike parts history, and saved workshop orders
                from one focused dashboard.
              </p>
            </div>

            <label className="login-field">
              <span>Email address</span>
              <input
                className="login-input"
                type="email"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleEnter}
              />
            </label>

            <label className="login-field">
              <span>Password</span>
              <input
                className="login-input"
                type="password"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleEnter}
              />
            </label>

            <button className="login-btn login-btn-primary" onClick={onLogin}>
              Sign in
            </button>

            <div className="login-separator">
              <span>or continue with</span>
            </div>

            <button className="google-btn login-btn-secondary" onClick={onGoogleLogin}>
              Continue with Google
            </button>

            <button className="signup-btn login-btn-ghost" onClick={onSignup}>
              Create a new account
            </button>

            <div className="login-card-footer">
              Secure access for customers, garages, and repeat service orders.
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
