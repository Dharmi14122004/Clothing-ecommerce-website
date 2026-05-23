import { Router } from "express";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { authMiddleware } from "../middleware/auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const usersPath = join(__dirname, "..", "data", "users.json");
const productsPath = join(__dirname, "..", "data", "products.json");

const router = Router();

function loadUsers() {
  return JSON.parse(readFileSync(usersPath, "utf-8"));
}

function saveUsers(users) {
  writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function loadProducts() {
  return JSON.parse(readFileSync(productsPath, "utf-8"));
}

router.get("/ids", authMiddleware, (req, res) => {
  const users = loadUsers();
  const user = users.find((u) => u.id === req.user.id);
  res.json(user?.wishlist || []);
});

router.get("/", authMiddleware, (req, res) => {
  const users = loadUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const wishlist = user.wishlist || [];
  const products = loadProducts().filter((p) => wishlist.includes(p.id));
  res.json(products);
});

router.post("/:productId", authMiddleware, (req, res) => {
  const productId = Number(req.params.productId);
  const products = loadProducts();
  if (!products.find((p) => p.id === productId)) {
    return res.status(404).json({ error: "Product not found" });
  }

  const users = loadUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!user.wishlist) user.wishlist = [];
  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    saveUsers(users);
  }
  res.json({ message: "Added to wishlist", wishlist: user.wishlist });
});

router.delete("/:productId", authMiddleware, (req, res) => {
  const productId = Number(req.params.productId);
  const users = loadUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.wishlist = (user.wishlist || []).filter((id) => id !== productId);
  saveUsers(users);
  res.json({ message: "Removed from wishlist", wishlist: user.wishlist });
});

export default router;
