# Bakery admin is authoritative for integrations

PayPal, Shippo, and TaxJar credentials, enabled states, and sandbox/live selections are managed in bakery admin. A successful save applies to subsequent server requests without a Vercel redeployment. Existing quotes/orders retain their existing payment rules and payment-mode mismatch protections.

## Upgrade and storage

The first server read upgrades the existing `commerce_settings.integrations` record atomically. Existing admin configuration and encrypted credentials win. Missing credential entries are imported from the legacy environment once, encrypted with AES-256-GCM, and saved with `source: bakery-admin`, a migration timestamp, and a revision. Existing modes, disabled services, origin, and packing profiles are preserved. Concurrent initialization retries instead of overwriting another request.

After that marker exists, provider variables in Vercel are ignored. They cannot override a saved value or resurrect a deleted credential. No provider secrets are returned to the browser, copied into logs, or committed to the repository. Keep `INTEGRATION_ENCRYPTION_KEY` stable in Vercel; losing it makes the stored credentials unreadable. Supabase infrastructure credentials, email, USDA, and other unrelated services remain in Vercel.

Legacy provider variables may remain as an operational backup during rollout. They are not the active configuration source after migration; shared Vercel variables are not modified by this feature.

## Admin workflow

1. Choose Payment Processing, Shipping, or Sales Tax.
2. Enter or replace the credentials for the selected sandbox/live mode. Blank inputs preserve stored credentials. Explicit removal never falls back to Vercel.
3. Use **Test connection**. Unsaved credentials can be tested without saving or activating them. Results show the mode and time, and whether they match saved credentials.
4. Enable the service as needed and save. Changed active credentials, enabling a service, or changing its mode requires a matching successful check from the last 15 minutes, or a fresh automatic server check.
5. Live PayPal activation still requires the explicit real-payment checkbox, live credentials, and live modes for enabled shipping/tax services.

Tests authenticate against fixed provider endpoints: PayPal OAuth plus webhook lookup, Shippo carrier accounts, and TaxJar nexus regions. PayPal's webhook must target the bakery's capture endpoint and subscribe to completed captures. Shippo token prefixes must match the chosen mode. Tests do not create checkout orders, purchase labels, or submit tax transactions. A passing check verifies access/configuration, not end-to-end fulfillment or a completed payment.

Admin writes require authentication, same-origin JSON, rate limiting, a current revision, and an atomic compare-and-swap. Stale browser tabs are told to reload. Failed tests/saves do not activate or overwrite credentials. Test records contain sanitized results and private HMAC fingerprints; public responses omit fingerprints and secret values.

## Validation

Automated tests cover encrypted migration, idempotency, existing-admin precedence, deleted-key persistence, wrong/tampered encryption keys, required credentials, sandbox/live separation, provider requests, webhook mismatch, and sanitized failures. Existing checkout and packing tests remain in place.
