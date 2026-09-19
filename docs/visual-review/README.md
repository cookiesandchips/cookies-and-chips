# Visual review 01

Owner authorized this first design pass after reviewing the proposed Home, shopping flow and light admin scope. This is an isolated, static design prototype, not the production application or approval of the final build contract.

Open `index.html` in a browser, or serve the repository's docs directory and visit `/visual-review/`. Image paths depend on the adjacent brand directory. Fonts load from Google Fonts for this review; production font files and licensing still require integration review.

## Review paths

- Home: proposed typography, palette, hierarchy and responsive merchandising. Reference tab displays the supplied production rendition unchanged.
- Product: representative Ali’s Classic page, dozen selection, add-to-bag dialog and remove action.
- Checkout: guest-first contact form, optional account entry, pickup/delivery choice and clearly pending tax/fulfillment totals. Enter sample data only.
- Admin: product search, explicit selection, per-product base prices, percentage/fixed markup preview and session-only apply. Social profiles opens a handle/HTTPS-link/visibility editor.

## Decisions to review

1. Confirm coral/gold pill storefront buttons and chocolate form/payment actions with dark readable text where necessary.
2. Confirm Allura script accents alongside DM Serif Display and Inter.
3. Confirm mobile centered seal with menu/cart, stacked hero copy/image, two-column products and monthly feature below.
4. Confirm single-column mobile checkout, guest-first emphasis and order-summary hierarchy.
5. Confirm light admin sidebar/table with right-hand pricing drawer; full-width editor at mobile widths.

## Deliberate limits and next work

Photography is explicitly missing. The cookie illustration marks image positions; it is not a replacement for photographic brand direction. Original hero, product, founder and gallery files remain required for the high-fidelity review. Reviews and story text are visibly labelled placeholders. The mockup's full navigation, review carousel and social gallery behavior need the next detailed page pass.

The shopping interaction uses one representative product; other sample cards route to it. The direct Checkout review tab shows an illustrative one-dozen order even when the sample bag is empty. Account sign-in, email signup, shipping, payment and secondary pages are stubs. No external services, credentials, databases, emails or payments are accessed. Session data resets on reload. The social editor is one representative record; platform lists, reordering and publishing will follow the admin specification. Prototype numeric calculations are for interaction review, not the production decimal-money implementation.

The prototype is intentionally outside application source. Sample lists are fixtures, not the future commerce schema: categories, subcategories, collections, product types and navigation remain data-driven and owner-editable in production.

## Verification

Browser inspected at desktop and 390px mobile width. Verified product → add-to-bag → checkout with a dozen/$20 subtotal. Verified selected-product 50% markup preview and apply changed only that product from $20 to $30. JavaScript syntax and repository foundation checks pass. This is not a complete accessibility, checkout or responsive acceptance test.

## Generated imagery update

Owner requested temporary generated photography. Seven built-in image-generation assets now fill the hero, four core product cards, seasonal feature, story, product detail, gallery and closing banner. See ../brand/generated-v1/README.md for prompts and provenance. This supersedes the image-placeholder description above; original product and founder photography can replace these independently.
