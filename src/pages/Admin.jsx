import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";

const emptyForm = {
  name: "",
  price: "",
  brand: "",
  bike: "Universal",
  category: "Oil",
  desc: "",
  imageFile: null,
  image_url: "",
  featured: false,
  recommended: false,
  bestseller: false,
};

export default function Admin({ products = [], setProducts, orders, setOrders }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const ordersList = Array.isArray(orders) ? orders : [];

  const totalRevenue = ordersList.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const deliveredCount = ordersList.filter((order) => order.status === "Delivered").length;
  const pendingCount = ordersList.filter((order) => order.status !== "Delivered").length;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.deleted) return false;
      if (categoryFilter !== "All" && product.category !== categoryFilter) return false;
      if (
        search &&
        !product.name.toLowerCase().includes(search.toLowerCase()) &&
        !String(product.brand || "").toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [products, search, categoryFilter]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    setOrders(data || []);
  };

  const fetchProductsFromDB = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    setProducts(data || []);
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchProductsFromDB();
    }
  }, [token]);

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
      return;
    }

    alert("Invalid admin login");
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
  };

  const handleImagesUpload = (files) => {
    const file = files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, imageFile: file }));
  };

  const submit = async () => {
    if (!form.name || !form.price) {
      alert("Name and price are required");
      return;
    }

    let imageUrl = form.image_url || "";

    if (form.imageFile) {
      const fileName = `${Date.now()}-${form.imageFile.name}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, form.imageFile, { upsert: true });

      if (error) {
        alert("Image upload failed");
        return;
      }

      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const payload = {
      name: form.name,
      price: Number(form.price),
      brand: form.brand,
      bike: form.bike,
      category: form.category,
      desc: form.desc,
      description: form.desc,
      image_url: imageUrl,
      featured: form.featured,
      recommended: form.recommended,
      bestseller: form.bestseller,
    };

    if (editId) {
      await supabase.from("products").update(payload).eq("id", editId);
    } else {
      await supabase.from("products").insert(payload);
    }

    await fetchProductsFromDB();
    setForm(emptyForm);
    setEditId(null);
  };

  const editProduct = (product) => {
    setForm({
      name: product.name || "",
      price: product.price || "",
      brand: product.brand || "",
      bike: product.bike || "Universal",
      category: product.category || "Oil",
      desc: product.desc || product.description || "",
      imageFile: null,
      image_url: product.image_url || "",
      featured: Boolean(product.featured),
      recommended: Boolean(product.recommended),
      bestseller: Boolean(product.bestseller),
    });
    setEditId(product.id);
  };

  const softDelete = async (id) => {
    await supabase.from("products").update({ deleted: true }).eq("id", id);
    fetchProductsFromDB();
  };

  const updateOrderStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
  };

  if (!token) {
    return (
      <div className="admin-login-shell">
        <div className="admin-login-card">
          <span className="page-kicker">Admin access</span>
          <h2>Sign in to the dashboard</h2>
          <p>Manage products, review orders, and keep your storefront updated.</p>

          <input
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button className="surface-primary-btn" onClick={login}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-shell">
      <section className="admin-hero-panel">
        <div>
          <span className="page-kicker">Admin dashboard</span>
          <h1>Manage catalog updates and monitor recent orders.</h1>
          <p>
            Keep products organized, track order status, and maintain a cleaner
            storefront workflow.
          </p>
        </div>
        <button className="surface-secondary-btn" onClick={logout}>
          Logout
        </button>
      </section>

      <section className="admin-stats-grid-v2">
        <div className="admin-stat-card-v2">
          <span>Total revenue</span>
          <strong>Rs. {totalRevenue}</strong>
        </div>
        <div className="admin-stat-card-v2">
          <span>Total orders</span>
          <strong>{ordersList.length}</strong>
        </div>
        <div className="admin-stat-card-v2">
          <span>Delivered</span>
          <strong>{deliveredCount}</strong>
        </div>
        <div className="admin-stat-card-v2">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>
      </section>

      <div className="admin-main-grid">
        <section className="admin-panel-card">
          <div className="admin-panel-head">
            <div>
              <span className="page-kicker">Catalog</span>
              <h2>{editId ? "Edit product" : "Add product"}</h2>
            </div>
          </div>

          <div className="admin-form-grid">
            <input
              placeholder="Product name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            />
            <input
              placeholder="Brand"
              value={form.brand}
              onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
            />
            <input
              placeholder="Bike / Model"
              value={form.bike}
              onChange={(event) => setForm((prev) => ({ ...prev, bike: event.target.value }))}
            />
            <select
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, category: event.target.value }))
              }
            >
              <option value="Oil">Oil</option>
              <option value="Brakes">Brakes</option>
              <option value="Accessories">Accessories</option>
              <option value="Filters">Filters</option>
            </select>
            <input type="file" onChange={(event) => handleImagesUpload(event.target.files)} />
            <textarea
              placeholder="Short description"
              value={form.desc}
              onChange={(event) => setForm((prev) => ({ ...prev, desc: event.target.value }))}
            />
          </div>

          <div className="admin-toggle-row">
            <label>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, featured: event.target.checked }))
                }
              />
              Featured
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.recommended}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, recommended: event.target.checked }))
                }
              />
              Recommended
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.bestseller}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, bestseller: event.target.checked }))
                }
              />
              Best seller
            </label>
          </div>

          <div className="admin-action-row">
            <button className="surface-primary-btn" onClick={submit}>
              {editId ? "Update product" : "Add product"}
            </button>
            {editId ? (
              <button
                className="surface-secondary-btn"
                onClick={() => {
                  setEditId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel editing
              </button>
            ) : null}
          </div>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-head">
            <div>
              <span className="page-kicker">Products</span>
              <h2>Current catalog</h2>
            </div>
          </div>

          <div className="admin-toolbar">
            <input
              placeholder="Search name or brand"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="All">All categories</option>
              <option value="Oil">Oil</option>
              <option value="Brakes">Brakes</option>
              <option value="Accessories">Accessories</option>
              <option value="Filters">Filters</option>
            </select>
          </div>

          <div className="admin-list">
            {filteredProducts.map((product) => (
              <div key={product.id} className="admin-list-row">
                <div>
                  <strong>{product.name}</strong>
                  <p>
                    {product.brand || "Brand"} • {product.category || "Category"} • Rs.{" "}
                    {product.price}
                  </p>
                </div>
                <div className="admin-row-actions">
                  <button className="surface-secondary-btn small" onClick={() => editProduct(product)}>
                    Edit
                  </button>
                  <button className="surface-danger-btn small" onClick={() => softDelete(product.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-panel-card admin-orders-panel">
        <div className="admin-panel-head">
          <div>
            <span className="page-kicker">Orders</span>
            <h2>Recent customer orders</h2>
          </div>
        </div>

        <div className="admin-orders-list">
          {ordersList.map((order) => (
            <div key={order.id} className="admin-order-card">
              <div>
                <strong>Order #{order.id}</strong>
                <p>
                  {order.user_email} • Rs. {order.total}
                </p>
              </div>
              <div className="admin-order-actions">
                <select
                  value={order.status || "Pending"}
                  onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
                {order.invoice_url ? (
                  <a href={order.invoice_url} target="_blank" rel="noreferrer" className="surface-link-btn">
                    Invoice
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
