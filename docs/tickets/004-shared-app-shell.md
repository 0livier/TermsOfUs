
# Ticket 004 - Shared app shell and state

## Goal

Create the shared application shell used by all views.

## Read first

- AGENTS.md

- docs/product/v1-summary.md

- docs/product/spec-v1.md sections 7, 8, 9, 16, 20

- docs/architecture/decisions.md

## Scope

Implement:

- app layout

- shared selection state

- active palette state

- summary counts display

- reset action

- copy-link action

- language selector

## Out of scope

- Final desktop SVG layout

- Final mobile layout polish

- comparison mode

## Acceptance criteria

- User can choose active state.

- User can reset selections.

- User can copy current URL.

- User can switch language without losing selections.

- Summary counts update from shared state.

