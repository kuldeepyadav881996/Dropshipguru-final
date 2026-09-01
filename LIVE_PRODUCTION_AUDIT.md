# Live Production Audit — Final Bugfix Pass

**Date:** 2026-08-02  
**Local repo:** all four requested fixes applied (`LOCAL_FAILS 0`)  
**Live site:** `https://dropshipguru.in` — **still serving old assets** (no git remote in this folder; files not published)

---

## Checklist

| Check | Local | Live |
|---|---|---|
| Verify sends full customer data | ✅ | ❌ |
| Server Sheets after paid verify | ✅ code | ⚠ depends on deploy + Render `GOOGLE_SCRIPT_URL` |
| No `Index.html` | ✅ | ❌ (2 refs → 404) |
| Public GAS URL only | ✅ | ❌ (`/a/macros/dropshipguru.info/`) |
| No localhost API in frontend | ✅ | ❌ (`DROPSHIPGURU_API_BASE = localhost:5000`) |
| API health / create-order | ✅ | ✅ 200 / 201 |
| Payment Checkout API target | ✅ Render | ✅ Render (hardcoded in live payment-client) |

---

## Real LIVE issues only

1. **`payment-client.js` (live) does not send full customer data on `/verify`**  
   Live file ~3.3 KB, no `fullName` / customer field list. Sheet after paid payment cannot get complete row from verify.

2. **`google-sheet-submit.js` (live) uses workspace GAS URL**  
   `https://script.google.com/a/macros/dropshipguru.info/s/…/exec`  
   Must be public `https://script.google.com/macros/s/…/exec`.

3. **`consultation.html` (live) forces `http://localhost:5000`**  
   Confirmed in browser: `window.DROPSHIPGURU_API_BASE === "http://localhost:5000"`.  
   Paid Checkout still hits Render because live `payment-client` hardcodes it; any other use of the global fails.

4. **`index.html` (live) still links `Index.html` (404)**  
   Two references; `GET /Index.html` → 404.

5. **Deploy drift** — fixed local files are not on production. Publish at minimum:  
   `payment-client.js`, `google-sheet-submit.js`, `consultation.html`, `index.html`  
   Plus Render env: `GOOGLE_SCRIPT_URL` = public macros URL.

---

## Not production-ready until the five items above are cleared by deploy.
