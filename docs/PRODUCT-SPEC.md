# Cookies & Chips — V1 product specification

Status: working specification. The facts below were supplied by Brant in this task; the complete build/design package is not yet approved. No application implementation is authorized by this document.

## Confirmed checkout requirements

- CHECKOUT-01: Both guests and registered customers can purchase through PayPal. Creating a Cookies & Chips account is not required to purchase. This does not promise any particular PayPal wallet/card eligibility.
- CHECKOUT-02: Guest and authenticated purchases share one commerce pipeline. Account scope includes profile, saved addresses, order history/detail and reorder alongside sign-in, registration and recovery. Guest-to-account order linking remains to be specified. See ADDENDUM-2026-09-19.md.
- SECURITY-01: Guest order access must use a secure verification mechanism; knowing an email address or order number alone must not expose an order. Never automatically attach a guest order to an account on an unverified email match.

## Confirmed catalog and copy

Names and descriptions below preserve owner-provided copy, with encoded trailing spaces removed.

| Product | Group supplied | Description |
| --- | --- | --- |
| Ali’s Classic | Cookies | A soft, buttery chocolate chip cookie filled with melted semi sweet chocolate and a golden-browned base. |
| The Cozy Oat | Cookies | A soft, cinnamon-kissed oatmeal cookie with sweet raisins. |
| Crinkle Crush | Cookies | A rich, brownie-like chocolate cookie with a delicate powdered sugar crackle and fudgy center. |
| Cinnamon Kiss | Cookies | A soft, buttery snickerdoodle rolled in cinnamon sugar and baked with a tender, chewy center. |
| Macadamia Dream | Cookies | A soft, buttery cookie filled with creamy white chocolate and crunchy macadamia nuts. |
| Pumpkin Patch | Seasonal | A soft pumpkin cookie with warm autumn spice and generous pockets of semi sweet chocolate chips. |
| Sandie’s Treats | For the Pups | Homemade pumpkin + peanut butter dog treats made with simple, natural ingredients. |

The supplied descriptions are marketing copy, not complete ingredient, allergen, nutrition or pet-feeding disclosures. Do not infer unprovided safety or dietary claims.

## Confirmed base pricing — September 19

Human-cookie starting base price is **$20 per dozen**. This is the private admin pricing basis, not the online selling price. Final selling price uses the confirmed percentage-or-fixed-amount markup rule. The starting markup has not yet been supplied. Maintaining the previously supplied $30 retail price would require either 50% or $10 markup; neither is selected automatically. Dog-treat base price/markup remain unspecified; the previously supplied $8/10 is retail, not an inferred base.

## Previously supplied retail price list

| Product family | Package | Price supplied |
| --- | --- | --- |
| Cookies | 1 dozen (12) | $30 |
| Sandie’s Treats | 10 dog treats | $8 |

The owner has removed individual and half-dozen pricing. Human cookies are offered by the dozen at $30; do not offer single-cookie or half-dozen purchase options. Quantity refers to the number of dozen packages, not individual cookies. The dollar denomination is supplied; currency code and tax treatment remain to be confirmed. Confirm that the general cookie pricing also applies to Pumpkin Patch and every flavor. Do not silently introduce automatic quantity discounts, mixed boxes, or arbitrary quantity repricing. Dog-treat pack pricing remains separate and unchanged at $8 for 10 treats.

## Checkout tax and shipping — confirmed requirement

Calculate and apply appropriate sales tax and shipping for the actual checkout destination before payment. Both guest and authenticated customers use the same server-side calculation pipeline. Saved addresses may prefill the flow, but changing the selected address must recalculate the quote.

- Display merchandise subtotal using published selling prices, shipping/local fulfillment charges, applicable sales tax and final payable total as separate lines.
- Tax calculation must use the configured business collection obligations, product tax classification, fulfillment method and applicable address rules; do not implement a universal ZIP-to-percentage table or assume every destination owes tax. Tax on shipping, if applicable, belongs in the tax calculation.
- Select/document tax and shipping calculation services or maintained mechanisms before implementation. Merchant tax configuration, origin address, product tax categories, parcel weights/dimensions and supported destinations remain required inputs. No tax rates or obligations are determined by this specification.
- Recalculate when destination, quantities, prices or fulfillment selection changes. Do not fall back to zero tax/free shipping if calculation fails; block payment pending a valid quote and show a recoverable error.
- Bind the reviewed quote to the current cart, destination, fulfillment method and currency. Validate quote freshness server-side before creating/capturing payment; changed totals require customer review. Preserve calculation references, breakdowns and purchase-time totals on the order.
- Pickup and local delivery need their appropriate fulfillment location/tax treatment; shipping OFF must not disable applicable tax calculation.

## Confirmed fulfillment offer

| Method | Supplied rule | Remaining definition |
| --- | --- | --- |
| Local delivery | Free within a 10-mile radius | Delivery origin, distance calculation, operating times and any minimum order |
| Local delivery | Free within 50 miles for orders of $50+ | Threshold calculation and treatment of orders below $50 outside the 10-mile zone |
| Shipping | $10–$20 depending on ZIP code | Exact ZIP/rate mapping or carrier quote method, supported destinations and edge cases |
| Pickup | Available | Location, fee if any, schedule, instructions and address visibility |

Delivery eligibility is evaluated against an address before offering a rate. Do not assume a paid delivery rate for the 10–50-mile zone below $50, delivery beyond 50 miles, free pickup, or a shipping rate within the range without a defined rule. Resolve inclusive distance boundaries and whether distance means straight-line radius or road mileage. Define whether the $50 threshold uses merchandise subtotal before/after discounts and excludes/includes tax; do not invent it.

## Proposed catalog organization — approval pending

Use editable categories for Cookies and For the Pups. Seasonal can be a collection containing Pumpkin Patch (or an editable subcategory if preferred). A product may appear in multiple collections without duplication. These names are initial content, never fixed code enums. Heather can rename, reorder, hide and expand the catalog taxonomy without deployment.

## Acceptance additions

- Guests complete an eligible purchase without registering for a Cookies & Chips account; signed-in customers can also purchase.
- Account and guest order access remain isolated; another shopper cannot obtain order details using a guessed identifier.
- Cookie packages display and calculate $30 per dozen, with no individual or half-dozen purchase options; Sandie’s Treats displays $8 per 10 treats. Final currency and seasonal applicability are confirmed before payment implementation.
- Eligible orders inside the confirmed 10-mile boundary receive free local delivery; eligible $50+ orders inside the confirmed 50-mile boundary do too.
- Test the exact approved distance and spend boundaries and values immediately on either side; unsupported or undefined cases cannot receive invented rates.
- Tax/shipping recalculation covers address changes, mixed human-food/pet-treat carts, shipping taxability, calculation failure, stale quotes and both checkout identities. Verify provider totals against persisted order and payment totals.
- Shipping uses the approved ZIP/rate rules and displays an exact total before payment, not a $10–$20 estimate charged arbitrarily.

## Next decisions

1. Dozen composition defaults to one selected flavor per dozen per the September 19 addendum. Mixed dozens require a separate specification. Admin pricing uses an entered base price plus either percentage or fixed-amount markup; see ADMIN-SPEC.md.
2. Delivery origin and distance method; rules for orders under $50 between 10 and 50 miles; threshold basis; service beyond 50 miles.
3. Shipping ZIP/rate schedule and geography; pickup details; preparation times and order cutoffs.
4. Currency/taxes, seasonal dates and price applicability, inventory model, ingredients/allergens and pet-treat details.
5. Approved photography/logo and visual references; page layouts, responsive behavior, full account/admin scope and final acceptance criteria.
