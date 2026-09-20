# Provisional operations — September 19, 2026

Owner authorizes placeholder markup and best-guess fulfillment so specification/design can proceed. These are development assumptions, editable during implementation, not published promises.

## Pricing
Human-cookie base remains $20 per dozen. Use 0% placeholder markup ($20 example retail) in development until the owner edits it. Starting markup is no longer a specification blocker. Prior $30 retail and mockup prices do not override the placeholder policy. Dog-treat pricing remains a separately editable placeholder.

## Fulfillment defaults for development
- Pickup: free, by appointment; proposed preparation lead time 48 hours.
- Local delivery: retain free delivery within 10 miles. For more than 10 through 50 miles, free on merchandise subtotal of $50 or more after discounts and before tax/fees.
- Proposed under-$50 delivery fee in the 10–50 mile band: $10.
- Proposed distance method: straight-line radius from the configured dispatch address. Address must be supplied privately; never invent an actual origin.
- Outside 50 miles: pickup or shipping when enabled; no local delivery.
- Shipping: OFF for initial public launch recommendation, consistent with the mockup's “coming soon” message. Preview can use a clearly labelled $15 flat simulated rate to exercise checkout. This is not a destination-based production quote.
- Later shipping: configure destination/carrier rates using actual parcel weight, dimensions, origin and eligible destinations. Do not present a simulated rate as a carrier quote.
- Use America/Phoenix time; proposed order lead time is 48 hours, with pickup/delivery appointment coordination. Specific operating days/capacity remain editable configuration.
- These choices support design and sandbox testing. Confirm business address, available hours and actual service capability before accepting real orders.

## Tax recommendation, not yet selected or provisioned
Use a server-side tax service such as TaxJar for custom Next.js + PayPal checkout. Send the actual origin, fulfillment destination (pickup location for pickup), shipping charge, discounted order lines and product tax categories; configure the merchant's collection jurisdictions/nexus. Human cookies and dog treats need separate classification review.

Calculate tax before creating the PayPal payment total and recalculate when the address, fulfillment, cart or price changes. Store the quote and order tax breakdown. Never infer tax from ZIP alone or collect a guessed percentage in live checkout. On calculation failure block payment with a retry message; do not silently assume tax is zero. Sandbox simulations must be explicitly labelled.

Arizona food classification and city rules need confirmation with the owner's tax professional or ADOR. The service does not determine registration obligations or automatically make filings unless those services are separately arranged. Review provider API plan eligibility and pricing before subscription. Provider selection and credentials remain pending.

References checked September 19, 2026:
- https://developers.taxjar.com/integrations/sales-tax-calculations/
- https://support.taxjar.com/article/810-taxjar-api-which-endpoint-should-i-use-for-calculations
- https://azdor.gov/model-city-tax-code/articles-and-sections/retail-sales-food-home-consumption
- https://azdor.gov/business/transaction-privilege-tax

## Approved shipping integration

Owner approved Shippo live rates and Site Configuration → Shipping. See [shipping settings and acceptance](SITE-CONFIGURATION.md#shipping--shippo--approved-v1-scope). Provider setup and measured packaging data are pending; earlier preview shipping charges remain non-production placeholders. Pickup and local delivery rules remain independent.

## Owner-authorized shipping estimates

Editable 12/24/36-cookie package presets and a provisional 2 oz per-cookie shipping weight are defined in [Site Configuration](SITE-CONFIGURATION.md#editable-package-estimates--owner-authorized). All are Estimated, not measured, and are configurable on the Shipping integration page. These unblock test quotes; pet-treat/mixed-product packing requires its own applicable rules.
