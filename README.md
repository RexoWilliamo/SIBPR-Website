# SIB Pekan Ranau Website

React, Vite, and TypeScript frontend for SIB Pekan Ranau, Sabah. The Fastify API is a separate sibling folder called `SIBPR Bckend`.

```text
Desktop/
├── SIBPR Website/   ← frontend (this folder)
└── SIBPR Bckend/    ← Fastify API and MongoDB setup
```

The public site includes the landing page, events, Sunday service schedule, and ministry pages. `/management` is a separate sign-in screen for admin and staff. The browser calls `/api` through Vite's local proxy; the backend checks credentials and permissions for management actions.

## Localhost

Install Node.js 24 and Docker Desktop. In **each** folder run `npm ci` once. The backend `.env` is in `SIBPR Bckend`; keep it private.

From `SIBPR Website`, run:

```powershell
npm run local
```

The command starts MongoDB from the backend folder, starts the backend API on port 3001 and frontend on port 5173, prints the URLs, and opens `http://localhost:5173/start` in your browser. That local start page links to the public website and the private management sign-in page.

For manual development, run `npm run dev` in this folder and `npm run dev` in `SIBPR Bckend` in separate terminals. Check the API at `http://localhost:3001/api/health`.

## Builds and deployment

Run `npm run build` in this folder for the frontend, and run `npm run build` in `SIBPR Bckend` for the API. The frontend GitHub Actions workflow builds and publishes only the web image. The backend has a Dockerfile, but its separate GitHub publishing workflow is not configured yet. The staging and production Compose file in `deploy/compose.yaml` still expects both `sibpr-web` and `sibpr-api` images; publish the backend image before deploying either environment.

Keep local, staging, and production MongoDB databases, secrets, and credentials separate. The frontend and backend should use matching release tags when deployed together. The frontend uses `deploy/Caddyfile` to route `/api` to Fastify and all other requests to the web app.

## Pages

- `/` — landing page
- `/events` — events and activities
- `/sunday-service` — public Sunday roster
- `/pelayanan-wanita`, `/pelayanan-wira`, `/pelayanan-muda-mudi` — ministries
- `/management` — admin and staff sign-in and schedule editor
- `/start` — local-only launcher

The Sunday service meets at 9:00 AM at SIB Pekan Ranau, Sabah. The site supports English and Bahasa Malaysia.