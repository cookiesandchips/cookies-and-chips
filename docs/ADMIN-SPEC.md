# Management portal — working specification

Updated September 19, 2026. Direct owner requirements: a light enterprise-style portal, editable prices, and a percentage markup applied to explicitly selected products. The three supplied roadmap screenshots establish layout/interaction references only. Do not copy their proprietary content, branding, code or dark palette. Exact tokens and responsive layouts remain to be approved.

## Visual and interaction direction

- White/light-gray surfaces, dark readable text, subtle borders, restrained accent color and clear active states. No dark default theme.
- Compact top bar with Cookies & Chips identity, active workspace context, account and sign-out controls.
- Persistent left navigation for Dashboard, Orders, Products, Catalog, Merchandising, Reviews and Settings. Final labels and permissions require page-spec approval.
- Main workspace with page title/count, search, filters and compact action toolbar. Use dense but readable rows, explicit statuses, grouped expandable sections where useful and consistent alignment.
- Right-hand detail/edit drawer opens from a selected row while preserving list filters and scroll. Use tabs only for meaningful detail groups, with a clear close control and visible save/cancel actions.
- Adapt the examples' hierarchy, filter bars, status chips, group counts and detail panel to commerce tasks. Roadmap quarters, release timelines, watches, Jira links and personnel data are not requested features.
- On narrow screens, collapse navigation, keep essential columns visible and offer horizontal table scrolling where needed. Detail drawers become full-screen. Keyboard focus enters the drawer, remains contained while modal, and returns to its trigger on close. Define unsaved-change handling before implementation.

## Product pricing and bulk markup

Confirmed: authorized administrators can enter a product price, select multiple products and apply one markup percentage to that selected set. No live prices have been changed by this specification.

**Decision pending:** Does the entered amount mean base/cost per sellable package, or the current selling price? Do not silently choose the markup basis. Markup is not margin: 50% markup on $20 yields $30, while a 50% margin would require $40. These are illustrative arithmetic examples, not catalog prices.

Proposed workflow for approval:

1. Search/filter the Products table and select explicit product rows. Show selected count. A page checkbox selects that page only; selecting all filtered results requires a distinct action showing the total scope. Filter changes do not silently expand the selection.
2. Enter/edit each product's package price. For human cookies the package is one dozen (12 cookies); for Sandie's Treats it is 10 treats. Never calculate per individual cookie by accident.
3. Choose Apply markup and enter a nonnegative percentage. Clearly label the calculation basis after the owner resolves it. Reject missing, invalid or negative amounts and invalid percentages; define practical upper limits with the final pricing contract.
4. Preview each selected product's package, basis amount, percentage, current selling price and resulting selling price. Show exclusions/errors explicitly. No price changes occur while previewing.
5. Apply the reviewed set through a deliberate Save prices action, with a count and total scope. Keep unselected products unchanged. Return the completed result and record an audit event.

Proposed calculation: new selling price = chosen basis × (1 + percentage / 100), rounded once to the currency's minor unit using decimal arithmetic and an explicitly specified rounding rule. Proposed rounding is half-up. No automatic .99 ending, tax markup, delivery markup or implicit discount. Currency remains to be confirmed.

If base/cost is chosen, store it separately from the public selling price and recalculate from that basis; rerunning the same percentage must not compound on the prior computed selling price. If current selling price is chosen, preview any compounding explicitly and prevent duplicate submissions/retries from applying twice. Decide manual overrides and whether later basis edits recalculate prices automatically before implementation.

## Integrity and permissions

- Require server-side admin authorization for pricing and fulfillment settings. Hiding a UI control is not authorization.
- Keep cost/basis fields, markup settings and pricing audit records private; only published selling prices reach public catalog responses.
- Record actor, timestamp, selected product IDs, basis, percentage, old/new prices and operation ID. Never log credentials or payment details.
- Use version checks between preview and save. If any selected price changed or a product became invalid, reject the batch and require a refreshed preview. Proposed V1 behavior is an atomic all-or-nothing update.
- Existing placed orders retain purchase-time prices. For open carts, revalidate current prices before payment and show changed totals for customer review. Define quote expiry and active-payment behavior in the commerce contract; never silently capture a different amount from the amount reviewed.
- Initial catalog prices remain $30/dozen and $8/10 dog treats until an authorized admin intentionally changes them. Configurable prices are not permanent constants.

## Shipping management

Provide a runtime Shipping enabled switch. Turning it off removes shipping from new checkout choices without deployment; retain existing orders and shipment history. Turning it on requires a configured destination-based rate mechanism and supported service area. A toggle must not invent rates or override local eligibility.

Revalidate fulfillment at checkout finalization. If shipping is disabled or the chosen destination changes before payment, request a valid selection/new quote. Specify handling of already-created payment orders before implementation. Shipping initial ON/OFF state remains undecided.

## Acceptance criteria to implement later

- Admin selects products A and B, previews and applies markup; unselected C remains unchanged.
- Pricing clearly identifies dozen/10-treat units in the table, drawer, preview and audit trail.
- Decimal rounding, zero markup, invalid input, empty selection, mixed package types and stale-price conflicts have explicit tests.
- Retry/double-click does not double-apply; failed validation does not partially update a batch.
- Customers cannot access private pricing inputs or invoke admin mutations; historical order totals remain unchanged.
- Shipping OFF removes it from both guest and authenticated checkout; ON calculates destination-specific charges before payment. Both flows use the same commerce pipeline.
- Light theme, filters, selection counts, expandable groups and detail drawer behave consistently with approved responsive/admin page specifications.
