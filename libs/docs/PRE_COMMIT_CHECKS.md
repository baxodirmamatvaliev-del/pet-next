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

## Full frontend review — 2026-10-18

Scope: `pet-next` source, dependencies/import reachability, static local asset references, tests, production build and generated routes. The sibling backend was not modified during this review.

### Cleanup

- Collapsed identical mobile/desktop render branches in `LayoutBasic`, `LayoutHome` and `LayoutFull`; the wrapper ID still follows the device breakpoint. Removed about 80 net lines of duplicated layout code.
- Removed the superseded, unreferenced `public/icons/kakao-login-official.png`. The requested TALK and multicolor Gmail icons remain.
- Removed three unused keys from each of the four translation dictionaries (12 entries), left over from the replaced login side panel.
- Strengthened the existing layout regression test to cover desktop → mobile → desktop wrapper changes and exactly one chat instance in each layout.
- All application source modules remain reachable from pages/configuration. Emotion, React DOM and Sass are framework/build dependencies, so absence of direct imports is not evidence they can be removed.

### Final validation

- `yarn lint`: passed, no lint warnings/errors.
- `yarn typecheck`: passed, including unused locals/parameters.
- `yarn test`: 23 passed (12 auth, 7 chat/layout, 1 viewport, 3 i18n).
- `yarn build`: passed with explicit localhost API build variables; 108 localized static pages generated.
- Production standalone server: HTTP smoke checks passed for all 108 generated localized routes, including the expected 404 responses.
- Real Chrome check on `/account/join`: 1440 → 390 → 1440 pixels; correct desktop/mobile wrappers, no horizontal overflow, form value preserved. Login box measured 560px on desktop, 358px on mobile.
- Signup displays the additional phone input; the social preview notice works. Video rate stays 0.5, native controls stay hidden, and reduced-motion preference pauses the video. No uncaught browser exceptions during these checks.
- Static local asset references checked: no missing literal references. Runtime/dynamic backend-provided asset paths are outside this check.
- `git diff --check`: passed.

### Limits

Backend port 3002 refused connections during this review. Live credentials, refresh-cookie issuance, orders/checkout, uploads, admin permissions and notification/chat delivery were not verified against a running API. Automated auth/chat tests use controlled mocks. KakaoTalk and Email remain intentional UI previews, not working provider login. No production deployment, dependency upgrade or commit was performed.
