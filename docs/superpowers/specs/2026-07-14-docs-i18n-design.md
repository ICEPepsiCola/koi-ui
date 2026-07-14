# Docs i18n design (2026-07-14)

## Goals

- Single source of truth for copy under `i18n/` (semantic English keys, never Chinese keys).
- Page-scoped files: `i18n/common.json` + `i18n/pages/<page-id>.json`.
- Rspress dual locales: default `en`, `zh` under `/zh`, `localeRedirect: 'auto'`, language switcher.
- Build generates `docs/en/**` and `docs/zh/**` from i18n + shared demos (`pnpm docs:generate`).

## Key conventions

- Flattened Rspress `i18n.json` keys: `common.nav.guide`, `pages.components.button.title`, `pages.components.button.demos.variants`.
- Component demos use English `key`s; titles resolve from page i18n.
- README is English-only community docs (separate from site i18n).
