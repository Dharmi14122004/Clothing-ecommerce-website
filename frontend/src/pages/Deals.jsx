import { useEffect, useState } from "react";
import { fetchDeals } from "../api";
import ProductCard from "../components/ProductCard";
import "./Home.css";
import "./Shop.css";

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals()
      .then(setDeals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <section className="shop__banner shop__banner--women" style={{ marginBottom: 0 }}>
        <div className="container">
          <p className="shop__eyebrow">🔥 Mega Sale</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 400 }}>Deals & Offers</h1>
        </div>
      </section>
      <section className="featured section">
        <div className="container">
          {loading ? (
            <p className="loading-text">Loading deals...</p>
          ) : (
            <div className="product-grid">
              {deals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
