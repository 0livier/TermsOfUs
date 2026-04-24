# Decisions

## V1 decisions

- Use Vite + React + TypeScript.
- Use no backend.
- Use JSON files for schema and locales.
- Use stable category and item IDs.
- Use a versioned schema.
- Use canonical item order from schema order.
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
