const KEY = "moda-recent";

export function addRecentlyViewed(product) {
  try {
    const list = getRecentlyViewed().filter((p) => p.id !== product.id);
    list.unshift({ id: product.id, name: product.name, image: product.image, price: product.price });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 12)));
  } catch {
    /* ignore */
  }
}

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
