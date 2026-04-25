# TermsOfUs spec

This short spec describes the current codebase. If this document disagrees with the implementation, update this document or the relevant ticket after reading the code.

## Goal
Help people clarify relationship expectations and boundaries using a structured grid.

## Core concepts
A user can mark each item as:
- Already present
- Important to me
- To discuss
- Not for me
- Not relevant / unanswered

## Current V1 behavior
- Load 19 categories and 101 items from versioned JSON content.
- Render English and French labels from locale dictionaries.
- Let users answer items through expandable category cards and per-state buttons.
- Persist selected answers in the URL hash using the sparse `s1` codec.
- Use `lang` in the query string for the selected locale, omitting it for English.
- Copy the current URL and clear all answers from the header menu.
- Fall back safely when a shared URL cannot be decoded.
- Keep all data local unless the user shares a link.

## Constraints
- Multilingual from the start: English and French
- Privacy-first
- Local-first by default
- Simple UI
- No backend, accounts, telemetry, or default network calls
