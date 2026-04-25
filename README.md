# TermsOfUs

TermsOfUs is a privacy-first web app for helping people express relationship expectations and boundaries in a structured way.

The current V1 is a local-first, multilingual React app where a person can mark relationship items as `present`, `important`, `discuss`, `no`, or unanswered, then share or restore that selection through a compact URL payload.

## Project status

The code is the source of truth for current behavior. The app currently includes:

- 19 content categories and 101 items in `src/content/schema.v1.json`
- English and French locale files with localized UI and content labels
- URL state using an optional `lang` query parameter and sparse `s1` hash payload
- a single-page React interface with an intro, localized state legend, expandable category cards, per-item state buttons, copy-link, clear-all confirmation, and invalid-link fallback notice
- unused Sunburst components kept in `src/sunburst/` for possible future visual map work
- unit tests run through Node's built-in test runner after TypeScript test compilation

Useful project docs:

- [docs/spec.md](docs/spec.md)
- [docs/product/v1-summary.md](docs/product/v1-summary.md)
- [docs/decisions.md](docs/decisions.md)
- [docs/tickets/README.md](docs/tickets/README.md)

## Stack

- React 19
- TypeScript
- Vite
- ESLint
- Node built-in test runner for current tests

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173`.

## Available scripts

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Run the current domain tests:

```bash
npm test
```

Preview the production build locally:

```bash
npm run preview
```

## Build notes

- `npm run build` runs TypeScript compilation and then creates the Vite production bundle.
- `npm test` compiles the local test target to a temporary directory and runs it with Node's test runner.
- The app is designed to stay backend-free in V1.
- The Vite base path is derived from `GITHUB_REPOSITORY` during CI builds so the app works on GitHub Pages project sites.

## Deployment

This repository includes a GitHub Actions workflow that builds and deploys the app to GitHub Pages on every push to `main`.

Before the first deployment, enable GitHub Pages in the repository settings and set the source to `GitHub Actions`.

The workflow does the following:

- installs dependencies with `npm ci`
- runs `npm test`
- runs `npm run build`
- publishes `dist/` to GitHub Pages

## Repository layout

```text
docs/                  Product notes, decisions, and tickets
public/                Static assets
scripts/               Project scripts, including test helpers
src/                   Application source
src/content/           Versioned schema, locale files, and content loader
src/domain/            Domain model and tests
src/routing/           URL parse/build/replace helpers
src/sunburst/          Optional visual map components not wired into the main app
```
