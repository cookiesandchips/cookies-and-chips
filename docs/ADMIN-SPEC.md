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
- Initial catalog prices remain $30/dozen and $8/10 dog treats until an authorized admin intentionally changes them. Configurable prices are not permanent constants.

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
