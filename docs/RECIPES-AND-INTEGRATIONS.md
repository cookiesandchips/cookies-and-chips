# Recipes and integration settings

## Recipe workflow

Open Administration → Products → Edit a saved product. Under Recipe & nutrition:

1. Search USDA by ingredient and brand, then choose the correct FoodData Central record. The USDA ID remains attached to each row.
2. Enter each ingredient amount and unit. Grams, kilograms, ounces and pounds convert directly. Cups, tablespoons, teaspoons and individual items require an ingredient-specific grams-per-unit value from a supplier label or measured weight. No universal volume-to-mass assumptions are made.
3. Enter the finished batch yield and measured baked weight of one cookie. A dozen is the sale package, not the nutrition serving.
4. Save to query USDA and calculate a private draft. The batch nutrient total is divided by the finished cookie count. Missing nutrients and mismatched units remain unavailable; they are never silently assumed to be zero.
5. Review branded subingredients, potential allergens, and cross-contact information. Confirm the review checkbox and publish the product nutrition. A later draft does not replace the last published snapshot until published.

The storefront displays a Nutrition Facts-style estimate per cookie, serving count, ingredient list ordered by recipe input weight, supplier subingredients when available, potential allergens, and kitchen warnings. It is an estimate based on ingredient data, not a laboratory analysis or an automatically certified package label. Moisture loss is represented by measured baked serving weight; nutrient changes from processing are not modeled. Human Nutrition Facts publication is blocked for dog treats.

Private ingredient quantities and batch yield remain in the service-only `commerce_settings` record `recipe:<product-id>`. Public catalog responses explicitly select only published nutrition/ingredient/allergen output. No AI is used. Existing product images, base prices, markup, and descriptions remain separately editable.

USDA nutrition sources: https://fdc.nal.usda.gov/api-guide/ and https://fdc.nal.usda.gov/Foundation_Foods_Documentation/ . Daily values: https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels .

## Administration sections

- **Payment processing**: PayPal or no provider, enable/disable, sandbox/live selection, client ID/secret/webhook ID for each environment. Live activation requires an explicit checkbox. Other payment processors require implemented and tested adapters before appearing as options; arbitrary processor names cannot make checkout work.
- **Sales tax**: enable/disable TaxJar, sandbox/live token entry. Disabled or unconfigured means no tax collected and merchant responsibility for manual tax calculation/remittance. An enabled service failure blocks payment rather than falling back to a zero tax charge.
- **Shipping**: enable/disable Shippo rates, test/live token entry, origin address, estimated box dimensions in inches, packing weight and cookie weight in ounces, and cookies-per-box capacity. Rates use those settings and split into multiple boxes as necessary. Dog treats/unsupported assortments remain pickup-only. Saving a configuration does not buy labels or activate tracking notifications.

Provider settings live in the service-only `commerce_settings` record `integrations`. Credentials use AES-256-GCM with a random IV and a dedicated `INTEGRATION_ENCRYPTION_KEY` (64 hexadecimal characters), stored only in the project's Vercel environment. Do not rotate this encryption key without decrypting and re-encrypting saved credentials; losing it requires re-entering credentials. The key is separate from Supabase's server key, so normal Supabase credential rotation does not invalidate integration secrets.

The API only returns credential presence/source, never values. Blank fields retain existing credentials. Vercel credentials are fallback until replaced through the portal. All management endpoints require a verified Supabase user and the dedicated administrator role; writes also require same-origin requests. Anonymous/authenticated database roles have no direct access to commerce settings.

No schema migration is required: existing private settings and audit tables are used. Settings changes affect new quotes. Sandbox/live payment reconciliation selects the original order's mode; keep old mode credentials available until pending transactions settle. Replacing the PayPal application itself while payments are pending requires reconciling those transactions first.

Provider references: https://developers.taxjar.com/api/reference/ and https://docs.goshippo.com/shipments/shipments .
