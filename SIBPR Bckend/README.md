# SIBPR Backend

Fastify API and MongoDB data for SIB Pekan Ranau. This folder is part of the SIBPR Website repository. Run `npm run local` from the repository root to start both applications.

## Local setup

1. Run `npm ci` in this folder.
2. Configure `.env` using `.env.example`.
3. Run `docker compose -f compose.local.yaml up -d` for MongoDB.
4. Run `npm run dev` to start the API at `http://localhost:3001`. The frontend Vite server proxies `/api` to this port.

`npm run build` compiles the API; `npm start` runs the compiled version. Management endpoints require a valid staff/admin token. Public schedule endpoints remain readable without signing in.

## Sunday roster

Signed-in staff can manage people in three teams: musicians, worship leaders and singers, and Live Multimedia & PA. Each person has a name and optional picture; musicians also have an instrument, and multimedia staff can have a talent or responsibility. Publishing a Sunday service stores selected assignments and a public snapshot in MongoDB.

Protected endpoints: GET/POST /api/management/people, PUT/DELETE /api/management/people/:id, and PUT /api/management/services/:date/publish. Public GET /api/services/:date includes names and roster pictures for published Sundays.
