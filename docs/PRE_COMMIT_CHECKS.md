# Frontend checks — 2026-10-15

## Passed

- `yarn lint`: no errors or warnings.
- `yarn typecheck`: includes unused local and parameter checks.
- `yarn test`: 20 tests (12 auth, 5 chat, 3 i18n).
- Production build with explicit local API build variables: 108 localized pages generated.
- HTTP smoke check of all 108 localized build routes: expected page/error status and Next.js HTML returned.
- Local image references: no missing referenced files found.
- Import graph review: all application source modules remain reachable from pages/configuration.
- `git diff --check`: passed.

## Cleanup

Removed the unused numeral dependency and lock entry, nine unused React imports, three unused TypeScript input interfaces, an unused auth re-export, five starter SVGs and duplicate chat CSS declarations. Replaced the scaffold README with project setup and validation instructions. Emotion, Sass, React DOM, Apollo and both socket transports are required and retained.

Chat regression tests cover session readiness, token encoding and identity changes, history and broadcasts, malformed payloads, trimmed sending, retry and cleanup. Reconnection now resets the send state, and malformed avatar metadata is ignored.

## Limits

Production build validation used localhost API URLs; deployment must supply its public URLs. HTTP smoke checks verify rendering and routing, not authenticated backend operations. Live login, order/payment mutations, uploads, notifications and chat delivery require the running backend and were not tested end to end. The local backend at port 3002 refused connections during chat validation. No commit was created.
