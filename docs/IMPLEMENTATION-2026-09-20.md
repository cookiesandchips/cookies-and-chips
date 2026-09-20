# Customer content and management update — September 20, 2026

## Implemented

- Cookies are $30 per dozen; no singles or half-dozen offerings. Dog treats remain $8 per ten treats.
- Authentic Heather/Ali story, clean closing slogan, real contact and Instagram links, cancellation/allergen policies, and moderated reviews replace illustrative content.
- Existing product images and homepage portrait remain. Administrators can upload replacement product images to the dedicated Supabase storage bucket and restore defaults. Peanut Butter Bliss uses the brand logo pending a supplied photograph.
- Administrator-only products, base prices and percent/fixed markup, bulk pricing, availability, classifications, social visibility, content, discounts, orders, reviews, and newsletter records.
- Verified customer accounts have their own orders and saved addresses. Bags persist in Supabase and merge once when signing in.
- Newsletter opt-in requires separate consent and email confirmation. Tokens are hashed; rejoining after unsubscribe requires a new signup.
- Public APIs return only approved public content. Private commerce tables enable RLS and deny direct anonymous/authenticated access; server routes verify customer identity and administrator membership.
- Local delivery, mixed dozens, and fulfillment workflow are unchanged. PayPal stays sandbox; shipping stays at its existing enabled/disabled setting.

## Database setup

Applied migrations 002–005 through the dedicated project's SQL editor. Administrator membership was granted only to the verified admin@cookiesandchips.com account with explicit owner confirmation. Verified eight products, seven $30 human-cookie products, one administrator, and RLS on all commerce tables.

## Validation

16 automated tests passed, foundation checks passed, and production build passed. Live environment connection and browser checks follow deployment; a successful build does not establish successful payment capture or email delivery.

## Remaining operational verification

Confirm the redeployed server uses the corrected Supabase secret key. Validate guest cart and sandbox checkout, signed-in administrator access, account confirmation, order confirmation delivery, and PayPal webhook delivery end-to-end. Real transactions remain disabled. USDA recipe/nutrition workflow, integration configuration screens, and tracking automation are not completed by this update and must not be represented as finished.
