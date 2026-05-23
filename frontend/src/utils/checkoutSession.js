const KEY = "moda-checkout-pending";

export function saveCheckoutSession(data) {
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function getCheckoutSession() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCheckoutSession() {
  sessionStorage.removeItem(KEY);
}
