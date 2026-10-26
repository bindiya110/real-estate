# EstateHub: Real Estate Management Platform

A full-stack MERN real estate marketplace. Users can buy, rent and list properties. Agents manage their inquiries, and admins moderate everything from a dashboard.

- **Frontend** (`client/`): React 19, Vite, Tailwind CSS 4, React Router 7, TanStack Query 5, React Hook Form, Zod, Recharts, Lucide icons, React Hot Toast
- **Backend** (`server/`): Node.js, Express 4, MongoDB with Mongoose 8, JWT stored in HttpOnly cookies, bcrypt, Zod, Multer, Cloudinary, Helmet, express-rate-limit, CORS allowlist

---

## Quick start

Requirements: Node.js 20 or newer. Installing MongoDB is **not** required for development.

```bash
npm run install:all          # installs root, server and client dependencies
cp server/.env.example server/.env
cp client/.env.example client/.env
# Put two long random strings in JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in server/.env:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm run dev                  # API on http://localhost:5000, web on http://localhost:5173
```

When `MONGODB_URI` is empty, the API starts an **embedded MongoDB** and saves its data to `server/.mongo-data`, so your records survive restarts. The first run downloads the MongoDB binary, which is about 600 MB. If the database is empty, it is seeded automatically.

To connect a real database instead, set `MONGODB_URI` to a MongoDB Atlas or local connection string.

### Demo accounts (seeded, development only)

| Role  | Email                 | Password      |
|-------|-----------------------|---------------|
| Admin | admin@estatehub.dev   | Admin@12345   |
| Agent | arjun@estatehub.dev   | Agent@12345   |
| User  | user@estatehub.dev    | User@12345    |

To reset the data: stop the server, then run `npm run seed` (this wipes and re-seeds the database).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Runs the API (`node --watch`) and the Vite client together |
| `npm run seed` | Wipes and re-seeds the development database |
| `npm test` | Runs the API integration tests (`node:test` + supertest) against an in-memory DB |
| `npm run build` | Builds the production client into `client/dist` |
| `npm start --prefix server` | Starts the API in production mode |

### Emails in development

If `SMTP_HOST` is not set, the server prints verification and password-reset emails to its console. The latest emails are also listed at `GET /api/v1/dev/emails`. This endpoint exists only outside production.

---

## Project structure

```
real-estate/
├── client/                  React app
│   └── src/
│       ├── components/      common, layout, forms, property, search, dashboard, admin
│       ├── layouts/         MainLayout, AuthLayout, DashboardLayout, AdminLayout
│       ├── pages/           public, auth, user, admin, legal
│       ├── services/        api.js (single Axios instance) + one service per resource
│       ├── hooks/           queryKeys, useFavorites, usePropertyFilters, useDebounce …
│       ├── context/         AuthContext (session state via TanStack Query)
│       ├── routes/          AppRouter, ProtectedRoute, AdminRoute
│       ├── schemas/         Zod form schemas
│       ├── constants/ utils/
└── server/
    ├── src/
    │   ├── config/          env (validated), database, cloudinary
    │   ├── models/          User, Property, Favorite, Inquiry, Category, Testimonial,
    │   │                    NewsletterSubscriber, PasswordResetToken, EmailVerificationToken,
    │   │                    RefreshToken, ContactMessage, SiteSetting, Upload
    │   ├── controllers/     thin HTTP handlers
    │   ├── services/        auth, token, email, property, upload business logic
    │   ├── routes/          one router per resource, mounted at /api/v1
    │   ├── middleware/      authenticate, authorize, validate, csrf, upload, rateLimiter, errorHandler
    │   ├── validators/      Zod request schemas
    │   ├── utils/           ApiError, asyncHandler, pagination, slugify, logger
    │   └── scripts/seed.js
    ├── tests/api.test.js
    └── uploads/             local image storage (UPLOAD_MODE=local)
```

---

## Security design

- **Sessions**: a short-lived JWT access token (15 min) and a refresh token (7 days), both in `HttpOnly` cookies. Nothing sensitive is kept in `localStorage`.
- **Refresh rotation and reuse detection**: refresh tokens are stored hashed and rotated on every use. If an old token is presented again, the whole session family is revoked.
- **CSRF**: double-submit tokens. The client fetches `GET /auth/csrf` and sends `X-CSRF-Token` on every state-changing request.
- **Authorization**: the role and ownership of every request are loaded from the database and never trusted from the request body. Zod strips unknown fields, which blocks mass assignment such as a user sending `status: "approved"`.
- **Passwords**: hashed with bcrypt (12 rounds). Login errors are generic to avoid account enumeration, and a dummy hash keeps response timing similar for unknown emails.
- **Reset and verification tokens**: random 256-bit values stored as SHA-256 hashes. They are single-use and expire (30 min for reset, 24 h for verification). Resetting or changing a password revokes all sessions.
- **Uploads**: file type is checked from the actual content (magic bytes), with limits of 5 MB per file and 15 images per listing. Every stored file is tracked in `Upload` so ownership can be checked before it is attached or deleted. Unused uploads are cleaned up every hour.
- Helmet headers, an explicit CORS allowlist, request body limits (100 kB), rate limits on login, password reset and forms, escaped regex search input, and a single error handler that never exposes stack traces in production.
- **Admin protections**: an admin cannot change their own role or suspend themselves, and the last active admin cannot be demoted or suspended.

### Deploying across domains

Example setup: client on Vercel, API on Render.

Server `.env`:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://…
CLIENT_URL=https://estatehub.example
CLIENT_ORIGINS=https://estatehub.example
COOKIE_SECURE=true
COOKIE_SAMESITE=none
TRUST_PROXY=true
UPLOAD_MODE=cloudinary
CLOUDINARY_CLOUD_NAME=…  CLOUDINARY_API_KEY=…  CLOUDINARY_API_SECRET=…
SMTP_HOST=…  SMTP_USER=…  SMTP_PASS=…
```

Client `.env`:
```
VITE_API_BASE_URL=https://api.estatehub.example/api/v1
```

Serve the client with an SPA fallback that rewrites every route to `index.html`. If the client and API share a parent domain (for example `app.example.com` and `api.example.com`), use `COOKIE_SAMESITE=lax` and set `COOKIE_DOMAIN=.example.com`.

---

## REST API

Base URL: `/api/v1`. Successful responses look like `{ "success": true, "data": …, "meta"?: …, "message"?: … }`. Errors look like `{ "success": false, "message": "…", "errors": [{ "field", "message" }], "code"?: "…" }`.

**Auth** column: *Public* means no login is needed, *Optional* means the response changes when you are logged in, *User* means any logged-in user, *Admin* means the admin role. Every `POST`, `PATCH` and `DELETE` also needs the `X-CSRF-Token` header.

**Common status codes**: `400` validation failed, `401` not signed in (`code: TOKEN_EXPIRED` means call `/auth/refresh` and retry), `403` forbidden or `CSRF_INVALID`, `404` not found, `409` duplicate, `413` body too large, `429` rate limited.

### Auth

| Method | Path | Auth | Body | Notes / errors |
|---|---|---|---|---|
| GET | `/auth/csrf` | Public | – | Returns `{ csrfToken }` and sets the CSRF cookie |
| POST | `/auth/register` | Public | `name, email, password, phone?` | 201 + session cookies; 409 if the email exists |
| POST | `/auth/login` | Public | `email, password` | 401 generic message; 403 if suspended |
| POST | `/auth/logout` | Public | – | Revokes the refresh token family |
| POST | `/auth/refresh` | Cookie | – | Rotates tokens; 401 if expired, revoked or reused |
| GET | `/auth/me` | Optional | – | `{ user }` or `{ user: null }`; 401 `TOKEN_EXPIRED` means refresh |
| POST | `/auth/forgot-password` | Public | `email` | Always 200 (no enumeration) |
| POST | `/auth/reset-password` | Public | `token, password` | 400 if the token is invalid, expired or used |
| POST | `/auth/verify-email` | Public | `token` | 400 if invalid or expired |
| POST | `/auth/resend-verification` | User | – | |

### Current user

| Method | Path | Auth | Body / query |
|---|---|---|---|
| GET | `/users/me` | User | – |
| PATCH | `/users/me` | User | `name?, phone?, bio?, city?, agency?, designation?` (agency fields apply to agents only) |
| POST | `/users/me/avatar` | User | multipart `avatar` |
| PATCH | `/users/me/password` | User | `currentPassword, newPassword` (revokes other sessions) |
| GET | `/users/me/properties` | User | `status?, q?, page, limit` (own listings, all statuses) |
| GET | `/users/me/stats` | User | Listing counts by status, inquiries, favorites |
| GET | `/users/me/inquiries` | User | `box=received\|sent, status?, page, limit` (`meta.unread`) |

### Properties

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/properties` | Public | Search with the query parameters below. Returns approved listings only |
| GET | `/properties/featured` | Public | `limit` ≤ 12 |
| GET | `/properties/latest` | Public | `limit` ≤ 12, `listingType?` |
| GET | `/properties/locations` | Public | Popular cities, aggregated from approved listings |
| GET | `/properties/slug/:slug` | Optional | Approved listings for everyone; owners and admins also see their non-public listings |
| GET | `/properties/:id` | Optional | Same visibility rules as the slug route (ids and slugs never clash) |
| GET | `/properties/:id/similar` | Public | Same listing type, same city or property type |
| POST | `/properties` | User | Body below. `saveAsDraft: true` gives a draft, otherwise `pending`. Submitting needs a verified email and at least 1 image |
| PATCH | `/properties/:id` | Owner/Admin | Partial body. An owner edit sends the listing back to `pending`. 403 if not the owner |
| DELETE | `/properties/:id` | Owner/Admin | Also removes images, favorites and inquiry links |

**Search query parameters** (all validated; unknown values return 400): `q` (full-text search), `listingType` (`sale` or `rent`), `propertyType` (comma-separated list), `category` (slug or id), `city`, `state`, `country`, `location` (partial match), `minPrice`, `maxPrice`, `bedrooms` (minimum), `bathrooms` (minimum), `minArea`, `maxArea`, `furnishing` (list), `amenities` (list; listing must have all), `availabilityStatus`, `featured`, `sort` (`newest`, `oldest`, `price_asc`, `price_desc` or `area_desc`), `page`, `limit` (≤ 48).

**Response `meta`**: `{ total, page, limit, totalPages, hasNextPage, hasPrevPage }`

**Property body**: `title, description, listingType, propertyType, category?, price, currency, address, city, state, country, postalCode, coordinates?{lat,lng}, bedrooms, bathrooms, area, areaUnit, furnishing, amenities[], parkingSpaces, yearBuilt?, availabilityStatus, images[]` where `images[]` is an ordered list of upload ids returned by the upload endpoint.

### Uploads

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/uploads/property-images` | User | multipart `images` (≤ 10 per request, ≤ 5 MB, JPEG/PNG/WebP checked by content). Returns `[{ _id, url }]` |
| DELETE | `/uploads/property-images` | Owner/Admin | `{ uploadIds: [] }`. Only your own uploads, and also detaches them from your listing |

### Favorites, inquiries, content

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/favorites` | User | Paginated saved listings |
| GET | `/favorites/ids` | User | Ids only, for heart icons |
| POST / DELETE | `/favorites/:propertyId` | User | Idempotent |
| POST | `/inquiries` | Optional | `propertyId` or `agentId`, plus `name, email, phone?, message`. The server picks the recipient |
| GET | `/inquiries/:id` | Sender, recipient or admin | 404 for anyone else |
| PATCH | `/inquiries/:id/status` | Recipient or admin | `status`: `new`, `read`, `replied` or `closed` |
| GET | `/agents` | Public | `q?, city?, page, limit`. Public profile fields only |
| GET | `/agents/featured` | Public | Top agents by approved listings |
| GET | `/agents/:id` | Public | `{ agent, properties }` |
| GET | `/categories` | Public | Active categories with `propertyCount` |
| GET | `/testimonials` | Public | Published only |
| GET | `/settings` | Public | Site name, hero and contact details |
| GET | `/stats` | Public | Counts of listings, agents and cities |
| POST | `/contact` | Public | `name, email, phone?, subject, message` (saved as a ContactMessage) |
| POST | `/newsletter/subscribe` | Public | `email` (idempotent) |
| POST | `/newsletter/unsubscribe` | Public | `email` (same response whether or not subscribed) |

### Admin (every route requires the admin role, checked on the server)

| Method | Path | Body / query |
|---|---|---|
| GET | `/admin/dashboard` | Totals plus chart aggregations (monthly listings, types, cities, inquiry status) |
| GET | `/admin/properties` | `q?, status?, listingType?, featured?, sort, page, limit` |
| GET / PATCH / DELETE | `/admin/properties/:id` | PATCH takes a partial property body and keeps the current status |
| PATCH | `/admin/properties/:id/approve` | Needs at least 1 image |
| PATCH | `/admin/properties/:id/reject` | `{ reason }` (5–500 characters) |
| PATCH | `/admin/properties/:id/feature` | `{ featured }` (approved listings only) |
| PATCH | `/admin/properties/:id/status` | `{ status?, availabilityStatus? }` |
| GET | `/admin/users` | `q?, role?, status?, page, limit` |
| GET | `/admin/users/:id` | Profile, listings and inquiry counts |
| PATCH | `/admin/users/:id/role` | `{ role }`. Not your own role; the last admin is protected; revokes the user's sessions |
| PATCH | `/admin/users/:id/status` | `{ isActive }`. Not yourself; the last admin is protected |
| GET | `/admin/inquiries` · PATCH `/:id/status` · DELETE `/:id` | |
| GET | `/admin/messages` · PATCH `/:id/status` · DELETE `/:id` | Contact form messages |
| GET / POST | `/admin/categories` · PATCH / DELETE `/:id` | `{ name, description?, image?, isActive }`. Categories in use cannot be deleted (409) |
| GET / POST | `/admin/testimonials` · PATCH / DELETE `/:id` | `{ name, role?, content, avatar?, rating, isPublished }` |
| GET | `/admin/newsletter` · DELETE `/:id` | Subscribers (`meta.active`) |
| GET / PATCH | `/admin/settings` | Site name, hero, contact details, social links |
