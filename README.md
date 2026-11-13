# SIB Pekan Ranau

Bilingual church website and public Sunday service roster for SIB Pekan Ranau, Sabah. Site admins and Sunday service admins can edit schedules; visitors can read them without signing in.

## Architecture

This is one repository with two deployable applications:

- **Frontend:** React + Vite + TypeScript, shadcn/ui-compatible components (`src/`, `public/`)
- **Backend:** Fastify + TypeScript API (`server/`)
- **Shared operations:** Docker images, reverse proxy, environment examples, and GitHub Actions (`deploy/`, `.github/`)

MongoDB stores service schedules and editor accounts. The browser calls `/api` on the same origin; Vite proxies it locally, while Caddy routes it to Fastify in staging and production.

## Three stages

| Stage | Purpose | Source | URL | Data |
| --- | --- | --- | --- | --- |
| Localhost | Coding and quick checks | Your working copy | `http://localhost:5173` | Local MongoDB database |
| Staging | User acceptance testing | `develop` branch, `staging` image tag | Your staging domain | Separate staging MongoDB database |
| Production | Public church website | Approved `v*` release tag | Your production domain | Separate production MongoDB database |

Staging and production use the same container definitions but different hostnames, credentials, database names, and image tags. Never copy real member data into staging without approval.

## Localhost setup

1. Install Node.js 24 and start MongoDB locally, or obtain a MongoDB Atlas connection URI.
2. Run `npm ci`.
3. Copy `.env.example` to `.env`. Set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` to your own values.
4. Run `npm run dev:api` in one terminal and `npm run dev` in another.
5. Open `http://localhost:5173`. Check the API at `http://localhost:3001/api/health`.

Run `npm run build` before submitting a pull request. This builds both the web app and compiled API.

The first API startup creates the initial admin account if it does not exist. The bootstrap credentials are stored in the database as a password hash; changing `ADMIN_PASSWORD` later does **not** change that account's password. Add password change and reset flows before a public launch. An admin can create a `service_admin` with `POST /api/admin/service-admins` and an admin bearer token.

## Staging and production setup

The deployment files assume two Docker-capable hosts or equivalent isolated deployments: one for staging and one for production. Each hostname must point to its host, and ports 80 and 443 must be available. Caddy serves the frontend and API on one HTTPS origin. Its automatic HTTPS requires working DNS and reachable ports. See [Caddy's HTTPS documentation](https://caddyserver.com/docs/automatic-https).

1. Create a GitHub repository and push this local repository. Keep the initial GitHub repository private until ready to share.
2. Create a `develop` branch from `main`. Use feature branches and pull requests into `develop`.
3. GitHub Actions verifies pushes and pull requests. A push to `develop` publishes `ghcr.io/<owner>/sibpr-web:staging` and `ghcr.io/<owner>/sibpr-api:staging`. A `v*` tag publishes images with that version tag. The workflow **builds images; deployment is a separate step**.
4. On the staging host, copy `deploy/` from the repository and create `deploy/staging.env` based on `deploy/staging.env.example`. Set the real staging domain, GitHub owner, staging MongoDB URI/database, and unique secrets. Never commit this file.
5. Sign in to GHCR on the host if the packages are private, then from the repository root run:

   ```sh
   docker compose --env-file deploy/staging.env -f deploy/compose.yaml pull
   docker compose --env-file deploy/staging.env -f deploy/compose.yaml up -d
   ```

6. Test the staging site with users. Check `https://<staging-domain>/api/health` and confirm schedule viewing, admin sign-in, and editing.
7. After acceptance, tag the approved commit (for example `v1.0.0`) and push the tag. Wait for the image workflow to finish. On the production host, create `deploy/production.env` from the example, set `IMAGE_TAG=v1.0.0`, and run the same two Compose commands with `production.env`.
8. For rollback, set `IMAGE_TAG` to the prior approved version in `production.env`, then run `docker compose --env-file deploy/production.env -f deploy/compose.yaml up -d`.

Use a different MongoDB user, database, `JWT_SECRET`, and admin password for each environment. The production site should only be announced after official church contact and giving details are confirmed, and editor account management is ready.

## API

- `GET /api/health`
- `GET /api/services?from=YYYY-MM-DD&limit=12`
- `GET /api/services/:date`
- `POST /api/auth/login`
- `GET /api/auth/me` (editor)
- `PUT /api/services/:date` (editor)
- `POST /api/admin/service-admins` (admin)

Service dates must be Sundays. No team names are seeded automatically. Official donation and church contact details remain placeholders until provided.
