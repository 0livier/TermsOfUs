# TermsOfUs

TermsOfUs is a privacy-first web app for helping people express relationship expectations and boundaries in a structured way.

The project goal for V1 is a local-first, multilingual app where a person can mark items as `have`, `want`, `avoid`, or unanswered, keep that data in the browser, and share or restore a selection through a compact URL payload.

## Project status

This repository is still in active development. The product direction and domain model are documented, and the repo already includes domain encoding tests, but the main UI is not fully implemented yet.

Useful project docs:

- [docs/spec.md](docs/spec.md)
- [docs/product/v1-summary.md](docs/product/v1-summary.md)
- [docs/decisions.md](docs/decisions.md)

## Stack

- React 19
- TypeScript
- Vite
- ESLint
- Node built-in test runner for current domain tests

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
- `npm test` compiles the domain test target to a temporary directory and runs it with Node's test runner.
- The app is designed to stay backend-free in V1.

## Repository layout

```text
docs/                  Product notes, decisions, and tickets
public/                Static assets
scripts/               Project scripts, including test helpers
src/                   Application source
src/domain/            Domain model and tests
```
