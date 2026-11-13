# SIB Pekan Ranau

Bilingual church website and Sunday service roster for SIB Pekan Ranau, Sabah.

## Stack

- React + Vite + TypeScript frontend, with shadcn/ui-compatible component setup
- Fastify + TypeScript API
- MongoDB for service schedules and editor accounts

## Local setup

1. Install Node.js 20 or newer and start MongoDB (local or Atlas).
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Use a unique strong secret and password.
4. In one terminal run `npm run dev:api`; in another run `npm run dev`.
5. Open http://localhost:5173. The API is at http://localhost:3001.

The first API startup creates the initial admin account from the environment variables. Change the bootstrap password after initial setup by removing the account and restarting with a new value, or add a password management feature before production use. The initial account has the `admin` role; `service_admin` users can be created with `POST /api/admin/service-admins` using an admin bearer token. Both roles can edit Sunday schedules. Visitors can read schedules without signing in.

## API

- `GET /api/health`
- `GET /api/services?from=YYYY-MM-DD&limit=12`
- `GET /api/services/:date`
- `POST /api/auth/login`
- `GET /api/auth/me` (editor)
- `PUT /api/services/:date` (editor)
- `POST /api/admin/service-admins` (admin)

Dates for services must be Sundays. The public schedule starts with no names; editors publish assignments through the page. Official donation and church contact details are intentionally left as content placeholders until provided.

## Collaboration

Create a GitHub repository, push this folder, invite collaborators, and use branches and pull requests. `.env` is ignored; never commit secrets. Recommended first issues: official church contact details, approved donation method, church logo and photography, and password reset / account management.
