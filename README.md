# MODA — Myntra-Style Fashion E-Commerce

A full-stack men's and women's clothing store inspired by Myntra, with React + Vite frontend and Express API backend.

## Features (Myntra-like)

| Feature | Description |
|---------|-------------|
| **Home** | Banner carousel, category pills, top brands, deals, trending, recently viewed |
| **Search** | Live suggestions, brand/product search, advanced filters |
| **Shop** | Men/Women collections with brand, price, sale filters & sorting |
| **Product** | Image gallery, brand, ratings, reviews, size chart, wishlist, similar items |
| **Wishlist** | Save favourites (synced when logged in) |
| **Bag / Cart** | Add to bag, quantity, out-of-stock warnings |
| **Checkout** | Saved addresses, coupon codes, price breakdown |
| **Online Payment** | UPI, Card, Net Banking, Wallet (secure checkout flow) |
| **Orders** | Order history + **track order** timeline |
| **Auth** | Sign up, login, profile, saved addresses |
| **Deals** | Dedicated sale page with discounted products |
| **Coupons** | MODA10, FIRST20, FLAT15, FREESHIP |

## Tech Stack

- **Frontend:** React 18, Vite, React Router
- **Backend:** Node.js, Express, JWT, bcrypt
- **Data:** JSON files (products, users, orders, reviews, coupons)

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```
API: **http://localhost:5000**

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App: **http://localhost:3000**

## Coupon Codes

| Code | Offer |
|------|-------|
| MODA10 | 10% off (min $50) |
| FIRST20 | 20% off first order (min $75) |
| FLAT15 | $15 off (min $100) |
| FREESHIP | Free delivery |

## API Overview

- `GET /api/products` — filters: category, brand, minPrice, maxPrice, onSale, sort, search
- `GET /api/deals` — sale products
- `GET /api/search/suggest?q=` — autocomplete
- `GET /api/banners` — homepage carousel
- `POST /api/coupons/validate` — apply coupon
- `GET/POST/DELETE /api/wishlist` — wishlist (auth)
- `GET/POST/DELETE /api/addresses` — saved addresses (auth)
- `POST /api/auth/signup` · `POST /api/auth/login`
- `GET/POST /api/orders` — orders with tracking timeline (requires paid payment)
- `POST /api/payments/process` — process online payment

## Payment Flow

1. **Bag** → add items  
2. **Checkout** → enter delivery address → **Continue to Payment**  
3. **Payment** → choose UPI / Card / Net Banking / Wallet → **Pay**  
4. Order is created only after successful payment  

### Demo payment tips
- **Card:** any 16-digit number (Luhn valid), e.g. `4111 1111 1111 1111`, expiry `12/28`, CVV `123`  
- **Card decline test:** use a card ending in `0000`  
- **UPI:** e.g. `name@paytm`  
- **Net Banking / Wallet:** select option and fill required fields  

## Project Structure

```
e commerce/
├── backend/
│   ├── data/          # products, users, orders, reviews, coupons, banners
│   ├── routes/        # auth, store, wishlist, addresses
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # SearchBar, BannerCarousel, WishlistButton, etc.
        ├── context/     # Auth, Cart, Wishlist
        └── pages/       # Home, Shop, Search, Deals, Profile, etc.
```

MIT License
