# Customer email notifications — V1

Owner requires account confirmation and order confirmation, with tracking when available. The owner supplied a readable Mercury verification-email screenshot on September 20. Adopt its concise single-column information hierarchy, using Cookies & Chips branding; the screenshot is a visual reference, not provider configuration or approved business copy.

## Account verification

Supabase Auth sends confirmation for new accounts through configured Resend SMTP. Keep email confirmation enabled. Branded email includes purpose, Verify email action and a plain fallback link, plus clear unsolicited-request guidance. Use Supabase-generated expiring verification links, configured redirect allowlists, resend feedback and rate limits. Never construct an unverified-account bypass. Expired/used links receive a helpful recovery state. Include password-reset delivery and testing in the same Auth setup.

For guest checkout with account opt-in, successful purchase does not wait for verification. Send a separate secure verification/setup email; link order history only after verified ownership. An existing account email must not expose history, create duplicates or silently transfer orders. Opt-out guests get order emails without an account. Transactional email is not marketing consent.

## Order confirmation

Send through server-side Resend API after server-confirmed successful payment/capture and durable order creation. Browser redirects alone cannot trigger a paid confirmation. Include order number, product names, quantities/package sizes, item amounts, discounts if applicable, tax collected, delivery/shipping, total/currency, selected fulfillment, preparation estimate and verified support contact. Show pickup or local-delivery instructions appropriate to the actual order. Never invent a scheduled date or delivery promise.

Order-detail links require authenticated ownership or secure scoped guest verification, never just an enumerable order number/email. Do not include recipes, private costs, credentials or unnecessary personal data. Show tax collected as zero where the approved manual tax policy applies, not a tax-exempt claim.

Create a durable notification/outbox entry with a unique order + notification-type/version key. Repeated payment webhooks must not create duplicate confirmation jobs. Use provider idempotency where available and bounded retries/reconciliation for uncertain sends. Email failure must not roll back a paid order or ask the customer to pay again. Admin sees pending/sent/failed status and can resend deliberately. Store sanitized provider message IDs/events, not secrets.

## Shipment and tracking

V1 supports optional admin-entered carrier, tracking number and validated tracking URL. Send a shipment email when an admin marks the order dispatched, not simply when a quote or label is created. Include order reference, carrier, tracking action and clearly labelled carrier delivery estimate if available. Pickup/local-delivery orders must not receive irrelevant parcel-tracking messages. Define parcel-level tracking when an order spans multiple boxes.

Automatic Shippo tracking event updates are an optional later integration, dependent on tracking/label workflow availability. If implemented, authenticate events using supported provider mechanisms, deduplicate events and preserve carrier timestamps so out-of-order events do not regress status. Do not promise automatic tracking before this is connected.

## Email design

Responsive, readable transactional layout: supplied logo, paper/cream background, chocolate headings, clear high-contrast action button and restrained coral accents. Provide HTML and plain-text versions, meaningful link text, image alt text and readable mobile sizing. Critical information must not depend on images loading. No promotions mixed into required verification/order messages by default.

## Setup still needed

Resend account exists but setup is pending. Verify a Cookies & Chips sending domain using Resend-provided DNS records, choose a sender address and monitored support/reply-to address, configure server sending credentials and Supabase custom SMTP. EMAIL_PROVIDER_API_KEY and EMAIL_FROM remain application variables; configure Auth SMTP separately. admin@cookiesandchips.com is the intended admin identity, not an automatically confirmed sending mailbox. No real email is sent by the current prototype.

## Acceptance

- New account receives verification; valid/expired/resend paths work. Unverified users cannot obtain privileged or other users' data.
- Guest opt-in gets setup mail separately from order confirmation; guest opt-out gets only the relevant order emails.
- Verified payment produces one logical order confirmation despite duplicate callbacks; failed/pending payment never receives a paid-order confirmation.
- Email provider failure leaves paid order intact with retryable notification status.
- Confirmation totals match immutable order records for pickup, delivery and shipping.
- Dispatched orders with tracking receive the right parcel links; labels alone do not claim dispatch.
- Email rendering, link ownership, redirect destinations, bounce/failure handling and production sender delivery are tested before launch.

## Confirmed verification-email reference

Use a narrow, mobile-friendly, left-aligned single-column email: Cookies & Chips logo; “Verify your email address” heading; short purpose statement; one prominent “Verify email” button; plain-text fallback link; expiry/resend guidance; support and brand sign-off; restrained footer. Use warm paper/cream, chocolate text and an accessible branded button.

Do not copy Mercury branding, postal address, app-download links, social accounts, or its 30-day expiry promise. Expiry text must reflect the actual Supabase configuration. Only say “reply to this email” when a monitored reply-to mailbox is configured; otherwise use a verified support destination. Footer social icons may use configured visible Cookies & Chips profiles.

Suggested copy: “Thanks for joining Cookies & Chips. Confirm your email address to finish setting up your account.” Follow with the verification action, configured expiry/resend instructions, and “If you didn’t create this account, you can ignore this email.” Sign off “Baked with love, The Cookies & Chips team.” The real verification link is generated by Supabase, never hard-coded.
