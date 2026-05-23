import { Router } from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const paymentsPath = join(__dirname, "..", "data", "payments.json");

const router = Router();

function loadPayments() {
  if (!existsSync(paymentsPath)) return [];
  try {
    return JSON.parse(readFileSync(paymentsPath, "utf-8"));
  } catch {
    return [];
  }
}

function savePayments(payments) {
  writeFileSync(paymentsPath, JSON.stringify(payments, null, 2));
}

function luhnCheck(cardNumber) {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function validatePayment(method, details, amount) {
  if (!amount || amount <= 0) {
    return { valid: false, message: "Invalid payment amount." };
  }

  if (method === "card") {
    const { cardNumber, cardName, expiry, cvv } = details;
    const num = (cardNumber || "").replace(/\s/g, "");
    if (!cardName?.trim()) return { valid: false, message: "Enter name on card." };
    if (!luhnCheck(num)) return { valid: false, message: "Invalid card number." };
    if (!/^\d{3,4}$/.test(cvv || "")) return { valid: false, message: "Invalid CVV." };
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry || "")) {
      return { valid: false, message: "Expiry must be MM/YY." };
    }
    if (num.endsWith("0000")) {
      return { valid: false, message: "Payment declined by bank. Try another card." };
    }
    return { valid: true, masked: `**** **** **** ${num.slice(-4)}` };
  }

  if (method === "upi") {
    const upi = (details.upiId || "").trim();
    if (!/^[\w.-]+@[\w.-]+$/.test(upi)) {
      return { valid: false, message: "Enter a valid UPI ID (e.g. name@upi)." };
    }
    return { valid: true, masked: upi };
  }

  if (method === "netbanking") {
    if (!details.bank) return { valid: false, message: "Select your bank." };
    return { valid: true, masked: details.bank };
  }

  if (method === "wallet") {
    if (!details.wallet) return { valid: false, message: "Select a wallet." };
    const phone = (details.phone || "").replace(/\D/g, "");
    if (phone.length < 10) return { valid: false, message: "Enter linked mobile number." };
    return { valid: true, masked: `${details.wallet} · ${phone.slice(-4)}` };
  }

  return { valid: false, message: "Invalid payment method." };
}

router.post("/process", (req, res) => {
  const { method, amount, details, orderEmail } = req.body;

  if (!method || !amount) {
    return res.status(400).json({ success: false, message: "Payment method and amount required." });
  }

  const validation = validatePayment(method, details || {}, Number(amount));
  if (!validation.valid) {
    return res.status(400).json({ success: false, message: validation.message });
  }

  const payments = loadPayments();
  const paymentId = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const payment = {
    paymentId,
    method,
    amount: Number(amount),
    status: "success",
    maskedDetail: validation.masked,
    email: orderEmail || null,
    createdAt: new Date().toISOString(),
  };

  payments.push(payment);
  savePayments(payments);

  res.json({
    success: true,
    message: "Payment successful!",
    payment: {
      paymentId,
      method,
      amount: payment.amount,
      status: "paid",
      maskedDetail: validation.masked,
      paidAt: payment.createdAt,
    },
  });
});

export default router;
