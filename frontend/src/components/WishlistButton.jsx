import { useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import "./WishlistButton.css";

export default function WishlistButton({ productId, className = "" }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [animating, setAnimating] = useState(false);
  const active = isWishlisted(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    await toggleWishlist(productId);
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <button
      type="button"
      className={`wishlist-btn ${active ? "is-active" : ""} ${animating ? "is-animating" : ""} ${className}`}
      onClick={handleClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>
  );
}
