import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  isProductInStock,
  validateCoupon,
  fetchAddresses,
} from "../api";
import { saveCheckoutSession } from "../utils/checkoutSession";
import "./Checkout.css";

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: parts[0] || "", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export default function Checkout() {
  const { items, cartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "United States",
  });

  useEffect(() => {
    if (user) {
      const { firstName, lastName } = splitName(user.name);
      setForm((prev) => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: lastName || prev.lastName,
        email: user.email,
      }));
      fetchAddresses()
        .then(setAddresses)
        .catch(() => setAddresses([]));
    }
  }, [user]);

  const outOfStockItems = items.filter((i) => !isProductInStock(i.product));
  const discount = couponApplied?.discount || 0;
  const freeShipping = couponApplied?.freeShipping;
  const shipping =
    freeShipping || cartTotal >= 150 ? 0 : 9.99;
  const total = Math.max(0, cartTotal - discount + shipping);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const applyCoupon = async () => {
    const result = await validateCoupon(couponCode, cartTotal);
    if (result.valid) {
      setCouponApplied(result);
      setCouponMsg(result.message);
    } else {
      setCouponApplied(null);
      setCouponMsg(result.message);
    }
  };

  const selectAddress = (addr) => {
    const parts = addr.name.split(" ");
    setForm({
      ...form,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      phone: addr.phone || "",
      address: addr.address,
      city: addr.city,
      zip: addr.zip,
      country: addr.country || "United States",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (outOfStockItems.length > 0) {
      setError(
        `Cannot checkout: ${outOfStockItems.map((i) => i.product.name).join(", ")} is out of stock.`
      );
      return;
    }
    setError("");
    saveCheckoutSession({
      customer: form,
      total,
      cartTotal,
      discount,
      shipping,
      coupon: couponApplied?.coupon?.code || null,
      orderItems: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        price: i.product.price,
      })),
    });
    navigate("/payment");
  };

  if (items.length === 0) {
    return (
      <div className="checkout checkout--empty">
        <div className="container">
          <h1>Checkout</h1>
          <p>Your bag is empty.</p>
          <Link to="/" className="btn btn--primary">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="container">
        <div className="payment-steps">
          <span className="done">Bag</span>
          <span className="active">Address</span>
          <span>Payment</span>
        </div>
        <h1>Checkout</h1>
        {outOfStockItems.length > 0 && (
          <div className="checkout__stock-warning" role="alert">
            Some items are out of stock. <Link to="/cart">Update bag</Link>
          </div>
        )}
        <form className="checkout__layout" onSubmit={handleSubmit}>
          <div className="checkout__form">
            {isAuthenticated && addresses.length > 0 && (
              <div className="saved-addresses">
                <h2>Saved Addresses</h2>
                {addresses.map((a) => (
                  <button key={a.id} type="button" className="saved-address-btn" onClick={() => selectAddress(a)}>
                    <strong>{a.name}</strong>
                    <span>{a.address}, {a.city}</span>
                  </button>
                ))}
              </div>
            )}
            <h2>Delivery Details</h2>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" required value={form.firstName} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" required value={form.lastName} onChange={handleChange} />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="address">Address</label>
              <input id="address" name="address" required value={form.address} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="city">City</label>
                <input id="city" name="city" required value={form.city} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label htmlFor="zip">PIN / ZIP</label>
                <input id="zip" name="zip" required value={form.zip} onChange={handleChange} />
              </div>
            </div>
            {error && <p className="checkout__error">{error}</p>}
          </div>

          <aside className="checkout__summary">
            <h2>Price Details</h2>
            <ul className="checkout__items">
              {items.map((item) => (
                <li key={item.key}>
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="coupon-box">
              <input
                placeholder="Coupon code (MODA10, FIRST20)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <button type="button" className="btn btn--outline" onClick={applyCoupon}>Apply</button>
            </div>
            {couponMsg && <p className={`coupon-msg ${couponApplied ? "success" : "error"}`}>{couponMsg}</p>}
            <div className="summary-row">
              <span>Bag Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>Coupon Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Delivery</span>
              <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row summary-row--total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button type="submit" className="btn btn--primary" disabled={outOfStockItems.length > 0}>
              Continue to Payment
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}
