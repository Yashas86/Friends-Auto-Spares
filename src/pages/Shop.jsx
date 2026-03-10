import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import BrandBar from "../components/BrandBar";
import { useMemo, useState, useEffect } from "react";
import VehicleSelector from "../components/VehicleSelector";

export default function Shop({ products = [], addToCart, vehicle, setVehicle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [bike, setBike] = useState("All");

  /* ---------------------- URL PARAMS ---------------------- */
  const brandParam = params.get("brand") || "";
  const searchParam = params.get("search") || "";

  /* ---------------------- LOCAL STATE ---------------------- */
  
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState(searchParam);
  const [sort, setSort] = useState("new");

  /* ---------------------- BASE PRODUCTS ---------------------- */
 const baseProducts = (products || []).filter((p) => !p.deleted);

  /* ---------------------- FILTERING ---------------------- */

  const filteredByBrand = brandParam
    ? baseProducts.filter((p) => p.brand === brandParam)
    : baseProducts;

  const filteredByVehicle = vehicle
    ? filteredByBrand.filter(
        (p) =>
          p.compatible?.brand === vehicle.brand &&
          p.compatible?.model === vehicle.model &&
          p.compatible?.year === vehicle.year &&
          p.compatible?.variant === vehicle.variant
      )
    : filteredByBrand;

  const filteredByBike = filteredByVehicle;


  const filteredByCategory =
    category === "All"
      ? filteredByBike
      : filteredByBike.filter((p) => p.category === category);

  const finalProducts = filteredByCategory.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedProducts = [...finalProducts].sort((a, b) => {
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    return 0;
  });

  /* ---------------------- BIKE FILTER OPTIONS ---------------------- */
  const bikesForBrand = useMemo(() => {
    const bikes = filteredByBrand.map((p) => p.bike);
    return ["All", "Universal", ...new Set(bikes.filter(Boolean))];
  }, [filteredByBrand]);

  useEffect(() => {
    setBike("All");
    setCategory("All");
  }, [brandParam]);

  /* ---------------------- UI ---------------------- */

  return (
    <div className="container">

     <div className="shop-header">
  <div className="shop-title">
    <span className="shop-icon">🛍️</span>
    <h2>Shop</h2>
  </div>
</div>


     {/* <VehicleSelector onSelect={setVehicle} />*/}
    <BrandBar brandParam={brandParam} />  

      {/* SEARCH + FILTER CARD */}
     <div className="shop-filter-container">
        <input
          type="text"
          placeholder="🔍 Search engine oil, brakes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">Newest</option>
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
          </select>

          {brandParam && (
            <>
             

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>All</option>
                <option>Oil</option>
                <option>Brakes</option>
                <option>Accessories</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="shop-grid fade-in">
        {sortedProducts.map((p) => (
          <div
            key={p.id}
            className="product-card"
            onClick={() => navigate(`/product/${p.id}`)}
          >
            {p.discount && (
              <div className="discount-badge">
                {p.discount}% OFF
              </div>
            )}

            
             <img
  src={p.image || p.image_url || "/images/placeholder.png"}
              alt={p.name}
              className="product-image"
            />

            <h4>{p.name}</h4>
            <p className="product-desc">{p.desc}</p>
            <p className="product-price">₹{p.price}</p>

            {vehicle && (
              <span className="fit-badge">
                {p.compatible?.model === vehicle.model
                  ? `Fits your ${vehicle.model}`
                  : "May not fit your bike"}
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(p);
              }}
              className="add-to-cart-btn ripple-btn"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* FIXED CART BAR */}
      {/* FIXED CART BAR */}
{sortedProducts.length > 0 && (
  <div className="cart-bar">
    <button
      onClick={() => navigate("/cart")}
      className="cart-bar-btn"
    >
      🛒 View Cart →
    </button>
  </div>
)}
    </div>
  );
}