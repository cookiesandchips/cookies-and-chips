# Checkout implementation — 2026-09-20

Owner selected PayPal Sandbox. Live payments remain off. Checkout uses dedicated Supabase commerce tables, authoritative server prices, private session-bound quotes, PayPal approval/capture reconciliation, and atomic paid-order/email-outbox persistence. No AI integration.

The migration creates only dedicated commerce tables, enables RLS, and denies browser database access. Origin is configured privately, not committed. Pickup origin is omitted from quote responses. Test orders are visibly labeled sandbox and confirmation emails identify that no real fulfillment should occur.

Routes: `/checkout`, `/checkout/return`, `/api/checkout/{config,quote,paypal,capture}`, `/api/paypal/webhook`. Configure the PayPal sandbox app webhook at the deployment's `/api/paypal/webhook` for `PAYMENT.CAPTURE.COMPLETED`; its ID must match `PAYPAL_WEBHOOK_ID`. Signed webhooks reconcile paid orders even if the buyer does not return. Provider verification must succeed before any order changes.

Order emails use `EMAIL_FROM` and `EMAIL_PROVIDER_API_KEY`. Email failure does not roll back payment. Provider idempotency prevents repeated confirmations within the retry window; older failures require manual reconciliation. Return-page retry and webhook retry attempt email delivery again.

Shipping rates require a dedicated `SHIPPO_TEST_API_TOKEN` (or `SHIPPO_LIVE_API_TOKEN` for live). Estimated cookie packing currently supports 12/24/36-cookie boxes, 2 oz per cookie and 8/12/16 oz packaging. Unsupported dog-treat/mixed packing fails closed. Pickup is enabled initially; shipping is disabled until token/rates verified. Local delivery radius, tracking, and editable shipping admin configuration remain outstanding.

Account creation is offered after payment through the existing email-confirmed account flow. It does not silently create an account or enroll customers in marketing. Guest purchasing does not require anonymous Supabase users.

Validation: production build, TypeScript, foundation checks, and tests cover browser price tampering, invalid/duplicate quantities, unavailable products, packing limits, address validation and capture order/currency/amount/status mismatches. Live end-to-end sandbox verification still required before readiness can be claimed.
