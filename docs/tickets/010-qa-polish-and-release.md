
# Ticket 010 - QA polish and release readiness

## Goal

Prepare V1 for release.

## Read first

- AGENTS.md

- docs/product/v1-summary.md

- docs/product/spec-v1.md sections 17, 18, 20, 21

- docs/architecture/decisions.md

## Scope

Implement:

- invalid URL handling polish

- empty state polish

- privacy/share notice

- README update

- basic manual QA checklist

## Out of scope

- analytics

- backend

- accounts

- comparison mode

## Acceptance criteria

- Malformed URLs do not break the app.

- Reset flow works.

- Copy-link flow works.

- Privacy note explains that links contain selections.

- README explains how to run, test, and build.

- `npm test` and `npm run build` pass.

