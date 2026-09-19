# Visual rules — first pass for review

September 19, 2026. Concrete recommendations derived from the supplied guide and latest rendition. These resolve choices for review; they are not represented as already approved or implemented. Logo package V1 is available; generated derivatives remain subject to visual review.

## Recommended decisions

| Area | First-pass choice |
| --- | --- |
| Palette | Use the exact guide tokens in brand/README.md; no new storefront palette |
| Typography | DM Serif Display 400 headings, Inter 400/500/600/700 body/UI, Allura for short emotional accents; retain guide type scales |
| Layout | 1280px maximum content width; full-bleed hero/banner; 24px desktop gutters, 16px mobile gutters |
| Breakpoints | Mobile below 768px; tablet 768–1199px; desktop from 1200px; review 320/390/768/1024/1440px |
| Cards / fields | 12px card radius; 8px input radius; subtle 1px borders; no heavy shadows |
| Buttons | Storefront merchandising CTAs use the rendition's pill shape as an explicit exception to the guide's 5–8px range; forms/admin use 8px. Minimum 44px touch target |
| CTA color | Coral hero/signup, gold secondary merchandising, chocolate monthly-feature/payment actions. Use dark readable text on coral/gold unless a tested contrast pair supports white; do not sacrifice legibility to screenshot pixels |
| Photography | Square product cards; 4:5 primary product-detail photos; dedicated hero mobile crop. Separate original assets required |
| Desktop merchandising | Four best-seller cards in the wider region with monthly feature at right |
| Mobile merchandising | Two-column best-seller grid; full-width monthly feature immediately after it |
| Mobile navigation | Logo, menu, cart; account and search in menu. Menu is a labelled keyboard-accessible drawer |
| Story / reviews | Stack image, story then review on mobile. Manual review carousel; no autoplay |
| Social | Curated horizontal gallery; no live-feed integration required |
| Logo | Use supplied circular artwork intact; minimum 72px and guide clear space. Validate header fit at 320px. Final simplified/favicon assets replace temporary selections |
| Admin | Light enterprise shell, Inter, white panels, restrained borders, compact tables, clear filters/selection toolbar and right edit drawer; full-screen editor on mobile |

Hero composition retains dark chocolate heading over the light left image area, coral script emphasis and cookie stack at right on desktop. Mobile needs a purposeful crop/composition review, not a shrunken desktop screenshot. Checkout is single-column on mobile with visible totals and retained input on errors.

## Next visual review

Review three representative page designs together: Home at desktop/mobile widths; Product plus cart interaction; Admin product/pricing table plus markup preview drawer. Then apply approved component rules to remaining pages. Explicitly approve pill-button exception, Allura, mobile header, mobile hero crop and typography/contrast treatment before converting these recommendations into final rules.

## Remaining inputs

- Placeholder markup is authorized; see provisional operations. Owner will edit actual prices during implementation.
- Review the supplied V1 logo derivatives; provide original hero/product/founder/gallery assets; actual story/reviews and selected featured products.
- Delivery origin, radius method, under-$50 delivery behavior, pickup location/hours, preparation/cutoffs and inventory policy.
- Tax calculation provider/business configuration; shipping mechanism, parcel sizes/weights and eligible destinations.
- Vercel project identity/repo connection; Supabase environment designation/access; Resend verified sender/Auth SMTP; PayPal sandbox secret/buyer/webhook when endpoint exists.

Visual drafting can proceed with labelled missing assets while these operational facts are collected. Full checkout implementation and final launch still require the corresponding data/acceptance contracts. No new production UI has been built in this update.

## Latest owner direction

[Provisional operations](PROVISIONAL-OPERATIONS.md) supersede earlier starting-markup blockers: placeholder prices and best-guess fulfillment are authorized for development. Actual tax obligations and live rates must be configured before real orders.

## Review artifact

The owner authorized the first visual review. See [review 01](visual-review/README.md) for the static prototype, decisions and known limitations. This does not approve production implementation.
