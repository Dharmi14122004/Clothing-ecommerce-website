import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchProduct,
  fetchSimilarProducts,
  fetchReviews,
  postReview,
  isProductInStock,
  getDiscount,
} from "../api";
import { useCart } from "../context/CartContext";
import { addRecentlyViewed } from "../utils/recentlyViewed";
import ProductCard from "../components/ProductCard";
import WishlistButton from "../components/WishlistButton";
import SizeGuide from "../components/SizeGuide";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [stockMessage, setStockMessage] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ userName: "", rating: 5, comment: "" });

  useEffect(() => {
    setLoading(true);
    setStockMessage("");
    Promise.all([
      fetchProduct(id),
      fetchSimilarProducts(id),
      fetchReviews(id),
    ])
      .then(([p, sim, rev]) => {
        setProduct(p);
        setSimilar(sim);
        setReviews(rev);
        setSize(p.sizes[0]);
        setColor(p.colors[0]);
        setActiveImage(0);
        addRecentlyViewed(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const inStock = product ? isProductInStock(product) : false;
  const discount = product ? getDiscount(product) : 0;
  const images = product?.images || (product ? [product.image] : []);

  const handleAdd = () => {
    if (!product || !size || !color) return;
    if (!inStock) {
      setStockMessage("This product is out of stock.");
      return;
    }
    const result = addToCart(product, size, color, qty);
    if (!result.ok) {
      setStockMessage(result.message);
      return;
    }
    setStockMessage("");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      const review = await postReview(id, reviewForm);
      setReviews((prev) => [review, ...prev]);
      setReviewForm({ userName: "", rating: 5, comment: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container product-detail product-detail--loading">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container product-detail">
        <p>Product not found.</p>
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  const hasSale = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="product-detail">
      <div className="container product-detail__grid">
        <div className="product-detail__gallery">
          <div className={`product-detail__image ${!inStock ? "is-sold-out" : ""}`}>
            <img src={images[activeImage]} alt={product.name} />
            <WishlistButton productId={product.id} className="product-detail__wishlist" />
            {!inStock && <span className="product-detail__badge">Out of Stock</span>}
            {discount > 0 && <span className="product-detail__discount-badge">{discount}% OFF</span>}
          </div>
          {images.length > 1 && (
            <div className="product-detail__thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === activeImage ? "active" : ""}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail__info">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to={`/shop/${product.category}`}>
              {product.category === "men" ? "Men" : "Women"}
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </nav>

          <Link to={`/search?brand=${encodeURIComponent(product.brand)}`} className="product-detail__brand">
            {product.brand}
          </Link>
          <h1>{product.name}</h1>
          <div className="product-detail__rating-row">
            <span className="product-detail__rating">★ {product.rating}</span>
            <span>({product.reviewCount} ratings)</span>
          </div>

          {!inStock && (
            <div className="stock-alert stock-alert--out" role="alert">
              This item is out of stock. We&apos;ll notify you when it&apos;s back.
            </div>
          )}
          {inStock && <div className="stock-alert stock-alert--in">In stock — usually ships in 2-3 days</div>}

          <div className="product-detail__price">
            <span className="current">₹{product.price.toFixed(0)}</span>
            <span className="price-usd">${product.price.toFixed(2)}</span>
            {hasSale && (
              <>
                <span className="original">${product.originalPrice.toFixed(2)}</span>
                <span className="save">({discount}% OFF)</span>
              </>
            )}
          </div>
          <p className="product-detail__tax">inclusive of all taxes</p>

          <p className="product-detail__desc">{product.description}</p>

          {inStock && (
            <div className="product-detail__options">
              <div className="option-group">
                <div className="option-group__header">
                  <label>Size</label>
                  <button type="button" className="size-guide-link" onClick={() => setSizeGuideOpen(true)}>
                    Size Chart
                  </button>
                </div>
                <div className="option-buttons">
                  {product.sizes.map((s) => (
                    <button key={s} type="button" className={size === s ? "active" : ""} onClick={() => setSize(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="option-group">
                <label>Color</label>
                <div className="option-buttons">
                  {product.colors.map((c) => (
                    <button key={c} type="button" className={color === c ? "active" : ""} onClick={() => setColor(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="option-group">
                <label>Quantity</label>
                <div className="qty-control">
                  <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty(qty + 1)}>+</button>
                </div>
              </div>
            </div>
          )}

          {stockMessage && <p className="stock-alert stock-alert--out stock-alert--inline" role="alert">{stockMessage}</p>}

          <div className="product-detail__actions">
            <button
              type="button"
              className={`btn btn--primary product-detail__add ${added ? "is-added" : ""}`}
              onClick={handleAdd}
              disabled={!inStock}
            >
              {!inStock ? "Out of Stock" : added ? "Added to Bag ✓" : "Add to Bag"}
            </button>
            <Link to="/cart" className="btn btn--outline">Go to Bag</Link>
          </div>

          <div className="product-detail__trust">
            <span>✓ Genuine products</span>
            <span>✓ Easy returns</span>
            <span>✓ Secure payment</span>
          </div>
        </div>
      </div>

      <SizeGuide open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} category={product.category} />

      <section className="product-reviews container">
        <h2>Ratings & Reviews ({reviews.length})</h2>
        <form className="review-form" onSubmit={handleReview}>
          <input placeholder="Your name" required value={reviewForm.userName} onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })} />
          <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} ★</option>)}
          </select>
          <textarea placeholder="Write a review..." required rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
          <button type="submit" className="btn btn--outline">Submit Review</button>
        </form>
        <div className="reviews-list">
          {reviews.map((r) => (
            <div key={r.id} className="review-card">
              <div className="review-card__header">
                <strong>{r.userName}</strong>
                <span>★ {r.rating}</span>
              </div>
              <p>{r.comment}</p>
              <time>{new Date(r.createdAt).toLocaleDateString()}</time>
            </div>
          ))}
        </div>
      </section>

      {similar.length > 0 && (
        <section className="similar-products container section">
          <h2 className="section-title">You May Also Like</h2>
          <div className="product-grid">
            {similar.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
