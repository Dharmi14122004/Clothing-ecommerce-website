import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchSuggest } from "../api";
import "./SearchBar.css";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions(null);
      return;
    }
    const t = setTimeout(() => {
      searchSuggest(query).then(setSuggestions).catch(() => setSuggestions(null));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div className="search-bar" ref={ref}>
      <form onSubmit={handleSubmit}>
        <svg className="search-bar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search for products, brands and more"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </form>
      {open && suggestions && (suggestions.products?.length > 0 || suggestions.brands?.length > 0) && (
        <div className="search-dropdown">
          {suggestions.brands?.length > 0 && (
            <div className="search-dropdown__section">
              <span className="search-dropdown__label">Brands</span>
              {suggestions.brands.map((b) => (
                <Link
                  key={b.slug}
                  to={`/search?brand=${encodeURIComponent(b.name)}`}
                  onClick={() => { setOpen(false); setQuery(""); }}
                >
                  {b.name}
                </Link>
              ))}
            </div>
          )}
          {suggestions.products?.length > 0 && (
            <div className="search-dropdown__section">
              <span className="search-dropdown__label">Products</span>
              {suggestions.products.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="search-dropdown__product"
                >
                  <img src={p.image} alt="" />
                  <div>
                    <strong>{p.name}</strong>
                    <span>{p.brand} · ${p.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
