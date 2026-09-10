# Mito Admin Panel

Standalone, password-protected administration workspace for Mito Skin Lab. This repository contains the admin application and its server APIs only. It does not contain the public clinic website, shop, booking pages, or customer-facing chatbot.

## Admin capabilities

- Overview of orders, booking requests, visible products, and active experts
- Order status management with inventory restoration on cancellation
- Booking status, consultation fee, payment, and session tracking
- Doctor profiles, credentials, photos, department, visibility, and display order
- Products, prices, stock, descriptions, visibility, featured state, and images
- Product groups and fallback group images
- Services, departments, descriptions, featured state, and booking visibility
- Website logo, hero, department images, contact details, social links, and delivery charge
- Opening hours shared with the public booking flow
- Care guide settings and optional OpenAI connection status
- Printable order and booking summaries

The “View website” links point to `https://mito-skin-lab-bd.vercel.app` and open in a separate tab.

## Architecture

The browser application is a small ES module SPA under `public/`. Vercel Functions under `api/` provide authentication and data access. Upstash Redis stores the shared Mito state under `mito:site-state:v1`, which lets this standalone panel manage the same records and content as the public website when both deployments use the same Redis credentials.

Admin sessions use an HTTP-only, Secure, SameSite cookie signed from `MITO_ADMIN_PASSWORD`. Unauthenticated state requests return `401`, and record/content mutations require both a valid admin session and a same-origin request.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the file map and API contracts.

## Local development

Requirements: Node.js 22 or later and pnpm.

```sh
pnpm install
pnpm run build
pnpm run dev
```

Open `http://127.0.0.1:4174/admin`.

Without Redis variables, local development loads the bundled seed data so the login layout and responsive admin interface can be reviewed. Persistent online writes require Redis.

## Tests and checks

```sh
pnpm test
pnpm run check
```

The tests cover authentication, content integrity, domain rules, order cancellation/restocking, and booking record validation.

## Vercel environment variables

Copy `.env.example` to `.env.local` for local Vercel development, or configure these in Vercel for Preview and Production:

```text
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
MITO_ADMIN_PASSWORD=use-a-unique-password-with-at-least-12-characters
```

The equivalent `KV_REST_API_URL` and `KV_REST_API_TOKEN` names created by compatible Vercel Marketplace integrations are also supported.

To connect this panel to the existing Mito website, use the same Redis REST URL and token in both Vercel projects. Keep all real values in Vercel; never commit them.

Optional live AI status variables:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
```

## Deployment

Import this repository into Vercel, add the environment variables, and deploy. `/` redirects to `/admin`; all `/admin/*` routes resolve to the admin SPA. Security headers prevent indexing and framing.
