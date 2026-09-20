# Project boundary

Work exclusively in cookiesandchips/cookies-and-chips. No code, private packages, credentials, databases, storage, deployments, assets, or infrastructure may be copied or shared with Re:Formd, Simply Settled, or any other project. Standard public upstream packages are allowed with a repository-local manifest and lockfile; no sibling imports, symlinks, workspace dependencies, shared internal libraries, or copied project scaffolds.

Only the Supabase project `vqebxtybuiegvfxawksf` is currently identified by the owner. Any additional development/staging resource must be dedicated to Cookies & Chips and explicitly recorded before use. Never use an unrelated project as a fallback.

Do not read unrelated repositories or credential files. Never log secret values. Commit only blank credential templates. Do not configure Vercel shared environment groups or reuse another application's PayPal app.

V1 implementation is authorized. Follow docs/SETUP-DECISIONS-2026-09-20.md: a single dedicated Supabase project for testing and production, no AI integration. Do not activate live payments or perform destructive database resets without explicit authorization.

Categories, subcategories, collections and product types must remain data-driven and owner-editable. No hard-coded category enums or navigation lists.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
