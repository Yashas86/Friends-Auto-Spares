import { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import { supabase } from "../supabase"; 

export default function Admin({ products, setProducts, orders, setOrders, fetchProducts }) {
  // ✅ SAFE ORDERS
  const ordersList = Array.isArray(orders) ? orders : [];

  const totalRevenue = ordersList.reduce(
    (sum, o) => sum + Number(o.total || 0),
    0
  );

  const deliveredCount = ordersList.filter(
    (o) => o.status === "Delivered"
  ).length;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [orderFilter, setOrderFilter] = useState("All");

 const [form, setForm] = useState({
  name: "",
  price: "",
  brand: "",
  bike: "Universal",
  category: "Oil",
  description: "",
  imageFile: null,
  image_url: "",

  featured: false,
  recommended: false,
  bestseller: false
});
  const [editId, setEditId] = useState(null);

  // ---------------- ORDERS ----------------
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
  };

  const updateOrderStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
  };

  // ---------------- LOGIN ----------------
  const login = async () => {
    const res = await fetch("https://friends-auto-backend.onrender.com/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("adminToken", data.token);
      setToken(data.token);
      fetchOrders();
    } else {
      alert("Invalid admin login");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  // ---------------- PRODUCTS (FETCH FROM DB) ----------------
  const fetchProductsFromDB = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (!error) setProducts(data || []);
  };

  useEffect(() => {
    fetchProductsFromDB();
  }, []);

  // ---------------- IMAGE ----------------
  const handleImagesUpload = (files) => {
    const file = files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, imageFile: file }));
  };

  // ---------------- SUBMIT ----------------
  const submit = async () => {
    if (!form.name || !form.price) return alert("Name & price required");

    let imageUrl = form.image_url || "";

    if (form.imageFile) {
      const fileName = `${Date.now()}-${form.imageFile.name}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, form.imageFile, { upsert: true });

      if (error) {
        alert("Image upload failed");
        console.error(error);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl; // ✅ FIX
    }

    if (editId) {
      await supabase.from("products").update({
  name: form.name,
  price: form.price,
  brand: form.brand,
  bike: form.bike,
  category: form.category,
  description: form.description,
  image_url: imageUrl,

  featured: form.featured,
  recommended: form.recommended,
  bestseller: form.bestseller
}).eq("id", editId);
    } else {
     await supabase.from("products").insert({
  name: form.name,
  price: form.price,
  brand: form.brand,
  bike: form.bike,
  category: form.category,
  description: form.description,
  image_url: imageUrl,

  featured: form.featured,
  recommended: form.recommended,
  bestseller: form.bestseller
});
    }

    fetchProductsFromDB();
    setForm({
      name: "",
      price: "",
      brand: "",
      bike: "Universal",
      category: "Oil",
      description: "",
      imageFile: null,
      image_url: "",
    });
    setEditId(null);
  };

  const editProduct = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      brand: p.brand,
      bike: p.bike,
      category: p.category,
      description: p.description || "",
      image_url: p.image_url || "",
      imageFile: null,
    });
    setEditId(p.id);
  };

  const softDelete = async (id) => {
    await supabase.from("products").update({ deleted: true }).eq("id", id);
    fetchProductsFromDB();
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.deleted) return false;
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, search, categoryFilter]);

  const downloadInvoice = (order) => {
    const doc = new jsPDF();
    doc.text("Friends Auto Spares - Invoice", 20, 20);
    doc.text(`Order ID: ${order.id}`, 20, 35);
    doc.text(`Customer: ${order.user || "Customer"}`, 20, 45);
    doc.text(`Total: ₹${order.total}`, 20, 55);

    let y = 70;
    order.order_items?.forEach((item) => {
      doc.text(`${item.name} x${item.qty} - ₹${item.price}`, 20, y);
      y += 10;
    });

    doc.save(`Invoice-${order.id}.pdf`);
  };

  if (!token) {
    return (
  <div className="admin-login">
        <h2>🔐 Admin Login</h2>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={login}>Login</button>
      </div>
    );
  }

return (
  <>
    <div className="admin-header">
      <h2>Admin Dashboard</h2>
      <button className="admin-logout" onClick={logout}>Logout</button>
    </div>

    <div className="admin-stats">
      <div className="stat-card">
        <h4>Total Revenue</h4>
        <h2>₹{totalRevenue}</h2>
      </div>

      <div className="stat-card">
        <h4>Total Orders</h4>
        <h2>{ordersList.length}</h2>
      </div>

      <div className="stat-card">
        <h4>Delivered</h4>
        <h2>{deliveredCount}</h2>
      </div>
    </div>

    <div className="admin-content">

      <div className="admin-form-card">
        <h3>{editId ? "Edit Product" : "Add Product"}</h3>

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
  value={form.brand}
  onChange={(e) => setForm({ ...form, brand: e.target.value })}
>
  <option value="">Select Brand</option>
  <option value="Hero">Hero</option>
  <option value="bajaj">bajaj</option>
  <option value="tvs">tvs</option>
  <option value="Honda">Honda</option>
</select>

        <input
          type="file"
          onChange={(e) => handleImagesUpload(e.target.files)}
        />

        <div style={{marginTop:10, display:"flex", gap:20}}>

<label>
<input
type="checkbox"
checked={form.featured}
onChange={(e)=>
setForm({...form, featured:e.target.checked})
}
/>
 Slider
</label>

<label>
<input
type="checkbox"
checked={form.recommended}
onChange={(e)=>
setForm({...form, recommended:e.target.checked})
}
/>
 Recommended
</label>

<label>
<input
type="checkbox"
checked={form.bestseller}
onChange={(e)=>
setForm({...form, bestseller:e.target.checked})
}
/>
 Best Seller
</label>

</div>

        <button className="admin-submit" onClick={submit}>
          {editId ? "Update Product" : "Add Product"}
        </button>
      </div>

      <div className="admin-products-card">
        <h3>Products</h3>

        {filteredProducts.map((p) => (
          <div key={p.id} className="admin-product-row">
            <div>
              <b>{p.name}</b>
              <p>₹{p.price}</p>
            </div>

            <div className="admin-actions">
              <button onClick={() => editProduct(p)}>Edit</button>
              <button onClick={() => softDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  </>
);
}