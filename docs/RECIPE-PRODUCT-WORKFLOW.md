# Private recipe → product workflow

Owner requirement: build products from a privately entered recipe, deriving editable public product information without exposing the recipe. This is a new planned workflow; automatic analysis is not connected in the static review.

## Inputs and derived drafts

| Input | Draft output | Required review |
| --- | --- | --- |
| Ingredients, quantities, units, exact brands/subingredients | Public ingredient statement and allergen flags | Verify supplier labels, ingredients ordered by weight, compound ingredients, and all relevant allergens |
| Ingredient nutrient matches, gram weights, finished batch yield/weight and serving size | Estimated nutrition per serving; optionally per package | Resolve ambiguous units, missing nutrients, ingredient matches and finished yield; use documented rounding and serving rules |
| Recipe and product notes | Product name/description suggestions | No unsupported health, dietary or allergen-free claims; do not disclose quantities or method |
| Recipe appearance notes and optional reference image | Generated product illustration | Owner review; separate from actual uploaded photography |
| Ingredient purchase costs/quantities, usable batch yield, packaging and optional labor/overhead | Cost per cookie and sellable package suggestion | Costs cannot be inferred from a recipe alone; owner chooses whether to adopt as base price |
| Owner base price and percentage OR fixed markup | Final selling price | Existing pricing contract remains authoritative; estimates must not overwrite prices automatically |

## Workflow

1. Admin creates a product draft and enters/pastes a recipe, ingredient brands, quantities and units; batch cookie count, finished weight and proposed serving. Support recipe document upload later, stored privately.
2. Parse to structured ingredient rows for correction. Match each ingredient against an approved nutrient source such as USDA FoodData Central or supplier nutrition. Record source IDs, values, date, units and uncertainty. Missing values remain unknown, never silently zero.
3. Calculate from normalized ingredient weights, appropriate yield/retention assumptions and finished serving definition. AI assists extraction/matching and copy; it must not invent nutrition values. Clearly label estimates and unresolved issues. Do not assume one dozen sold equals one nutritional serving.
4. Draft ingredient/allergen information separately from kitchen cross-contact declarations. Check milk, eggs, fish, crustacean shellfish, tree nuts, peanuts, wheat, soy and sesame, including subingredients. Recipe absence alone does not establish allergen-free status. Kitchen/shared-equipment facts require owner input.
5. Review editable Description, Images, Ingredients & Allergens, Nutrition and Pricing tabs. Display public preview alongside a private recipe editor. Publish only explicitly reviewed public fields. Recipe changes invalidate derived-field approval and require re-review, without silently publishing stale or changed nutrition.
6. Store recipe versions and derived-field provenance. Existing orders retain their purchase-time product information as appropriate. Production labeling format/compliance requires separate verification before describing estimates as a compliant Nutrition Facts label. Dog treats require a separate pet-food information workflow, not human Nutrition Facts or human daily values.

## Privacy boundary

Private recipe quantities, methods, yield/cost records and recipe attachments live in dedicated protected Supabase tables/storage with server-side admin authorization and RLS. Public responses use an explicit allowlist of published fields. Never embed private recipe data in browser storefront payloads, page source, public storage, search indexes, structured data, analytics, logs or the public GitHub repository. Ingredient names are intentionally public; quantities and preparation instructions are not.

External model/nutrition/image providers require a deliberate data-flow decision before private recipes are transmitted. Prefer ingredient-level nutrient lookup and a sanitized visual brief for image generation; do not send the full recipe to an image service by default. Credentials remain server-only and provider-specific setup is pending.

## Acceptance

- A public/guest request cannot read recipe records, attachments or private cost data.
- Incomplete quantities, brands, nutrient matches or yield produce review issues, not fabricated facts.
- Public ingredients/allergens and nutrition appear on product detail after review; recipe instructions/amounts never do.
- Detect compound-ingredient allergens; separate verified contains statements from owner-confirmed cross-contact notes.
- Recipe edits flag affected nutrition, ingredients/allergens, descriptions and costing as needing review.
- Derived cost does not replace owner base/markup without an explicit apply action.
- Images can be uploaded/replaced independently of recipe data.

References reviewed September 19, 2026:
- USDA nutrient API: https://fdc.nal.usda.gov/api-guide/
- FDA allergen guidance: https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies

## September 20 controlling update

[Current V1 setup decisions](SETUP-DECISIONS-2026-09-20.md) supersede conflicting earlier plans: implementation authorized, single dedicated Supabase environment, no AI integration, and configurable TaxJar.
