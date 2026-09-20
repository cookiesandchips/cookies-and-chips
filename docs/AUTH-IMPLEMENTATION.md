# Account implementation and connection checklist

September 20, 2026. The owner reports Supabase email/password configuration, verified Resend domain notifications.cookiesandchips.com, Supabase SMTP, and Vercel EMAIL_FROM / EMAIL_PROVIDER_API_KEY completed. These are owner-reported configuration, not delivery-test results. Google, Apple and anonymous authentication remain disabled.

## Implemented locally

Dedicated Next.js App Router / TypeScript foundation, repository-local dependencies and lockfile, approved local Inter / DM Serif Display fonts, account creation, login, logout, confirmation resend, recovery request and password update. Auth uses Supabase browser + request-scoped server clients, cookie refresh, server-verified identity and fixed redirect destinations. Public client refuses a different Supabase project. No secrets or administrator credentials are sent to the browser. No admin privilege is granted by email matching.

The home route is a clearly labelled preparation page. The approved complete storefront remains in docs/visual-review, unchanged. This account slice is not a complete commerce launch. No orders, payments, order history or transactional order sends are represented as working.

## Run

Use Node 24 LTS, npm ci, npm run dev. Copy .env.example to ignored .env.local and provide the dedicated public Supabase key. Never commit private values. npm run test, npm run check, npm run typecheck and npm run build validate local implementation.

## Configure after a deployment URL is available

1. Set Supabase Authentication URL Configuration Site URL to the actual deployed application origin. Set NEXT_PUBLIC_SITE_URL consistently. Do not use the Supabase API URL or sending domain as the website origin.
2. Allow that exact origin plus /auth/callback and /auth/callback?next=/auth/update-password as redirect URLs. Add equivalent localhost:3000 addresses only for local testing. Avoid broad production wildcards.
3. Upload supabase/templates/confirmation.html to Confirm signup and recovery.html to Reset password. They use SiteURL + /auth/confirm and Supabase TokenHash to support opening links on another device. Deploy those routes before changing templates. Existing default templates can use the PKCE /auth/callback flow, but require the originating browser.
4. Keep Confirm Email and new account signup enabled; anonymous, Google and Apple disabled. Configure provider rate limits and a suitable password policy. Review CAPTCHA before public launch.
5. SMTP sends from the verified notifications.cookiesandchips.com subdomain. Suggested sender hello@notifications.cookiesandchips.com; actual sender must match configured EMAIL_FROM. No monitored reply-to address has yet been verified, so templates do not invite replies.

## Acceptance still requiring live access

- Send verification to an owner-approved test inbox; inspect Supabase and Resend delivery logs without logging credentials or link tokens.
- Verify new registration, confirmation in another browser, expired/used link recovery, resend, login/logout, password recovery and update; verify no session or account information leaks between users.
- Validate email appearance on mobile/desktop and whether the actual Supabase email template configuration supplies a suitable plain-text alternative.
- Test deployed callback allowlist and no-cache behavior; verify HTTPS and provider abuse controls.

The locally authenticated Vercel CLI returned “The specified scope does not exist” for scope cookies-and-chips. No environments were downloaded, production deployment made, cloud settings changed or live messages sent.

## Commerce dependency

Guest checkout will use server-created orders without Supabase anonymous accounts. Guest account opt-in is separate from purchasing and ownership must be verified before linking history. The durable order schema, verified PayPal capture and deduplicated email outbox must be implemented before order-confirmation delivery can be tested. Never send paid confirmations from browser success callbacks. See EMAIL-NOTIFICATIONS.md.
