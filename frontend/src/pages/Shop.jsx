import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { fetchProducts, fetchBrands } from "../api";
import ProductCard from "../components/ProductCard";
import "./Shop.css";

const SUBCATEGORIES = {
  men: ["all", "shirts", "pants", "outerwear", "knitwear"],
  women: ["all", "dresses", "pants", "outerwear", "tops", "skirts"],
};

export default function Shop() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const subcategory = searchParams.get("sub") || "all";
  const sort = searchParams.get("sort") || "";
  const search = searchParams.get("q") || "";
  const brand = searchParams.get("brand") || "";
  const onSale = searchParams.get("onSale") === "true";

  const isMen = category === "men";
  const title = isMen ? "Men's Collection" : "Women's Collection";
  const subs = SUBCATEGORIES[category] || [];

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { category };
    if (subcategory !== "all") params.subcategory = subcategory;
    if (sort) params.sort = sort;
    if (search) params.search = search;
    if (brand) params.brand = brand;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (onSale) params.onSale = "true";

    fetchProducts(params)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, subcategory, sort, search, brand, minPrice, maxPrice, onSale]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="shop">
      <div className={`shop__banner shop__banner--${category}`}>
        <div className="container">
          <p className="shop__eyebrow">MODA</p>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="container shop__layout">
        <aside className="shop__filters">
          <h3>Filters</h3>
          <div className="filter-group">
            <label>Category</label>
            <div className="filter-pills">
              {subs.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  className={subcategory === sub ? "active" : ""}
                  onClick={() => updateFilter("sub", sub === "all" ? "" : sub)}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Brand</label>
            <select value={brand} onChange={(e) => updateFilter("brand", e.target.value)}>
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Price Range ($)</label>
            <div className="price-range">
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <span>—</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>
          <div className="filter-group">
            <label>
              <input type="checkbox" checked={onSale} onChange={(e) => updateFilter("onSale", e.target.checked ? "true" : "")} />
              {" "}On Sale Only
            </label>
          </div>
          <div className="filter-group">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={(e) => updateFilter("sort", e.target.value)}>
              <option value="">Recommended</option>
              <option value="new">What's New</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Better Discount</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </aside>

        <div className="shop__main">
          <p className="shop__count">
            {loading ? "Loading..." : `${products.length} styles found`}
          </p>
          {loading ? (
            <div className="shop__skeleton">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="shop__empty">No products found. Try adjusting your filters.</p>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
