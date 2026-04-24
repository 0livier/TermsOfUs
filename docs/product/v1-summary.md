# TermsOfUs V1 Summary

Build a multilingual, backend-free React app for relationship reflection.

V1 must:
- load versioned content from JSON
- support English and French
- let users assign one state per item: none, want, avoid, have
- encode the full selection in the URL
- restore selection from URL
- support desktop and mobile views using the same data
- be accessible and not rely on color alone

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
- path-based locale routing preferred
- base64url compact selection encoding
- SVG desktop view
- DOM mobile view
- Vitest for domain tests
