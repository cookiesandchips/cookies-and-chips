# Storefront functionality update

Owner requested original My Story copy, a conventional account icon, and working storefront interactions. Story copy is proposed brand narrative authorized by the owner; it avoids invented awards, family history, dates and personal credentials. Founder approval of the copy is still recommended. The story page uses cookie photography, not a generated person presented as Heather.

The published storefront source now lives in src/storefront/index.html independently from the archived design review. The build packages its assets without modifying the old reference. Header/footer/mobile navigation points to real routes, account uses a labelled profile icon, and bags persist across refresh, account navigation and return visits. Quantities are bounded and can be edited or removed. Browser back/forward and direct product/shop links restore view state. This browser bag is a convenience only; future checkout must reprice and validate all lines on the server.

Existing account registration and recovery remain Supabase-backed. Payment, tax/shipping quotes, durable order storage/outbox, private recipes and real admin storage remain outstanding; no code in this update authorizes payment from browser prices. Origin address and monitored contact mailbox were requested from owner.
