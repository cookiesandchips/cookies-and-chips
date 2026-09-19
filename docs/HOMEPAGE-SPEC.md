# Homepage production reference — V1

Status: visual composition approved by Brant in this task. The supplied circular logo is now the current primary asset. The Brand & UI System V1 governs specified colors and typography; remaining token alternatives, responsive layouts, source photography and interaction specifications remain open. This reference does not open the implementation gate by itself.

## Source and precedence

The [updated September 19 rendition](brand/homepage-production-reference-2026-09-19.png) supersedes `CC Wesite Mockup.png`. It governs overall appearance, composition and UX/UI. The [Brand & UI System V1](brand/Cookies_and_Chips_Brand_UI_System_V1.pdf) governs specified colors and typography; see the [brand library](brand/README.md) for transcribed values and remaining alternatives. Use the [supplied circular logo](brand/cookies-and-chips-logo.png) intact. No independent visual redesign or image regeneration is required.

Confirmed catalog, computed admin selling prices, guest/account checkout and fulfillment requirements override sample products, prices and operational text in the image. The screenshot is not a bundle of production photography or evidence of testimonial rights.

## Homepage composition

1. **Announcement and header:** Narrow chocolate announcement strip with heart accents, brand/local messaging and fulfillment status at right. Warm off-white navigation beneath, with the circular logo overlapping the header vertically at left. Home, Shop dropdown, Cookie of the Month, My Story, Reviews, FAQ and Contact centrally arranged; account, search and cart controls right. Active Home has a restrained coral underline. Preserve the supplied logo proportions. Shipping status text must reflect actual runtime configuration; the sample “Coming Soon” does not decide launch settings. Search and Shop-dropdown behavior need page-level definitions.
2. **Hero:** Full-width warm bakery photography, light behind the copy and darker behind the cookies. Large close-up stacked cookies dominate the right. Left-aligned chocolate editorial headline, “Cookies make life better.” Script coral emphasis on “better.” Small uppercase line, “EVEN IF IT’S ONLY FOR A MINUTE.” Rounded coral “SHOP COOKIES” CTA. Small handwritten accent on the right. Three icon/value pairs below the CTA: Freshly Baked, High Quality Ingredients, Small Batch Made with Love.
3. **Merchandising row:** Light background. “Our Best Sellers” heading and compact Shop All link. Four compact image-first product cards occupy the wider left region. Each has name, package-aware price and rounded CTA. A taller Cookie of the Month feature occupies the narrower right region with a warm seasonal image on a blush panel with heart/botanical accents, heading, product copy and darker CTA. Keep their relative hierarchy and adjacency at wide widths.
4. **Story and review row:** Founder photograph left, story introduction in the center, softly textured testimonial card right. “My Story,” script “Hi, I’m Heather,” a short paragraph and Read My Story CTA. Review card includes quote treatment, attribution, stars and carousel controls/indicators. Real biography, founder photography and authorized reviews are required before publication.
5. **Follow Along:** Light section with title and small uppercase supporting line, Instagram identity/follow control, and a horizontal row of closely spaced square or near-square imagery. Curated approved imagery is sufficient; a live social integration is not established by the image.
6. **Final CTA:** Dark chocolate photographic strip with cookie/chocolate details. Script “Life’s short.” paired with serif “Eat the damn cookie.” Pale-gold Shop Cookies CTA. Preserve this distinct closing brand moment.
7. **Footer:** Pale background with circular logo left, Shop/About/Support link columns, email signup with coral Join button, social icons and a warm closing heart/Arizona line. Use Cookies and Chips LLC and current copyright year. “Join our cookie club” is presented as email updates, not subscription commerce; define provider, consent, success/error and unsubscribe behavior before implementing signup. Gift Boxes and other sample links require actual catalog destinations. Verify social handles and final footer copy.

## Visual characteristics to preserve

Use the guide’s exact cream/paper, chocolate, gold, coral and support tokens; editorial serif headings, selective handwritten accents and legible sans-serif controls. Photography drives the composition. Buttons are compact rounded pills. Product cards have modest corner rounding and little visual chrome. Decorative hearts, fine icons and subtle texture remain secondary to products and readability.

The image's display dimensions do not define CSS breakpoints or production font sizes. Use the guide’s named heading/body fonts and type scale; finalize the accent-font alternative and unresolved numeric ranges before implementation. Use production photography assets rather than slicing the flattened screenshot into a functioning page.

## Content reconciliation

| Rendition / pasted example | Production treatment |
| --- | --- |
| Chocolate Chip, Sea Salt Chocolate Chip, Monster Chip and White Chocolate Macadamia cards | Use approved catalog names and actual products. Ali’s Classic and Macadamia Dream are confirmed names; Sea Salt and Monster Chip are not confirmed launch products. Heather selects the four best sellers. |
| $24 cards and $26 monthly feature | These are visual placeholders. Use the current admin-calculated selling price per dozen and show the package size beside it. $30/dozen is the initial supplied retail price, not a hard-coded constant. Individual and half-dozen purchase options have been removed. Sandie’s Treats starts at $8 for 10 treats and also follows the admin pricing contract. Seasonal price applicability still needs confirmation. |
| Pumpkin Chocolate Chip as monthly feature | Pumpkin Patch is the confirmed seasonal product name. Current Cookie of the Month designation is still to be selected; do not infer it from the reference. |
| Add to Cart on every card | Direct add requires a clearly defined purchasable package/default. Required flavor/package choices must be selected first. Preserve CTA styling while specifying the appropriate interaction. |
| Local delivery “if enabled later” in pasted notes | Local delivery is already part of the owner-supplied offer; remaining rate/eligibility details are unresolved, not silently deferred. |
| Sample founder story and Sarah M. review | Reference layout only. Use approved, accurate story copy and an authentic review with permission. |
| Logo | Use the supplied circular logo, replacing the old mascot/wordmark composition. Keep it independently replaceable. |

## Remaining deterministic design deliverables

1. **Brand & UI implementation mapping:** Colors, heading/body fonts, type scale and spacing now come from the supplied guide. Resolve its script alternative and numeric ranges, exact state/contrast pairs, grid rules and component-role mapping without replacing the guide with arbitrary choices.
2. **Responsive Homepage V1:** Explicit mobile/tablet/wide layouts and breakpoint rules. Resolve hero image/copy placement, header menu behavior, four-card grid versus scroll, monthly feature ordering, story/review stacking, gallery scrolling and footer layout. Do not infer mobile layout from a scaled desktop screenshot.
3. **Interaction and state definitions:** Package selection/add behavior, cart feedback, sold-out/missing images, featured-product absence/expiry, review controls, keyboard/focus, reduced motion and links. Avoid automatically rotating reviews unless accessible timing/control behavior is specified.
4. **Asset/content manifest:** Supplied primary logo is available; remaining simplified/favicon assets and original hero/product/founder/gallery/banner assets with rights and alt text; final story/reviews/social links; designated best sellers and monthly product.
5. **Other page specifications and commerce/data contract:** Apply the visual system consistently to Shop, product, cart, guest/account checkout, order access, account and admin. Confirm delivery and package rules before implementing price or checkout logic.

Acceptance: the approved wide-layout comparison must preserve section order, relative column proportions, hero focal point/text hierarchy, merchandising placement and CTA treatment. Agree target viewport widths and visual tolerances with the final token/responsive package. Every material departure from the rendition must be surfaced for review.
