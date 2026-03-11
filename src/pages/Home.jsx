import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BRANDS as brands } from "../data/brands";

export default function Home({ products = [] }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredProducts = useMemo(
    () => products.filter((item) => item.featured ?? true).slice(0, 4),
    [products]
  );

  const recommendedProducts = useMemo(
    () => products.filter((item) => item.recommended ?? true).slice(0, 6),
    [products]
  );

  const bestSellers = useMemo(
    () => products.filter((item) => item.bestseller ?? true).slice(0, 4),
    [products]
  );

  const categories = useMemo(() => {
    const mapped = products.reduce((acc, item) => {
      const key = item.category || "Bike Parts";

      if (!acc[key]) {
        acc[key] = {
          name: key,
          count: 0,
          brands: new Set(),
        };
      }

      acc[key].count += 1;
      if (item.brand) {
        acc[key].brands.add(item.brand);
      }

      return acc;
    }, {});

    return Object.values(mapped)
      .slice(0, 4)
      .map((item) => ({
        name: item.name,
        count: item.count,
        brands: Array.from(item.brands).slice(0, 2).join(" • ") || "Popular picks",
      }));
  }, [products]);

  const activeSlide = featuredProducts[currentSlide] || products[0];

  useEffect(() => {
    if (featuredProducts.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, [featuredProducts.length]);

  const handleSearch = () => {
    const value = searchQuery.trim();
    if (!value) {
      return;
    }

    navigate(`/shop?search=${encodeURIComponent(value)}`);
  };

  const handleSearchEnter = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="storefront-page">
      <section className="storefront-hero">
        <div className="storefront-hero-copy">
          <span className="storefront-kicker">Blue Line Collection</span>
          <h1 className="storefront-title">
            Better bike-parts shopping with a cleaner storefront.
          </h1>
          <p className="storefront-subtitle">
            Discover engine oils, brake parts, filters, and workshop essentials
            in a faster, more organized shopping experience.
          </p>

          <div className="storefront-search">
            <input
              type="text"
              placeholder="Search for oils, chains, brake pads..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleSearchEnter}
            />
            <button onClick={handleSearch}>Search Parts</button>
          </div>

          <div className="storefront-actions">
            <button
              className="storefront-primary-btn"
              onClick={() => navigate("/shop")}
            >
              Explore Shop
            </button>
            <button
              className="storefront-secondary-btn"
              onClick={() => navigate("/cart")}
            >
              View Cart
            </button>
          </div>

          <div className="storefront-trust-row">
            <div className="storefront-trust-pill">Genuine stock</div>
            <div className="storefront-trust-pill">Fast checkout</div>
            <div className="storefront-trust-pill">Trusted brands</div>
          </div>
        </div>

        <div className="storefront-feature-panel">
          {activeSlide && (
            <>
              <div className="storefront-feature-header">
                <span className="storefront-feature-label">Featured product</span>
                <div className="storefront-feature-dots">
                  {featuredProducts.map((item, index) => (
                    <button
                      key={item.id || item.name || index}
                      className={`storefront-dot ${
                        index === currentSlide ? "active" : ""
                      }`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Show featured product ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="storefront-feature-card">
                <div className="storefront-feature-content">
                  <span className="storefront-feature-brand">
                    {activeSlide.brand || "Friends Auto Spares"}
                  </span>
                  <h2>{activeSlide.name}</h2>
                  <p>{activeSlide.desc || "Popular rider-first performance part."}</p>
                  <div className="storefront-feature-meta">
                    <span>Category: {activeSlide.category || "Bike Parts"}</span>
                    <strong>Rs. {activeSlide.price}</strong>
                  </div>
                  <button
                    className="storefront-link-btn"
                    onClick={() => navigate(`/product/${activeSlide.id}`)}
                  >
                    View product
                  </button>
                </div>

                <div className="storefront-feature-image-wrap">
                  <img
                    src={
                      activeSlide.image ||
                      activeSlide.image_url ||
                      "/images/placeholder.png"
                    }
                    alt={activeSlide.name}
                    className="storefront-feature-image"
                    onError={(event) => {
                      event.target.src = "/images/placeholder.png";
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="storefront-metrics">
        <div className="storefront-metric-card">
          <strong>100%</strong>
          <span>authentic part selection</span>
        </div>
        <div className="storefront-metric-card">
          <strong>Top</strong>
          <span>brands for daily riders</span>
        </div>
        <div className="storefront-metric-card">
          <strong>Easy</strong>
          <span>search, compare, and checkout</span>
        </div>
      </section>

      <section className="storefront-section">
        <div className="storefront-section-head">
          <div>
            <span className="storefront-section-kicker">Browse faster</span>
            <h2>Shop by category</h2>
          </div>
          <button
            className="storefront-text-action"
            onClick={() => navigate("/shop")}
          >
            See all products
          </button>
        </div>

        <div className="storefront-category-grid">
          {categories.map((category) => (
            <button
              key={category.name}
              className="storefront-category-card"
              onClick={() => navigate(`/shop?category=${category.name}`)}
            >
              <span className="storefront-category-name">{category.name}</span>
              <strong>{category.count} products</strong>
              <p>{category.brands}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="storefront-section">
        <div className="storefront-section-head">
          <div>
            <span className="storefront-section-kicker">Popular picks</span>
            <h2>Recommended for your next ride</h2>
          </div>
        </div>

        <div className="storefront-product-grid">
          {recommendedProducts.map((item) => (
            <article
              key={item.id}
              className="storefront-product-card"
              onClick={() => navigate(`/product/${item.id}`)}
            >
              <div className="storefront-product-image-wrap">
                <img
                  src={item.image || item.image_url || "/images/placeholder.png"}
                  alt={item.name}
                  onError={(event) => {
                    event.target.src = "/images/placeholder.png";
                  }}
                />
              </div>
              <span className="storefront-product-brand">
                {item.brand || "Trusted brand"}
              </span>
              <h3>{item.name}</h3>
              <p>{item.desc || "Reliable bike care essential for daily use."}</p>
              <div className="storefront-product-footer">
                <strong>Rs. {item.price}</strong>
                <span>View details</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="storefront-split">
        <div className="storefront-split-panel">
          <div className="storefront-section-head compact">
            <div>
              <span className="storefront-section-kicker">Best sellers</span>
              <h2>Most ordered products</h2>
            </div>
          </div>

          <div className="storefront-best-list">
            {bestSellers.map((item) => (
              <button
                key={item.id}
                className="storefront-best-item"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <img
                  src={item.image || item.image_url || "/images/placeholder.png"}
                  alt={item.name}
                  onError={(event) => {
                    event.target.src = "/images/placeholder.png";
                  }}
                />
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.brand || item.category || "Bike accessory"}</p>
                </div>
                <span>Rs. {item.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="storefront-split-panel storefront-brand-panel">
          <div className="storefront-section-head compact">
            <div>
              <span className="storefront-section-kicker">Trusted brands</span>
              <h2>Browse by manufacturer</h2>
            </div>
          </div>

          <div className="storefront-brand-grid">
            {brands.map((brand) => (
              <button
                key={brand.name}
                className="storefront-brand-card"
                onClick={() => navigate(`/shop?brand=${brand.name}`)}
              >
                <img src={brand.logo} alt={brand.name} />
                <span>{brand.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="storefront-cta">
        <div>
          <span className="storefront-section-kicker">Ready to shop</span>
          <h2>Find the right part before your next service day.</h2>
          <p>
            Explore the full catalog and move from product search to checkout
            with a simpler, more polished flow.
          </p>
        </div>
        <button
          className="storefront-primary-btn"
          onClick={() => navigate("/shop")}
        >
          Go to shop
        </button>
      </section>

      <footer className="storefront-footer">
        <span>Copyright 2026 Friends Auto Spares</span>
        <span>Contact: +91 9449721304</span>
        <span>Privacy Policy | Terms</span>
      </footer>
    </div>
  );
}
