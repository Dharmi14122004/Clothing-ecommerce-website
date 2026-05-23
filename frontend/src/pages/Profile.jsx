import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAddresses, addAddress, deleteAddress } from "../api";
import "./Profile.css";

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("account");
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [addrForm, setAddrForm] = useState({
    name: "", phone: "", address: "", city: "", state: "", zip: "", country: "United States", isDefault: true,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login", { state: { from: { pathname: "/profile" } } });
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses().then(setAddresses).catch(() => setAddresses([]));
    }
  }, [isAuthenticated]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const addr = await addAddress(addrForm);
      setAddresses((prev) => [...prev, addr]);
      setShowForm(false);
      setAddrForm({ name: "", phone: "", address: "", city: "", state: "", zip: "", country: "United States", isDefault: false });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    await deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  if (authLoading || !user) return <div className="profile-page"><div className="container">Loading...</div></div>;

  return (
    <div className="profile-page">
      <div className="container profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-user">
            <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
          <nav>
            <button type="button" className={tab === "account" ? "active" : ""} onClick={() => setTab("account")}>Account</button>
            <button type="button" className={tab === "addresses" ? "active" : ""} onClick={() => setTab("addresses")}>Addresses</button>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">Wishlist</Link>
          </nav>
        </aside>
        <main className="profile-main">
          {tab === "account" && (
            <>
              <h1>My Account</h1>
              <div className="profile-card">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="profile-quick-links">
                <Link to="/orders" className="profile-link-card">📦 Track Orders</Link>
                <Link to="/wishlist" className="profile-link-card">❤️ Wishlist</Link>
                <Link to="/deals" className="profile-link-card">🏷️ Deals & Offers</Link>
              </div>
            </>
          )}
          {tab === "addresses" && (
            <>
              <div className="profile-header-row">
                <h1>Saved Addresses</h1>
                <button type="button" className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
                  {showForm ? "Cancel" : "+ Add Address"}
                </button>
              </div>
              {showForm && (
                <form className="profile-card address-form" onSubmit={handleAddAddress}>
                  <input placeholder="Full name" required value={addrForm.name} onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })} />
                  <input placeholder="Phone" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} />
                  <input placeholder="Address" required value={addrForm.address} onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })} />
                  <div className="form-row">
                    <input placeholder="City" required value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} />
                    <input placeholder="ZIP" required value={addrForm.zip} onChange={(e) => setAddrForm({ ...addrForm, zip: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn--primary">Save Address</button>
                </form>
              )}
              {addresses.length === 0 ? (
                <p className="profile-empty">No saved addresses yet.</p>
              ) : (
                addresses.map((a) => (
                  <div key={a.id} className="profile-card address-card">
                    {a.isDefault && <span className="address-default">Default</span>}
                    <p><strong>{a.name}</strong> · {a.phone}</p>
                    <p>{a.address}, {a.city} {a.zip}</p>
                    <button type="button" className="address-delete" onClick={() => handleDelete(a.id)}>Delete</button>
                  </div>
                ))
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
