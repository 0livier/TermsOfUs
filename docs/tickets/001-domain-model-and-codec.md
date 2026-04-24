
# Ticket 001 - Domain model and selection codec

## Goal

Create the domain foundation.

## Read first

- AGENTS.md

- docs/product/v1-summary.md

- docs/product/spec-v1.md sections 6, 11, 12, 13, 16, 20

- docs/architecture/decisions.md

## Scope

Implement:

- TypeScript domain types

- schema loading types

- item flattening in canonical order

- selection state model

- selection encoder

- selection decoder

- summary counts

## Out of scope

- UI

- routing

- i18n rendering

- desktop SVG

- mobile layout

- comparison mode

## Acceptance criteria

- Types exist for schema, category, item, locale, item state, and selection state.

- A function returns canonical flattened item order.

- Encoder converts a selection into base64url.

- Decoder restores a selection from base64url.

- Invalid payloads fail safely.

- Unit tests cover empty selection, state roundtrip, malformed payload, and payload length mismatch.

