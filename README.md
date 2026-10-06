# CampusClubs

A modern campus club directory for discovering and exploring college clubs and activities.

**Live site:** https://rootedrock.github.io/CampusClubs/

## Overview

CampusClubs consists of two main parts:

- **Frontend** — A responsive, static site (HTML/CSS/JS) hosted on GitHub Pages with a club directory, search, filters, FAQ, and a club suggestion form.
- **Backend** — A REST API (Node.js + Express) that powers club data, suggestions, and admin functionality.

## Quick links

- [**Frontend README**](./frontend/README.md) — Club directory features, tech stack, file structure, and implementation details.
- [**Backend README**](./backend/README.md) — API reference, configuration, project structure, and deployment guide.

---

## Frontend

A student club directory that lets new students browse, search, and filter campus clubs in one place instead of relying on word of mouth.

**Live site:** https://rootedrock.github.io/CampusClubs/

### Features

- **Club directory** — 8 clubs across 4 categories (Technical, Cultural, Sports, Social), each with a name, description, and meeting day/time.
- **Category filter** — instantly show/hide clubs by category, with a "no clubs found" state when nothing matches.
- **Live search** — filters cards by name as you type, and works together with the active category filter rather than overriding it.
- **FAQ accordion** — expandable/collapsible answers to 5 common questions, one open at a time.
- **Suggest a Club form** — client-side validation (required club name, email format check) with inline error messages and a success confirmation screen — no `alert()` popups.
- **Club Spotlight** — a static "Club of the Month" highlight section.
- **Theme toggle** — switches between light and dark mode, saved to `localStorage` so it persists across page reloads.
- **Mobile navigation** — the nav collapses behind a hamburger menu below 768px.
- **Responsive layout** — tested from 320px phones up to large desktop screens.

### Tech stack

- HTML5, CSS3, vanilla JavaScript — no frameworks or build tools.
- [Lucide](https://lucide.dev/) for icons, loaded via CDN.
- [Inter](https://fonts.google.com/specimen/Inter) font, loaded via Google Fonts.
- Hosted on GitHub Pages.

### File structure

```
frontend/
├── index.html   # Page structure and content (all club data is hardcoded here)
├── style.css    # All styling, including light/dark theme variables and responsive breakpoints
├── script.js    # Theme toggle, mobile nav, filtering/search, FAQ accordion, form validation
├── logo.png     # Site logo, used in the navbar and footer
└── README.md
```

### Running locally

No build step needed — the app's entry point is `frontend/index.html`. To run locally, serve the frontend folder:

```bash
npx serve frontend
```

---

## Backend

A REST API backend for the CampusClubs student club directory. It powers:

- The directory grid, `⌘K` search, and category filters (Technical / Cultural / Sports / Social)
- Individual club detail pages
- The "Club of the Month" spotlight
- The "12+ Active Clubs / 4 Categories / 500+ Students" stats banner
- The "Suggest a Club" form, including validation and an admin view of submissions

Built with **Node.js + Express** and a dependency-free JSON-file data store — no database setup required, and no native modules to compile. Swap `src/db.js` for a real database later without touching the routes.

### Getting started

```bash
npm install
cp .env.example .env   # then edit .env as needed
npm start               # or: npm run dev (auto-restarts on changes)
```

The API runs on `http://localhost:4000` by default.

### Configuration (`.env`)

| Variable        | Description                                                              |
|------------------|---------------------------------------------------------------------------|
| `PORT`           | Port the server listens on (default `4000`)                              |
| `CORS_ORIGINS`   | Comma-separated origins allowed to call the API. The example includes GitHub Pages and the local preview origins (`localhost` and `127.0.0.1` on port 8000). |
| `ADMIN_API_KEY`  | Shared secret required (via `x-api-key` header) to view/delete suggestions |

### API reference

#### Clubs

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

#### Suggestions

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

#### Health check

```bash
curl http://localhost:4000/api/health
```

### Project structure

```
backend/
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

### Frontend connection

The frontend in `frontend/` calls the deployed API configured in `frontend/api.js`. Keep the API's `CORS_ORIGINS` setting aligned with the origins that serve the frontend. The current Render configuration allows `https://rootedrock.github.io`, `http://localhost:8000`, and `http://127.0.0.1:8000`. The example values are documented in `backend/.env.example`; update the Render service settings when the allowed origins change.

### Notes on the JSON-file store

Writes (new suggestions) are synchronous file writes, which is fine for a small class project or low-traffic directory but isn't safe under heavy concurrent write load. If you outgrow it, replace `src/db.js` with a real database (PostgreSQL, MongoDB, etc.) without changing any route handlers.
