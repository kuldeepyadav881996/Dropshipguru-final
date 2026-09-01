# DropshipGuru Backend Setup

Production-ready **Node.js + Express** API for Razorpay payments, designed for the existing static DropshipGuru website.

**Do not deploy until secrets and domain CORS are configured.**

---

## Folder structure

```
backend/
  server.js
  package.json
  .env.example
  .gitignore
  config/
    env.js
    razorpay.js
  routes/
    index.js
    paymentRoutes.js
  controllers/
    paymentController.js
  middleware/
    errorHandler.js
    validate.js
    security.js
  services/
    razorpayService.js
```

Frontend helper (root):

- `payment-client.js` — browser Checkout client (Key ID only; never Secret)
- `consultation.html` — opens Razorpay when payable amount > 0, then submits the lead

---

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness check (also available at `/api/health`) |
| `POST` | `/api/payment/create-order` | Create Razorpay order (server uses Secret) |
| `POST` | `/api/payment/verify` | Verify Checkout payment signature |
| `POST` | `/api/payment/webhook` | Razorpay webhook (HMAC verified) |

### Create order body

```json
{
  "amount": 299,
  "currency": "INR",
  "receipt": "optional",
  "notes": { "selectedType": "COURSE" },
  "customer": {
    "name": "Rahul",
    "email": "rahul@example.com",
    "contact": "9876543210"
  }
}
```

`amount` is in **INR** (rupees). Backend converts to paise.

### Verify body

```json
{
  "razorpay_order_id": "order_...",
  "razorpay_payment_id": "pay_...",
  "razorpay_signature": "..."
}
```

---

## Local setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Server defaults to `http://localhost:5000`.

### `.env` keys

| Variable | Required | Notes |
|---|---|---|
| `PORT` | No | Default `5000` |
| `NODE_ENV` | Yes in prod | `production` / `development` |
| `CORS_ORIGINS` | Yes | Comma-separated origins, e.g. `https://dropshipguru.in,http://localhost:5500` |
| `RAZORPAY_KEY_ID` | Yes | Public Key ID (safe to return to browser) |
| `RAZORPAY_KEY_SECRET` | Yes | **Never expose to frontend** |
| `RAZORPAY_WEBHOOK_SECRET` | Yes in prod | From Razorpay Dashboard → Webhooks |
| `MAX_ORDER_AMOUNT_INR` | No | Default `100000` |

---

## Frontend configuration

In `consultation.html` (or globally before `payment-client.js`):

```html
<script>
  window.DROPSHIPGURU_API_BASE = 'https://YOUR-RENDER-SERVICE.onrender.com';
</script>
<script src="payment-client.js"></script>
```

Local default is `http://localhost:5000`.

Flow on consultation submit:

1. If payable amount > 0 → `POST /api/payment/create-order`
2. Razorpay Checkout opens (Key ID only)
3. On success → `POST /api/payment/verify`
4. Lead is then sent to Google Sheets (existing flow), with payment IDs appended to the message

Free / zero-amount consultations skip Razorpay and submit the lead only.

---

## Security features

- **Helmet** HTTP headers
- **CORS** allow-list via `CORS_ORIGINS`
- **Morgan** request logging
- **dotenv** for secrets
- **express-rate-limit** on payment routes
- Secret Key used only on the server
- Webhook HMAC verification with raw body
- Timing-safe signature compare
- Centralized error handler (no stack leaks in production)
- Amount ceiling via `MAX_ORDER_AMOUNT_INR`

---

## Render deployment (ready, not deployed)

1. Create a new **Web Service** on Render from this repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Set environment variables from `.env.example` (use live Razorpay keys in production).
6. Add webhook in Razorpay Dashboard:
   - URL: `https://YOUR-SERVICE.onrender.com/api/payment/webhook`
   - Secret → `RAZORPAY_WEBHOOK_SECRET`
7. Update frontend `DROPSHIPGURU_API_BASE` to the Render URL.
8. Ensure `CORS_ORIGINS` includes `https://dropshipguru.in` (and `www` if used).

Health check path for Render: `/health`

---

## Quick API smoke tests

```bash
# Health
curl https://YOUR-SERVICE.onrender.com/health

# Create order (test keys)
curl -X POST https://YOUR-SERVICE.onrender.com/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount":299,"currency":"INR","notes":{"test":"1"}}'
```

---

## Notes

- This backend does **not** replace Google Sheets lead capture; it secures payments only.
- Webhook handler currently acknowledges verified events and logs them. Extend `paymentController.handleWebhook` for fulfillment automation later.
- Never commit `backend/.env`.
