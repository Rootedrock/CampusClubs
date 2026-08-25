# CampusClubs Backend

A REST API backend for the [CampusClubs](https://rootedrock.github.io/CampusClubs/) student club directory. It powers:

- The directory grid, `⌘K` search, and category filters (Technical / Cultural / Sports / Social)
- Individual club detail pages
- The "Club of the Month" spotlight
- The "12+ Active Clubs / 4 Categories / 500+ Students" stats banner
- The "Suggest a Club" form, including validation and an admin view of submissions

Built with **Node.js + Express** and a dependency-free JSON-file data store — no database setup required, and no native modules to compile. Swap `src/db.js` for a real database later without touching the routes.

## Getting started

```bash
npm install
cp .env.example .env   # then edit .env as needed
npm start               # or: npm run dev (auto-restarts on changes)
```

The API runs on `http://localhost:4000` by default.

## Configuration (`.env`)

| Variable        | Description                                                              |
|------------------|---------------------------------------------------------------------------|
| `PORT`           | Port the server listens on (default `4000`)                              |
| `CORS_ORIGINS`   | Comma-separated list of origins allowed to call the API. Add your GitHub Pages origin (`https://rootedrock.github.io`) here for the live site to work. |
| `ADMIN_API_KEY`  | Shared secret required (via `x-api-key` header) to view/delete suggestions |

## API reference

### Clubs

| Method | Route | Description |
|---|---|---|
| GET | `/api/clubs?search=&category=` | List clubs, optionally filtered by free-text search and/or category |
| GET | `/api/clubs/categories` | List distinct category names |
| GET | `/api/clubs/club-of-the-month` | Get the current spotlighted club |
| GET | `/api/clubs/stats` | Get active club count, category count, total student count |
| GET | `/api/clubs/:id` | Get a single club's details |

Example:

```bash
curl "http://localhost:4000/api/clubs?category=Technical&search=robot"
```

### Suggestions

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/suggestions` | none | Submit a new club suggestion |
| GET | `/api/suggestions` | admin | List all submitted suggestions |
| DELETE | `/api/suggestions/:id` | admin | Delete a suggestion |

Admin routes require an `x-api-key` header matching `ADMIN_API_KEY`.

Submit a suggestion:

```bash
curl -X POST http://localhost:4000/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{
        "clubName": "Chess Club",
        "email": "student@campus.edu",
        "category": "Technical",
        "reason": "Weekly tournaments and casual play for all skill levels."
      }'
```

Fields:
- `clubName` (required)
- `email` (required, must look like a valid email)
- `category` (required, one of `Technical`, `Cultural`, `Sports`, `Social`)
- `reason` (optional)

View submissions (admin):

```bash
curl http://localhost:4000/api/suggestions -H "x-api-key: <your ADMIN_API_KEY>"
```

### Health check

```bash
curl http://localhost:4000/api/health
```

## Project structure

```
campusclubs-backend/
├── server.js                  # App entry point
├── src/
│   ├── db.js                  # JSON-file data access layer
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── requireAdmin.js
│   └── routes/
│       ├── clubs.js
│       └── suggestions.js
├── data/
│   ├── clubs.json             # Seed data (edit to add/change clubs)
│   └── suggestions.json       # Submitted suggestions get appended here
├── package.json
└── .env.example
```

## Connecting the existing frontend

The current site is static HTML/JS on GitHub Pages, so it isn't calling any API yet. To wire it up:

1. Deploy this backend somewhere reachable over HTTPS (Render, Railway, Fly.io, a VPS, etc.).
2. Add that deployed origin — and `https://rootedrock.github.io` — to `CORS_ORIGINS`.
3. In the frontend JS, replace the hard-coded club array with a `fetch('https://your-api-domain/api/clubs')` call, and point the suggestion form's submit handler at `POST https://your-api-domain/api/suggestions`.

## Notes on the JSON-file store

Writes (new suggestions) are synchronous file writes, which is fine for a small class project or low-traffic directory but isn't safe under heavy concurrent write load. If you outgrow it, replace the functions in `src/db.js` with calls to SQLite/Postgres/MongoDB — the route files only depend on that module's function signatures, so nothing else needs to change.
