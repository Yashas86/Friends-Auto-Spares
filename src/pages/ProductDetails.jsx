import { useParams, useNavigate } from "react-router-dom";

export default function ProductDetails({ products, addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find((p) => String(p.id) === id);

  if (!product) return <p>Product not found</p>;

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>

     <div style={{ display: "flex", gap: 30, marginTop: 20, alignItems: "flex-start" }}>
     <img
  src={product.image || product.image_url || "/images/placeholder.png"}
  alt={product.name}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = "/images/placeholder.png";
  }}
  style={{
    maxWidth: "320px",
    maxHeight: "320px",
    width: "100%",
    height: "auto",
    objectFit: "contain",
    display: "block"
  }}
/>

        <div>
          <h2>{product.name}</h2>
          <p style={{ color: "#6b7280" }}>{product.desc}</p>

          <p><b>Brand:</b> {product.brand}</p>
          <p><b>Bike:</b> {product.bike}</p>
          <p><b>Category:</b> {product.category}</p>

          <h3 style={{ marginTop: 10 }}>₹{product.price}</h3>

          <button
            onClick={() => addToCart(product)}
            style={{
              marginTop: 10,
              padding: "10px 16px",
              background: "#2563eb",
              color: "white",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
