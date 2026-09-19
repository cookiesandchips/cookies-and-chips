# Website Build Contract — draft, implementation gate CLOSED

This is an engineering scope and acceptance contract, not a signed commercial/legal agreement. No approval is implied by this file. Owner: Brant; business content and operational decisions to be confirmed with Heather. Approval requires a version/date, approver and evidence link for each deliverable below; all are currently pending.

## Confirmed constraints and reference status

The owner requests online commerce with PayPal and both guest and customer-account purchasing, story/products/Cookie of the Month/reviews, dynamic categories/subcategories/collections and strict project isolation. The updated September 19 homepage rendition supersedes `CC Wesite Mockup.png`. The supplied circular logo is the current primary asset; Brand & UI System V1 supplies the governing colors and typography. All three originals are available in [the customer brand library](brand/README.md). See [Homepage Production Reference](HOMEPAGE-SPEC.md) for the approved composition, reconciliation with real catalog/pricing, and remaining design deliverables. Accompanying pasted specifications are reference material; their examples do not override direct owner decisions. Exact tokens, responsive layouts and non-homepage specifications still require approval.

## Exact next work, in order

September 19 updates: see [reconciled addendum](ADDENDUM-2026-09-19.md) for legal identity, shipping controls and unified checkout/account scope, and [management portal specification](ADMIN-SPEC.md) for light enterprise design and selected-product markup. Markup basis is resolved: entered base price plus either percentage or fixed-amount markup. Destination-aware tax and shipping calculation is required before payment; provider/configuration choices remain open. No current catalog prices have been changed. These additions do not open the implementation gate.

1. **Complete business/product intake.** Guest and account purchasing are now confirmed. See [the working product specification](PRODUCT-SPEC.md) for the supplied seven-product menu, package prices, delivery offer, shipping range and pickup availability. Resolve the remaining package composition, delivery origin/eligibility and exact shipping-rate rules; obtain currency, product photography, food/pet product information, stock versus made-to-order rules, lead times/cutoffs/timezone, refund/cancellation rules, contact details, domain ownership and actual story/reviews. Decide monthly feature behavior, review collection/moderation, admin scope and V1 exclusions (subscriptions, build-a-box, discounts, gift cards, favorites, social feeds).
2. **Approve product specification.** Translate intake into numbered requirements with roles, user journeys, order/payment/fulfillment states, catalog lifecycle, taxonomy editing/deletion, customer identity rules, stock race behavior, emails and error recovery. Resolve tax calculation responsibility and business-provided policy/disclosure content before checkout implementation. Record decisions rather than inventing business rules.
3. **Approve sitemap and content inventory.** Review candidate routes: Home, Shop, category/subcategory, collection, product, Cookie of the Month, My Story, cart, checkout, confirmation/order status, login/register/reset, account/orders, contact/policies, admin catalog/taxonomy/collections/orders. Explicitly include or exclude standalone Reviews. For each route record purpose, audience, data, copy/assets and success action.
4. **Approve visual references.** Recover the logo and reference images into an approved asset package; verify usage rights. Choose named reference pages/screenshots with annotations stating exactly what to adopt or avoid. Approve one visual direction; reference mood alone does not approve layouts. Record file versions and approval dates.
5. **Specify UX/design system.** Define exact typography families/weights/licenses, color tokens and contrast, spacing scale, content widths, grids, radii, icons, image ratios/cropping, buttons, forms, focus/error states and motion/reduced-motion behavior. Approve component variants and keyboard/screen-reader behavior. No arbitrary theme defaults.
6. **Complete page-level and responsive specifications.** Produce approved mobile/tablet/desktop layouts for every included route. Define section order, exact content/assets, data bindings, interactions, validation and loading/empty/error/sold-out/unauthorized states. Specify breakpoint values and interpolation, navigation collapse, grid column changes, wrapping, sticky elements, overflow and image crops. Review 320, 390, 768, 1024 and 1440 CSS-pixel viewports plus intermediate widths; these are proposed review sizes, not approved breakpoints.
7. **Finalize architecture and acceptance matrix.** Approve schema/relations, RLS permission matrix, server/browser boundaries, environment ownership, checkout/account decisions, email flow, deployment/rollback and failure recovery. Map every numbered requirement to a design reference and observable acceptance check.
8. **Sign implementation gate.** Brant records approval of the versioned package, Heather's operational/content decisions and resolved blocking questions. No critical TBDs in an included feature. New scope requires an updated contract and acceptance evidence.

## Page specification template

For each route provide: requirement IDs; URL pattern; roles/access; section order; component variants; final copy and asset IDs; data/query and sort rules; user action/result; validations; loading/empty/error and alternate states; mobile/tablet/desktop measurements; keyboard/focus/announcement rules; metadata/SEO; acceptance cases; approval/version. A picture alone is insufficient.

## Acceptance cases to finalize

| ID | Required observable outcome | Evidence required |
| --- | --- | --- |
| ISO-01 | Only dedicated repository/service resources and local dependency graph are used | Remote/resource inventory and dependency audit |
| CAT-01 | Owner creates/renames/reorders/hides categories and subcategories without code changes | Admin flow plus storefront result |
| CAT-02 | One product appears in multiple collections without duplicated product data | Catalog and collection cases |
| CAT-03 | Cycles, deleted parents, hidden/empty groups and slug changes behave as specified | Approved edge-case tests |
| AUTH-01 | Customers cannot read others' orders; non-admins cannot edit catalog | RLS and endpoint authorization tests |
| PAY-01 | Server rejects changed browser prices, wrong currency and unrelated provider orders | Sandbox integration cases |
| PAY-02 | Duplicate requests/events and delayed capture responses do not duplicate payment/fulfillment | Retry/reconciliation cases |
| PAY-03 | Cancelled/failed payment, sold-out race and refund paths follow approved state machines | State-transition cases |
| UX-01 | Every included page matches approved layouts at specified widths and intermediate sizes | Screenshot review with agreed tolerances |
| A11Y-01 | Target WCAG 2.2 AA; keyboard purchase/admin paths, focus, contrast and error announcements verified | Automated checks plus manual review; target subject to contract approval |
| OPS-01 | Redirects, email, webhook verification, backup/restore and rollback are verified | Staging evidence and launch checklist |

Performance budgets, browser/device support, image budgets, SEO requirements, accessibility target and visual comparison tolerances must become numeric/testable approved criteria before gate closure. Current cases are requirements for the upcoming specification, not claims of implemented behavior.

## Latest owner direction

[Provisional operations](PROVISIONAL-OPERATIONS.md) supersede earlier starting-markup blockers: placeholder prices and best-guess fulfillment are authorized for development. Actual tax obligations and live rates must be configured before real orders.
