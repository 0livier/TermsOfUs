# Agent instructions

## Project
TermsOfUs is a privacy-first web app to help people express and compare relationship expectations.

## Rules
- Keep the codebase simple
- Prefer boring, maintainable choices
- No multi-agent architecture
- No telemetry by default
- No network calls unless explicitly required
- Explain non-trivial decisions in docs/decisions.md

## Done means
- Code builds
- Tests pass
- README or docs updated when behavior changes

## Working style

- Never implement the entire product spec at once.
- Always work from one ticket in docs/tickets/.
- If no ticket is provided, create a proposed ticket list first.
- Keep each change small enough to review.
- Do not introduce new libraries unless the ticket explicitly requires them.
