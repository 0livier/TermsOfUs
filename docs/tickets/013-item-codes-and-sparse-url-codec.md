# Ticket 013 - Item codes and sparse URL codec

## Goal

Add permanent compact item codes for evolvable URL encoding.

## Read first

- AGENTS.md
- docs/product/v1-summary.md
- docs/product/spec-v1.md sections 11, 13, 16, 20
- docs/decisions.md

## Scope

Implement:

- permanent numeric item codes alongside string item IDs
- schema validation helpers for item code lookup
- sparse URL selection encoder using only selected items
- sparse URL selection decoder
- URL state parsing with optional `lang` query parameter and hash payload
- decision documentation

## Out of scope

- removing string item IDs
- changing UI behavior
- multi-schema loading

## Acceptance criteria

- Every schema item has a unique positive integer code.
- Item IDs remain present and stable for humans, code, and locale dictionaries.
- Sparse encoding omits `none` items.
- Sparse decoding restores selected `want`, `avoid`, and `have` states by item code.
- Invalid sparse payloads fail safely.
- URL state uses `/?lang=fr#encodedPayload`, with `lang` omitted for the default locale.
