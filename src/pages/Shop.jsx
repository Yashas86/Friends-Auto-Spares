import { useSearchParams, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import BrandBar from "../components/BrandBar";

export default function Shop({ products = [], addToCart, vehicle }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState(params.get("search") || "");
  const [sort, setSort] = useState("new");

  const brandParam = params.get("brand") || "";
  const searchParam = params.get("search") || "";
  const categoryParam = params.get("category") || "";

  const availableCategories = useMemo(() => {
    return ["All", ...new Set(products.map((item) => item.category).filter(Boolean))];
  }, [products]);

  useEffect(() => {
    setSearch(searchParam);
    setCategory(categoryParam || "All");
  }, [searchParam, categoryParam, brandParam]);

  const visibleProducts = useMemo(() => {
    const baseProducts = products.filter((item) => !item.deleted);

    const byBrand = brandParam
      ? baseProducts.filter((item) => item.brand === brandParam)
      : baseProducts;

    const byVehicle = vehicle
      ? byBrand.filter(
          (item) =>
            item.compatible?.brand === vehicle.brand &&
            item.compatible?.model === vehicle.model &&
            item.compatible?.year === vehicle.year &&
            item.compatible?.variant === vehicle.variant
        )
      : byBrand;

    const byCategory =
      category === "All"
        ? byVehicle
        : byVehicle.filter((item) => item.category === category);

    const bySearch = byCategory.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = [...bySearch];

    if (sort === "low") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      sorted.sort((a, b) => b.price - a.price);
    }

    return sorted;
  }, [products, brandParam, vehicle, category, search, sort]);

  return (
    <div className="shop-page-shell">
      <section className="shop-hero-panel">
        <div>
          <span className="page-kicker">Bike parts catalog</span>
          <h1>
            Find the right product faster with cleaner filters and brand-first
            browsing.
          </h1>
          <p>
            Explore engine oils, brakes, accessories, and trusted workshop parts
            across major bike brands.
          </p>
        </div>

        <div className="shop-hero-stats">
          <div className="shop-hero-stat">
            <strong>{visibleProducts.length}</strong>
            <span>matching products</span>
          </div>
          <div className="shop-hero-stat">
            <strong>{brandParam || "All"}</strong>
            <span>active brand</span>
          </div>
          <div className="shop-hero-stat">
            <strong>{category}</strong>
            <span>selected category</span>
          </div>
        </div>
      </section>

      <section className="shop-filter-panel">
        <div className="shop-filter-head">
          <div>
            <span className="page-kicker">Refine results</span>
            <h2>Browse by brand, category, and price</h2>
          </div>
        </div>

        <BrandBar brandParam={brandParam} />

        <div className="shop-filter-grid">
          <label className="shop-filter-field">
            <span>Search</span>
            <input
              type="text"
              placeholder="Search oils, chains, brake pads..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="shop-filter-field">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {availableCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="shop-filter-field">
            <span>Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="new">Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </label>
        </div>
      </section>

      {visibleProducts.length === 0 ? (
        <section className="empty-surface">
          <h2>No products found</h2>
          <p>Try changing the search term, category, or active brand filter.</p>
          <button className="surface-primary-btn" onClick={() => navigate("/shop")}>
            Reset filters
          </button>
        </section>
      ) : (
        <section className="shop-product-grid">
          {visibleProducts.map((item) => (
            <article
              key={item.id}
              className="shop-product-card-v2"
              onClick={() => navigate(`/product/${item.id}`)}
            >
              <div className="shop-product-media">
                {item.discount ? (
                  <span className="shop-badge">{item.discount}% off</span>
                ) : null}
                <img
                  src={item.image || item.image_url || "/images/placeholder.png"}
                  alt={item.name}
                  onError={(event) => {
                    event.target.src = "/images/placeholder.png";
                  }}
                />
              </div>

              <div className="shop-product-body">
                <span className="shop-product-brand">{item.brand || "Bike parts"}</span>
                <h3>{item.name}</h3>
                <p>{item.desc || item.description || "Trusted service-ready product."}</p>

                <div className="shop-product-meta">
                  <strong>Rs. {item.price}</strong>
                  {vehicle && (
                    <span className="shop-fit-pill">
                      {item.compatible?.model === vehicle.model
                        ? `Fits ${vehicle.model}`
                        : "Universal fit"}
                    </span>
                  )}
                </div>
              </div>

              <button
                className="surface-primary-btn compact"
                onClick={(event) => {
                  event.stopPropagation();
                  addToCart(item);
                }}
              >
                Add to cart
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
