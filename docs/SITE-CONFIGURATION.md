# Site Configuration — approved V1 scope

Owner approved provider configuration in the admin UI and explicitly selected no collection when tax is disabled or unconfigured.

## Sections

Site Configuration contains Payment Processing and Tax; use an extensible section layout for future settings. These are implementation requirements, not a claim that provider connections are operational.

### Payment Processing → PayPal

Enabled/disabled, sandbox/live mode, separate client ID/client secret/webhook ID for each mode, Test Connection, last test time/status and explicit Activate Live. No enabled, configured payment provider means checkout cannot take payment. Activation validates the selected mode's credentials and prerequisites; changing mode never falls back to another mode's secrets.

### Tax → TaxJar

Enabled/disabled, sandbox/live mode, separate API tokens, Test Connection, last test time/status and explicit Activate Live.

**Owner policy:** If tax is not configured or is explicitly disabled, the checkout tax line is $0.00 and purchases can proceed if payment processing is available. Cookies & Chips is responsible for calculating and remitting applicable taxes manually. This is a collection policy, not a determination that a sale is tax-exempt or that no tax is owed. No tax-included price adjustment is inferred.

Admin shows a persistent notice: “Automatic tax collection is off. No tax will be collected at checkout. Cookies & Chips is responsible for calculating and remitting applicable taxes manually.” Record acknowledgement and actor/time when changing to this mode. Customer copy says “Tax collected: $0.00”; do not claim tax-exempt status.

Distinguish unconfigured/disabled from operational failures. An enabled integration with expired/invalid credentials, timeouts or provider errors must show a retryable error and block payment until resolved or an authorized admin explicitly disables tax. Never silently turn failure into zero tax. Incomplete configuration cannot be enabled.

Persist order tax amount, collection mode (manual/no collection versus TaxJar), provider mode, configuration version and quote reference where applicable. Keep these snapshots unchanged after order placement. Recalculate an open checkout when mode changes and obtain customer review if its total changes; never capture a different total silently. Existing completed orders are not rewritten by a toggle.

## Credential protection

Only authorized administrators can manage configuration through server-enforced permissions. Encrypt credential values at rest with a dedicated server-only encryption key held outside the database; plan rotation/versioning. Secrets are write-only in the UI after saving: show presence and masked status, allow replacement/removal, never return plaintext through read endpoints. No browser storage, public payloads, Git history or logs may contain credentials. Test responses expose sanitized status only.

Audit actor, timestamp, provider, mode, changed field names, test result and activation/deactivation; exclude secret values. Vercel retains bootstrap infrastructure secrets and the settings encryption key. Existing provider environment variables may support deliberate bootstrap; never silently fall back to old environment credentials after admin settings are changed or disabled. Production credential-storage and authentication implementation is still pending.

## Acceptance

- Save separate sandbox/live credentials without revealing them on reread. Test uses only selected credentials and endpoint.
- Unauthorized users cannot read or mutate provider configuration. Failed save preserves prior configuration.
- Unconfigured tax permits checkout with zero tax collected and manual-responsibility admin notice.
- Explicitly disabled TaxJar makes no provider requests and collects zero tax.
- Enabled TaxJar uses returned tax; provider failures never silently become zero tax.
- Payment disabled blocks payment independently of tax mode.
- Live activation is explicit, audited and validated; switching mode revalidates outstanding quotes.

## Shipping → Shippo — approved V1 scope

Owner approved live carrier rates through Shippo and a third Site Configuration section, Shipping. This records scope; no account, connection or live shipping activation has been completed.

Settings: shipping enabled/disabled; live carrier rates or owner-defined manual rates; dedicated test/live credentials and explicit live activation; Test Connection and sanitized status; private ship-from address; eligible destinations and carrier services; package presets with dimensions/units, empty packaging weight, capacity and packing rules; optional disclosed handling fee; explicit optional fallback rate. Use the credential protection and audit rules above. Do not infer activation from the provider account existing.

Checkout builds parcels from purchased package quantities and validated packing rules. Weight includes finished products plus all packaging. Mixed products and multiple boxes must be supported by deterministic reviewed rules; if an order cannot be packed by a configured rule, do not invent dimensions or silently underquote. Use origin, destination, actual parcel dimensions/weights and allowed carrier services to fetch eligible rates. Display transit estimates separately from preparation time; do not promise guaranteed arrival unless the service explicitly supports that promise.

Customer chooses a shipping service before payment. Server computes the shipping charge from the selected rate plus any configured handling fee, and passes that charge to tax calculation when enabled. Requote when cart, address, service, packing configuration or quote validity changes, and show any changed total before payment. Save carrier/service, parcel plan, quote reference, quoted postage, handling fee, total shipping charged and provider mode with the order. Later rate changes must not rewrite placed-order totals.

Shipping OFF removes shipped delivery from new checkout choices and preserves existing shipments. Pickup and local delivery retain their independent rules. Test rates must not be used for real customer orders. Rate errors or no eligible services require retry, another fulfillment method, or an explicitly configured applicable fallback; never silently set shipping to zero. A manual/fallback charge is clearly identified and is not represented as a live carrier quote.

Label purchase is separate from checkout rate lookup. Do not automatically buy postage merely because a customer requests rates or starts checkout. Label purchase, tracking and label refunds can be added as a subsequent operational workflow; this approval does not authorize paid label purchases now.

### Required package data before live shipping

Owner measures and weighs a fully packed one-dozen order and common larger orders. Record external box dimensions, total weight, empty packaging weight, capacity and actual product weights. Configure dispatch address, service area, allowed services and baking/dispatch schedule. Existing illustrative $10–$20 pricing and $15 preview rates are not live carrier rules.

### Acceptance

- One-dozen, multi-dozen, mixed-product and multi-box carts use correct validated parcel plans.
- Only allowed destination/services render; no eligible service produces an actionable state.
- Handling fee is applied once per configured rule and included in the reviewed total.
- Address/cart changes invalidate stale quotes; duplicate rate requests cannot buy labels.
- Rate failure uses only an explicitly configured applicable fallback and never implicit free shipping.
- Test/live credentials remain distinct and server-only; toggles and configuration edits are audited.

Source: https://support.goshippo.com/hc/en-us/articles/4404415886491-Get-started-with-the-Shippo-API

## Editable package estimates — owner authorized

Use the following provisional human-cookie package presets for development and test quotes. These are planning assumptions, not measured packaging or verified carrier costs. All values are editable in Site Configuration → Shipping → Package presets.

| Preset | Capacity | External dimensions (inches) | Empty packaging weight | Estimated packed weight at capacity |
| --- | --- | --- | --- | --- |
| One dozen | 12 cookies | 9 × 6 × 3 | 8 oz | 32 oz / 2 lb |
| Two dozen | 24 cookies | 12 × 9 × 4 | 12 oz | 60 oz / 3.75 lb |
| Three dozen | 36 cookies | 12 × 12 × 5 | 16 oz | 88 oz / 5.5 lb |

Assume 2 oz finished weight per human cookie initially. Estimated packed weight = sum of item weights + empty packaging weight; empty weight includes box, inserts, liners and protective material. Do not add packaging twice. Stored product weights are configurable per product and separate from nutrition serving weights until verified. No assumption that every recipe produces identically sized cookies.

Admin fields: preset name, enabled, capacity, applicable products/types, external length/width/height, dimension unit, empty packaging weight and unit, computed packed-weight preview, optional measured packed-weight override for an exact contents configuration, verification status, measured date and notes. Label the status Estimated or Verified. Default these presets to Estimated. Editing inputs immediately updates the preview; saving invalidates affected open shipping quotes. Require positive finite dimensions/weights, integer capacity and supported units. Convert to provider units server-side.

Provisional packing: for human-cookie-only orders choose the smallest enabled preset with sufficient capacity up to 36 cookies. Beyond 36, allocate full 36-cookie boxes then the smallest sufficient preset for the remainder; calculate actual contents weight for each box, not full-capacity weight for every box. Example: 4 dozen → one 36-cookie box (88 oz) plus one 12-cookie box (32 oz). This is a deterministic starting rule, not a validated physical packing result. Pet treats/mixed product orders need applicable package rules; never apply human-cookie capacity blindly.

Use these estimates for test-rate development now. Before live quotes/label purchase, measure sealed parcels or explicitly confirm continued use of estimates; keep unverified status visible to admin. Underestimated dimensions/weight can cause carrier adjustments. Changing a preset does not rewrite completed orders or purchased labels.
