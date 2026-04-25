
# Ticket 009 - Accessibility pass

## Status

Needs verification against the current category-card UI. Do not assume the older palette/mobile/SVG acceptance criteria are complete for the current app.

## Goal

Make V1 accessible enough to ship.

## Read first

- AGENTS.md

- docs/product/v1-summary.md

- docs/product/spec-v1.md sections 10, 20

- docs/decisions.md

## Scope

Implement or verify:

- keyboard navigation

- visible focus states

- screen reader labels

- non-color-only state communication

- readable contrast

- mobile touch targets

## Out of scope

- Full external accessibility audit

- advanced ARIA patterns unless needed

## Acceptance criteria

- Palette is keyboard usable.

- Items are keyboard usable.

- Focus state is visible.

- Screen reader labels include item label and current state.

- State is distinguishable without color.
