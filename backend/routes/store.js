import { Router } from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");

const router = Router();

function loadJson(file) {
  return JSON.parse(readFileSync(join(dataDir, file), "utf-8"));
}

router.get("/banners", (_req, res) => {
  res.json(loadJson("banners.json"));
});

router.get("/brands", (_req, res) => {
  const products = loadJson("products.json");
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort();
  res.json(brands.map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-") })));
});

router.post("/coupons/validate", (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: "Enter a coupon code" });
  }

  const coupons = loadJson("coupons.json");
  const coupon = coupons.find((c) => c.code === code.toUpperCase().trim());

  if (!coupon) {
    return res.json({ valid: false, message: "Invalid coupon code" });
  }

  if (subtotal < coupon.minOrder) {
    return res.json({
      valid: false,
      message: `Minimum order of $${coupon.minOrder} required for this coupon`,
    });
  }

  let discount = 0;
  if (coupon.type === "percent") {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else if (coupon.type === "flat") {
    discount = coupon.value;
  } else if (coupon.type === "shipping") {
    discount = 0;
  }

  res.json({
    valid: true,
    coupon: { code: coupon.code, description: coupon.description, type: coupon.type },
    discount: Math.round(discount * 100) / 100,
    freeShipping: coupon.type === "shipping",
    message: `Coupon applied! You save $${discount.toFixed(2)}`,
  });
});

export default router;
