# Decisions

## V1 decisions

- Use Vite + React + TypeScript.
- Use no backend.
- Use JSON files for schema and locales.
- Store V1 content under `src/content/` as `schema.v1.json` plus `locales/en.json` and `locales/fr.json`.
- Resolve unsupported locales to English, and fall back missing category/item labels to English before falling back to the stable ID.
- Use stable category and item IDs.
- Use a versioned schema.
- Use canonical item order from schema order.
- Use path-based locale URLs with `v` for schema version and `s` for encoded selection state.
- Update selection URLs with `history.replaceState` so selection changes do not add browser-history noise.
- Omit `s` from the URL when the current selection is empty.
- Encode item states using 2 bits per item:
  - 00 = none
  - 01 = want
  - 10 = avoid
  - 11 = have
- Encode packed bytes as base64url.
- Use SVG for desktop visual map.
- Use DOM cards/chips for mobile.
- Do not use D3 in V1.
- Do not add analytics in V1.
- Deploy the static build to GitHub Pages from GitHub Actions on pushes to `main`.
