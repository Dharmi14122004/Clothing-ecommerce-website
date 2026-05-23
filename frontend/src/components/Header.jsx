import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import SearchBar from "./SearchBar";
import "./Header.css";

export default function Header() {
  const { cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const mobileSearchSubmit = (e) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(mobileSearch.trim())}`);
      setMobileSearch("");
      closeMenu();
    }
  };

  return (
    <>
      <div className="top-bar">
        <div className="container top-bar__inner">
          <span>🎉 Use code <strong>MODA10</strong> for 10% off · Free shipping over $150</span>
          <div className="top-bar__links">
            <Link to="/profile">Profile</Link>
            <Link to="/orders">Track Order</Link>
            <Link to="/deals">Offers</Link>
          </div>
        </div>
      </div>
      <header className="header">
        <div className="container header__inner">
          <button
            className="header__menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>

          <Link to="/" className="header__logo" onClick={closeMenu}>
            MODA
          </Link>

          <SearchBar />

          <nav className={`header__nav ${menuOpen ? "is-open" : ""}`}>
            <form className="header__mobile-search" onSubmit={mobileSearchSubmit}>
              <input
                type="search"
                placeholder="Search products..."
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
              />
            </form>
            <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
            <NavLink to="/shop/men" onClick={closeMenu}>Men</NavLink>
            <NavLink to="/shop/women" onClick={closeMenu}>Women</NavLink>
            <NavLink to="/deals" onClick={closeMenu}>Sale</NavLink>
            <NavLink to="/orders" onClick={closeMenu}>Orders</NavLink>
            <NavLink to="/wishlist" onClick={closeMenu}>Wishlist</NavLink>
            {!loading && !isAuthenticated && (
              <>
                <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
                <NavLink to="/signup" onClick={closeMenu}>Sign Up</NavLink>
              </>
            )}
          </nav>

          <div className="header__actions">
            {!loading && isAuthenticated ? (
              <Link to="/profile" className="header__profile" onClick={closeMenu} title={user.email}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </Link>
            ) : (
              !loading && (
                <Link to="/login" className="header__auth-link" onClick={closeMenu}>Login</Link>
              )
            )}
            <Link to="/wishlist" className="header__icon-link" onClick={closeMenu} aria-label="Wishlist">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {wishlistCount > 0 && <span className="header__badge">{wishlistCount}</span>}
            </Link>
            <Link to="/cart" className="header__cart" onClick={closeMenu} aria-label="Bag">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
                <path d="M6 6L5 3H2" />
              </svg>
              {cartCount > 0 && <span className="header__badge">{cartCount}</span>}
            </Link>
            {isAuthenticated && (
              <button type="button" className="header__logout-desktop" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
        {menuOpen && <div className="header__overlay" onClick={closeMenu} />}
      </header>
    </>
  );
}
