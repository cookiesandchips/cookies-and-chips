# Architecture decision record — foundation

## Boundaries

Target: Next.js App Router + strict TypeScript, Vercel deployment, dedicated Supabase Postgres/Auth/Storage, PayPal checkout. Use a single repository and application with separately installed public upstream dependencies. No shared internal platform, multi-tenant factory, package workspace, cross-project database or infrastructure. Prior discussion of a Website Factory is context, not scope.

At activation use reviewed compatible versions of next, react, react-dom, typescript, @types/node, @types/react, @types/react-dom, @supabase/supabase-js and @supabase/ssr. Choose and record a supported Node LTS version matched to Vercel; generate a repo-local npm lockfile and use npm ci in CI. No UI library or visual theme is selected. Framework installation guidance: https://nextjs.org/docs/app/getting-started/installation

Planned ownership: src/app for approved routes and server handlers; src/lib/env for browser/server configuration; src/lib/supabase for request-specific authenticated clients and separate server-only privileged clients; src/lib/payments/paypal for this site's payment integration; supabase/migrations for reviewed schema/RLS; tests for acceptance evidence. These are planned directories, not implemented features.

## Commerce model to specify before migrations

- Product: stable ID, slug, title, description, lifecycle state, product type and type-specific validated attributes. Human food and pet treats must support distinct information fields. Pricing/currency, variants, stock and fulfillment rules need intake decisions.
- Category: data-backed ID, parent_id, editable name/slug, sort order and visibility. Parent links support subcategories; enforce no cycles and decide allowed depth. Define archive/delete, orphan handling and redirects before implementation.
- Product-category membership: join records support flexible assignment; decide whether one primary category is required and whether multiple placements ship in V1.
- Collection: independent merchandising entity with ordered product membership. A product can belong to multiple collections without duplication. Manual versus rule-based membership and publication scheduling remain open.
- Cookie of the Month: references products/collections; define period, timezone, expired and missing-feature behavior. It does not imply subscriptions.
- Orders and order items: immutable purchase-time snapshots of names, variants, prices, currency and fulfillment details. Later catalog/category edits must not rewrite historical purchases.
- Payments and webhook receipts: provider order/capture identifiers, durable idempotency and unique event records. Separate order, payment and fulfillment state machines.
- Customer profiles/addresses and admin permissions: tied to Supabase Auth identity; customer-owned order access; privileged owner-only catalog and fulfillment operations.

All category/collection navigation is driven by published data, including empty and hidden-state rules. An admin must be able to create, rename, reorder and hide groups without deployment. Final relational constraints and deletion behavior require specification approval.

## Payment and security behavior to implement later

Server computes totals from the authoritative catalog, checks stock and fulfillment, creates/captures PayPal orders and validates amount, currency, merchant and order association. A browser success callback alone cannot mark an order paid. Authenticate/authorize every mutation; apply rate limits and origin/CSRF protections appropriate to the selected auth flow. RLS protects customer records and unpublished data; public reads expose only approved catalog fields. Storage upload roles, file limits and visibility require explicit policies.

Persist idempotency keys for supported PayPal operations. Verify webhook signatures, deduplicate durable events, handle retries/out-of-order messages, reconcile capture timeouts, and prevent duplicate fulfillment. Acknowledge only after durable receipt; recover transient errors safely. Inventory reservation/release and refund authority must be settled in the product specification.

References: [PayPal idempotency](https://developer.paypal.com/reference/guidelines/idempotency/), [PayPal webhooks](https://developer.paypal.com/api/rest/webhooks/rest/). SDK choice and eligible payment methods must be verified when implementation starts.

## Recipe-derived product information

See [private recipe workflow](RECIPE-PRODUCT-WORKFLOW.md) for the owner-requested recipe intake, reviewed nutrition/ingredient/allergen drafts, image and description generation, costing suggestions and strict public/private boundary.

## September 20 controlling update

[Current V1 setup decisions](SETUP-DECISIONS-2026-09-20.md) supersede conflicting earlier plans: implementation authorized, single dedicated Supabase environment, no AI integration, and configurable TaxJar.

## Site Configuration and manual tax policy — controlling update

[Site Configuration](SITE-CONFIGURATION.md) records approved UI management of sandbox/live PayPal and TaxJar credentials and activation. Owner explicitly chooses zero checkout tax collection when tax is unconfigured or disabled, with Cookies & Chips calculating/remitting applicable taxes manually. This supersedes earlier requirements to block checkout solely because tax is unconfigured/off. Enabled-provider failures still block rather than silently collect zero.
