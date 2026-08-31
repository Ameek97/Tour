# Production configuration

Do not put real secrets in this file or in Git.

## Local development

1. Copy `config.env.example` to `config.env` (already gitignored).
2. Fill in values locally. Never commit `config.env` or `.env`.
3. Backend: `npm run dev` (defaults to port 3000).
4. Frontend: `cd frontend && npm run dev` (Vite on 5173, proxies `/api` to port 3000).
5. Leave `VITE_API_URL` empty so the browser uses same-origin `/api` via the proxy (httpOnly cookie).

`NODE_ENV=development` enables the booking payment bypass (no Razorpay Checkout).

## Production environment variables (names only)

Backend:

- `NODE_ENV` — must be `production`
- `PORT` — provided by the host, or `3000`
- `DATABASE` — MongoDB URI; may include `<db_password>` placeholder
- `PASSWORD` — substituted into `DATABASE` when the placeholder is used
- `JWT_KEY`
- `JWT_EXP` — e.g. `90d` (optional; default `90d`)
- `COOKIE_EXP` — cookie lifetime in days (optional; default `90`)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `EMAIL_FROM`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (tour image uploads)
- `FRONTEND_ORIGIN` — optional; see CORS below

Frontend:

- `VITE_API_URL` — leave empty for same-origin `/api` (recommended when this Node app serves `frontend/dist`)

Only `VITE_*` values are exposed to browser code. Never prefix secrets with `VITE_`.

## Same-origin production (recommended)

1. `NODE_ENV=production`
2. `cd frontend && npm run build`
3. `npm start` from the repo root
4. Express serves `frontend/dist` and `/api` on the same host/port
5. Leave `FRONTEND_ORIGIN` empty
6. Cookies: `httpOnly`, `secure`, `sameSite=lax`, `path=/`

SPA reloads (`/tours`, `/bookings`, `/admin`, …) are handled by sending `index.html` for non-`/api` GET requests.

## Split frontend/API hosts

If the UI is on another origin:

1. Set `FRONTEND_ORIGIN` to that origin (comma-separated if several), e.g. `https://app.example.com`
2. Cookies use `sameSite=none` and `secure` (HTTPS required)
3. Set `VITE_API_URL` at **frontend build time** to the API origin, e.g. `https://api.example.com`
4. Do not use `*` for origins with credentials

## Razorpay

Dashboard keys must match the mode (`rzp_test_…` vs `rzp_live_…`). Key ID and secret must be a pair from the same Razorpay account/mode. Webhook URL: `https://<api-host>/api/booking/webhook` with `RAZORPAY_WEBHOOK_SECRET`.

If Checkout or order creation returns 401, the server keys are rejected by Razorpay — replace them; this is not a client-side key leak.

Production never uses the development booking bypass.

## Reverse proxy

Production sets `trust proxy` so `secure` cookies and rate-limit IPs work behind TLS terminators.
