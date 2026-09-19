# Environment and secrets contract

Status: names established; Resend selected; values and deployment scopes not configured. Supabase Auth SMTP configuration is separate from the application email API configuration.

| Variable | Exposure | Purpose / required when |
| --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Browser | Dedicated environment's Supabase URL; currently supplied project only |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Browser | Public client key; needed for Auth and policy-controlled queries |
| SUPABASE_SECRET_KEY | Server secret | Optional privileged server operations; bypasses RLS, so require explicit authorization in application code |
| NEXT_PUBLIC_SITE_URL | Browser | Exact canonical origin for that environment; production HTTPS, development localhost |
| APP_ENV | Server configuration | development, preview, production; independent of NODE_ENV |
| NEXT_PUBLIC_PAYPAL_CLIENT_ID | Browser | Dedicated PayPal app client ID matching the environment |
| PAYPAL_CLIENT_SECRET | Server secret | Same app's secret for server-side token/order/capture operations |
| PAYPAL_WEBHOOK_ID | Server configuration | Registered endpoint's ID, matched to app and sandbox/live mode |
| PAYPAL_ENVIRONMENT | Server configuration | sandbox for development/preview; live requires production activation |
| EMAIL_FROM | Server configuration | Verified sender; needed when email is implemented |
| EMAIL_PROVIDER_API_KEY | Server secret | Dedicated Resend sending API key (existing variable name retained) |

Use modern Supabase publishable/secret keys. The earlier conversation's SUPABASE_SERVICE_ROLE_KEY is a legacy alternative, not an additional required credential. Do not provision both by default. If the project requires legacy keys, document that explicit exception before changing this contract.

Only `.env.example` may be tracked. All credential fields in it stay blank. Use ignored `.env.local` for this project's local configuration and project-scoped Vercel settings for deployments. Mark server secrets sensitive where supported. Never place server credentials in NEXT_PUBLIC variables, next.config env, public files, logs, screenshots or client bundles. Public identifiers being safe to expose does not make customer data public; database access still requires reviewed policies.

At application activation, implement separate server-only and browser environment modules with schema validation. Reject missing values, unknown APP_ENV/mode values, mismatched resource identity and non-production live payment mode. Errors name missing variables without echoing values. Validate deployment URLs and exact resource allowlists for each environment; never silently use production defaults. NEXT_PUBLIC values are build-time configuration and require rebuilding when changed.

The foundation check validates the committed template only; it does not validate real credentials, cloud settings, key ownership or runtime connections.

Sources reviewed 2026-09-18: [Supabase keys](https://supabase.com/docs/guides/getting-started/api-keys), [Vercel environment scopes](https://vercel.com/docs/environment-variables), [Vercel sensitive variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables).
