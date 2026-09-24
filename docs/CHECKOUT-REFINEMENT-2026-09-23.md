# Checkout refinement deployment

To enable the support checkbox, apply `supabase/migrations/202609230003_order_support.sql` to the dedicated Cookies & Chips project before collecting support. It adds a dedicated `donation_cents` column (0 or 100) and updates the total constraint. Existing orders retain zero support. The compatibility check keeps ordinary checkout working before migration and hides the support checkbox until the dedicated column exists. Finish the migration to make support available.

## Payments

Bakery admin remains authoritative for the active environment and encrypted provider credentials. The browser receives only the active PayPal public client ID. The JavaScript SDK renders eligible PayPal, Venmo, and card buttons; Google Pay uses PayPal's Googlepay component and Google's PaymentsClient. Google Pay merchant onboarding must be enabled on the corresponding PayPal app. Wallet buttons use provider branding and device/account eligibility. No Pay Later messages or badges are loaded; `disable-funding=paylater,credit` disables merchant checkout buttons. PayPal documents this as button configuration, not a guarantee about financing choices inside its signed-in wallet. Confirm any account-level suppression with PayPal; do not manipulate PayPal-owned UI.

Approval navigates to automatic server-side capture/reconciliation. The receipt appears only after the paid order is persisted and reread. Retries retain the same provider order and capture idempotency key. Google Pay returns success only after capture is persisted; its receipt route is idempotent. Interrupted verification presents a status retry, never a second purchase action.

Required account/device verification: sandbox PayPal guest and signed-in approval, cancel, interrupted return, repeat return, Venmo eligible mobile account, Google Pay eligible Chrome/device and 3DS flow. A live paid transaction requires a buyer and explicit spending authorization; provider onboarding cannot be inferred from a successful build.

## CureSearch support and accounting

The unchecked checkbox opts into exactly $1.00. The server accepts only boolean true, ignores browser-supplied amounts, and includes a dedicated order field and separate named PayPal amount line. It does not use PayPal's restricted DONATION category or create a fake catalog product. Merchandise discounts and shipping weight do not apply to the support amount. Receipts, customer history and admin show it separately. Full refunds performed in PayPal must include the full captured total, including this amount. Partial refunds require the operator to record which part of the refund concerns support; do not infer that every partial refund returns the contribution. There is no automatic disbursement to CureSearch. The merchant must reconcile collected, refunded and remitted support separately.

Copy says “support” and makes no claim of customer tax deductibility, partnership, or automatic remittance. CureSearch's [product and sales donations information](https://curesearch.org/ways-to-donate/donate-to-childrens-cancer-research/corporate-and-foundation-gifts/product-and-sales-donations/) welcomes business fundraising but does not establish this bakery's agreement. Confirm campaign wording, remittance, refund handling and tax treatment directly with CureSearch and the merchant's accountant. [IRS Publication 526](https://www.irs.gov/publications/p526) does not establish deductibility of this merchant-collected payment. The implementation excludes this separate voluntary support amount from merchandise sales-tax inputs; its treatment needs merchant tax review before collecting it in live mode.

## Content and addresses

Admin Content selects an active canonical product for Cookie of the Month. The feature displays its catalog name, image, description and price; inactive selection is not advertised. Homepage story introduction already used the CMS and remains editable there. Hero and closing ribbon use the requested new copy. No redeploy is needed for monthly selection or story edits.

Checkout, customer saved addresses and admin ship-from/pickup forms use the same USPS dropdown. Server validation converts recognized legacy names/codes into uppercase two-letter values and rejects invented codes. Existing saved addresses are normalized when used/saved; there is no destructive bulk rewrite. Military/territory codes being valid USPS destinations does not guarantee a carrier service is available.
