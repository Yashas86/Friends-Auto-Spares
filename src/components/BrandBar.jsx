import { useNavigate, useSearchParams } from "react-router-dom";
import { BRANDS } from "../data/brands";

export default function BrandBar({ brandParam }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const activeBrand = params.get("brand");

  return (
    <div className="brand-bar-v2">
      {BRANDS.map((brand) => (
        <button
          key={brand.name}
          className={`brand-bar-card ${activeBrand === brand.name ? "active" : ""}`}
          onClick={() => {
            if (brandParam === brand.name) {
              navigate("/shop");
            } else {
              navigate(`/shop?brand=${brand.name}`);
            }
          }}
        >
          <img src={brand.logo} alt={brand.name} />
          <span>{brand.name}</span>
        </button>
      ))}
    </div>
  );
}
