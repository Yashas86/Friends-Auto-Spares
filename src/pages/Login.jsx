import { motion } from "framer-motion";

export default function Login({
onLogin,
onSignup,
onGoogleLogin,
setEmail,
setPassword
}) {
return ( <div className="login-page">

  <motion.div
    className="login-card"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6 }}
  >

    <h2 className="login-title">Sign In</h2>

    <input
      className="login-input"
      type="email"
      placeholder="Email"
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      className="login-input"
      type="password"
      placeholder="Password"
      onChange={(e) => setPassword(e.target.value)}
    />

    <button className="login-btn" onClick={onLogin}>
      Login
    </button>

    <button className="signup-btn" onClick={onSignup}>
      Signup
    </button>

    <button className="google-btn" onClick={onGoogleLogin}>
      Continue with Google
    </button>

  </motion.div>

</div>

);
}
