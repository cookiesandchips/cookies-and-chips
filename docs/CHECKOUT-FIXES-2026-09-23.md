# Checkout fixes — 2026-09-23

Checkout feedback now appears beside the review/payment action. Errors receive focus and scroll into view; shipping results focus the service selector and reviewed totals move into view. Checkout reloads its effective server configuration when requesting a new quote, so an open page does not retain an old mode indefinitely.

Integration saves update only their own admin section, preserve the other sections, and reject concurrent writes instead of overwriting a newer save. Save results appear in a sticky action area. Live payment confirmation applies to the Payment Processing section; all existing credential and environment consistency checks remain in force.

Shipping supports owner-configured parcel profiles by product type. Existing human-cookie packaging remains the fallback; other types require their own rule. Mixed types are packed separately, and every box includes its own packaging weight. Signed shipping quotes include the ship-from address and calculated parcel plan, invalidating rates after packing changes.

The owner authorized estimates for Sandie's Treats: 9 × 6 × 3 inches, 8 oz empty packaging, 0.5 oz per treat, maximum 40 treats per box. These are provisional estimates, not measured parcels. Save these through Shipping after deployment. One 10-treat package weighs an estimated 13 oz packed; four packages weigh 28 oz; five packages split into 28 oz and 13 oz boxes.

At investigation time the public checkout API returned payment mode sandbox and shipping mode sandbox. The authenticated admin reported PayPal live credentials and Shippo live token absent. Vercel lists legacy PayPal environment credentials and SHIPPO_TEST_API_TOKEN, but no SHIPPO_LIVE_API_TOKEN. Deployment scope Production is independent of provider mode. No credential values were read or copied. This code change does not relabel sandbox credentials as live or activate real payments automatically.

Validation: 43 unit tests, TypeScript, repository foundation checks, and a production build passed. A local browser fixture confirmed a failed quote renders its error by the review button and transfers focus to it. Provider-backed live payment and shipping checks require the corresponding credentials and saved modes.
