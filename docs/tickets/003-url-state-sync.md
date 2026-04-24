
# Ticket 003 - URL state sync

## Goal

Persist and restore selection state from the URL.

## Read first

- AGENTS.md

- docs/product/v1-summary.md

- docs/product/spec-v1.md sections 8, 13, 16, 17, 20

- docs/architecture/decisions.md

## Scope

Implement:

- locale parsing from path

- schema version parsing from query params

- selection payload parsing from query params

- URL update when selection changes

- safe handling for invalid URLs

## Out of scope

- UI polish

- copy link button

- comparison params

## Acceptance criteria

- `/fr?v=1&s=...` restores locale, version, and selection.

- Selection changes update the URL without full page reload.

- Invalid payloads fall back safely.

- Unknown locale falls back safely.

- Tests cover valid and invalid URL parsing.

