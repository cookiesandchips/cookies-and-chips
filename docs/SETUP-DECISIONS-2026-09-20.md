# Current V1 setup decisions

Direct owner instructions supersede earlier conflicting foundation plans.

- V1 implementation authorized; visual direction accepted. No AI integration: structured ingredient rows, manual USDA matching and deterministic nutrition per cookie/product. Earlier AI proposals are superseded; existing generated images remain static temporary assets.
- Initial admin: admin@cookiesandchips.com. Account not yet provisioned. Verify identity and grant role server-side; browser email checks must not grant access.
- Use only dedicated Supabase project vqebxtybuiegvfxawksf for testing and production. Do not create separate environments. Identify synthetic records and use targeted cleanup; no destructive database resets.
- USDA key reported added; connectivity unverified.
- Resend is not set up. Sender domain verification, sending key and sender address still needed. Admin email is not automatically the sender.
- TaxJar credentials: TAXJAR_SANDBOX_API_TOKEN and TAXJAR_LIVE_API_TOKEN. TAXJAR_ENVIRONMENT=sandbox initially. TAXJAR_ENABLED=true seeds the initial admin setting; saved admin on/off choice then takes precedence without redeployment. All variables server-only.
- The Vercel Production deployment may use sandbox APIs while testing. Keep deployment scope separate from API mode. Select only the matching token; no automatic live fallback.
- TaxJar on uses the configured API; off makes no TaxJar calls. Owner explicitly selected manual tax responsibility: unconfigured/disabled tax collects zero at checkout and allows purchases. API failures never silently produce zero tax. Audit toggle changes and revalidate checkout quotes.
- Sandbox endpoint: https://api.sandbox.taxjar.com/v2/ ; live: https://api.taxjar.com/v2/ . Map these in server code; no URL variable needed.
- Add variables to the Cookies & Chips project's Production scope for the owner's production-hosted testing. Redeploy after environment changes. Never expose tokens in admin/browser or commit values.

Reference: https://developers.taxjar.com/api/reference/

## Site Configuration and manual tax policy — controlling update

[Site Configuration](SITE-CONFIGURATION.md) records approved UI management of sandbox/live PayPal and TaxJar credentials and activation. Owner explicitly chooses zero checkout tax collection when tax is unconfigured or disabled, with Cookies & Chips calculating/remitting applicable taxes manually. This supersedes earlier requirements to block checkout solely because tax is unconfigured/off. Enabled-provider failures still block rather than silently collect zero.
