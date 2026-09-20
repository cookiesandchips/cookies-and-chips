# Infrastructure readiness — updated 2026-09-19

## Current readiness

Owner reports accounts created for Supabase, Resend, GitHub, Vercel and PayPal. GitHub publication has been verified in this task. Other account configuration and connections remain unverified. Resend is selected for order emails and email confirmation. A USA PayPal sandbox merchant account and client ID have been supplied privately; credential values and login details are deliberately excluded from this public repository. The client secret and registered webhook ID have not been configured or verified.

Account creation does not establish deployment, email delivery or payment readiness. Logo package V1 is available in the brand library; generated derivatives await visual review.

## Original inspection (September 18)


GitHub repository is public and was empty: no commits, application, branches with commits, dependencies, CI, migrations, or configuration to audit. Cloned directly from the canonical URL into this project directory. No other project was inspected or used. The supplied Supabase URL is recorded, but management access, database contents, Auth, Storage, region, backups and key configuration have not been inspected. No Vercel or PayPal account/project has been verified. No remote infrastructure has been changed.

This foundation provides documentation, blank secret templates and a credential-free CI check. It does not establish cloud account readiness. Public repository contents must contain no customer data, private intake answers, secret credentials, or unapproved private assets.

## Missing access and provisioning sequence

| Service | Needed next | Later activation evidence |
| --- | --- | --- |
| GitHub | Confirm repository visibility is intentional; choose maintainers and branch protections after first commit | Required foundation checks, least-privilege repo-only deployment integration |
| Supabase | Owner access to supplied project; confirm dedicated ownership, environment role and region; obtain project publishable key through secure configuration | Inventory existing schema without mutations; review Auth redirects, RLS, storage policies, backups and recovery before schema work |
| Supabase privileged access | Dedicated secret key only when server-side privileged operations are specified; migration operator access only when migrations are approved | Never use a privileged key for browser code; migration password/token is operator tooling, not an app environment variable |
| Vercel | Dedicated project and owner/team selection; GitHub integration scoped to this repo; record project ID and project-specific environment scopes | Next.js preset, repo root, production branch main, reviewed runtime/region, protected previews; deployment remains disabled until app gate passes |
| PayPal | Client ID and sandbox merchant reported; verify dedicated REST app ownership, obtain its client secret securely, and confirm a separate sandbox personal buyer account | Register real sandbox webhook listener once a stable endpoint exists; record its webhook ID; test capture, cancellation, failures and duplicate events |
| PayPal launch | Business account owner completes account setup; dedicated live app credentials and live webhook ID | Live mode only after launch approval; never infer card/wallet eligibility from sandbox |
| Email/domain | Resend selected; confirm domain/DNS owner, verify sender domain and obtain a dedicated sending credential | Auth delivery, order emails and sender-domain verification; production site and redirect URLs |

Do not request passwords or API secrets in chat or intake forms. Account invitations and dashboard entry into project-scoped settings are the preferred handoff. No account-wide Vercel token or Supabase management token belongs in the web application.

## Environment isolation

The supplied Supabase project's production/staging role remains undecided. Do not connect preview or development to it until that role is confirmed. Reserve separate Cookies & Chips-only non-production data resources (local Supabase or dedicated staging project/branch) before functional testing. New identifiers require updating the reviewed environment contract; never derive a fallback from another project.

Development and Preview use PayPal sandbox only and synthetic customer data. Production uses its own verified Supabase resource and live PayPal app only at launch. Set secrets separately in each Vercel project environment; do not inherit shared team secret groups. Untrusted pull-request deployments receive no secrets.

## After specification approval

1. Record approved runtime, dependency versions and lockfile; scaffold Next.js App Router with strict TypeScript in this repo.
2. Confirm dedicated resource IDs, project scopes and non-production isolation. Configure secure environment values.
3. Design migrations and RLS from approved data/permission model; review before applying to the dedicated non-production environment.
4. Implement approved pages and payment/auth flows, then verify acceptance evidence in preview.
5. Prepare a distinct launch checklist: domain, email, policies, backups, production keys, webhook registration, monitoring and rollback. Deployment is a separate milestone.

## PayPal sandbox setup next

1. In PayPal Developer Dashboard, Apps & Credentials, select Sandbox. Open or create the dedicated Cookies & Chips merchant REST app and confirm it is associated with the supplied sandbox business account.
2. Configure its client ID and client secret together in this project's secure development/preview settings. The sandbox account login password is not the API client secret and is not an application environment variable.
3. Confirm a separate sandbox personal buyer for test purchases. The sandbox website is a testing login, not the app's payment API base URL.
4. Once a stable HTTPS webhook handler exists, register it on that sandbox app, configure its webhook ID, and verify real sandbox event signatures, capture completion, retries and failures.
5. Test server-authoritative totals, capture, cancelled/failed payments, reconciliation and order emails. Configure a distinct live app and live webhook only for launch.

Official references: https://developer.paypal.com/api/rest/ and https://developer.paypal.com/studio/checkout/standard/integrate

## Resend setup next

Verify a dedicated Cookies & Chips sending domain and sender; configure a project-specific sending key securely. Use EMAIL_PROVIDER_API_KEY for the Resend key under the existing environment contract and EMAIL_FROM for the verified sender. Configure Supabase Auth email delivery separately (for example through Resend SMTP); an application Resend key alone does not configure Supabase confirmation/reset emails. Validate Auth redirects and both transactional and Auth email delivery. Provider setup reference: https://resend.com/docs/dashboard/domains/introduction

## Latest owner update

Vercel project is created and set up according to the owner; environment variables are not yet configured. Dashboard sign-in is required in the current browser before the exact project settings can be verified. Starting markup no longer blocks design; see [provisional operations](PROVISIONAL-OPERATIONS.md).

## September 20 controlling update

[Current V1 setup decisions](SETUP-DECISIONS-2026-09-20.md) supersede conflicting earlier plans: implementation authorized, single dedicated Supabase environment, no AI integration, and configurable TaxJar.
