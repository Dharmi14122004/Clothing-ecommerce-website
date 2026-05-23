import express from "express";
import cors from "cors";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import authRoutes from "./routes/auth.js";
import storeRoutes from "./routes/store.js";
import wishlistRoutes from "./routes/wishlist.js";
import addressRoutes from "./routes/addresses.js";
import paymentRoutes from "./routes/payments.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const dataDir = join(__dirname, "data");

const productsPath = join(dataDir, "products.json");
const ordersPath = join(dataDir, "orders.json");
const reviewsPath = join(dataDir, "reviews.json");

const BRANDS = ["Roadster", "H&M", "Mango", "Zara", "Nike", "Puma", "Levis", "Biba"];

app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",").map((u) => u.trim())
      : true,
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", storeRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/payments", paymentRoutes);

function enrichProduct(p) {
  const discount = p.originalPrice
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : 0;
  return {
    ...p,
    brand: p.brand || BRANDS[(p.id - 1) % BRANDS.length],
    images: p.images || [p.image, p.image],
    reviewCount: p.reviewCount || Math.floor(15 + p.rating * 12),
    discount,
    onSale: discount > 0,
  };
}

const products = JSON.parse(readFileSync(productsPath, "utf-8")).map(enrichProduct);

function loadReviews() {
  if (!existsSync(reviewsPath)) return [];
  return JSON.parse(readFileSync(reviewsPath, "utf-8"));
}

function saveReviews(reviews) {
  writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
}

function loadOrders() {
  if (!existsSync(ordersPath)) return [];
  try {
    return JSON.parse(readFileSync(ordersPath, "utf-8"));
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
}

let orders = loadOrders();
let orderId = orders.length ? Math.max(...orders.map((o) => o.id)) + 1 : 1;

function findProduct(id) {
  return products.find((p) => p.id === Number(id));
}

function isInStock(product) {
  return product?.inStock !== false;
}

function getOutOfStockItems(items) {
  return items
    .map((item) => {
      const product = findProduct(item.productId);
      if (!product) return { ...item, reason: "Product not found" };
      if (!isInStock(product))
        return { ...item, name: product.name, reason: "Out of stock" };
      return null;
    })
    .filter(Boolean);
}

function buildTracking(createdAt) {
  const t = new Date(createdAt);
  return [
    { status: "placed", label: "Order Placed", done: true, date: createdAt },
    { status: "confirmed", label: "Confirmed", done: true, date: createdAt },
    {
      status: "packed",
      label: "Packed",
      done: true,
      date: new Date(t.getTime() + 3600000).toISOString(),
    },
    {
      status: "shipped",
      label: "Shipped",
      done: true,
      date: new Date(t.getTime() + 86400000).toISOString(),
    },
    {
      status: "out_for_delivery",
      label: "Out for Delivery",
      done: false,
      date: null,
    },
    { status: "delivered", label: "Delivered", done: false, date: null },
  ];
}

function filterProducts(query) {
  const {
    category,
    subcategory,
    featured,
    search,
    sort,
    brand,
    minPrice,
    maxPrice,
    minDiscount,
    onSale,
    inStock,
  } = query;

  let result = [...products];

  if (category) result = result.filter((p) => p.category === category.toLowerCase());
  if (subcategory)
    result = result.filter((p) => p.subcategory === subcategory.toLowerCase());
  if (featured === "true") result = result.filter((p) => p.featured);
  if (brand) result = result.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  if (minPrice) result = result.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));
  if (minDiscount)
    result = result.filter((p) => p.discount >= Number(minDiscount));
  if (onSale === "true") result = result.filter((p) => p.onSale);
  if (inStock === "true") result = result.filter((p) => isInStock(p));

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
  else if (sort === "rating") result.sort((a, b) => b.rating - a.rating);
  else if (sort === "discount") result.sort((a, b) => b.discount - a.discount);
  else if (sort === "new") result.sort((a, b) => b.id - a.id);

  return result;
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", store: "MODA" });
});

app.get("/api/search/suggest", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  if (!q || q.length < 2) return res.json({ products: [], brands: [] });

  const matched = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.subcategory.includes(q)
    )
    .slice(0, 6);

  const brands = [...new Set(products.map((p) => p.brand))]
    .filter((b) => b.toLowerCase().includes(q))
    .slice(0, 4);

  res.json({ products: matched, brands });
});

app.get("/api/products", (req, res) => {
  res.json(filterProducts(req.query));
});

app.get("/api/deals", (_req, res) => {
  res.json(products.filter((p) => p.onSale).sort((a, b) => b.discount - a.discount));
});

app.get("/api/products/:id/similar", (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const similar = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.subcategory === product.subcategory)
    )
    .slice(0, 4);
  res.json(similar);
});

app.get("/api/products/:id/reviews", (req, res) => {
  const reviews = loadReviews().filter(
    (r) => r.productId === Number(req.params.id)
  );
  res.json(reviews);
});

app.post("/api/products/:id/reviews", (req, res) => {
  const { userName, rating, comment } = req.body;
  if (!userName || !rating || !comment) {
    return res.status(400).json({ message: "Name, rating and comment required" });
  }
  const reviews = loadReviews();
  const review = {
    id: reviews.length ? Math.max(...reviews.map((r) => r.id)) + 1 : 1,
    productId: Number(req.params.id),
    userName,
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString(),
  };
  reviews.push(review);
  saveReviews(reviews);
  res.status(201).json(review);
});

app.get("/api/products/:id", (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.get("/api/categories", (_req, res) => {
  res.json({
    men: {
      label: "Men",
      subcategories: ["shirts", "pants", "outerwear", "knitwear"],
      image:
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80",
    },
    women: {
      label: "Women",
      subcategories: ["dresses", "pants", "outerwear", "tops", "skirts"],
      image:
        "https://images.unsplash.com/photo-1483985988355-763728ebc545?w=800&q=80",
    },
  });
});

app.post("/api/orders", (req, res) => {
  const { items, customer, total, coupon, discount, userId, payment } = req.body;
  if (!items?.length || !customer?.email) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  if (!payment?.paymentId || payment?.status !== "paid") {
    return res.status(400).json({
      error: "Payment required",
      message: "Please complete online payment before placing your order.",
    });
  }

  const outOfStock = getOutOfStockItems(items);
  if (outOfStock.length > 0) {
    const names = outOfStock.map((i) => i.name || `Product #${i.productId}`).join(", ");
    return res.status(400).json({
      error: "Some items are out of stock",
      message: `Sorry, the following item(s) are out of stock: ${names}. Please remove them from your cart and try again.`,
      outOfStock,
    });
  }

  const createdAt = new Date().toISOString();
  const order = {
    id: orderId++,
    items,
    customer,
    total,
    coupon: coupon || null,
    discount: discount || 0,
    userId: userId || null,
    payment: {
      paymentId: payment.paymentId,
      method: payment.method,
      amount: payment.amount || total,
      status: "paid",
      maskedDetail: payment.maskedDetail || null,
      paidAt: payment.paidAt || createdAt,
    },
    status: "confirmed",
    tracking: buildTracking(createdAt),
    createdAt,
  };
  orders.push(order);
  saveOrders(orders);
  res.status(201).json(order);
});

app.get("/api/orders", (req, res) => {
  const { email } = req.query;
  let result = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  if (email) {
    const e = email.toLowerCase();
    result = result.filter((o) => o.customer?.email?.toLowerCase() === e);
  }
  res.json(result);
});

app.get("/api/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (!order.tracking) order.tracking = buildTracking(order.createdAt);
  res.json(order);
});

app.listen(PORT, () => {
  console.log(`MODA API running at http://localhost:${PORT}`);
});
