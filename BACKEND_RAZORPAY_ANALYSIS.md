# Backend & Razorpay Integration Analysis

**Project:** DropshipGuru-Final  
**Date:** 2026-08-01  
**Mode:** Read-only inspection — no code modified  

---

## 1. Does this project have a backend?

**No.**

The production website is a **static front-end site**:

- Public pages are HTML (`index.html`, `consultation.html`, `plan-details.html`, `/about`, `/contact`, legal pages, etc.)
- Behavior is client-side JavaScript (`google-sheet-submit.js`, `brand-icons.js`, gallery scripts, inline scripts)
- There is **no** `server.js`, `app.js`, Express app, database layer, auth service, or server-rendered API in the deployable root

**Related but not a production backend for this site:**

| Item | Role |
|---|---|
| `google-sheet-submit.js` | Browser → Google Apps Script Web App (external form endpoint) |
| `_build-legal-pages.js`, `scripts/verify-production.js` | Local/build utility scripts only |
| `dropshipguru-landing/` | Separate Next.js experiment/app; not wired as the live static site backend |
| Root `node_modules/` | Tooling deps from image/build utilities (e.g. png tooling), not a running server |

**Verdict:** Deployable product = static hosting + third-party form endpoint. **No first-party backend.**

---

## 2. Is Node.js / Express configured?

**Node.js: partially present as tooling only. Express: no.**

| Check | Result |
|---|---|
| Root `package.json` | **Missing** |
| Root `package-lock.json` | Present (orphan lockfile for tooling packages) |
| Root `node_modules/` | Present (utility packages, not an app server) |
| Express dependency / routes | **Not found** |
| `server.js` / `app.js` / HTTP createServer entry | **Not found** |
| `dropshipguru-landing/package.json` | Next.js 16 app (`next dev` / `next start`) — **not Express**, and not the main static site |

**Verdict:** Express is **not configured**. Node is only used for offline/build utilities and a secondary Next.js folder, not as the website’s API server.

---

## 3. Is there any API?

**No first-party API. One external form endpoint only.**

### What exists
- **Google Apps Script Web App** called from the browser via `fetch(POST)` in `google-sheet-submit.js`
  - Purpose: consultation/form lead capture into Google Sheets
  - This is a third-party webhook-style endpoint, not an API owned/hosted by this repo

### What does not exist
- No `/api/*` routes in this project
- No REST/GraphQL server
- No payment create-order / verify endpoints
- No auth, session, or webhook handlers in-repo

**Verdict:** Client-side site + **one external Google Apps Script form API**. No application API of your own.

---

## 4. Is there a package.json?

| Location | Exists? | Purpose |
|---|---|---|
| **Project root** `package.json` | **No** | — |
| Project root `package-lock.json` | Yes | Lockfile without a matching root `package.json` (tooling leftover) |
| `dropshipguru-landing/package.json` | Yes | Next.js landing app dependencies |
| `node_modules/*/package.json` | Yes | Dependency packages only |

**Verdict:** The **main static website has no root `package.json`**. A nested Next.js app does.

---

## 5. Can Razorpay be securely integrated without adding a backend?

**No — not for a secure Orders/Checkout flow.**

### Why a backend (or trusted server) is required

Razorpay’s secure Standard Checkout / Orders flow needs:

1. **Order creation** with the **Key Secret** (server-side only)
2. **Payment signature verification** after checkout (server-side only)
3. Preferably a **webhook** to confirm payment status (server-side only)

If the Key Secret is placed in front-end JavaScript, anyone can extract it and create/forge orders. That is **not** a secure integration.

### What is possible without *your* Node/Express backend

| Approach | Secure? | Notes |
|---|---|---|
| Full Razorpay Checkout with Key Secret in browser | **No** | Secret exposure; not acceptable |
| Razorpay Payment Links / Payment Pages (hosted) | **Partially** | Can collect money with less custom code; still need a trusted place to confirm payment & fulfill entitlement |
| Google Apps Script / serverless function as order + verify layer | **Yes, if done correctly** | This *is* still a backend — just not Node/Express in this repo |
| Add Node/Express, Next.js API routes, Cloudflare Workers, etc. | **Yes** | Recommended for production checkout |

### Current project readiness for Razorpay

- Razorpay appears only as a **UI brand chip** styling in `plan-details.html` (`data-brand="razorpay"`)
- No Razorpay SDK, keys, order APIs, or payment verification code found
- Consultation flow submits leads to Google Sheets; it does **not** process payments

**Verdict:**  
**You cannot securely integrate Razorpay Checkout/Orders in this static site without adding some form of backend** (Node/Express, serverless, or a hardened Apps Script/edge function that holds secrets and verifies signatures).

---

## Summary

| Question | Answer |
|---|---|
| 1. Backend? | **No** (static site + Google Apps Script form) |
| 2. Node/Express configured? | **Node tooling only; Express = No** |
| 3. API? | **No first-party API**; external Google Apps Script form endpoint only |
| 4. `package.json`? | **No root `package.json`**; nested Next.js app has one |
| 5. Secure Razorpay without backend? | **No** — needs server-side order creation + signature verification |

### Recommended next step (informational only)
To accept Razorpay payments securely, add a minimal backend/serverless layer with:
1. `POST /create-order` (uses Key Secret)
2. Client Checkout with **Key ID** only
3. `POST /verify-payment` (HMAC signature check)
4. Optional Razorpay webhook for fulfillment confirmation
