# Deploy MODA for Your Portfolio (Free)

Deploy so anyone can open a **live link** on your resume/portfolio.

**Recommended (free):**
- **Frontend** → [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
- **Backend** → [Render](https://render.com)

---

## Step 1 — Push code to GitHub

1. Create a repo at [github.com/new](https://github.com/new) (e.g. `moda-ecommerce`)
2. In VS Code terminal (project root):

```powershell
git init
git add .
git commit -m "MODA full-stack ecommerce project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/moda-ecommerce.git
git push -u origin main
```

Replace `YOUR_USERNAME` and repo name with yours.

---

## Step 2 — Deploy backend (Render)

1. Go to [render.com](https://render.com) → Sign up (free)
2. **New +** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Name:** `moda-api`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Environment variables** (Environment tab):

| Key | Value |
|-----|--------|
| `JWT_SECRET` | any long random string |
| `FRONTEND_URL` | leave empty for now, add after Step 3 |

6. Click **Create Web Service**
7. Copy your URL, e.g. `https://moda-api.onrender.com`

Test: open `https://moda-api.onrender.com/api/health` — should show JSON.

> Free Render sleeps after ~15 min idle; first visit may take 30–60 seconds to wake up.

---

## Step 3 — Deploy frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. **Add New Project** → import your repo
3. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
4. **Environment Variables:**

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://moda-api.onrender.com/api` |

(use your real Render URL from Step 2)

5. **Deploy**
6. Copy your site URL, e.g. `https://moda-ecommerce.vercel.app`

---

## Step 4 — Link frontend & backend

1. Back on **Render** → your backend service → **Environment**
2. Set `FRONTEND_URL` = your Vercel URL (e.g. `https://moda-ecommerce.vercel.app`)
3. Save (service will redeploy)

---

## Step 5 — Add to your portfolio

### On your portfolio website, add a project card:

**MODA — Fashion E-Commerce (Full Stack)**  
React, Node.js, Express, JWT auth, payments, wishlist, order tracking  

- **Live Demo:** https://your-site.vercel.app  
- **GitHub:** https://github.com/YOUR_USERNAME/moda-ecommerce  

### Screenshot tips
- Home page with banners  
- Product page  
- Payment page  
- Mobile view (resize browser)  

### What to write (short)
> Built a Myntra-style clothing store with React and Express. Includes search, filters, cart, online payment flow, user accounts, wishlist, coupons, and order tracking.

---

## Optional — Custom domain

- **Vercel:** Project → Settings → Domains → add `shop.yourname.com`
- Point DNS from your domain provider (Vercel shows instructions)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Products don't load | Backend not running; check `VITE_API_URL` ends with `/api` |
| Login fails | Set `FRONTEND_URL` on Render to exact Vercel URL (no trailing slash) |
| Slow first load | Render free tier waking from sleep — normal |
| Orders reset | Free tier may reset JSON data on redeploy — OK for demo portfolio |

---

## Alternative hosts

| Part | Options |
|------|---------|
| Frontend | Netlify, GitHub Pages (needs API URL config) |
| Backend | Railway, Fly.io |
| Both | Railway (one project, two services) |

For a student portfolio, **Vercel + Render** is the most common and free.
