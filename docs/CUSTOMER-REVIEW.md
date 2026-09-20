# Customer approval deployment

This release connects the approved visual review and generated photography to the Next.js account application on the dedicated Cookies & Chips Vercel project. The root route serves the review, with links to /account. Account registration/sign-in/recovery use the configured Supabase project. Visual review checkout and admin edits remain demonstrations and never create orders, charge cards or save production catalog changes.

## Review scope

Review desktop/mobile homepage, shop search/filtering, product details, bag and Continue Shopping, guest/login checkout layout, price markup preview and social icon visibility. Use My account for real authentication; do not enter private recipes or fulfillment details into demo forms.

## Not complete

Database-backed catalog/admin, private structured USDA recipes, PayPal verified capture/webhooks, TaxJar, Shippo, durable order records, order-confirmation outbox and tracking delivery remain implementation work. Linked credentials alone do not implement integrations. Email delivery and callback settings need live validation. Google/Apple and anonymous auth remain disabled. This is customer approval, not permission to accept real orders.

## Deployment

GitHub main is linked to cookies-and-chips on the Cookies and Chips Vercel team. vercel.json selects Next.js; prebuild packages only the approved visual assets. No secret values are committed. Team variables were confirmed linked in the browser. CLI credentials do not have team access; deployment uses the existing Git integration.
