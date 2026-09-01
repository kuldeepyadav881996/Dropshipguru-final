# Render Deployment Checklist — DropshipGuru Backend

**Verdict: Yes — the backend is structurally ready for Render**, after you set secrets and wire the frontend API base URL.

---

## Pre-flight verification (current repo)

| Check | Status | Evidence |
|---|---|---|
| `package.json` present | ✅ | `backend/package.json` |
| `start` script | ✅ | `"start": "node server.js"` |
| `engines.node` | ✅ | `>=18` (Render-compatible) |
| Dependencies declared | ✅ | `express`, `cors`, `helmet`, `morgan`, `dotenv`, `razorpay`, `express-rate-limit` |
| `PORT` from env | ✅ | `Number(process.env.PORT) \|\| 5000` in `config/env.js`; `app.listen(env.port)` |
| Health endpoint | ✅ | `GET /health` (+ `GET /api/health`) |
| Razorpay routes | ✅ | `POST /api/payment/create-order`, `/verify`, `/webhook` |
| `.env.example` | ✅ | Documents `PORT`, `NODE_ENV`, `CORS_ORIGINS`, Razorpay keys, webhook secret |
| Secret not in frontend | ✅ | Checkout uses Key ID from create-order only |

---

## Render service setup

- [ ] Create a **Web Service** on Render (not Static Site)
- [ ] Connect the Git repo that contains `backend/`
- [ ] Set **Root Directory** to `backend`
- [ ] **Runtime:** Node
- [ ] **Build Command:** `npm install`
- [ ] **Start Command:** `npm start`
- [ ] **Health Check Path:** `/health`
- [ ] Confirm Render injects `PORT` automatically (do **not** hardcode a port in Start Command)

---

## Environment variables (Render Dashboard → Environment)

Copy from `backend/.env.example`, then fill real values:

- [ ] `NODE_ENV` = `production`
- [ ] `CORS_ORIGINS` = `https://dropshipguru.in,https://www.dropshipguru.in` (add any preview/staging origins needed)
- [ ] `RAZORPAY_KEY_ID` = live Key ID (`rzp_live_…`) — use `rzp_test_…` only for a staging service
- [ ] `RAZORPAY_KEY_SECRET` = matching Secret (**never** commit / never put in frontend)
- [ ] `RAZORPAY_WEBHOOK_SECRET` = webhook signing secret from Razorpay Dashboard
- [ ] `MAX_ORDER_AMOUNT_INR` = optional ceiling (e.g. `100000`)
- [ ] Do **not** upload a public `.env` file; use Render env vars only

> Note: In production the app **requires** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` at startup. Missing any of these will crash the service.

---

## Razorpay Dashboard

- [ ] Switch to **Live** mode for production (or keep Test mode for a staging Render service)
- [ ] Create webhook URL: `https://YOUR-SERVICE.onrender.com/api/payment/webhook`
- [ ] Copy webhook secret → Render `RAZORPAY_WEBHOOK_SECRET`
- [ ] Enable relevant payment events (at least payment captured / failed as needed)
- [ ] Confirm API keys match the mode (test vs live)

---

## Frontend wiring (after backend is live)

- [ ] Set `window.DROPSHIPGURU_API_BASE` to `https://YOUR-SERVICE.onrender.com` (no trailing slash)
- [ ] Redeploy / publish the static site with that value
- [ ] Confirm `CORS_ORIGINS` includes the exact site origin(s) serving `consultation.html`

---

## Post-deploy smoke tests

- [ ] `GET https://YOUR-SERVICE.onrender.com/health` → `{ "success": true, "status": "ok", ... }`
- [ ] `POST /api/payment/create-order` with `{ "amount": 299 }` → returns `orderId` + `keyId`, **no** secret fields
- [ ] `POST /api/payment/verify` with a fake signature → **401** `INVALID_SIGNATURE`
- [ ] Complete one real Checkout payment from the website (test or live)
- [ ] Confirm lead still lands in Google Sheets after successful payment
- [ ] Trigger / wait for a webhook and confirm Render logs show `[razorpay-webhook]`

---

## Common Render pitfalls

- [ ] Root Directory must be `backend` (otherwise `npm start` won’t find `package.json`)
- [ ] Free-tier services spin down when idle — first request may be slow; health checks help keep diagnostics clear
- [ ] If CORS fails, origin must match exactly (scheme + host, no trailing slash)
- [ ] Do not set `HOST=…` unless you know you need it; binding via `PORT` is enough
- [ ] Never put `RAZORPAY_KEY_SECRET` in static HTML/JS or Render “secret files” served publicly

---

## Go / No-Go

| Item | Ready? |
|---|---|
| Code + scripts for Render | **Go** |
| Secrets configured on Render | **You must complete** |
| Frontend `DROPSHIPGURU_API_BASE` updated | **You must complete** |
| Razorpay webhook pointed at Render URL | **You must complete** |

**Deploy only after the three “You must complete” items above are done.**
