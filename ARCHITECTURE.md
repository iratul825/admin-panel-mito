# Architecture and admin context

## Scope boundary

This project is the clinic management surface only. It deliberately omits public page renderers, storefront navigation, cart and checkout UI, customer booking forms, marketing sections, and the public chat interface.

It retains the shared content schema because the admin must edit the data consumed by the public website: products, product groups, experts, services, departments, clinic settings, opening hours, and chatbot copy. It also reads and manages orders and bookings created by the public deployment.

## Browser application

| File | Responsibility |
| --- | --- |
| `public/index.html` | Admin-only HTML shell, noindex metadata, fonts, and styles |
| `public/app.js` | SPA routing, event delegation, sign-in, form submission, and external website links |
| `public/admin.js` | Admin views, tables, editors, validation orchestration, invoices, and responsive side navigation |
| `public/store.js` | Authenticated state loading, serialized writes, content saves, and dedicated record patches |
| `public/domain.js` | Product, opening-hours, order, stock, and booking rules |
| `public/ui.js` | Escaping, safe images, fields, dialogs, icons, and notifications |
| `public/base.css` | Admin design tokens and shared controls |
| `public/admin.css` | Dashboard, tables, editors, sidebar, cards, invoices, and breakpoints |
| `public/admin-login.css` | Secured login view |

The admin is responsive. At widths below 700px, the side navigation becomes a horizontally scrollable navigation bar, cards stack, tables scroll within their containers, and forms use one column.

## Server APIs

### `GET /api/auth`

Returns whether admin authentication is configured and whether the current request has a valid session.

### `POST /api/auth`

Validates `MITO_ADMIN_PASSWORD`, rate-limits failed attempts, and sets an eight-hour HTTP-only session cookie. Requests must be same-origin.

### `DELETE /api/auth`

Clears the admin session cookie.

### `GET /api/state`

Returns the complete shared clinic state to an authenticated admin. Unauthenticated requests receive `401`.

### `PUT /api/state`

Saves editable website content. Orders and bookings are preserved from the latest Redis state so a content save cannot overwrite a transaction that arrived concurrently.

### `PATCH /api/admin-record`

Applies one authenticated transactional mutation under the Redis lock:

- `kind: "order"` updates status and restores stock when an order is cancelled.
- `kind: "booking"` updates status, fee, paid amount, total sessions, and completed sessions with server-side validation.

### `GET /api/chat`

Reports whether the optional server-side OpenAI connection is configured. The admin uses this for its AI status indicator.

## Shared data and concurrency

`api/_lib/db.js` connects to Upstash Redis with either the `UPSTASH_REDIS_REST_*` or compatible `KV_REST_API_*` environment variables. All mutations take a short Redis lock before reading and writing the shared state. This prevents overlapping admin saves and customer submissions from silently replacing each other.

The standalone admin panel must receive the same Redis credentials as the public website to manage its live records. No secret or production credential is stored in this repository.

## Authentication

The session value is an HMAC derived from the server-side password. Password comparison and cookie verification use constant-time hash comparison. Cookies are `HttpOnly`, `Secure`, `SameSite=Strict`, scoped to `/`, and expire after eight hours.

Changing `MITO_ADMIN_PASSWORD` invalidates existing sessions because the cookie signature changes.

## Data model

The top-level state contains:

- `products`
- `groups`
- `experts`
- `departments`
- `services`
- `settings`, including hours and website branding
- `chatbot`
- `orders`
- `bookings`
- `cart`, retained for schema compatibility but never managed by the admin UI

`scripts/write-seed.mjs` regenerates `api/_lib/seed.js` from the source product inventory and clinic content. Redis uses that seed only when the shared state key does not yet exist.

## Security controls

- No public state endpoint in this project
- Same-origin checks on login and every mutation
- Rate-limited password attempts
- Server-side validation for transactional changes
- Safe URL and image handling in the browser
- HTML escaping for content and customer fields
- Content Security Policy, HSTS, frame denial, restrictive permissions policy, and noindex headers
- Secrets excluded through `.gitignore` and represented only by empty placeholders in `.env.example`
