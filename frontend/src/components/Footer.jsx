import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <span className="footer__logo">MODA</span>
          <p>Curated essentials for modern wardrobes. Quality fabrics, timeless silhouettes.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop/men">Men&apos;s Collection</Link></li>
            <li><Link to="/shop/women">Women&apos;s Collection</Link></li>
            <li><Link to="/orders">Order History</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </ul>
        </div>
        <div>
          <h4>Help</h4>
          <ul>
            <li><a href="#shipping">Shipping & Returns</a></li>
            <li><a href="#size">Size Guide</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Newsletter</h4>
          <p className="footer__newsletter-text">Get 10% off your first order.</p>
          <form className="footer__form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email" aria-label="Email" />
            <button type="submit">Join</button>
          </form>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>&copy; {new Date().getFullYear()} MODA. All rights reserved.</p>
      </div>
    </footer>
  );
}
