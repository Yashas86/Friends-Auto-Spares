import { useNavigate, useSearchParams } from "react-router-dom";
import { BRANDS } from "../data/brands";

export default function BrandBar({ brandParam }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const activeBrand = params.get("brand");

  return (
    <div className="brand-row">
      {BRANDS.map((b) => (
        <div
          key={b.name}
          className="brand-card"
         onClick={() => {
  if (brandParam === b.name) {
    navigate("/shop"); // remove filter
  } else {
    navigate(`/shop?brand=${b.name}`);
  }
}}
          style={{
            cursor: "pointer",
            background: "white",
            padding: 12,
            borderRadius: 12,
            border: activeBrand === b.name ? "2px solid #2563eb" : "2px solid transparent",
            boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
            textAlign: "center",
            width: 120,
          }}
        >
          <img
            src={b.logo}
            alt={b.name}
            style={{ width: 70, height: 40, objectFit: "contain" }}
          />
          <div style={{ marginTop: 6, fontWeight: 600 }}>{b.name}</div>
        </div>
      ))}
    </div>
  );
}
