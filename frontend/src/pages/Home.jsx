import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, fetchCategories, fetchBanners, fetchBrands, fetchDeals } from "../api";
import { getRecentlyViewed } from "../utils/recentlyViewed";
import ProductCard from "../components/ProductCard";
import BannerCarousel from "../components/BannerCarousel";
import "./Home.css";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState(null);
  const [banners, setBanners] = useState([]);
  const [brands, setBrands] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRecent(getRecentlyViewed());
    Promise.all([
      fetchProducts({ featured: "true" }),
      fetchCategories(),
      fetchBanners(),
      fetchBrands(),
      fetchDeals(),
    ])
      .then(([products, cats, b, br, d]) => {
        setFeatured(products);
        setCategories(cats);
        setBanners(b);
        setBrands(br);
        setDeals(d.slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <BannerCarousel banners={banners} />

      <section className="category-pills">
        <div className="container category-pills__inner">
          <Link to="/shop/men">Men</Link>
          <Link to="/shop/women">Women</Link>
          <Link to="/deals">Sale</Link>
          <Link to="/search?onSale=true">Offers</Link>
          <Link to="/wishlist">Wishlist</Link>
        </div>
      </section>

      {brands.length > 0 && (
        <section className="brands-strip section">
          <div className="container">
            <h2 className="section-title">Top Brands</h2>
            <div className="brands-scroll">
              {brands.map((b) => (
                <Link
                  key={b.slug}
                  to={`/search?brand=${encodeURIComponent(b.name)}`}
                  className="brand-chip"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {deals.length > 0 && (
        <section className="deals-section section">
          <div className="container">
            <div className="section-header-row">
              <h2 className="section-title">Deals of the Day</h2>
              <Link to="/deals" className="see-all">See All →</Link>
            </div>
            <div className="product-grid">
              {deals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="categories section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories__grid">
            {categories && (
              <>
                <Link to="/shop/men" className="category-card category-card--men">
                  <img src={categories.men.image} alt="Men's collection" />
                  <div className="category-card__content">
                    <span>Collection</span>
                    <h3>Men</h3>
                    <span className="category-card__link">Shop Now →</span>
                  </div>
                </Link>
                <Link to="/shop/women" className="category-card category-card--women">
                  <img src={categories.women.image} alt="Women's collection" />
                  <div className="category-card__content">
                    <span>Collection</span>
                    <h3>Women</h3>
                    <span className="category-card__link">Shop Now →</span>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="featured section">
        <div className="container">
          <h2 className="section-title">Trending Now</h2>
          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : (
            <div className="product-grid">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="recent-section section">
          <div className="container">
            <h2 className="section-title">Recently Viewed</h2>
            <div className="recent-scroll">
              {recent.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="recent-item">
                  <img src={p.image} alt={p.name} />
                  <span>{p.name}</span>
                  <strong>${p.price?.toFixed(2)}</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="promo">
        <div className="container promo__inner">
          <div>
            <h2>Free shipping on orders over $150</h2>
            <p>Easy 30-day returns · Use code MODA10 for 10% off</p>
          </div>
          <Link to="/deals" className="btn btn--light">
            Shop Deals
          </Link>
        </div>
      </section>
    </div>
  );
}
