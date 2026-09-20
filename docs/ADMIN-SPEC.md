# Management portal — working specification

Updated September 19, 2026. Direct owner requirements: a light enterprise-style portal, editable prices, and a percentage or fixed-amount markup applied to explicitly selected products. The three supplied roadmap screenshots establish layout/interaction references only. Do not copy their proprietary content, branding, code or dark palette. Exact tokens and responsive layouts remain to be approved.

## Visual and interaction direction

- White/light-gray surfaces, dark readable text, subtle borders, restrained accent color and clear active states. No dark default theme.
- Compact top bar with Cookies & Chips identity, active workspace context, account and sign-out controls.
- Persistent left navigation for Dashboard, Orders, Products, Catalog, Merchandising, Reviews and Settings. Final labels and permissions require page-spec approval.
- Main workspace with page title/count, search, filters and compact action toolbar. Use dense but readable rows, explicit statuses, grouped expandable sections where useful and consistent alignment.
- Right-hand detail/edit drawer opens from a selected row while preserving list filters and scroll. Use tabs only for meaningful detail groups, with a clear close control and visible save/cancel actions.
- Adapt the examples' hierarchy, filter bars, status chips, group counts and detail panel to commerce tasks. Roadmap quarters, release timelines, watches, Jira links and personnel data are not requested features.
- On narrow screens, collapse navigation, keep essential columns visible and offer horizontal table scrolling where needed. Detail drawers become full-screen. Keyboard focus enters the drawer, remains contained while modal, and returns to its trigger on close. Define unsaved-change handling before implementation.

## Product pricing and bulk markup

Confirmed: administrators enter a base price per sellable package and choose either a percentage markup or a fixed-amount markup to create the public selling price. The same markup setting can be applied to explicitly selected products, each using its own base price. No live prices are changed by this specification.

- Percentage mode: selling price = base price × (1 + markup percentage / 100).
- Fixed-amount mode: selling price = base price + markup amount, per sellable package.
- Use one mode at a time; do not stack percentage and fixed amounts. Markup is calculated from the entered base, never from the previous selling price.
- Illustrative examples: $20 base + 50% = $30 selling price; $20 base + $5 = $25 selling price. These examples do not establish actual catalog base prices.
- Store base price, markup mode/value and resulting selling price separately. The base is an administrator-entered pricing basis, not necessarily an accounting cost. Customers see the final selling price, not the private base or markup.

Proposed workflow for approval:

1. Search/filter and select explicit product rows. Show selected count; select-page and select-all-filtered are separate actions with clear scope. Filter changes never silently expand selection.
2. Enter/edit each product's base price per package: one dozen for human cookies, 10 treats for Sandie's Treats.
3. Choose Percentage or Fixed amount and enter a nonnegative value. Reject missing/invalid base prices, invalid markup values and negative values. Resolve supported limits in implementation validation.
4. Preview product, package size, base price, markup mode/value, current selling price and new selling price. Preview makes no changes.
5. Save the reviewed set. Saving a base or markup change recomputes the selling price from that base and selected mode. Unselected products remain unchanged; retries do not compound markup. Proposed V1 has no independent manual override of the computed final price.

Use decimal arithmetic; round the computed selling price once to the currency's minor unit. Proposed rounding: half-up. Fixed markup uses the same currency as the product. No automatic .99 endings or markup on taxes/shipping. Currency still needs confirmation. Existing $30/dozen and $8/10 prices are prior retail prices, not newly inferred base prices; human-cookie base is now confirmed at $20/dozen, with starting markup still to be selected. Dog-treat base/markup remain pending.

## Integrity and permissions

- Require server-side admin authorization for pricing and fulfillment settings. Hiding a UI control is not authorization.
- Keep cost/basis fields, markup settings and pricing audit records private; only published selling prices reach public catalog responses.
- Record actor, timestamp, selected product IDs, base price, markup mode/value, old/new prices and operation ID. Never log credentials or payment details.
- Use version checks between preview and save. If any selected price changed or a product became invalid, reject the batch and require a refreshed preview. Proposed V1 behavior is an atomic all-or-nothing update.
- Existing placed orders retain purchase-time prices. For open carts, revalidate current prices before payment and show changed totals for customer review. Define quote expiry and active-payment behavior in the commerce contract; never silently capture a different amount from the amount reviewed.
- Starting markup may use development placeholders; see provisional operations. Owner will set actual selling prices during implementation. Configurable prices are not permanent constants.

## Shipping management

Provide a runtime Shipping enabled switch. Turning it off removes shipping from new checkout choices without deployment; retain existing orders and shipment history. Turning it on requires a configured destination-based rate mechanism and supported service area. A toggle must not invent rates or override local eligibility.

Revalidate fulfillment at checkout finalization. If shipping is disabled or the chosen destination changes before payment, request a valid selection/new quote. Specify handling of already-created payment orders before implementation. Shipping initial ON/OFF state remains undecided.

## Acceptance criteria to implement later

- Admin selects products A and B, previews and applies markup; unselected C remains unchanged.
- Pricing clearly identifies dozen/10-treat units in the table, drawer, preview and audit trail.
- Percentage and fixed-amount calculations, decimal rounding, zero markup, invalid input, empty selection, mixed package types and stale-price conflicts have explicit tests.
- Retry/double-click does not double-apply; failed validation does not partially update a batch.
- Customers cannot access private pricing inputs or invoke admin mutations; historical order totals remain unchanged.
- Shipping OFF removes it from both guest and authenticated checkout; ON calculates destination-specific charges before payment. Both flows use the same commerce pipeline.
- Light theme, filters, selection counts, expandable groups and detail drawer behave consistently with approved responsive/admin page specifications.

## Social profiles and links — confirmed owner requirement

Provide Settings → Social profiles so an authorized administrator can add, edit, hide, remove and reorder social profiles without a code change or deployment. Keep this Cookies & Chips configuration isolated from every other project.

Each record stores a stable ID, platform, optional display label, editable handle, full profile URL, visible flag and display order. Support Instagram, Facebook, TikTok, Pinterest, YouTube and a generic website/link option; the actual enabled platforms and handles are owner-entered. Do not infer a URL solely from a handle: retain the explicit full URL and show a preview so the administrator can check that both match.

Use the saved settings consistently in the header where present, Follow Along section, footer and other public profile links. Hidden/incomplete profiles must not render empty icons or broken links. A social gallery's image/content management is separate; editing a handle does not connect a live social feed.

Save only validated HTTPS URLs with a hostname; reject script/data schemes, embedded credentials and invalid destinations. Recognized platform choices should warn on a mismatched hostname. Handle text is plain text, never executable markup. Require server-side admin authorization, audit actor/time and before/after values, preserve unsaved edits on validation errors, and invalidate published settings caches after save. Do not store platform passwords or access tokens in public profile settings.

Acceptance criteria:
- Editing a handle and URL updates every public occurrence after successful save without redeployment.
- Visibility and ordering persist and match the storefront; removing one profile does not alter another.
- Invalid links cannot be published; failures keep the last valid public configuration.
- Customers and unauthorized accounts cannot mutate settings.
- Icons have accessible platform labels; new-tab links use appropriate security attributes.
- Empty settings show no invented profiles; an admin preview shows the exact destination before save.

This section specifies future implementation; the admin portal is not yet built.

## Latest owner direction

[Provisional operations](PROVISIONAL-OPERATIONS.md) supersede earlier starting-markup blockers: placeholder prices and best-guess fulfillment are authorized for development. Actual tax obligations and live rates must be configured before real orders.

## Social icon mapping — owner refinement

Support Instagram, Facebook, TikTok, YouTube, Pinterest, X, Threads, LinkedIn, Snapchat, Bluesky, WhatsApp, Telegram, Reddit and Discord. Each platform has its recognizable brand icon, selected automatically from the platform ID; administrators do not upload or choose an icon manually. One profile per platform in V1, with editable handle, HTTPS profile URL, visibility and display order. Add/remove controls and an icon preview are included.

Only saved, visible profiles with valid URLs render in Follow Along and storefront footer social links. Hidden profiles preserve their settings but contribute no icon or empty space. Sort by configured display order, preserving list order on ties. Links have platform/handle accessible names, 44px targets and safe new-tab behavior. Reject mismatched platform domains and embedded credentials. Generic links, if added later, use a generic link symbol, never another platform's logo.

The local review uses vendored Font Awesome Free brand SVGs with its license in visual-review/social-icons/LICENSE.txt. Test icon appearance, hide/show, reorder, invalid links and independent profile edits before production. Current changes are session-only preview behavior; production settings require persistence, admin authorization and publishing/cache updates described above.

## Recipe-derived product information

See [private recipe workflow](RECIPE-PRODUCT-WORKFLOW.md) for the owner-requested recipe intake, reviewed nutrition/ingredient/allergen drafts, image and description generation, costing suggestions and strict public/private boundary.

## September 20 controlling update

[Current V1 setup decisions](SETUP-DECISIONS-2026-09-20.md) supersede conflicting earlier plans: implementation authorized, single dedicated Supabase environment, no AI integration, and configurable TaxJar.
