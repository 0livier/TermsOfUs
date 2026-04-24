# Ticket 012 - GitHub Pages deploy

## Goal

Build and publish the static app automatically on pushes to `main`.

## Read first

- AGENTS.md
- README.md
- docs/decisions.md
- vite.config.ts

## Scope

Implement:

- GitHub Actions workflow for test, build, and deploy
- Vite base path handling for GitHub Pages project sites
- README deployment notes
- deployment decision note

## Out of scope

- custom domain setup
- preview deployments for pull requests
- backend hosting

## Acceptance criteria

- Pushes to `main` run tests and build in GitHub Actions.
- Successful `main` builds deploy the `dist/` output to GitHub Pages.
- The built app works when hosted at either `/` or `/<repo>/`.
- README explains the deployment flow and any required GitHub setting.
