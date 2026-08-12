---
name: run-malha3d
description: Launch Malha3D ERP server; test endpoints with curl or browser
---

# Run Malha3D — ERP Admin Panel

**Malha3D** is an integrated CRM + Project Management + Financial ERP system for ArchViz studios, built on Node.js + Express + Sequelize + SQLite (dev) / PostgreSQL (prod).

This skill runs the production server (`npm start`) and provides smoke tests via curl to verify basic endpoints. The server starts on port 3001 and exposes both the admin UI (Handlebars) and REST APIs.

## Prerequisites

```bash
# Ubuntu/Debian
apt-get update && apt-get install -y nodejs npm curl

# Verify versions
node --version  # v24+
npm --version   # v10+
```

## Build & Setup

```bash
cd "h:/Zanoello Web/LANDING PAGE"
npm install                    # Install dependencies
npm run build                  # (alias for npm install)
```

**Environment:** The `.env` file is already configured for local development:
- `PORT=3001`
- `NODE_ENV=development`
- `DATABASE_URL` → SQLite fallback (data/dev.sqlite)
- Session secret pre-set; change before production deploy

## Run (Agent Path)

Use the driver to start the server and verify endpoints:

```bash
cd "h:/Zanoello Web/LANDING PAGE"
node .claude/skills/run-malha3d/driver.mjs
```

Output:
```
🚀 Malha3D Driver: Starting server...
📡 Testing endpoints:
  ✅ Homepage: 200
  ✅ Admin Login: 200
  ✅ Health Check: 200
  ✅ Contacts: 200
✅ All endpoints responding. Server is running.
   → Browse to http://localhost:3001
   → Press Ctrl+C to stop
```

The driver spawns `node server.js` in the background, waits 3 seconds for startup, then tests:
- `GET /` — homepage (200)
- `GET /admin/login` — admin panel (200)
- `GET /admin/health` — health check endpoint (200 + JSON status)
- `GET /admin/contatos` — contacts page (200)

All 4 must return 2xx-3xx status for the driver to report success.

## Run (Human Path — Manual)

```bash
cd "h:/Zanoello Web/LANDING PAGE"
npm start
# → 🚀 Malha3D Admin rodando em http://localhost:3001
# → 📡 WebSocket ativo para Chat Interno
```

Open browser → `http://localhost:3001`

**Default credentials:**
- Email: `admin@malha3d.com`
- Password: `admin123`

Press Ctrl+C to stop the server.

## Smoke Test Routes

Once running, test specific endpoints with curl:

```bash
# Health check (always 200, no auth required)
curl http://localhost:3001/admin/health

# HomePage (200, public)
curl -o /dev/null -w "%{http_code}\n" http://localhost:3001/

# Admin pages (302 redirect to login if not authenticated)
curl -o /dev/null -w "%{http_code}\n" http://localhost:3001/admin/crm
curl -o /dev/null -w "%{http_code}\n" http://localhost:3001/admin/projetos
curl -o /dev/null -w "%{http_code}\n" http://localhost:3001/admin/financeiro

# Login (GET → form, POST with credentials)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@malha3d.com","password":"admin123"}'
```

## Direct Invocation (Testing APIs)

Many PRs touch the API layer directly. Run a unit test or invoke endpoints:

```bash
# Run Jest tests
npm test

# Or directly call an API endpoint after starting the server
curl http://localhost:3001/admin/api/health
```

## Gotchas

1. **Port 3001 already in use** — Kill the existing process on that port or set `PORT=3002` in `.env`
2. **SQLite database locked** — If you run multiple instances, they may contend on `data/dev.sqlite`. Only one process should write at a time.
3. **WebSocket connection refused** — Chat features require WebSocket upgrade. Browser console may show warnings if the WS connection drops; this is non-fatal for HTTP endpoints.
4. **"Cannot find module"** — Run `npm install` if you see this. The git repo doesn't commit `node_modules/`.
5. **Handlebars compile errors** — If a view template is malformed, the server still starts but serving that route will 500. Check `views/admin/*.hbs` syntax.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `EADDRINUSE :::3001` | Port already in use. Kill existing process: `lsof -ti:3001 \| xargs kill -9` or use a different port. |
| `SUPABASE_DB_URL não definida` (warning) | Expected. SQLite fallback is active. No action needed. |
| `Cannot GET /admin/contatos` (404) | Server is running but the route doesn't exist. Check if `views/admin/contatos.hbs` exists and route is defined in `routes/admin.js`. |
| `Error: listen EACCES: permission denied :::3001` | Port < 1024 requires sudo. Use `PORT=3001` (>1024 on Linux) or run with sudo. |
| `Timeout connecting to localhost:3001` | Server didn't start. Check logs: `npm start 2>&1 \| head -50`. Look for DB connection errors or missing env vars. |
| `Sequelize connection error` | Database URL is wrong or DB is down. If using PostgreSQL, check `SUPABASE_DB_URL` or set it to SQLite (empty string uses fallback). |

## Next Steps

- **Run tests:** `npm test` (Jest)
- **Lint code:** `npm run lint`
- **Start dev mode with auto-reload:** `npm run dev` (uses nodemon)
- **Health check:** `curl http://localhost:3001/admin/health` (always works, no auth)

---

**Version:** Malha3D v2.0 (30 features, ACID transactions, ERP Financeiro complete)  
**Main entry:** `server.js` → exports `startServer()` and Express `app`  
**Routes:** `routes/index.js` → mounted at `/`, `/admin`, `/api`  
**Models:** Sequelize ORM, 40+ tables (Budget, Project, Client, User, AR/AP, etc.)  
**Database:** SQLite (dev) → PostgreSQL via `SUPABASE_DB_URL` (prod)
