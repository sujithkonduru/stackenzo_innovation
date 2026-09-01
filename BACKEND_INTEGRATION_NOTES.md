# Backend Integration Notes

This document lists every inconsistency, missing endpoint, and broken code path found
while reading the backend source (`api/*.js`, `index.js`) and the live database schema
(recovered from `steps.txt`) to build this frontend. Each entry follows:

**Issue → Current backend behavior → Frontend impact → Recommended backend change**

---

## 1. No authentication system exists

**Current backend behavior:** `api/auth.js` is a completely empty file (0 bytes) and is
never `require`'d or mounted in `index.js`. There is no login, no signup, no session
verification, no JWT issuance, and no middleware that checks a token on any route. A
`users` table exists in PostgreSQL (`organization_id`, `name`, `email`,
`password_hash`, `role`, `is_active`), but nothing ever reads or writes to it through
an API.

**Frontend impact:** `/login` cannot be a real login screen. It's implemented as a
local "session setup" screen (`src/pages/auth/Login.jsx`) that lets someone pick an
organization and identify themselves, stored only in `localStorage`. This is stated
plainly on the screen itself. Route guards (`ProtectedRoute`, `RoleProtectedRoute`)
only gate the frontend UI — they provide no real security since the backend enforces
nothing.

**Recommended backend change:** Implement `api/auth.js` with at minimum
`POST /auth/register` (or an admin-only user-creation endpoint), `POST /auth/login`
issuing a JWT, and middleware that verifies the token and attaches `req.user` to every
protected route. Once that exists, `src/services/api.js` already has an
`Authorization: Bearer <token>` header wired into its request interceptor — swapping in
a real token is a one-line change (`session.token` is already read from local storage).

---

## 2. `api/sale.js` is fully implemented but never mounted

**Current backend behavior:** `api/sale.js` (1000 lines) implements `POST /create` and
`GET /get` with real stock-availability checks, FEFO-aware batch handling, tax/discount
calculation, and multi-payment support. But `index.js` never requires or mounts it —
there is no `app.use("/api/sale", ...)` line. Every request to `/api/sale/*` currently
404s at the Express routing layer, before it ever reaches the file.

**Frontend impact:** `src/pages/sales/POS.jsx` and `src/pages/sales/Sales.jsx` are
built completely against the real contract in `api/sale.js` (confirmed field-by-field:
`organization_id`, `location_id`, `invoice_number`, `customer_name`, `customer_phone`,
`discount`, `created_by`, `items[]` with `product_id`/`batch_id`/`quantity`/
`unit_price`/`tax_percent`, `payments[]` with `payment_method` ∈
`CASH|UPI|CARD|BANK_TRANSFER`/`amount`/`transaction_reference`). Checkout will fail with
a 404 until the route is mounted. The POS page surfaces a clear error message pointing
at this exact issue if the request 404s.

**Recommended backend change:** In `index.js`, add:
```js
const sale = require("./api/sale");
app.use("/api/sale", sale);
```

---

## 3. Purchases have no GET endpoint

**Current backend behavior:** `api/purchase.js` implements only `POST /create`. There
is no `GET /purchase/get` or equivalent — no way to list, filter, or review past
purchases through the API.

**Frontend impact:** `src/services/purchaseApi.js` exports `getPurchases()`, which
intentionally throws a clear "not implemented" error rather than faking data.
`src/pages/purchases/Purchases.jsx` shows an explicit empty state explaining this, and
the same applies to `/reports/purchases` (`UnavailableReport`). `PurchaseCreate.jsx`
still works fully — creating purchases is unaffected.

**Recommended backend change:** Add a `GET /purchase/get` endpoint mirroring the
filter/response pattern already used in `api/sale.js`'s `GET /get` (join in supplier
name, location name, and items via `json_agg`).

---

## 4. No GET endpoint reads `stock_movements`

**Current backend behavior:** The `stock_movements` table is written to by purchases,
sales, material issues, and returns (confirmed via inserts in `api/purchase.js`,
`api/sale.js`, and `api/employeeRequest.js`), but no route anywhere in the codebase
selects from it.

**Frontend impact:** `src/services/inventoryApi.js` exports `getStockMovements()`,
which intentionally throws rather than fabricating movement history.
`src/pages/stockmovements/StockMovements.jsx`, the "Stock Movement History" section
on `src/pages/products/ProductDetails.jsx`, and `/reports/stock-movements` all show an
explicit "not available yet" state.

**Recommended backend change:** Add `GET /api/inventory/movements` (or similar) that
selects from `stock_movements`, joined with `products`, `product_batches`, and
`inventory_locations`, with filters for organization/location/product/date range.

---

## 5. Material return with DAMAGED/SCRAP condition will crash

**Current backend behavior:** In `api/employeeRequest.js`'s `POST /return` handler,
when a return item's `condition` is `DAMAGED` or `SCRAP`, the code inserts a row into
an `inventory_scrap` table. That table **does not exist** in the live database schema
— it was not found anywhere in the `CREATE TABLE` statements captured in `steps.txt`.
This will throw a Postgres error and roll back the transaction (returning a 500) any
time someone submits a non-WORKING return.

**Frontend impact:** `src/pages/returns/ReturnCreate.jsx` still lets a user select
DAMAGED or SCRAP as a condition (since it's a documented, valid backend value), but
shows an inline warning next to the condition dropdown explaining that this specific
path currently fails, so the failure isn't a surprise. WORKING-condition returns are
fully functional.

**Recommended backend change:** Either create the missing `inventory_scrap` table
(with columns matching what `api/employeeRequest.js` inserts), or remove that insert
and instead route damaged/scrap quantities into a status field on the existing
`material_return_items` row, whichever matches the intended design.

---

## 6. `material_issues` / `material_issue_items` tables are unused

**Current backend behavior:** These tables exist in the schema but no endpoint in
`api/employeeRequest.js` or elsewhere ever inserts into or selects from them. Approving
a material request deducts inventory directly and marks the request `APPROVED` — it
does not create a row in `material_issues`.

**Frontend impact:** The original spec's sidebar included a "Material Issues" item
separate from "Material Requests." Since there's no backend data source for a
standalone issues log, this frontend does not add a separate `/material-issues` page —
"issued" quantities are shown inline on the Material Returns page instead, derived from
the request's `approved_quantity` field, which is data that does actually exist via
`GET /employee/get` and `GET /employee/user-items`.

**Recommended backend change:** Either wire up `material_issues` as an actual issuance
ledger (populated at approval time) with a `GET` endpoint, or drop the unused tables if
the request/approval flow is intended to be the full source of truth.

---

## 7. Inconsistent organization identification across modules

**Current backend behavior:**
- `organization.js`, `locations.js`, `category.js`, `product.js`, `product_batch.js`,
  and `purchase.js` all take an **`organization_name`** string in their `create`
  bodies and resolve it server-side via `WHERE name ILIKE '%...%'`.
- `supplier.js`, `sale.js`, and `employeeRequest.js` all take an
  **`organization_id`** UUID directly.

**Frontend impact:** Each service file in `src/services/` uses whichever the real
endpoint expects — this is called out with a comment at the top of each file
(`organizationApi.js`, `locationApi.js`, `categoryApi.js`, `productApi.js`,
`batchApi.js` use `organization_name`; `supplierApi.js`, `saleApi.js`,
`employeeApi.js` use `organization_id`). The `OrganizationContext` exposes both
`currentOrganizationId` and `currentOrganizationName` so pages can pick whichever is
correct for the endpoint they're calling.

**Recommended backend change:** Standardize on `organization_id` everywhere (it's
unambiguous and doesn't depend on fuzzy string matching, which could match the wrong
organization if two have similar names).

---

## 8. Inconsistent response envelope keys

**Current backend behavior:** Most `GET`/`POST` handlers return `{ success, data }` or
`{ success, count, data }`. `organization.js` is the exception — it returns
`{ success, organization }` (singular endpoints) or `{ success, organizations }`
(list endpoint) instead of `data`.

**Frontend impact:** `src/services/api.js` exports `extractList(payload, ...keys)` and
`extractItem(payload, ...keys)` helpers that accept a list of possible key names, so
`organizationApi.js` passes `'organizations'`/`'organization'` as fallbacks while every
other service just uses the default `'data'`.

**Recommended backend change:** Standardize all responses on `{ success, data }` (and
`{ success, count, data }` for lists) for consistency.

---

## 9. Empty `GET` results return HTTP 404, not an empty array

**Current backend behavior:** Nearly every `GET /*/get` endpoint returns
`res.status(404).json({ success: false, message: "No X found" })` when a query matches
zero rows, rather than `200` with `data: []`.

**Frontend impact:** `src/services/api.js`'s `getListOrEmpty()` helper specifically
catches a `404` status and resolves to `[]` instead of surfacing it as an error, so
"no products yet" and "the products endpoint is down" don't get confused in the UI —
but this does mean a genuine `404` (e.g., the sales endpoint not being mounted, per
issue #2) is indistinguishable from "no rows" purely by status code. The Sales page
specifically checks the error message text to tell the two apart where it can.

**Recommended backend change:** Return `200` with `{ success: true, count: 0, data: [] }`
for empty result sets, reserving `404` for "the resource itself doesn't exist" (e.g., a
truly unmounted route, or a lookup by ID that doesn't exist).

---

## Summary table

| # | Issue | Status |
|---|---|---|
| 1 | No auth system | Not implemented on backend |
| 2 | `sale.js` not mounted | Written, needs one line in `index.js` |
| 3 | No purchase history GET | Not implemented on backend |
| 4 | No stock movements GET | Not implemented on backend |
| 5 | Scrap/damaged returns crash | Missing `inventory_scrap` table |
| 6 | `material_issues` unused | Dead schema, or missing implementation |
| 7 | Inconsistent org identifiers | Works, but inconsistent |
| 8 | Inconsistent response keys | Works, but inconsistent |
| 9 | 404-for-empty convention | Works, but non-standard |
