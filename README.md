# Cookies & Chips

Foundation only. No application, UI, database migrations, or deployment exists yet.

Canonical repository: https://github.com/cookiesandchips/cookies-and-chips

Dedicated Supabase project: `vqebxtybuiegvfxawksf`.

## Start here

- [Readiness and provisioning](docs/INFRASTRUCTURE.md)
- [Environment contract](docs/ENVIRONMENT.md)
- [Architecture and dynamic commerce model](docs/ARCHITECTURE.md)
- [Website Build Contract and specification gate](docs/BUILD-CONTRACT.md)
- [Working product specification and confirmed menu](docs/PRODUCT-SPEC.md)
- [Homepage production reference and content reconciliation](docs/HOMEPAGE-SPEC.md)
- [Management portal and bulk pricing specification](docs/ADMIN-SPEC.md)
- [September 19 specification addendum](docs/ADDENDUM-2026-09-19.md)

Run `npm run check` to check foundation invariants. No package installation or credentials are needed. Copy `.env.example` to ignored `.env.local` only when configuring this project. Do not paste secrets into chat or commit them.

The framework and SDK dependency installation is deferred until the contract gate is approved. The initial package manifest is tooling only; it is not a deployable Next.js application. At activation, install and lock reviewed versions of Next.js, React, TypeScript and Supabase packages inside this repository.
