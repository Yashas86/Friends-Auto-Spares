import { useNavigate } from "react-router-dom";
import { BRANDS as brands } from "../data/brands";
import { useState, useEffect } from "react";

export default function Home({ products }) {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [lastViewed, setLastViewed] = useState(null);
  const [reviews, setReviews] = useState({});
  const [newReview, setNewReview] = useState("");
  const [cart, setCart] = useState([]);

const slides = (products || []).filter(p => p.featured ?? true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!slides.length) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleSwipe = (touchEnd) => {
    if (!slides.length) return;

    if (touchStart - touchEnd > 50) {
      setCurrent((prev) => (prev + 1) % slides.length);
    }

    if (touchStart - touchEnd < -50) {
      setCurrent((prev) =>
        prev === 0 ? slides.length - 1 : prev - 1
      );
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate(`/shop?search=${searchQuery}`);
  };

  const handleAddToCart = (product) => {
    setCart((prev) => [...prev, product]);
    alert("Added to cart 🛒");
  };

  return (
    <div className="home-wrapper">

      {/* CART PREVIEW */}
<div className="cart-preview-wrapper">
  <button className="cart-btn" onClick={() => setShowCartPreview(!showCartPreview)}>
  <span className="cart-icon">🛒</span>
  Cart
  {cart.length > 0 && (
    <span className="cart-badge">{cart.length}</span>
  )}
</button>

  {showCartPreview && (
    <div className="cart-preview">
      <h4>🛒 Your Cart</h4>

      {cart.length === 0 ? (
        <p>No items added yet.</p>
      ) : (
        <>
          {cart.map((item, index) => (
            <p key={index}>
              {item.name || item.title} - ₹{item.price}
            </p>
          ))}

          <p>
            <strong>
              Total: ₹
              {cart.reduce(
                (acc, item) => acc + Number(item.price || 0),
                0
              )}
            </strong>
          </p>
        </>
      )}

      <button onClick={() => navigate("/cart")}>
        Go to Cart
      </button>
    </div>
  )}
</div>

      {/* HERO SLIDER */}
      <section
        className="hero-slider-container"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => handleSwipe(e.changedTouches[0].clientX)}
      >
        <div
          className="hero-slider-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div className="hero-slide" key={index}>
              <h1 className="hero-title">
                Find Genuine Spare Parts for Your Bike
              </h1>

              <h2 className="slide-product-name">
                {slide.name}
              </h2>

              <p className="slide-description">
                {slide.desc || slide.description}
              </p>

 <img
  src={slide.image || slide.image_url || "/images/placeholder.png"}
  alt={slide.name}
  className="hero-slide-image"
  onError={(e)=>{
    e.target.src="/images/placeholder.png"
  }}
/>
              <button
                className="hero-btn"
                onClick={() => setSelectedProduct(slide)}
              >
                Explore Products
              </button>
            </div>
          ))}
        </div>

        <button
          className="slider-arrow left"
          onClick={() =>
            setCurrent((prev) =>
              prev === 0 ? slides.length - 1 : prev - 1
            )
          }
        >
          ‹
        </button>

        <button
          className="slider-arrow right"
          onClick={() =>
            setCurrent((prev) =>
              (prev + 1) % slides.length
            )
          }
        >
          ›
        </button>

        <div className="hero-search">
          <input
            type="text"
            placeholder="Search for engine oil, brake pads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="slider-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${current === index ? "active" : ""}`}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      </section>

      {/* RECOMMENDED */}
      <section className="recommend-section">
        <h2 className="section-title">Recommended For You</h2>

<div className="best-grid">
  {(products || []).filter(p => p.recommended ?? true).map((item) => (
    <div
      key={item.id}
      className="best-card"
      onClick={() => navigate(`/product/${item.id}`)}
    >
      <img
        src={item.image || item.image_url || "/images/placeholder.png"}
        alt={item.name}
      />
      <h4>{item.name}</h4>
    </div>
  ))}
</div>
      </section>

      {/* TRUST SECTION */}
      <section className="trust-section">
        <div className="trust-item">
          <div className="trust-icon">✔</div>
          <div>
            <h4>Genuine Products</h4>
            <p>100% authentic spare parts</p>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">🚚</div>
          <div>
            <h4>Fast Delivery</h4>
            <p>Quick & reliable shipping</p>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">💳</div>
          <div>
            <h4>Secure Payments</h4>
            <p>Razorpay protected checkout</p>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-icon">↩</div>
          <div>
            <h4>Easy Returns</h4>
            <p>Hassle-free replacement</p>
          </div>
        </div>
      </section>

      {/* BEST SELLER */}
      <section className="best-seller-section">
        <h2 className="section-title">Best Sellers</h2>

        <div className="best-grid">
      {loading ? (
  <div className="shimmer-grid">
    <div className="shimmer-card"></div>
    <div className="shimmer-card"></div>
    <div className="shimmer-card"></div>
  </div>
) : (
  (products || []).filter(p => p.bestseller ?? true).map((item, index) => (
              <div key={index} className="best-card">
<img
  src={item.image || item.image_url || "/images/placeholder.png"}
  alt={item.name}
  onError={(e)=>{
    e.target.src="/images/placeholder.png"
  }}
/>
                <h4>{item.title || item.name}</h4>

                <div className="rating">
                  ⭐⭐⭐⭐☆ <span>(124)</span>
                </div>

                <div className="price">
                  ₹{item.price}
                </div>

               <div className="card-buttons">
  <button
    className="add-btn"
    onClick={() => handleAddToCart(item)}
  >
    Add to Cart
  </button>

  <button
    className="view-btn"
    onClick={() => navigate(`/product/${item.id}`)}
  >
    View Product
  </button>
</div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* BRAND SECTION */}
      <section className="brand-section">
        <h2 className="section-title">Browse by Brand</h2>

        <div className="brand-grid">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="brand-card"
              onClick={() => navigate(`/shop?brand=${brand.name}`)}
            >
              <img src={brand.logo} alt={brand.name} />
            </div>
          ))}
        </div>
      </section>

      {/* MODAL */}
      {selectedProduct && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
           <img
  src={
    selectedProduct.image ||
    selectedProduct.image_url ||
    "/images/placeholder.png"
  }
  alt={selectedProduct.name}
/>
            <h3>{selectedProduct.title || selectedProduct.name}</h3>
            <p>₹{selectedProduct.price}</p>

<button
  className="details-btn"
  onClick={() => navigate(`/product/${selectedProduct.id}`)}
>
  View Full Details
</button>

            <div className="modal-review">
              <h4>Reviews</h4>

              {(reviews[selectedProduct.id] || []).length === 0 && (
                <p style={{ fontSize: 14, color: "#64748b" }}>
                  No reviews yet
                </p>
              )}

              {(reviews[selectedProduct.id] || []).map((r, i) => (
                <p key={i}>⭐ {r}</p>
              ))}

              <input
                type="text"
                placeholder="Write a review..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
              />

        <button
  className="submit-review-btn"
  onClick={() => {
    if (!newReview.trim()) return;

    setReviews((prev) => ({
      ...prev,
      [selectedProduct.id]: [
        ...(prev[selectedProduct.id] || []),
        newReview,
      ],
    }));

    setNewReview("");
  }}
>
  Submit Review
</button>
        
            </div>
          </div>
        </div>
      )}

      <footer className="footer">

  <div className="footer-company">
    © 2026 Friends Auto Spares
  </div>

  <div className="footer-contact">
    Contact: +91 9449721304
  </div>

  <div className="footer-links">
    Privacy Policy | Terms
  </div>

</footer>

    </div>
  );
}