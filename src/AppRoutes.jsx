// AppRoutes.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import ProductDetails from "./pages/ProductDetails";
import OrderSuccess from "./pages/OrderSuccess";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Footer from "./components/Footer";

export default function AppRoutes({
  currentUser,
  cart,
  products,
  setProducts,
  addToCart,
  setCart,
  logout,
  orders,
  fetchOrders,
  updateOrderStatus,
  setOrders,
  setEmail,
  setPassword,
  login,
  signup,
  loginWithGoogle,
}) {

      const [vehicle, setVehicle] = useState(null); 
      const location = useLocation();

  // 🔐 Not logged in → show Login only
  if (!currentUser) {
    return (
     <div className="route-wrapper">
  <AnimatePresence mode="wait">
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Routes location={location}>
        <Route
          path="*"
          element={
            <Login
              onLogin={login}
              onSignup={signup}
              onGoogleLogin={loginWithGoogle}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          }
        />
          </Routes>
    </motion.div>
  </AnimatePresence>
</div>
    );
  }

  // ✅ Logged in → full app
  return (
    <>
  <Navbar user={currentUser} onLogout={logout} cartCount={cart.length} />

  <div className="route-wrapper">
  <AnimatePresence mode="wait">
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Routes location={location}>
      <Route path="/" element={<Home products={products} />} />
      <Route
        path="/shop"
        element={
          <Shop
            products={products}
            addToCart={addToCart}
            vehicle={vehicle}
            setVehicle={setVehicle}
          />
        }
      />
      <Route
        path="/cart"
        element={
          <Cart cart={cart} setCart={setCart} vehicle={vehicle} />
        }
      />
      <Route
        path="/product/:id"
        element={
          <ProductDetails
            products={products}
            addToCart={addToCart}
          />
        }
      />
      <Route
        path="/checkout"
        element={
          <Checkout cart={cart} currentUser={currentUser} />
        }
      />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route
        path="/profile"
        element={
          <Profile
            user={currentUser}
            cart={cart}
            orders={orders}
          />
        }
      />

      <Route
        path="/admin"
        element={
          currentUser?.email === "yashaskrishna22@gmail.com" ? (
            <Admin
              products={products}
              setProducts={setProducts}
              orders={orders}
              updateOrderStatus={updateOrderStatus}
              fetchOrders={fetchOrders}
              setOrders={setOrders}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
       </Routes>
    </motion.div>
  </AnimatePresence>
</div>

  <Footer />
</>
  );
}
