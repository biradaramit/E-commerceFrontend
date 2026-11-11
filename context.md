# Project Handoff: E-Commerce Frontend

Last updated: 2026-11-11

This document is a handoff for another agent or developer. It records what is deployed, what is verified, what is not, and what to do next. Read it fully before making changes.

---

## 1. Summary

A React 19 + Vite single-page app for an e-commerce site. It is deployed to Azure Static Web Apps and calls a backend API through an Azure Container Apps API gateway. The backend microservices (user, product, order) are not in this repo.

Current state:

- The committed code on `origin/main` is live. Products and cart code are both in the deployed bundle.
- CORS on the gateway has been fixed, so the browser can call the API from the Static Web App.
- Products load from the live API (verified with curl, not in a browser).
- Cart requires a logged-in user. No test account has been created or verified.
- Uncommitted work exists in the working tree: an Add Product admin feature and related edits. It is not deployed and not committed.

---

## 2. Repository

- Path: `C:\Users\Amit\source\repos\ecommerce-frontend`
- Remote: `origin` = `https://github.com/biradaramit/E-commerceFrontend.git`
- Branch: `main`. `main` and `origin/main` were in sync at the last check.
- Commits:
  - `6e71e4a` first commit
  - `c7b2ab5` Connect frontend to Azure API Gateway and add Azure deployment pipeline (HEAD)
- Line endings: Git prints "LF will be replaced by CRLF" warnings for `App.jsx`, `AuthContext.jsx`, and `app.css`. This is a Windows autocrlf issue, not a code bug.

### Tech stack

- React 19.2, react-router-dom 7, axios 1.20, Vite 8, ESLint 10
- Node: CI uses Node 22.x. Vite 8 requires Node `^20.19.0 || >=22.12.0`.
- Install: `npm ci`. Build: `npm run build`. Output: `dist/`.

### Key files

| Path | Purpose |
|---|---|
| `src/api/apiClient.js` | Axios instance. Base URL from `VITE_API_BASE_URL`. Adds `Authorization: Bearer` from localStorage. Handles 401 (clears session, redirects to `/login`), 403 (logs), and network errors (logs). |
| `src/App.jsx` | Route table. See section 5. |
| `src/context/AuthContext.jsx` | Stores `user` (`userId`, `email`, `firstName`, `roles`) in localStorage under `user`. Token is under `token`. Exposes `isAuthenticated` and `isAdmin` (UI-only). |
| `src/components/ProtectedRoute.jsx` | Redirects unauthenticated users to login. |
| `src/components/AdminRoute.jsx` | Redirects non-admins. UI-only guard. |
| `src/services/*.js` | Thin wrappers over `apiClient`. One per domain: auth, cart, order, product. |
| `src/pages/*.jsx` | Products, product detail, login, register, cart, checkout, orders, order detail, add product. |
| `public/staticwebapp.config.json` | SPA fallback to `/index.html` and 404 override. Cache headers for `/assets/*`. |
| `.env.production` | `VITE_API_BASE_URL` for production builds. |
| `.env.development` | `VITE_API_BASE_URL` for dev. Same gateway URL. |
| `azure-pipelines.yml` | Azure DevOps pipeline. Triggers on `main`. Builds with Node 22 and deploys `dist/` to Azure Static Web Apps. |

### Environment variables

- `VITE_API_BASE_URL` is the only variable the app reads. It is baked in at build time.
- Production value: `https://ecommerce-api-gateway.ashysmoke-4c224a19.eastus.azurecontainerapps.io/api`
- A local gateway can be used by creating `.env.local` (git-ignored) with `VITE_API_BASE_URL=https://localhost:5200/api`.
- `apiClient.js` falls back to the production gateway if the variable is missing.

---

## 3. Azure Infrastructure

Subscription: `Project-IBMMSPCICINPOC` (tenant `IBM-Alliance-Microsoft Partner Network-Global-Tenant`). Account and tenant IDs are in the local `az` CLI profile.

Resource group: `rg-lab-amit-training-20260921` (region `eastus`, except the SWA in `eastus2`).

| Resource | Type | Notes |
|---|---|---|
| `ecommerce-frontend-amit` | Static Web App (Custom provider) | Default hostname `victorious-ocean-024997b0f.3.azurestaticapps.net`. Region `eastus2`. Linked to GitHub repo `biradaramit/E-commerceFrontend`, branch `main`. |
| `ecommerce-api-gateway` | Container App | External ingress. Image `acrecommerceamit2026.azurecr.io/apigateway:v8`. Latest revision `--0000005`. Public FQDN `ecommerce-api-gateway.ashysmoke-4c224a19.eastus.azurecontainerapps.io`. |
| `ecommerce-user-service` | Container App | Internal ingress only. Image `userservice:v2`. |
| `ecommerce-product-service` | Container App | Internal ingress only. Image `productservice:v1`. |
| `ecommerce-order-service` | Container App | Internal ingress only. Image `orderservice:v1`. |
| `cae-ecommerce-microservices` | Container Apps environment | Hosts the four container apps. |
| `acrecommerceamit2026` | Container Registry | Holds the service images. |
| `sql-ecommerce-amit2026` | SQL Server | Databases: `ECommerceUserServiceDb`, `ECommerceProductServiceDb`, `ECommerceOrderServiceDb`. |
| `workspacerglabamittraining202609219c95` | Log Analytics workspace | |

### Gateway CORS (changed 2026-11-11)

CORS was enabled on `ecommerce-api-gateway` ingress with:

- Allowed origin: `https://victorious-ocean-024997b0f.3.azurestaticapps.net` only
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Headers: `content-type`, `authorization`
- Credentials: false

Verified: preflight and GET both return `access-control-allow-origin` for the SWA origin.

Localhost is not allowed. If local development against the deployed gateway is needed, add `http://localhost:5173` with:

```
az containerapp ingress cors update -g rg-lab-amit-training-20260921 -n ecommerce-api-gateway --allowed-origins <existing> http://localhost:5173
```

Check the existing origin list first. Changing CORS on a shared gateway needs the user's approval.

---

## 4. Deployment

### Pipeline (intended path)

`azure-pipelines.yml` is meant to run on push to `main`:

1. Install Node 22.
2. `npm ci`
3. `npm run build`
4. Deploy `dist/` to the SWA using the token from variable group `ECommerce-Frontend-Secrets`, secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.

Status: this pipeline could not be run from the local machine. The `az pipelines` CLI needs Azure DevOps sign-in for org `gh-training-sandbox`, project `ECommerceMicroservice`, and the git remote is GitHub, not Azure DevOps. The SWA is also linked to GitHub, so GitHub Actions may have created a workflow file on the SWA side. Check the SWA's GitHub integration before assuming which pipeline deploys.

### Manual deploy used (2026-11-11)

The live site was checked before any redeploy. Its bundle hash (`index-DfSI8zlX.js`) matches a fresh build of `origin/main`, so no redeploy was needed.

If a redeploy is needed without pushing uncommitted work:

1. Export `origin/main` to a clean folder with `git archive origin/main | tar -x -C <dir>`.
2. `npm ci && npm run build` in that folder.
3. Copy `public/staticwebapp.config.json` into `dist/`.
4. Upload `dist/` with the SWA deployment token. Get the token from the Azure portal or `az staticwebapp secrets list`. Never commit it.

Do not write the token into any file in the repo.

---

## 5. Routes

| Path | Component | Guard |
|---|---|---|
| `/` | ProductsPage | none |
| `/products/:id` | ProductDetailsPage | none |
| `/login` | LoginPage | none |
| `/register` | RegisterPage | none |
| `/cart` | CartPage | ProtectedRoute |
| `/checkout` | CheckoutPage | ProtectedRoute |
| `/orders` | OrdersPage | ProtectedRoute |
| `/orders/:id` | OrderDetailsPage | ProtectedRoute |
| `/admin/products/new` | AddProductPage | AdminRoute (uncommitted) |

---

## 6. API Contract (as used by the frontend)

All paths are relative to the gateway base URL, which ends in `/api`.

| Method | Path | Used by | Auth |
|---|---|---|---|
| POST | `/Auth/register` | RegisterPage | none |
| POST | `/Auth/login` | LoginPage | none |
| GET | `/Auth/me` | authService | token |
| GET | `/Products?category=` | ProductsPage | none |
| GET | `/Products/{id}` | ProductDetailsPage | none |
| POST | `/Products` | AddProductPage (uncommitted) | Admin role |
| GET | `/Categories` | ProductsPage, AddProductPage | none |
| GET | `/Cart` | CartPage | token |
| POST | `/Cart/items` | ProductsPage / details | token |
| PUT | `/Cart/items/{id}` | CartPage | token |
| DELETE | `/Cart/items/{id}` | CartPage | token |
| POST | `/Orders` | CheckoutPage | token |
| GET | `/Orders/my-orders` | OrdersPage | token |
| GET | `/Orders/{id}` | OrderDetailsPage | token |

### Verified live (curl, 2026-11-11)

- `GET /api/products` returns 200 with a JSON array. Sample item fields: `id`, `name`, `description`, `price`, `sku`, `categoryId`, `categoryName`, `stockQuantity`, `imageUrl`, `isActive`.
- `GET /api/cart` returns 401 without a token. Expected.
- `GET /api/orders` returns 401 without a token. Expected.
- `POST /api/auth/login` returned 405 on GET. The frontend uses `/Auth/login` (capital A) via axios, so this was probed with the wrong path. Re-verify with a POST to `/api/Auth/login`.

### Assumptions not yet verified

- The login response shape: `{ token, userId, email, firstName, roles }`. `AuthContext.login` depends on it.
- The product create body matches `CreateProductDto`: `name`, `description`, `price`, `sku`, `categoryId`, `stockQuantity`, `imageUrl`.
- Admin is a role string `"Admin"` in the `roles` array.

---

## 7. Feature Status

| Feature | Code | Deployed | Verified |
|---|---|---|---|
| Products list + category filter | committed | yes | API verified; UI not checked in a browser |
| Product detail | committed | yes | not verified |
| Login / register | committed | yes | not verified |
| Cart (view, add, update, remove) | committed | yes | blocked: needs a logged-in user |
| Checkout / place order | committed | yes | not verified |
| My orders / order detail | committed | yes | not verified |
| Add Product (admin) | uncommitted | no | not verified |
| Admin nav link | uncommitted | no | not verified |
| Success banner after add | uncommitted | no | not verified |

Important: nothing has been tested in a real browser. Only the build and curl checks have run.

---

## 8. Uncommitted Changes

Working tree status at the last check:

```
 M src/App.jsx
 M src/components/Header.jsx
 M src/context/AuthContext.jsx
 M src/pages/ProductsPage.jsx
 M src/services/productService.js
 M src/styles/app.css
?? src/components/AdminRoute.jsx
?? src/pages/AddProductPage.jsx
```

What these add:

- `AdminRoute.jsx` (new): guard for `/admin/products/new`. Redirects unauthenticated users to `/login` and non-admins to `/`.
- `AddProductPage.jsx` (new): form with client-side validation. Loads categories, POSTs via `productService.createProduct`, and navigates to `/` with a success message on success. Maps 403 and 409 to messages.
- `AuthContext.jsx`: adds `isAdmin` derived from `user.roles`.
- `Header.jsx`: shows an "Add Product" link when `isAdmin`.
- `productService.js`: adds `createProduct`.
- `ProductsPage.jsx`: reads a success message from router state and clears it on mount.
- `app.css`: styles for the add-product form.
- `App.jsx`: adds the admin route and a debug line (see section 9).

Do not commit these without the user's approval. Pushing to `main` deploys the pipeline, and it would deploy these changes.

Before committing, review the `App.jsx` change noted in section 9.

---

## 9. Known Issues and Code Smells

1. **`App.jsx` debug side effect.** The `App` function body calls `localStorage.setItem("name", "Amit")` and `console.log` on every render. This is leftover code and should be removed. It is present in both the committed and uncommitted versions. The uncommitted version changed the name from `"Kamalesh"` to `"Amit"`, which is also leftover.
2. **Admin checks are UI-only.** `isAdmin` and `AdminRoute` only hide the UI. The backend must reject non-admin `POST /Products`. This has not been verified.
3. **Auth token in localStorage.** Standard for this stack, but it is readable by any script on the page.
4. **Stale `ProductsPage` state.** It reads `location.state.message` once on mount and clears it with `navigate(..., { replace: true, state: null })`. Check that the banner is not lost when the page re-renders.
5. **`productService.js` has no trailing newline.** Harmless.
6. **Duplicate SWA deploy paths.** The SWA is linked to GitHub, and `azure-pipelines.yml` also deploys it. Confirm which one actually runs, to avoid double deploys or stale output.
7. **CRLF warnings.** Git converts line endings for several files. Consider a `.gitattributes` file to normalize them.
8. **`apiClient.js` logs network and 403 errors to the console only.** Users see no feedback from these failures.
9. **No backend source in this repo.** Backend behavior is inferred from the frontend's expectations and curl checks.

---

## 10. Next Steps (in priority order)

1. **Create a test user or confirm an existing one.** Cart and orders need a logged-in user. Register through `POST /api/Auth/register` or use an existing account. The user has not chosen yet. Registering writes to the shared user database, so get the user's approval first.
2. **Verify login and cart end to end in a browser.** Open the SWA, log in, add a product to the cart, and check the cart page. Confirm no CORS or 401 errors in the console.
3. **Verify the login response shape** from `POST /api/Auth/login` matches what `AuthContext.login` expects.
4. **Decide what to do with the uncommitted work.** Options: commit and push (deploys everything, including the debug line in `App.jsx`), or commit only after removing the debug line and testing Add Product locally against the gateway. Get the user's approval before pushing.
5. **Remove the debug `localStorage.setItem("name", ...)` from `App.jsx`.**
6. **Test Add Product end to end** as an admin. Confirm the backend rejects non-admin POSTs to `/Products`.
7. **Check the SWA's GitHub integration** and decide which deployment path to keep.
8. **Optional:** add `http://localhost:5173` to gateway CORS for local development. Needs approval.

---

## 11. How to Work in This Repo

- Build: `npm run build`
- Dev server: `npm run dev` (default port 5173)
- Lint: `npm run lint`
- Do not commit or push without the user's explicit approval.
- Do not write secrets (deployment tokens, passwords, connection strings) into this repo.
- Changes to shared Azure resources (CORS, scaling, ingress, database writes) need the user's approval first.
- For UI changes, test in a browser. A build passing does not confirm the feature works.

---

## 12. Open Questions for the User

- Which test account should be used for cart and checkout testing?
- Should the uncommitted Add Product work be committed and pushed?
- Which deployment path should stay active: the Azure DevOps pipeline or the SWA's GitHub integration?
- Is localhost CORS on the gateway wanted for local development?
