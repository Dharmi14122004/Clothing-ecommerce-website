const ORDERS_KEY = "moda-orders";

export function getLocalOrders() {
  try {
    const saved = localStorage.getItem(ORDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order) {
  const orders = getLocalOrders();
  const exists = orders.some((o) => o.id === order.id);
  if (!exists) {
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
}

export function mergeOrders(apiOrders, localOrders) {
  const map = new Map();
  [...localOrders, ...apiOrders].forEach((order) => {
    map.set(order.id, order);
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}
