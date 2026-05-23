import { Router } from "express";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { authMiddleware } from "../middleware/auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const usersPath = join(__dirname, "..", "data", "users.json");

const router = Router();

function loadUsers() {
  return JSON.parse(readFileSync(usersPath, "utf-8"));
}

function saveUsers(users) {
  writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

router.get("/", authMiddleware, (req, res) => {
  const users = loadUsers();
  const user = users.find((u) => u.id === req.user.id);
  res.json(user?.addresses || []);
});

router.post("/", authMiddleware, (req, res) => {
  const { name, phone, address, city, state, zip, country, isDefault } = req.body;
  if (!name || !address || !city || !zip) {
    return res.status(400).json({ message: "Name, address, city and ZIP are required" });
  }

  const users = loadUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!user.addresses) user.addresses = [];
  const newAddr = {
    id: user.addresses.length ? Math.max(...user.addresses.map((a) => a.id)) + 1 : 1,
    name,
    phone: phone || "",
    address,
    city,
    state: state || "",
    zip,
    country: country || "United States",
    isDefault: !!isDefault,
  };

  if (newAddr.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(newAddr);
  saveUsers(users);
  res.status(201).json(newAddr);
});

router.delete("/:id", authMiddleware, (req, res) => {
  const users = loadUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.addresses = (user.addresses || []).filter((a) => a.id !== Number(req.params.id));
  saveUsers(users);
  res.json({ message: "Address deleted" });
});

export default router;
