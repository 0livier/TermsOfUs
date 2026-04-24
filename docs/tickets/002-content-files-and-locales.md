
# Ticket 002 - Content schema and locale files

## Goal

Add initial versioned content files.

## Read first

- AGENTS.md

- docs/product/v1-summary.md

- docs/product/spec-v1.md sections 7, 8, 11, 12, 20

- docs/architecture/decisions.md

## Scope

Implement:

- schema.v1.json

- locales/en.json

- locales/fr.json

- basic content loader

- translation fallback behavior

## Out of scope

- Full original PDF transcription

- UI rendering

- admin editing

- dynamic remote loading

## Acceptance criteria

- Content uses stable category and item IDs.

- English and French labels exist.

- Missing translation falls back to default locale.

- Missing translations do not crash the app.

- Tests cover locale resolution and fallback.

