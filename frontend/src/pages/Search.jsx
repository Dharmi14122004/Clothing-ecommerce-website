import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, fetchBrands } from "../api";
import ProductCard from "../components/ProductCard";
import "./Shop.css";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const brand = searchParams.get("brand") || "";
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localQ, setLocalQ] = useState(q);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const sort = searchParams.get("sort") || "";

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (q) params.search = q;
    if (brand) params.brand = brand;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sort) params.sort = sort;
    if (searchParams.get("onSale") === "true") params.onSale = "true";

    fetchProducts(params)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q, brand, minPrice, maxPrice, sort, searchParams]);

  const applySearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localQ) next.set("q", localQ);
    else next.delete("q");
    setSearchParams(next);
  };

  const updateSort = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("sort", value);
    else next.delete("sort");
    setSearchParams(next);
  };

  return (
    <div className="shop">
      <div className="shop__banner shop__banner--women">
        <div className="container">
          <p className="shop__eyebrow">Search</p>
          <h1>{q ? `"${q}"` : brand ? brand : "All Products"}</h1>
        </div>
      </div>
      <div className="container shop__layout">
        <aside className="shop__filters">
          <h3>Filters</h3>
          <form onSubmit={applySearch} className="filter-group">
            <label>Search</label>
            <input value={localQ} onChange={(e) => setLocalQ(e.target.value)} placeholder="Search..." />
            <button type="submit" className="btn btn--outline" style={{ marginTop: "0.5rem", width: "100%" }}>
              Search
            </button>
          </form>
          <div className="filter-group">
            <label>Brand</label>
            <select
              value={brand}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set("brand", e.target.value);
                else next.delete("brand");
                setSearchParams(next);
              }}
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-range">
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <span>—</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>
          <div className="filter-group">
            <label htmlFor="sort">Sort</label>
            <select id="sort" value={sort} onChange={(e) => updateSort(e.target.value)}>
              <option value="">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Discount</option>
              <option value="rating">Rating</option>
              <option value="new">What's New</option>
            </select>
          </div>
        </aside>
        <div className="shop__main">
          <p className="shop__count">{loading ? "Loading..." : `${products.length} products found`}</p>
          {loading ? (
            <div className="shop__skeleton">{[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}</div>
          ) : products.length === 0 ? (
            <p className="shop__empty">No products found. Try different keywords.</p>
          ) : (
            <div className="product-grid">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
