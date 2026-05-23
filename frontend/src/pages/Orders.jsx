import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchOrders } from "../api";
import { getLocalOrders, mergeOrders } from "../utils/orders";
import { useAuth } from "../context/AuthContext";
import "./Orders.css";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Orders() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const successMessage = location.state?.message;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [filterEmail, setFilterEmail] = useState(user?.email || "");

  useEffect(() => {
    if (user?.email) setFilterEmail(user.email);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const local = getLocalOrders();
    const emailFilter = filterEmail || user?.email || undefined;

    fetchOrders(emailFilter)
      .then((apiOrders) => {
        setOrders(mergeOrders(apiOrders, local));
      })
      .catch(() => {
        const filtered = filterEmail
          ? local.filter(
              (o) =>
                o.customer?.email?.toLowerCase() === filterEmail.toLowerCase()
            )
          : local;
        setOrders(filtered);
      })
      .finally(() => setLoading(false));
  }, [filterEmail, user?.email]);

  const handleFilter = (e) => {
    e.preventDefault();
    setFilterEmail(email.trim());
  };

  return (
    <div className="orders-page">
      <div className="container">
        <h1>Your Orders</h1>
        <p className="orders-page__subtitle">
          Past orders from completed checkouts
        </p>

        {successMessage && (
          <div className="orders-success" role="status">
            {successMessage}
          </div>
        )}

        {isAuthenticated && (
          <p className="orders-page__logged-in">
            Showing orders for <strong>{user.email}</strong>
          </p>
        )}

        <form className="orders-filter" onSubmit={handleFilter}>
          <input
            type="email"
            placeholder="Filter by email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isAuthenticated}
          />
          <button type="submit" className="btn btn--outline">
            Filter
          </button>
          {filterEmail && (
            <button
              type="button"
              className="orders-filter__clear"
              onClick={() => {
                setEmail("");
                setFilterEmail("");
              }}
            >
              Clear
            </button>
          )}
        </form>

        {loading ? (
          <p className="orders-page__loading">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <p>No orders yet.</p>
            <Link to="/shop/women" className="btn btn--primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <header className="order-card__header">
                  <div>
                    <span className="order-card__id">Order #{order.id}</span>
                    <time>{formatDate(order.createdAt)}</time>
                  </div>
                  <span className="order-card__status">{order.status}</span>
                </header>

                <div className="order-card__customer">
                  <p>
                    {order.customer?.firstName} {order.customer?.lastName}
                  </p>
                  <p>{order.customer?.email}</p>
                  <p>
                    {order.customer?.address}, {order.customer?.city}{" "}
                    {order.customer?.zip}
                  </p>
                </div>

                <ul className="order-card__items">
                  {order.items?.map((item, idx) => (
                    <li key={idx}>
                      <span>
                        {item.name} × {item.quantity}
                        {item.size && ` · ${item.size}`}
                        {item.color && ` · ${item.color}`}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                <footer className="order-card__footer">
                  <span>Total</span>
                  <strong>${order.total?.toFixed(2)}</strong>
                </footer>
                <Link to={`/orders/${order.id}`} className="order-track-btn">
                  Track Order →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
