import { motion } from "framer-motion";

export default function Login({
  onLogin,
  onSignup,
  onGoogleLogin,
  setEmail,
  setPassword,
}) {
  const stats = [
    { value: "Secure", label: "account access" },
    { value: "Fast", label: "checkout recovery" },
    { value: "Simple", label: "Google sign-in" },
  ];

  const benefits = [
    "Access saved orders and delivery details in one place.",
    "Continue checkout faster with your stored cart and profile.",
    "Use local sign-in or Google without changing your flow.",
  ];

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      onLogin();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <motion.section
          className="auth-showcase"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="auth-badge">Friends Auto Spares</div>
          <h1 className="auth-hero-title">
            Professional login for a cleaner bike-parts experience.
          </h1>
          <p className="auth-hero-copy">
            Sign in to manage orders, restore your cart, and get back to oils,
            brake parts, filters, and workshop essentials faster.
          </p>

          <div className="auth-stat-grid">
            {stats.map((item) => (
              <div key={item.label} className="auth-stat-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="auth-info-card">
            <div className="auth-info-head">
              <span className="auth-info-dot" />
              <p>Account benefits</p>
            </div>

            <div className="auth-benefit-list">
              {benefits.map((item) => (
                <div key={item} className="auth-benefit-item">
                  <span className="auth-check">+</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          className="auth-form-wrap"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
        >
          <motion.div
            className="auth-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.14 }}
          >
            <div className="auth-card-head">
              <span className="auth-kicker">Sign in</span>
              <h2 className="auth-title">Welcome back</h2>
              <p className="auth-copy">
                Use your account to continue shopping and track your orders.
              </p>
            </div>

            <label className="auth-field">
              <span>Email address</span>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={handleEnter}
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                className="auth-input"
                type="password"
                placeholder="Enter your password"
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={handleEnter}
              />
            </label>

            <button className="auth-button auth-button-primary" onClick={onLogin}>
              Sign in
            </button>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <button
              className="auth-button auth-button-secondary"
              onClick={onGoogleLogin}
            >
              Continue with Google
            </button>

            <button className="auth-button auth-button-ghost" onClick={onSignup}>
              Create account
            </button>

            <p className="auth-footnote">
              Blue-and-white workspace designed for quick access and minimal
              friction.
            </p>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
