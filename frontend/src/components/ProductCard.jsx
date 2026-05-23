import { Link } from "react-router-dom";
import { isProductInStock, getDiscount } from "../api";
import WishlistButton from "./WishlistButton";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const hasSale = product.originalPrice && product.originalPrice > product.price;
  const inStock = isProductInStock(product);
  const discount = getDiscount(product);

  return (
    <article className={`product-card ${!inStock ? "product-card--sold-out" : ""}`}>
      <div className="product-card__image-wrap">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <WishlistButton productId={product.id} className="product-card__wishlist" />
        {discount > 0 && inStock && (
          <span className="product-card__discount">{discount}% OFF</span>
        )}
        {!inStock && <span className="product-card__sold-out">Out of Stock</span>}
        <div className="product-card__overlay">
          <Link to={`/product/${product.id}`}>
            <span>{inStock ? "Quick View" : "Out of Stock"}</span>
          </Link>
        </div>
      </div>
      <div className="product-card__info">
        <span className="product-card__brand">{product.brand}</span>
        <Link to={`/product/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        {!inStock && (
          <p className="product-card__stock-msg">Currently unavailable</p>
        )}
        <div className="product-card__rating-row">
          <span className="product-card__rating">★ {product.rating}</span>
          <span className="product-card__reviews">({product.reviewCount})</span>
        </div>
        <div className="product-card__meta">
          <div className="product-card__price">
            <span className="current">${product.price.toFixed(2)}</span>
            {hasSale && (
              <span className="original">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
