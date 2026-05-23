import { Router } from "express";
import bcrypt from "bcryptjs";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { signToken, authMiddleware } from "../middleware/auth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const usersPath = join(__dirname, "..", "data", "users.json");

const router = Router();

function loadUsers() {
  if (!existsSync(usersPath)) return [];
  try {
    return JSON.parse(readFileSync(usersPath, "utf-8"));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Name, email, and password are required.",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Please enter a valid email address.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Password must be at least 6 characters.",
    });
  }

  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email === normalizedEmail)) {
    return res.status(409).json({
      error: "Email exists",
      message: "An account with this email already exists. Please log in.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);

  const token = signToken(user);
  res.status(201).json({
    message: "Account created successfully.",
    token,
    user: sanitizeUser(user),
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Email and password are required.",
    });
  }

  const users = loadUsers();
  const user = users.find((u) => u.email === email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({
      error: "Invalid credentials",
      message: "Invalid email or password.",
    });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({
      error: "Invalid credentials",
      message: "Invalid email or password.",
    });
  }

  const token = signToken(user);
  res.json({
    message: "Logged in successfully.",
    token,
    user: sanitizeUser(user),
  });
});

router.get("/me", authMiddleware, (req, res) => {
  const users = loadUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ user: sanitizeUser(user) });
});

export default router;
