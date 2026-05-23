import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { isProductInStock } from "../api";
import "./Cart.css";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();

  const outOfStockItems = items.filter((i) => !isProductInStock(i.product));
  const hasOutOfStock = outOfStockItems.length > 0;

  if (items.length === 0) {
    return (
      <div className="cart cart--empty">
        <div className="container">
          <h1>Shopping Bag</h1>
          <p>Your bag is empty.</p>
          <Link to="/shop/women" className="btn btn--primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <h1>Your Cart</h1>

        {hasOutOfStock && (
          <div className="cart__stock-warning" role="alert">
            <strong>Out of stock:</strong>{" "}
            {outOfStockItems.map((i) => i.product.name).join(", ")} — please
            remove these items before checkout.
          </div>
        )}

        <div className="cart__layout">
          <div className="cart__items">
            {items.map((item) => {
              const inStock = isProductInStock(item.product);
              return (
                <div
                  key={item.key}
                  className={`cart-item ${!inStock ? "cart-item--out-of-stock" : ""}`}
                >
                  <Link to={`/product/${item.product.id}`} className="cart-item__img">
                    <img src={item.product.image} alt={item.product.name} />
                  </Link>
                  <div className="cart-item__info">
                    <Link to={`/product/${item.product.id}`}>
                      <h3>{item.product.name}</h3>
                    </Link>
                    <p>
                      {item.size} · {item.color}
                    </p>
                    {!inStock && (
                      <p className="cart-item__stock-msg">Out of stock</p>
                    )}
                    <p className="cart-item__price">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="cart-item__actions">
                    <div className="qty-control">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.key, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.key, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => removeFromCart(item.key)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cart-item__subtotal">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
          <aside className="cart__summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{cartTotal >= 150 ? "Free" : "$9.99"}</span>
            </div>
            <div className="summary-row summary-row--total">
              <span>Total</span>
              <span>
                ${(cartTotal + (cartTotal >= 150 ? 0 : 9.99)).toFixed(2)}
              </span>
            </div>
            {hasOutOfStock ? (
              <button type="button" className="btn btn--primary" disabled>
                Remove out-of-stock items
              </button>
            ) : (
              <Link to="/checkout" className="btn btn--primary">
                Checkout
              </Link>
            )}
            <Link to="/" className="cart__continue">
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
