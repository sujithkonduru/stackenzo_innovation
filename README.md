# Stackenzo Inventory — Frontend

A production-style React (JSX, no TypeScript) frontend for the Stackenzo Inventory
Management backend (Node.js + Express + PostgreSQL + Redis).

Built with: **React 18, Vite, React Router, Axios, Recharts, lucide-react**, and CSS
variables for theming (light / dark / system). No Redux — state lives in React Context
and local component state.

---

## ⚠️ Read this first — backend status

This frontend was built by reading the actual backend source code end-to-end (every
file in `api/`, `index.js`, and the live database schema), not by guessing at an API
contract. In doing that, a few real gaps turned up on the backend side that affect what
works today. They're summarized here and covered in full, with code references, in
[`BACKEND_INTEGRATION_NOTES.md`](./BACKEND_INTEGRATION_NOTES.md):

1. **There is no authentication system.** `api/auth.js` is an empty file and isn't
   mounted in `index.js`. This app uses a local, clearly-labeled "session" screen
   instead of a real login — see [Session / "Login"](#session--login) below.
2. **`api/sale.js` (the whole POS/Sales module) is fully written but not mounted** in
   `index.js`. `/api/sale/*` will 404 until the backend adds
   `app.use("/api/sale", require("./api/sale"))`.
3. **Purchases have no GET endpoint.** Only `POST /purchase/create` exists — there's no
   way to list purchase history yet.
4. **There's no GET endpoint for `stock_movements`**, even though purchases, sales, and
   material requests/returns all write to that table.
5. **Material returns with DAMAGED/SCRAP condition will fail** — the code inserts into
   an `inventory_scrap` table that does not exist in the live database schema.
   WORKING-condition returns work fine.
6. **`material_issues` / `material_issue_items` tables exist but nothing uses them.**
7. Endpoint conventions are inconsistent: `locations`, `category`, `product`,
   `product_batch`, and `purchase` all identify the org by `organization_name` (fuzzy
   `ILIKE` match); `supplier`, `sale`, and `employee` (material requests) use
   `organization_id` directly. The frontend matches whichever each real endpoint
   expects.

None of this is faked or worked around with mock data. Every screen affected by a
missing endpoint says so in the UI, and the corresponding API service function
(`src/services/*.js`) throws a clear, isolated error instead of pretending to succeed.

---

## Requirements

- Node.js 18+
- npm
- A running instance of the Stackenzo Inventory backend (Express + PostgreSQL)

## Installation

```bash
npm install
```

## Environment

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=/api
VITE_BACKEND_ORIGIN=http://localhost:8000
```

Never hardcode the backend URL anywhere else in the app — every API call goes through
`src/services/api.js`, which reads `VITE_API_BASE_URL`.

## CORS — why there's a dev proxy

The backend doesn't send any CORS headers, so calling `http://localhost:8000` directly
from the Vite dev server at `http://localhost:5173` fails in the browser with a CORS
error before the request even reaches your API code — different port = different
origin, and there's no `Access-Control-Allow-Origin` response header to satisfy the
browser's check.

To avoid that, this app talks to a **same-origin** path instead of the backend
directly:

- The browser calls `VITE_API_BASE_URL` (`/api` by default) — always same-origin as
  the frontend, so no CORS preflight happens at all.
- `vite.config.js` proxies any request to `/api/*` server-side (inside the Vite dev
  server, in Node — not in the browser) to `VITE_BACKEND_ORIGIN`
  (`http://localhost:8000` by default). Node isn't subject to browser CORS rules, so
  this hop is unaffected.
- The same proxy is enabled for `npm run preview`, so a local production-style preview
  works the same way.

If you change the backend's host or port, only update `VITE_BACKEND_ORIGIN` in
`.env` — leave `VITE_API_BASE_URL` as `/api`.

**This proxy only exists in the Vite dev server and `vite preview`.** If you deploy
the built app (`npm run build` → the static files in `dist/`) behind a real web server
(nginx, Vercel, etc.), you need one of:

1. **A reverse proxy in production too** — configure your web server to forward
   `/api/*` to the backend, the same way `vite.config.js` does locally (this is the
   most common approach, and keeps `VITE_API_BASE_URL=/api` working unchanged), **or**
2. **Real CORS headers on the backend** — add the `cors` npm package to the Express
   app (`app.use(cors({ origin: "https://your-frontend-domain.com" }))`) and set
   `VITE_API_BASE_URL` to the backend's full URL instead of `/api`.

## Run

```bash
npm run dev
```

Frontend runs at `http://localhost:5173` and expects the backend at
`http://localhost:8000` (or whatever `VITE_API_BASE_URL` points to).

## Build

```bash
npm run build
```

## Preview a production build

```bash
npm run preview
```

---

## Session / "Login"

Since the backend has no authentication, `/login` is a **local session setup screen**,
not a real login — it says so on the screen itself. It asks you to:

1. Pick (or create) an **Organization** — this calls the real `GET /api/organization`
   and `POST /api/organization/create` endpoints.
2. Enter your **name** and a **role** (Admin / Manager / Employee) — used only for
   local navigation and route-guarding (e.g. hiding the Users page from non-admins),
   not verified by the backend.
3. Optionally enter your **User ID** — a real UUID from the backend's `users` table.
   This is required for anything that writes `requested_by`, `approved_by`, or
   `returned_by` (material requests, approvals, returns), because those columns have
   `NOT NULL` foreign keys into `users` and there is currently no API to create a user.
   If you don't have one, ask whoever administers the database to insert a row into
   `users` and give you its `id`.

The session is stored in `localStorage` (`stackenzo_session`) and can be changed later
from **Settings → Profile**, or by switching organizations from the dropdown in the top
navigation bar.

---

## Project structure

```
src/
├── components/
│   ├── common/          Button, Card, Badge, EmptyState, Loader/Skeletons,
│   │                     SearchInput, Pagination, Breadcrumb, PageHeader,
│   │                     StatusBadge, KpiCard
│   ├── layout/           Sidebar, Topbar, AppLayout, navConfig
│   ├── forms/             Input, Select, Textarea, NumberInput, DateInput,
│   │                     SearchSelect, Checkbox, Switch, FormField,
│   │                     FormSection, FormActions
│   ├── tables/            DataTable (sort, paginate, empty/loading states, row actions)
│   └── modals/            Modal, ConfirmModal
├── pages/
│   ├── auth/              Login (session setup)
│   ├── dashboard/         Dashboard
│   ├── organization/      Organization
│   ├── locations/         Locations
│   ├── categories/        Categories
│   ├── products/          Products, ProductForm, ProductDetails
│   ├── batches/           Batches
│   ├── inventory/         Inventory
│   ├── stockmovements/    StockMovements (placeholder — see notes)
│   ├── suppliers/         Suppliers, SupplierDetails
│   ├── purchases/         Purchases (placeholder history), PurchaseCreate
│   ├── sales/              POS, Sales, SaleDetails
│   ├── requests/           Requests, RequestCreate, RequestDetails
│   ├── returns/            Returns, ReturnCreate
│   ├── users/               Users (placeholder — see notes)
│   ├── reports/             Reports, InventoryReport, LowStockReport,
│   │                       ExpiryReport, UnavailableReport
│   ├── settings/            Settings
│   └── errors/               NotFound (404), Unauthorized (403)
├── services/               api.js (central Axios instance) + one file per backend
│                           module (organizationApi, locationApi, categoryApi,
│                           productApi, batchApi, inventoryApi, supplierApi,
│                           purchaseApi, saleApi, employeeApi)
├── context/                AuthContext, OrganizationContext, ThemeContext,
│                           ToastContext
├── hooks/                  useApiList, useDebounce, useProducts, useInventory,
│                           useSuppliers, useCategories, useLocations, useBatches,
│                           useRequests
├── utils/                  formatCurrency.js, formatDate.js, validation.js,
│                           constants.js
├── routes/                 AppRoutes.jsx, ProtectedRoute.jsx, RoleProtectedRoute.jsx
├── App.jsx
├── main.jsx
└── index.css                theme tokens (light/dark), base styles
```

## Available routes

```
/login

/dashboard

/organization

/locations

/categories

/products
/products/create
/products/edit/:id
/products/:id

/batches

/inventory
/stock-movements

/suppliers
/suppliers/:id

/purchases
/purchases/create

/pos
/sales
/sales/:id

/requests
/requests/create
/requests/:id

/returns
/returns/create

/users            (Admin only)

/reports
/reports/inventory
/reports/low-stock
/reports/expiry
/reports/purchases        (backend endpoint missing)
/reports/sales            (backend endpoint missing)
/reports/stock-movements  (backend endpoint missing)

/settings
/unauthorized
* → 404
```

`/suppliers/create`, `/suppliers/edit/:id`, `/locations/create`,
`/locations/edit/:id`, `/organization/create`, and `/organization/edit/:id` from the
original spec are implemented as **modals** on their respective list pages instead of
separate routes — the backend operations are identical (`create`, `update`,
`deactivate`), and a modal keeps the list visible while editing. Nothing about the API
usage changed.

## Authentication & authorization

- Route protection: `<ProtectedRoute />` redirects to `/login` if no local session
  exists. `<RoleProtectedRoute allowedRoles={["ADMIN"]} />` redirects to `/unauthorized`
  if the local session's role doesn't match — currently only used for `/users`.
- **This is frontend-only gating.** The backend has no authorization checks of any
  kind today (no auth middleware exists at all), so it remains the source of truth only
  in the sense that it currently trusts every request equally. Once the backend adds
  real auth, `src/services/api.js` already has an `Authorization: Bearer <token>`
  interceptor stubbed in, ready to wire up.

## Currency & dates

- All money values use `src/utils/formatCurrency.js`, which formats with the Indian
  numbering system (₹1,25,000.00), plus a compact form for KPI cards (₹1.2L, ₹3.4Cr).
- All dates use `src/utils/formatDate.js` (`30 Aug 2026` style), with helpers for
  days-until-expiry and relative time.

## Dark mode

Implemented via CSS variables in `src/index.css` under `:root` and
`[data-theme='dark']`, toggled by `ThemeContext` (light / dark / system), persisted to
`localStorage`. No component hardcodes a color — everything reads `var(--*)`.

## What's intentionally *not* built

Per the instruction not to fabricate backend functionality, the following UI is present
and wired up, but shows an explicit "not available yet" state instead of fake data,
until the backend adds the missing endpoint:

- Purchase history / purchase reports (`GET /purchase` doesn't exist)
- Stock movement history, on both the Product Details page and its own report
  (no `GET` route reads `stock_movements`)
- Sales history and POS checkout will fail against a real backend until
  `api/sale.js` is mounted at `/api/sale` (the frontend code is correct and ready)
- User management (`/users`) — no backend CRUD for `users` exists
- Material returns with DAMAGED or SCRAP condition — will hit a 500 from the backend
  until the missing `inventory_scrap` table is created (WORKING-condition returns are
  unaffected)

See `BACKEND_INTEGRATION_NOTES.md` for the full detail, including exact file
references and suggested backend changes.
#   s t a c k e n z o _ i n n o v a t i o n  
 