# Decisions

## V1 decisions

- Use Vite + React + TypeScript.
- Use no backend.
- Use JSON files for schema and locales.
- Store V1 content under `src/content/` as `schema.v1.json` plus `locales/en.json` and `locales/fr.json`.
- Resolve unsupported locales to English, and fall back missing category/item labels to English before falling back to the stable ID.
- Use stable category and item IDs.
- Give every item a permanent positive integer code for compact machine encoding; item codes must never be recycled.
- Keep string item IDs even when item codes exist because they are easier for humans, tests, translations, and LLM-assisted maintenance.
- Use a versioned schema.
- Use canonical item order from schema order.
- Use `lang` as an optional query parameter for locale; omit it for the default English locale.
- Store the sparse encoded selection payload in the URL hash.
- Preserve the current hosting base path when writing URL state so GitHub Pages project paths keep working.
- Update selection URLs with `history.replaceState` so selection changes do not add browser-history noise.
- Omit the hash payload when the current selection is empty.
- Encode item states using 2 bits per item:
  - 00 = none
  - 01 = want
  - 10 = avoid
  - 11 = have
- Encode packed bytes as base64url.
- Encode sparse selected item/state pairs in item-code order with a URL-safe base62 alphabet.
- Use React component state for the V1 shared shell until the app has enough cross-view complexity to justify a separate state library.
- Use SVG for desktop visual map.
- Use DOM cards/chips for mobile.
- Do not use D3 in V1.
- Do not add analytics in V1.
- Deploy the static build to GitHub Pages from GitHub Actions on pushes to `main`.
