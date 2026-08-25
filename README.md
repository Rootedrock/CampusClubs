# CampusClubs

A student club directory that lets new students browse, search, and filter campus clubs in one place instead of relying on word of mouth.

**Live site:** https://rootedrock.github.io/CampusClubs/

## Features

- **Club directory** — 8 clubs across 4 categories (Technical, Cultural, Sports, Social), each with a name, description, and meeting day/time.
- **Category filter** — instantly show/hide clubs by category, with a "no clubs found" state when nothing matches.
- **Live search** — filters cards by name as you type, and works together with the active category filter rather than overriding it.
- **FAQ accordion** — expandable/collapsible answers to 5 common questions, one open at a time.
- **Suggest a Club form** — client-side validation (required club name, email format check) with inline error messages and a success confirmation screen — no `alert()` popups.
- **Club Spotlight** — a static "Club of the Month" highlight section.
- **Theme toggle** — switches between light and dark mode, saved to `localStorage` so it persists across page reloads.
- **Mobile navigation** — the nav collapses behind a hamburger menu below 768px.
- **Responsive layout** — tested from 320px phones up to large desktop screens.

## Tech stack

- HTML5, CSS3, vanilla JavaScript — no frameworks or build tools.
- [Lucide](https://lucide.dev/) for icons, loaded via CDN.
- [Inter](https://fonts.google.com/specimen/Inter) font, loaded via Google Fonts.
- Hosted on GitHub Pages.

## File structure

```
CampusClubs/
├── index.html   # Page structure and content (all club data is hardcoded here)
├── style.css    # All styling, including light/dark theme variables and responsive breakpoints
├── script.js    # Theme toggle, mobile nav, filtering/search, FAQ accordion, form validation
├── logo.png     # Site logo, used in the navbar and footer
└── README.md
```

## Running locally

No build step needed — clone the repo and open `index.html` directly in a browser, or serve it with any static server, e.g.:

```bash
npx serve .
```

## Implementation notes

- **Filtering & search** work off `data-category` and `data-name` attributes on each `.club-card`. A single `filterClubs()` function re-evaluates all cards against both the active category and the current search term on every keystroke or filter click, so the two features never fight each other.
- **Theme toggle** sets `body.className` to `light-theme` or `dark-theme`, with CSS custom properties (`:root` vs `.light-theme`) driving the actual color values. The chosen theme is saved to `localStorage` and re-applied on page load — this is the only place `localStorage` is used in the project.
- **FAQ accordion** toggles an `active` class on the parent `.faq-item` (not the button itself), which both rotates the chevron icon and animates `max-height` on the answer via CSS transition.
- **Form validation** checks that the club name isn't empty and that the email matches a basic `name@domain.tld` pattern, showing inline `<small class="error">` messages next to each field instead of using `alert()`. On success, the form is hidden and a confirmation message takes its place; "Submit another" resets and swaps back.
