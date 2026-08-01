# Payment Gateway Compliance Checklist — DropshipGuru

**Legal entity:** DropshipGuru Private Limited
**Site:** https://dropshipguru.in
**Date:** 2026-08-01
**Primary target:** Cashfree (also applicable to Razorpay, PhonePe, PayU — their website-verification requirements are near-identical).

Legend: ✅ present on site · ⚠️ present but confirm/complete · ❌ missing / action needed

---

## 1. Mandatory Website Requirements (all gateways)

| Requirement | Status | Location |
|---|:--:|---|
| Legal/registered business name shown | ✅ | Footer (all pages), About, Contact, Policies |
| “Owned and operated by DropshipGuru Private Limited” statement | ✅ | Homepage, About, Contact, footers |
| Registered business address | ⚠️ | `contact/` → *Webel.io Tech Garden, Gurugram, Haryana 122102* — **confirm this matches your CIN/incorporation record** |
| Contact email | ✅ | `support@dropshipguru.info` (Contact + footers) |
| Contact phone | ✅ | `+91 74283 29102` (Contact + footers) |
| Contact Us page | ✅ | `/contact/` |
| About Us page | ✅ | `/about/` |
| Privacy Policy | ✅ | `/privacy-policy/` |
| Terms & Conditions | ✅ | `/terms-conditions/` |
| Refund & Cancellation Policy | ✅ | `/refund-policy/` |
| Pricing clearly displayed | ✅ | `plan-details.html`, plans section |
| Products/services described | ✅ | Homepage sections, plan details |
| HTTPS/SSL | ⚠️ | Enable at hosting before submitting for verification |
| Working links to all policy pages in footer | ✅ | Verified — 0 broken links |

---

## 2. Cashfree-Specific Verification

- [x] Company legal name visible to reviewers
- [x] Three policy pages present and linked from every page footer
- [x] Cancellation & refund terms explicitly stated
- [x] Contact details (email + phone) publicly visible
- [ ] **GSTIN**: footer shows a “GST Compliant” badge but **no GST number is printed** — add the actual GSTIN on Contact/footer if requested by Cashfree
- [ ] Business PAN / CIN / incorporation certificate ready for the merchant dashboard (document upload, not website)
- [ ] Bank account (current account in the company name) for settlements
- [ ] Product/pricing currency shown in **INR**

---

## 3. ⚠️ Content Risk Review (important)

Payment gateways actively reject sites that make **guaranteed or unrealistic income claims**. The site currently contains earnings-style messaging that reviewers may flag:

- Income/earnings tickers and figures (e.g., earnings amounts, “₹… earned”)
- Urgency countdowns and “limited seats/offer” framing
- Testimonials citing specific earning amounts

**Recommendation:** ensure all such claims are (a) truthful, (b) accompanied by a visible **earnings/results disclaimer** ("results are not guaranteed and vary by individual effort"), and (c) free of any *guaranteed* income language. This is the most common reason ed-tech/coaching sites fail gateway review. Consider adding a short disclaimer near earnings sections and in the Terms.

---

## 4. Payment Integration Status

- The consultation flow is currently **lead capture** (form → Google Sheet) plus WhatsApp/phone follow-up. **No live payment gateway checkout code was found in the site.**
- When you integrate Cashfree:
  - [ ] Use official Cashfree Checkout / Payment Links / SDK
  - [ ] Never expose the **secret key** in client-side JS (only the public/app ID client-side; secret stays server-side)
  - [ ] Verify the payment **signature/webhook** server-side before fulfilling
  - [ ] Show order amount, currency (INR), and business name on the checkout
  - [ ] Handle success/failure redirect pages
  - [ ] Test in **sandbox** before going live

---

## 5. Pre-Submission Final Check

- [ ] Site live over HTTPS at `https://dropshipguru.in`
- [ ] All 3 policy pages + Contact + About reachable from the homepage footer
- [ ] Refund/cancellation timelines and eligibility clearly worded
- [ ] Earnings disclaimer added (see §3)
- [ ] GSTIN added if required (see §2)
- [ ] Registered address confirmed accurate (see §1)
- [ ] Business documents (CIN, PAN, GST, bank proof) uploaded in the Cashfree dashboard
