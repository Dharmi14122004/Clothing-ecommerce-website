import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { processPayment, placeOrder } from "../api";
import { getCheckoutSession, clearCheckoutSession } from "../utils/checkoutSession";
import { saveLocalOrder } from "../utils/orders";
import "./Payment.css";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: "📱", desc: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Card", icon: "💳", desc: "Credit / Debit Card" },
  { id: "netbanking", label: "Net Banking", icon: "🏦", desc: "All major banks" },
  { id: "wallet", label: "Wallet", icon: "👛", desc: "Paytm, Amazon Pay" },
];

const BANKS = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra"];
const WALLETS = ["Paytm", "PhonePe", "Amazon Pay", "Mobikwik"];

export default function Payment() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [method, setMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [card, setCard] = useState({ cardNumber: "", cardName: "", expiry: "", cvv: "" });
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("");
  const [wallet, setWallet] = useState("");
  const [walletPhone, setWalletPhone] = useState("");

  useEffect(() => {
    const data = getCheckoutSession();
    if (!data || !items.length) {
      navigate("/checkout", { replace: true });
      return;
    }
    setSession(data);
  }, [items.length, navigate]);

  if (!session) {
    return (
      <div className="payment-page">
        <div className="container">Loading payment...</div>
      </div>
    );
  }

  const { customer, total, cartTotal, discount, shipping, coupon, orderItems } = session;

  const getPaymentDetails = () => {
    if (method === "card") return card;
    if (method === "upi") return { upiId };
    if (method === "netbanking") return { bank };
    if (method === "wallet") return { wallet, phone: walletPhone };
    return {};
  };

  const handlePay = async () => {
    setError("");
    setProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));

      const paymentResult = await processPayment({
        method,
        amount: total,
        details: getPaymentDetails(),
        orderEmail: customer.email,
      });

      const order = await placeOrder({
        items: orderItems,
        customer,
        total,
        coupon,
        discount,
        userId: user?.id || null,
        payment: paymentResult.payment,
      });

      saveLocalOrder(order);
      clearCheckoutSession();
      clearCart();
      setSuccess(true);

      setTimeout(() => {
        navigate(`/orders/${order.id}`, {
          replace: true,
          state: {
            message: `Payment successful! Order #${order.id} confirmed.`,
          },
        });
      }, 1500);
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\D/g, "").slice(0, 16);
    return v.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 2) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return v;
  };

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-steps">
          <span className="done">Bag</span>
          <span className="done">Address</span>
          <span className="active">Payment</span>
        </div>

        <h1>Payment</h1>
        <p className="payment-secure">🔒 100% secure payments powered by MODA Pay</p>

        {success ? (
          <div className="payment-success-card">
            <div className="payment-success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p>Redirecting to your order...</p>
          </div>
        ) : (
          <div className="payment-layout">
            <div className="payment-methods-panel">
              <h2>Select Payment Method</h2>
              <div className="payment-method-list">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`payment-method ${method === m.id ? "active" : ""}`}
                    onClick={() => setMethod(m.id)}
                  >
                    <span className="payment-method__icon">{m.icon}</span>
                    <div>
                      <strong>{m.label}</strong>
                      <span>{m.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="payment-form">
                {method === "upi" && (
                  <>
                    <label>UPI ID</label>
                    <input
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <p className="payment-hint">You will receive a payment request on your UPI app</p>
                  </>
                )}

                {method === "card" && (
                  <>
                    <label>Card Number</label>
                    <input
                      placeholder="1234 5678 9012 3456"
                      value={card.cardNumber}
                      onChange={(e) => setCard({ ...card, cardNumber: formatCardNumber(e.target.value) })}
                      maxLength={19}
                    />
                    <label>Name on Card</label>
                    <input
                      placeholder="As on card"
                      value={card.cardName}
                      onChange={(e) => setCard({ ...card, cardName: e.target.value })}
                    />
                    <div className="form-row">
                      <div>
                        <label>Expiry (MM/YY)</label>
                        <input
                          placeholder="MM/YY"
                          value={card.expiry}
                          onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label>CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          value={card.cvv}
                          onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <p className="payment-hint">Demo: use any valid-format card. Ends in 0000 will decline.</p>
                  </>
                )}

                {method === "netbanking" && (
                  <>
                    <label>Select Bank</label>
                    <select value={bank} onChange={(e) => setBank(e.target.value)}>
                      <option value="">Choose bank</option>
                      {BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </>
                )}

                {method === "wallet" && (
                  <>
                    <label>Wallet</label>
                    <select value={wallet} onChange={(e) => setWallet(e.target.value)}>
                      <option value="">Choose wallet</option>
                      {WALLETS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    />
                  </>
                )}
              </div>

              {error && <p className="payment-error" role="alert">{error}</p>}

              <button
                type="button"
                className="btn btn--primary payment-pay-btn"
                onClick={handlePay}
                disabled={processing}
              >
                {processing ? (
                  <span className="payment-loading">
                    <span className="spinner" /> Processing...
                  </span>
                ) : (
                  `Pay $${total.toFixed(2)}`
                )}
              </button>

              <Link to="/checkout" className="payment-back">← Back to address</Link>
            </div>

            <aside className="payment-summary">
              <h2>Order Summary</h2>
              <div className="payment-summary__row">
                <span>Bag Total</span>
                <span>${cartTotal?.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="payment-summary__row discount">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="payment-summary__row">
                <span>Delivery</span>
                <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="payment-summary__row total">
                <span>Amount to Pay</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <div className="payment-summary__address">
                <h3>Deliver to</h3>
                <p>{customer.firstName} {customer.lastName}</p>
                <p>{customer.address}</p>
                <p>{customer.city} {customer.zip}</p>
                <p>{customer.phone}</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
