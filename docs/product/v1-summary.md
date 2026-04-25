# TermsOfUs V1 Summary

This summary is aligned to the current code. Product intent can evolve in `docs/product/spec-v1.md`, but implemented behavior is verified from `src/`.

Build a multilingual, backend-free React app for relationship reflection.

Current V1 behavior:
- loads versioned content from JSON
- supports English and French
- lets users assign one state per item: none, present, important, discuss, no
- encodes selected items in the URL hash with an `s1` sparse base62 payload
- restores selection from versioned URL payloads
- uses expandable category cards as the primary interface
- includes localized UI strings, item labels, category labels, and fallback copy
- avoids backend storage, accounts, analytics, and default network calls

V1 must not include:
- backend
- accounts
- comparison mode
- compatibility score
- PDF export
- admin UI
- real-time collaboration

Technical decisions:
- React + TypeScript + Vite
- content stored as schema + locale JSON files
- optional `lang` query parameter for locale
- sparse `s1` hash payload for selected items
- base62 compact selection encoding with permanent item codes
- Node built-in test runner for local tests
- GitHub Pages deployment from GitHub Actions on pushes to `main`

Current known gaps:
- the main app does not show summary counts
- the main app does not use the older `src/sunburst/` visual map components
- search/filter UI is not implemented
