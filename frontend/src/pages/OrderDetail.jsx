import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { fetchOrder } from "../api";
import { getLocalOrders } from "../utils/orders";
import "./OrderDetail.css";

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const successMessage = location.state?.message;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(id)
      .then(setOrder)
      .catch(() => {
        const local = getLocalOrders().find((o) => o.id === Number(id));
        setOrder(local || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container" style={{ padding: "3rem 0" }}>Loading order...</div>;
  if (!order) return <div className="container" style={{ padding: "3rem 0" }}>Order not found. <Link to="/orders">Back to orders</Link></div>;

  const tracking = order.tracking || [];

  return (
    <div className="order-detail">
      <div className="container">
        <Link to="/orders" className="order-detail__back">← Back to Orders</Link>
        {successMessage && (
          <div className="orders-success" style={{ marginBottom: "1rem" }}>{successMessage}</div>
        )}
        <h1>Order #{order.id}</h1>
        <p className="order-detail__date">
          Placed on {new Date(order.createdAt).toLocaleString()}
        </p>

        <div className="order-detail__grid">
          <section className="order-tracking">
            <h2>Track Order</h2>
            <div className="tracking-timeline">
              {tracking.map((step, i) => (
                <div key={step.status} className={`tracking-step ${step.done ? "is-done" : ""} ${i === tracking.findIndex((s) => !s.done) ? "is-current" : ""}`}>
                  <div className="tracking-step__dot" />
                  <div className="tracking-step__content">
                    <strong>{step.label}</strong>
                    {step.date && <span>{new Date(step.date).toLocaleString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside>
            <div className="order-detail__card">
              <h3>Delivery Address</h3>
              <p>{order.customer?.firstName} {order.customer?.lastName}</p>
              <p>{order.customer?.email}</p>
              <p>{order.customer?.address}</p>
              <p>{order.customer?.city} {order.customer?.zip}</p>
            </div>
            {order.payment && (
              <div className="order-detail__card payment-info-card">
                <h3>Payment</h3>
                <p className="payment-paid-badge">✓ Paid</p>
                <p><strong>ID:</strong> {order.payment.paymentId}</p>
                <p><strong>Method:</strong> {order.payment.method?.toUpperCase()}</p>
                {order.payment.maskedDetail && (
                  <p><strong>Details:</strong> {order.payment.maskedDetail}</p>
                )}
                <p><strong>Amount:</strong> ${order.payment.amount?.toFixed(2)}</p>
                <p className="payment-date">
                  Paid on {new Date(order.payment.paidAt).toLocaleString()}
                </p>
              </div>
            )}
            <div className="order-detail__card">
              <h3>Items</h3>
              <ul className="order-detail__items">
                {order.items?.map((item, idx) => (
                  <li key={idx}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              {order.coupon && <p className="order-coupon">Coupon: {order.coupon}</p>}
              {order.discount > 0 && <p className="order-discount">Discount: -${order.discount.toFixed(2)}</p>}
              <p className="order-total"><strong>Total: ${order.total?.toFixed(2)}</strong></p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
