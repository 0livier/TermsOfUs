
# Ticket 005 - Palette and item components

## Goal

Build reusable UI components for state selection and item interaction.

## Read first

- AGENTS.md

- docs/product/v1-summary.md

- docs/product/spec-v1.md sections 7.2, 9.1, 9.4, 10, 16.2, 20

- docs/architecture/decisions.md

## Scope

Implement:

- Palette component

- Item/chip component

- state visuals for none, want, avoid, have

- click/tap behavior

- accessible labels

## Out of scope

- Full desktop map

- Full mobile accordion

- animations

## Acceptance criteria

- Active palette state is visible.

- Applying the same active state twice resets item to none.

- State is not communicated by color alone.

- Components support keyboard activation.

- Components have meaningful accessible labels.

