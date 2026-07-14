# AGENTS.md

You are an expert in JavaScript, Rspack, Rsbuild, Rslib, and library development. You write maintainable, performant, and accessible code.

## Commands

- `pnpm build` - Build the library for production
- `pnpm dev` - Turn on watch mode, watch for changes and rebuild the library
- `pnpm lint` - Run ESLint + Oxlint (required after code changes)
- `pnpm typecheck` - Run TypeScript 6 type checking (required after code changes)
- `pnpm test` - Run tests (all components must have smoke tests)
- `pnpm test:coverage` - Run tests with Istanbul coverage reports (`coverage/` in each package)
- `pnpm tests:generate` - Regenerate component smoke tests after adding components
- `pnpm check` - Full CI: lint → typecheck → test → build → doc:build
- `pnpm push:check` - Pre-push gate: lint → typecheck → test → build
- `pnpm release` - semantic-release（CI：push `main` 自动；也可 Actions 手动触发）
- 手动发版：Actions → **Release** → bump 选 `auto` / `patch` / `minor` / `major`（与自动同一套流程，手动仅多强制 bump 级别）
- `pnpm docs:generate` - 从 `i18n/` + demos 生成 `docs/en`、`docs/zh`（文案源在 `i18n/common.json` 与 `i18n/pages/*.json`，英文语义 key，按页面分文件）
- Commit messages must follow Conventional Commits (enforced by husky + commitlint). Release mapping: `feat`→minor, `fix`/`perf`→patch, `BREAKING CHANGE`/`!`→major; `docs`/`chore`/`ci`/`test`/`refactor` 默认不发版。
- Docs site: default `en`, `localeRedirect: 'auto'`, navbar language switch; do not hand-edit generated `docs/en/**` / `docs/zh/**`.

## Quality requirements

1. **Always run `pnpm lint` and `pnpm typecheck`** after modifying code.
2. **Every new component must have a test case** — add an entry to `scripts/generate-tests.mjs`, then run `pnpm tests:generate`.
3. Prefer behavior tests in `packages/core/tests/index.test.tsx` for adaptive/core logic.

## Docs

- Rslib: https://rslib.rs/llms.txt
- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- Rstest: https://rstest.rs/llms.txt
- Rspress: https://rspress.rs/llms.txt

## Tools

### Rspress

- Run `pnpm doc` to start the Rspress documentation dev server at http://localhost:8877
- Run `pnpm doc:preview` to preview the production build at http://localhost:8878
- Run `pnpm doc:build` to build the documentation
