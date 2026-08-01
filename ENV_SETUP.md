# Environment Setup — Razorpay (DropshipGuru)

Razorpay is configured **from environment variables only**.  
The **Key Secret never appears in frontend code, HTML, or API responses**.

---

## 1. Required variables

Create `backend/.env` from the example:

```bash
cd backend
cp .env.example .env
```

Set at least:

| Variable | Where used | Public? | Purpose |
|---|---|---|---|
| `RAZORPAY_KEY_ID` | Backend → returned to Checkout as `keyId` | **Yes (Key ID)** | Razorpay Checkout `key` |
| `RAZORPAY_KEY_SECRET` | Backend only | **No — secret** | Create orders + verify payment signatures |
| `RAZORPAY_WEBHOOK_SECRET` | Backend webhook route | **No — secret** | Verify `x-razorpay-signature` (required in production) |
| `CORS_ORIGINS` | Backend | Config | Allowed frontend origins |
| `PORT` | Backend | Config | Default `5000` |
| `NODE_ENV` | Backend | Config | `development` / `production` |
| `MAX_ORDER_AMOUNT_INR` | Backend | Config | Optional amount ceiling |

### Example `backend/.env`

```env
PORT=5000
NODE_ENV=development

CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,https://dropshipguru.in,https://www.dropshipguru.in

RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

MAX_ORDER_AMOUNT_INR=100000
```

Get keys from: [Razorpay Dashboard → API Keys](https://dashboard.razorpay.com/app/keys)

---

## 2. Security rules (enforced in code)

| Rule | How it is enforced |
|---|---|
| Read Key ID + Secret from `.env` | `backend/config/env.js` → `process.env.RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` |
| Never expose Secret to frontend | Create-order response returns **only** `keyId` (public Key ID) |
| Key ID only in Checkout | `payment-client.js` uses `key: order.keyId` |
| Verify payment signature on backend | `POST /api/payment/verify` HMAC-SHA256 with Key Secret |
| Reject invalid signatures | Returns **401** `INVALID_SIGNATURE` |
| `.env` not committed | `backend/.gitignore` + root `.gitignore` ignore `.env` |

### Signature verification formula

```
HMAC_SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
```

Compared with `razorpay_signature` using **timing-safe** equality.  
Mismatch → request rejected.

---

## 3. Frontend configuration (no secrets)

In `consultation.html` (or before `payment-client.js`):

```html
<script>
  window.DROPSHIPGURU_API_BASE = 'http://localhost:5000';
  /* Production:
     window.DROPSHIPGURU_API_BASE = 'https://YOUR-BACKEND.onrender.com';
  */
</script>
<script src="payment-client.js"></script>
```

Frontend may know:

- Backend API base URL
- Public Razorpay **Key ID** (received from `/api/payment/create-order`)

Frontend must **never** contain:

- `RAZORPAY_KEY_SECRET`
- Webhook secret
- Any hardcoded `key_secret`

---

## 4. Payment flow

```
Browser                     Backend (.env secrets)              Razorpay
   |                                |                              |
   |-- POST /api/payment/create-order --------------------------->|
   |<- { orderId, amount, keyId } --|                              |
   |-- Checkout.js (key = keyId) -------------------------------->|
   |<- payment success ids ---------|                              |
   |-- POST /api/payment/verify --->| HMAC with KEY_SECRET         |
   |<- { verified: true }  or 401 --|                              |
```

---

## 5. Local checklist

1. Copy `.env.example` → `.env`
2. Paste **test** Key ID + Key Secret
3. `npm install` (inside `backend/`)
4. `npm run dev`
5. Open site with `DROPSHIPGURU_API_BASE=http://localhost:5000`
6. Complete a test payment
7. Confirm `/api/payment/verify` succeeds for real signatures and fails for tampered ones

---

## 6. Production / Render checklist

1. Set `NODE_ENV=production`
2. Set **live** `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` in the host env UI (not in git)
3. Set `RAZORPAY_WEBHOOK_SECRET` and point Razorpay webhook to  
   `https://YOUR-BACKEND/api/payment/webhook`
4. Set `CORS_ORIGINS` to your live site origins only
5. Point frontend `DROPSHIPGURU_API_BASE` to the backend URL
6. Confirm `.env` is not deployed as a public static file

---

## 7. Quick validation

```bash
# Health (no secrets)
curl http://localhost:5000/health

# Create order — response must include keyId, must NOT include keySecret
curl -X POST http://localhost:5000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d "{\"amount\":299,\"currency\":\"INR\"}"

# Verify with a fake signature — must be rejected (401)
curl -X POST http://localhost:5000/api/payment/verify \
  -H "Content-Type: application/json" \
  -d "{\"razorpay_order_id\":\"order_x\",\"razorpay_payment_id\":\"pay_x\",\"razorpay_signature\":\"invalid\"}"
```

Expected verify failure shape:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Invalid payment signature"
  }
}
```

---

## 8. Do / Don’t

**Do**
- Keep secrets only in `backend/.env` or host env vars
- Rotate keys if they are ever leaked
- Use test keys (`rzp_test_…`) locally

**Don’t**
- Put `RAZORPAY_KEY_SECRET` in HTML, JS, or GitHub
- Commit `backend/.env`
- Trust unpaid Checkout callbacks without `/api/payment/verify`
