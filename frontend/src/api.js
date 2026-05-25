const API = "https://moda-backend-dlfh.onrender.com/api";
const TOKEN_KEY = "moda-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res) {
  try {
    const data = await res.json();
    return data.message || data.error || "Request failed";
  } catch {
    return "Request failed";
  }
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, ...authHeaders() },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function signupUser(name, email, password) {
  const res = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function fetchMe() {
  return apiFetch(`${API}/auth/me`);
}

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/products${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchDeals() {
  const res = await fetch(`${API}/deals`);
  if (!res.ok) throw new Error("Failed to fetch deals");
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`${API}/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

export async function fetchSimilarProducts(id) {
  const res = await fetch(`${API}/products/${id}/similar`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchReviews(productId) {
  const res = await fetch(`${API}/products/${productId}/reviews`);
  if (!res.ok) return [];
  return res.json();
}

export async function postReview(productId, data) {
  const res = await fetch(`${API}/products/${productId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchBanners() {
  const res = await fetch(`${API}/banners`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchBrands() {
  const res = await fetch(`${API}/brands`);
  if (!res.ok) return [];
  return res.json();
}

export async function searchSuggest(q) {
  const res = await fetch(`${API}/search/suggest?q=${encodeURIComponent(q)}`);
  if (!res.ok) return { products: [], brands: [] };
  return res.json();
}

export async function validateCoupon(code, subtotal) {
  const res = await fetch(`${API}/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  });
  return res.json();
}

export async function fetchOrders(email) {
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiFetch(`${API}/orders${query}`);
}

export async function fetchOrder(id) {
  return apiFetch(`${API}/orders/${id}`);
}

export async function processPayment({ method, amount, details, orderEmail }) {
  const res = await fetch(`${API}/payments/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ method, amount, details, orderEmail }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Payment failed");
  }
  return data;
}

export async function placeOrder(orderData) {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const message = await parseError(res);
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function fetchWishlistIds() {
  return apiFetch(`${API}/wishlist/ids`);
}

export async function fetchWishlist() {
  return apiFetch(`${API}/wishlist`);
}

export async function addToWishlistApi(productId) {
  return apiFetch(`${API}/wishlist/${productId}`, { method: "POST" });
}

export async function removeFromWishlistApi(productId) {
  return apiFetch(`${API}/wishlist/${productId}`, { method: "DELETE" });
}

export async function fetchAddresses() {
  return apiFetch(`${API}/addresses`);
}

export async function addAddress(data) {
  return apiFetch(`${API}/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(id) {
  return apiFetch(`${API}/addresses/${id}`, { method: "DELETE" });
}

export function isProductInStock(product) {
  return product?.inStock !== false;
}

export function getDiscount(product) {
  return product.discount ?? (product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0);
}
