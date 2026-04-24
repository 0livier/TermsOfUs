
# Ticket 007 - Desktop SVG visual map

## Goal

Create the desktop visual bubble map.

## Read first

- AGENTS.md

- docs/product/v1-summary.md

- docs/product/spec-v1.md sections 7.3, 9.2, 9.4, 14.2, 14.4, 20

- docs/architecture/decisions.md

## Scope

Implement:

- SVG desktop renderer

- category bubble grouping

- item rendering inside groups

- responsive SVG sizing

- selection interaction inside SVG

## Out of scope

- D3

- force-directed layout

- advanced animations

- comparison overlays

## Acceptance criteria

- Desktop view shows category-level bubbles.

- Items are directly selectable.

- SVG view uses shared selection state.

- Layout remains usable across common desktop widths.

- No D3 dependency is introduced.

