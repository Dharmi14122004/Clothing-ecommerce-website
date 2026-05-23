import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { fetchProducts } from "../api";
import ProductCard from "../components/ProductCard";
import "./Home.css";

export default function Wishlist() {
  const { ids } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    fetchProducts()
      .then((all) => setProducts(all.filter((p) => ids.includes(p.id))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="home" style={{ padding: "2rem 0 4rem" }}>
      <div className="container">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginBottom: "0.5rem" }}>
          My Wishlist
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>
          {ids.length} item{ids.length !== 1 ? "s" : ""} saved
          {!isAuthenticated && " · Sign in to sync across devices"}
        </p>
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)" }}>
              Your wishlist is empty. Start adding items you love!
            </p>
            <Link to="/shop/women" className="btn btn--primary">Browse Collection</Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
