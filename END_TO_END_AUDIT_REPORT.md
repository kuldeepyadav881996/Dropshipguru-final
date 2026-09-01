# DropshipGuru — Complete End-to-End Audit Report

**Date:** 2026-08-02  
**Scope:** Frontend (GitHub Pages / `dropshipguru.in`), Render backend, Razorpay, Google Apps Script  
**Method:** Full local file inspection + live HTTPS probes (health, CORS, create-order, deployed HTML/JS). No production secrets were read from disk (`backend/.env` absent locally).

---

## STEP 1 — Project analysis & dependency map

```
index.html
  ├─ assets/app.css, brand-icons.css, mobile-layout.css
  ├─ brand-icons.js, product gallery / jewellery scripts
  └─ CTAs → consultation.html?plan|course|service|platform…

consultation.html
  ├─ brand-icons.css + inline CSS + mobile-layout.css
  ├─ google-sheet-submit.js ──POST──► Google Apps Script (free / ₹0 leads)
  ├─ payment-client.js
  │     ├─ POST {API}/api/payment/create-order
  │     ├─ Razorpay Checkout (Key ID only)
  │     └─ POST {API}/api/payment/verify (+ full customer fields)
  └─ (paid) server writes sheet; browser does NOT resubmit sheet

backend/server.js
  ├─ config/env.js          (RAZORPAY_*, CORS_ORIGINS, GOOGLE_SCRIPT_URL)
  ├─ config/razorpay.js
  ├─ routes/index.js → paymentRoutes.js
  ├─ controllers/paymentController.js
  ├─ services/razorpayService.js      → Razorpay Orders API + HMAC verify
  ├─ services/googleSheetsService.js  → Apps Script after verify
  └─ middleware: validate, security (rate limit), errorHandler

Razorpay Dashboard webhook → POST /api/payment/webhook (ack only; sheet on /verify)
```

### Key files located

| Asset | Path |
|--------|------|
| payment-client.js | `/payment-client.js` |
| consultation.html | `/consultation.html` |
| index.html | `/index.html` |
| Backend | `/backend/` |
| Controllers | `/backend/controllers/paymentController.js` |
| Routes | `/backend/routes/` |
| Services | `/backend/services/` |
| Config / env | `/backend/config/env.js`, `/backend/config/razorpay.js` |
| Mobile CSS | `/mobile-layout.css` (+ synced rules in `assets/app.css`) |
| Free-lead GAS client | `/google-sheet-submit.js` |

---

## STEP 2 — Frontend check

### Form (`consultation.html` `#leadForm`)

| Check | Status |
|--------|--------|
| Required: name, phone (10 digits), email, state, profession | OK |
| Step validation `validateStep1()` | OK |
| Submit button `#submitBtn` | OK |
| Paid path opens Razorpay via `DropshipGuruPayments.startCheckout` | OK (local) |
| Free path `GoogleSheetSubmit.submitToGoogleSheet` | OK |
| Async success / cancel / error handling | OK |
| Paid path avoids duplicate browser sheet submit | OK (local) |

### URLs used

| Call | URL |
|------|-----|
| Create order | `POST {API_BASE}/api/payment/create-order` |
| Verify | `POST {API_BASE}/api/payment/verify` |
| Webhook (Razorpay → server) | `POST {API_BASE}/api/payment/webhook` |
| Health | `GET {API_BASE}/health` |
| Free leads (browser) | `POST https://script.google.com/macros/s/AKfycbz…/exec` |
| Paid leads (server) | same Apps Script URL via `GOOGLE_SCRIPT_URL` |
| Checkout script | `https://checkout.razorpay.com/v1/checkout.js` |
| Production API | `https://dropshipgurufi-api.onrender.com` |

---

## STEP 3 — Backend check

| Item | Status |
|------|--------|
| `server.js` listen / trust proxy / Helmet / CORS / Morgan | OK |
| `express.json` + raw body for webhook | OK |
| Routes: create-order, verify, webhook, /health | OK |
| Controllers + Razorpay service | OK |
| Env validation (Key ID / Secret; webhook secret in production) | OK |
| Rate limits | OK |
| Render start: `node server.js`, `engines.node >= 18` | OK |
| Live `/health` | **OK** (200) |
| Live CORS for `https://dropshipguru.in` + `www` | **OK** |
| Live `create-order` with `{amount:100}` | **OK** → `rzp_live_…` Key ID |

---

## STEP 4 — Razorpay audit

| Item | Status |
|------|--------|
| Order creation (paise, INR, capture=1) | OK |
| Key ID returned; secret never returned | OK |
| Checkout popup | OK |
| Signature verify HMAC-SHA256 timing-safe | OK |
| Webhook HMAC with `RAZORPAY_WEBHOOK_SECRET` | OK (config required in prod) |
| Error mapping / JSON `{success,error}` | OK |
| Live mode keys already in use on Render | Confirmed (`rzp_live_…`) |

### Payment failure modes (covered)

- Invalid / zero amount  
- Amount over `MAX_ORDER_AMOUNT_INR`  
- Checkout script load failure  
- User dismiss / cancel  
- `payment.failed` event  
- Network / non-JSON API response (hardened)  
- Missing verify fields / invalid signature  
- Rate limit  
- Webhook misconfig / bad signature  
- Sheet write failure (does **not** fail payment verify)

### Residual risk

- Sheet write depends on `/verify` completing after Checkout. If the tab dies after pay but before verify, money can capture without a lead row (webhook only logs).

---

## STEP 5 — Google Sheets audit

### Free / ₹0 leads

Browser → `google-sheet-submit.js` fields:  
`fullName, mobile, email, state, profession, selectedType, selectedPlan, selectedCourse, selectedService, selectedPlatform, price, budget, message, source`  
(`businessExperience` folded into `message`).

### Paid leads (intended local design)

Backend `/verify` → `googleSheetsService` with the same customer fields **plus**  
`razorpay_order_id`, `razorpay_payment_id`, `orderId`, `paymentId`, `status`/`paymentStatus` (`PAID`), `timestamp`, and payment line inside `message`.

### Gaps found (pre-fix)

| Field | Pre-fix gap |
|-------|----------------|
| Payment ID / Order ID as dedicated columns | Sent as params; Apps Script must map them (also in `message`) |
| Status | Was missing → now sent as `PAID` |
| Timestamp | Was missing → now ISO timestamp |
| LIVE deployed flow | Verify sent **no** customer fields; client sheet used `paymentMeta.paymentId` but Checkout resolved `razorpay_payment_id` → **Payment IDs often missing on LIVE sheet** |

---

## STEP 6 — Mobile responsiveness

| Breakpoint | Local `mobile-layout.css` | Live site |
|------------|---------------------------|-----------|
| 320 / 375 / 390 / 414 / 768 | Rules present; prior session verified no H-scroll | Live consultation/index **missing** `mobile-layout.css` deploy |
| Overflow (live consultation @375) | — | `scrollWidth === clientWidth` (no H-scroll) with inline CSS only |
| Live index | Has `assets/app.css` | **No** `mobile-layout.css` link |

Local files are ready; **production deploy of `mobile-layout.css` + updated HTML** is still required.

---

## STEP 7 — Live deployment check

| Surface | Status |
|---------|--------|
| Frontend HTTPS `https://dropshipguru.in` | OK |
| Backend HTTPS Render | OK |
| CORS allowlisted | OK (live) |
| Mixed content risk | Was present if localhost API used; fixed in code |
| No `CNAME` file in repo | Custom domain managed outside repo |
| Deploy drift | **HIGH** — live `payment-client.js` / consultation payment glue ≠ local |

---

## STEP 8 — Bug report

### CRITICAL

1. **LIVE paid sheet missing Payment/Order IDs**  
   - **File:** Deployed `consultation.html` + `payment-client.js`  
   - **Reason:** `leadPromise` checks `paymentMeta.paymentId`, but live Checkout resolves Razorpay’s `razorpay_payment_id`.  
   - **Impact:** Paid customers may land in Sheet without payment references.  
   - **Fix:** Deploy local flow (verify carries customer + IDs; server writes sheet).

2. **Deploying unfixed local API base would break all paid checkouts**  
   - **File:** `consultation.html` (~840)  
   - **Reason:** Forced `http://localhost:5000` on every host.  
   - **Impact:** HTTPS site → localhost / mixed content → payments fail for real users.  
   - **Fix:** Hostname-aware API base + `payment-client.js` ignore-localhost-on-prod guard (**applied locally**).

### HIGH

3. **LIVE `payment-client.js` does not send customer fields on `/verify`**  
   - **Impact:** If `GOOGLE_SCRIPT_URL` is set, server may write empty/partial paid rows; also duplicates if client still posts.  
   - **Fix:** Deploy updated `payment-client.js` + consultation paid path (server-only sheet).

4. **`mobile-layout.css` not on live index/consultation**  
   - **Impact:** Mobile layout fixes from local work are not live.  
   - **Fix:** Deploy `mobile-layout.css` and HTML link tags.

5. **GAS URL mismatch (workspace vs public)**  
   - **File:** `google-sheet-submit.js` used `/a/macros/dropshipguru.info/…`  
   - **Impact:** Free leads may fail for users outside the Workspace domain.  
   - **Fix:** Aligned to public `/macros/s/…` URL (**applied**).

6. **Sheet fields Status / Timestamp missing on server payload**  
   - **File:** `backend/services/googleSheetsService.js`  
   - **Fix:** Append `status`, `paymentStatus`, `timestamp`, aliases (**applied**).

### MEDIUM

7. **`env.js` default CORS omitted production origins**  
   - **Impact:** Misconfigured Render env → CORS failures.  
   - **Fix:** Defaults now include `dropshipguru.in` / `www` (**applied**).

8. **`apiPost` assumed JSON body**  
   - **File:** `payment-client.js`  
   - **Impact:** HTML/error pages caused opaque failures.  
   - **Fix:** Parse via `text()` + safe JSON (**applied**).

9. **Webhook does not enrich Sheet**  
   - **Impact:** Abandoned verify → paid without CRM row.  
   - **Fix:** Operational — monitor Razorpay + ensure verify completes; optional future reconciliation job.

### LOW

10. **No repo `CNAME`** — document DNS/GitHub Pages settings externally.  
11. **Local `backend/.env` missing** — expected on laptop; must exist only on Render.

---

## STEP 9 — Auto-fix (applied in workspace)

| File | Change |
|------|--------|
| `consultation.html` | Production API base → Render; localhost only on local hosts |
| `payment-client.js` | `resolveApiBase()` guards; safer `apiPost`; keeps customer payload on verify |
| `google-sheet-submit.js` | Public Apps Script URL |
| `backend/config/env.js` | Safer default `CORS_ORIGINS` |
| `backend/services/googleSheetsService.js` | `status`, `paymentStatus`, `timestamp`, payment ID aliases |

**Not broken by design (left intact):** free-lead browser submit; paid path server-only sheet; Razorpay signature verify; webhook ack pattern.

---

## STEP 10 — Final report

### What was broken

- Production consultation forced / risked localhost API.  
- Live payment client omitted customer data on verify; live sheet append used wrong payment ID property.  
- Free-lead GAS used Workspace-scoped URL.  
- Paid sheet payload lacked Status/Timestamp.  
- CORS defaults unsafe if env unset.  
- Live missing `mobile-layout.css`.

### What was fixed (local workspace)

- API base selection hardened for prod vs local.  
- GAS URL unified.  
- Sheet metadata enriched.  
- CORS defaults + JSON error hardening.

### Files modified

1. `consultation.html`  
2. `payment-client.js`  
3. `google-sheet-submit.js`  
4. `backend/config/env.js`  
5. `backend/services/googleSheetsService.js`  
6. `END_TO_END_AUDIT_REPORT.md` (this file)

### Deployment required before real customers (checklist)

1. **Deploy frontend** to GitHub Pages / `dropshipguru.in`:  
   `consultation.html`, `payment-client.js`, `google-sheet-submit.js`, `mobile-layout.css`, `index.html` (if link present).  
2. **Redeploy Render backend** with updated `env.js` + `googleSheetsService.js`.  
3. Confirm Render env:  
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (live)  
   - `RAZORPAY_WEBHOOK_SECRET`  
   - `GOOGLE_SCRIPT_URL` = public macros URL  
   - `CORS_ORIGINS` includes `https://dropshipguru.in,https://www.dropshipguru.in`  
   - `NODE_ENV=production`  
4. Razorpay webhook → `https://dropshipgurufi-api.onrender.com/api/payment/webhook`.  
5. Apps Script: deploy as **Anyone** web app; sheet headers map new fields (`status`, `timestamp`, `paymentId`, …).  
6. End-to-end **₹1–₹100 live test**: create-order → pay → verify → Sheet row with name + payment IDs.  
7. Confirm free consultation still writes Sheet.

### Suggested git commit message

```
fix: harden payment API base, sheet fields, and GAS URL for production

Point consultation/payment-client at Render on deployed hosts, align Apps
Script to the public exec URL, enrich paid sheet metadata, and widen default CORS.
```

### Production readiness score: **72 / 100**

| Area | Score | Notes |
|------|-------|-------|
| Backend Razorpay | 90 | Live orders work; secrets server-side |
| Frontend payment glue | 55 | Local fixed; **live still drifted** until deploy |
| Google Sheets | 65 | Design OK after fix; GAS column mapping + Render env must be confirmed |
| Mobile | 70 | Local CSS ready; not fully on live |
| Ops / webhook / reconcile | 60 | Webhook ack only; no auto-reconcile |

### Still required before accepting real customer payments confidently

1. **Ship the fixed frontend + backend** (current live JS is an older payment client).  
2. **Verify `GOOGLE_SCRIPT_URL` on Render** and that paid test rows include Name, Phone, Email, Plan/Platform, Price, Payment ID, Order ID, Status, Timestamp.  
3. **One successful live end-to-end payment test** with Sheet + Razorpay dashboard reconciliation.  
4. **Deploy `mobile-layout.css`** for mobile QA sign-off.  
5. Keep monitoring for verify failures after capture (Razorpay payments without Sheet rows).

Until deploy + live E2E sheet confirmation, treat the site as **not fully production-ready for unattended paid checkout**, even though the Render Razorpay API itself is already in **live** mode.
