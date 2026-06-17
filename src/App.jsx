import { BrowserRouter, Routes, Route } from "react-router-dom";
import Checkout from "./pages/Checkout";
import AppRoutes from "./AppRoutes";
import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import "./App.css";



function App() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("users");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const [products, setProducts] = useState(() => {
  const saved = localStorage.getItem("products");

  return saved
    ? JSON.parse(saved)
    : [
        {
          id: 1,
          name: "Castrol Activ Oil",
          price: 699,
          brand: "Castrol",
          category: "Oil",
          desc: "High performance engine oil",
          image: "/images/castrol-oil.png",

          featured: true,     // slider
          recommended: true,  // recommended section
          bestseller: true    // best sellers
        },
        {
          id: 2,
          name: "Motul 3000",
          price: 899,
          brand: "Motul",
          category: "Oil",
          desc: "Premium engine oil",
          image: "/images/motul-oil.png",

          featured: true,
          recommended: true,
          bestseller: false
        },
        {
          id: 3,
          name: "Hero Genuine Oil",
          price: 599,
          brand: "Hero",
          category: "Oil",
          desc: "Reliable engine oil",
          image: "/images/hero-oil.png",

          featured: false,
          recommended: true,
          bestseller: true
        },
        {
          id: 4,
          name: "Shell Advance",
          price: 799,
          brand: "Shell",
          category: "Oil",
          desc: "Advanced engine protection",
          image: "/images/shell-advance.png",

          featured: true,
          recommended: false,
          bestseller: true
        }
      ];
});

  // ✅ Auto login on refresh (Supabase)
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = session.user;
        const supaUser = {
          email: user.email,
          name: user.user_metadata?.full_name,
          photo: user.user_metadata?.avatar_url,
          provider: "google",
        };

        setCurrentUser(supaUser);
        localStorage.setItem("currentUser", JSON.stringify(supaUser));
      } else {
        const savedUser = JSON.parse(localStorage.getItem("currentUser") || "null");

        if (savedUser && savedUser.provider !== "google") {
          setCurrentUser(savedUser);
        } else {
          setCurrentUser(null);
          localStorage.removeItem("currentUser");
        }
      }
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(`cart_${currentUser?.email}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [vehicle, setVehicle] = useState(null);

  // 🔐 Local Auth (demo)
  const signup = () => {
    if (!email || !password) {
      return alert("Please enter both your email address and password.");
    }
    if (users.find((u) => u.email === email)) {
      return alert("An account with this email address already exists.");
    }
    const newUser = { email, password, provider: "local" };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setEmail("");
    setPassword("");
  };

  const login = () => {
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) return alert("The email address or password you entered is incorrect.");
    setCurrentUser({ ...user, provider: user.provider || "local" });
    setEmail("");
    setPassword("");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    setCart([]);
  };

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (currentUser?.email) {
      localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  useEffect(() => {
    if (currentUser?.email) {
      const saved = localStorage.getItem(`cart_${currentUser.email}`);
      setCart(saved ? JSON.parse(saved) : []);

      const savedOrders = localStorage.getItem(`orders_${currentUser.email}`);
      setOrders(savedOrders ? JSON.parse(savedOrders) : []);
    } else {
      setOrders([]);
    }
  }, [currentUser]);

 const addToCart = (product) => {
  setCart((prev) => {
    const exists = prev.find((p) => p.id === product.id);

    const cartItem = {
      ...product,
      image: product.image || product.image_url || product.images?.[0] || "",
      qty: exists ? exists.qty + 1 : 1,
    };

    if (exists) {
      return prev.map((p) =>
        p.id === product.id ? { ...p, qty: p.qty + 1 } : p
      );
    }

    return [...prev, cartItem];
  });
};

  const fetchOrders = async () => {
    const token = localStorage.getItem("adminToken");
    const res = await fetch("https://friends-auto-backend.onrender.com/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  };

  const updateOrderStatus = async (id, status) => {
    const token = localStorage.getItem("adminToken");
    await fetch(`https://friends-auto-backend.onrender.com/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  // 🔥 Google Login (Supabase)
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      alert("Google sign-in could not be completed. Please try again.");
      console.error(error);
    }
  };


return (
   
  <BrowserRouter>
    <AppRoutes
      currentUser={currentUser}
      cart={cart}
      products={products}
      addToCart={addToCart}
      setCart={setCart}
      logout={logout}
      orders={orders}
      fetchOrders={fetchOrders}
      updateOrderStatus={updateOrderStatus}
      setOrders={setOrders}
      setEmail={setEmail}
      setPassword={setPassword}
      login={login}
      signup={signup}
      loginWithGoogle={loginWithGoogle}
      setProducts={setProducts}
    />
  </BrowserRouter>
);
}
export default App;
