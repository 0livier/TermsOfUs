
# Ticket 008 - i18n integration

## Goal

Localize UI and content cleanly.

## Read first

- AGENTS.md

- docs/product/v1-summary.md

- docs/product/spec-v1.md sections 8, 16.3, 17, 20

- docs/architecture/decisions.md

## Scope

Implement:

- UI string localization

- content localization

- language selector behavior

- default locale fallback

- missing translation handling in development

## Out of scope

- Adding more than English and French unless trivial

- translator workflow

- server-side routing

## Acceptance criteria

- UI text is localized.

- Content labels are localized.

- Switching locale preserves selection and schema version.

- Missing translations fall back safely.

- Locale is reflected in the URL.

