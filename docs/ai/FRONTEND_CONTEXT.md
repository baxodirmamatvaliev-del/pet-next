# PetNest Frontend Context

Source observations verified on 2026-11-24. [AGENTS.md](../../AGENTS.md) owns permanent rules. Existing historical guides are preserved and are not current test results.

## Tooling and versions

[package.json](../../package.json), [yarn.lock](../../yarn.lock) and [package-lock.json](../../package-lock.json) exist. Yarn is the documented/Docker workflow; the lockfile is classic format. npm's lockfile is version 3. No root `engines` or `packageManager` field is declared. Preserve both locks pending authorized cleanup; their coexistence is a drift risk, not permission to switch managers.

Installed metadata read during the analysis/bootstrap:

| Package | Installed version |
| --- | --- |
| Next.js | 16.3.8 |
| React / React DOM | 19.2.8 |
| TypeScript | 5.9.3 |
| Apollo Client / GraphQL | 3.13.8 / 16.11.0 |
| MUI Material / Icons | 7.3.1 |
| Emotion React / Styled | 11.14.0 / 11.14.1 |
| Sass | 1.92.1 |
| apollo-upload-client | 18.0.1 |
| Axios | 1.20.0 |
| jwt-decode | 4.0.0 |
| socket.io-client | 4.8.1 |
| SweetAlert2 | 11.22.4 |
| falling-leaves | 0.1.0 |
| ESLint / eslint-config-next | 9.39.5 / 16.3.8 |

These are observations, not upgrade instructions. Recheck installed package metadata before version-sensitive work. Docker uses Node 22 Alpine; no installed Yarn executable version is asserted.

## Commands and verification limits

| Command | Actual behaviour |
| --- | --- |
| `yarn install --frozen-lockfile` | Dependency installation used by Docker; run only when authorized |
| `yarn dev` | `next dev --webpack`; starts a server |
| `yarn typecheck` | `tsc --noEmit --noUnusedLocals --noUnusedParameters`; incremental config can write metadata |
| `yarn lint` | ESLint flat configuration |
| `yarn test` | Node test runner over `tests/*.test.mjs` |
| `yarn test:auth` / `yarn test:i18n` | Focused Node suites |
| `yarn build` | `next build --webpack`; writes generated output |
| `yarn start` | Copies public/static assets into standalone output and starts its server |

There are 25 test cases in five files: [auth](../../tests/auth.test.mjs) 12, [chat/layout](../../tests/chat.test.mjs) 7, [device](../../tests/device.test.mjs) 1, [i18n](../../tests/i18n.test.mjs) 3 and [SEO](../../tests/seo.test.mjs) 2. Controlled VM/hooks/HTTP/socket mocks are used. They are not real browser/backend integration tests.

No repository Playwright configuration, test dependency or browser-test script was found. Use available authorized browser tools; do not automatically install a new test stack. Existing coverage does not establish checkout/payment, notifications, uploads or backend transaction reliability. Historical build/test/browser passes in [PRE_COMMIT_CHECKS.md](../../libs/docs/PRE_COMMIT_CHECKS.md) and [INTEGRATION_AUDIT.md](../../libs/docs/INTEGRATION_AUDIT.md) are not fresh results.

## Environment and deployment facts

[Configuration](../../libs/config.ts) consumes `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_GRAPHQL_URL` and `NEXT_PUBLIC_API_SOCKET_URL`. Development API fallback is localhost:3002; GraphQL derives `/graphql`, Socket.IO derives the origin and raw chat converts HTTP(S) to WS(S). Production requires a nonempty base URL. Public URL format/HTTPS is not comprehensively validated there.

Frontend development defaults to port 3000; no live listener was checked. Backend is the sibling `/Users/user/Desktop/pet-nest`; its rules use npm, not frontend Yarn. Report variable names and safe configuration facts, never secrets or backup contents.

[Dockerfile](../../Dockerfile) installs/builds with Yarn, passes public API build arguments, and runs standalone output as a non-root user on 3000 with a health check. [Compose](../../compose.prod.yml) runs frontend/backend/Caddy, persists uploads and Caddy state, and does not define MongoDB or the batch app. [Caddy](../../deploy/Caddyfile) routes the storefront to 3000 and API to 3002. Configuration does not prove the hosting state. Public browser settings require a rebuild to change existing bundles. Build-context risks are tracked in [SECURITY_RULES.md](SECURITY_RULES.md#deployment-and-secrets).

## Feature status

| Feature | Status from source |
| --- | --- |
| Storefront, pet/product listings, variants, filters, likes/reviews, follows and profiles | Implemented UI/GraphQL paths |
| Cart, delivery/order creation, cancellation and admin status controls | Implemented paths; backend remains authoritative |
| Nickname/password auth and rotating refresh compatibility | Implemented; known recovery limits remain |
| Public desktop/mobile guest chat and private notifications | Implemented separate transports |
| Four locales and light/dark themes | Implemented with documented localization limits |
| Liquid Glass interactive test card, water/3D/glass effects | Implemented visual demo, not external payment collection |
| Internal payment record and admin confirmation | Implemented, not an external charge |
| Kakao/email login | UI placeholders plus historical implementation/setup proposals |
| Google/Apple/other provider auth, real card/Kakao charge, refunds/webhooks | No implementation found; no approved integration inferred |
| SSR product data, sitemap/structured data, browser checkout regression suite | Not found in the inspected implementation |

Use [API_CONTRACTS.md](API_CONTRACTS.md), [UI_UX_RULES.md](UI_UX_RULES.md) and [SECURITY_RULES.md](SECURITY_RULES.md) for source evidence. A capability's absence is not an approved plan to implement it.

## Documentation conflicts

| Existing reference | Verified current interpretation |
| --- | --- |
| `/Users/user/Desktop/AGENTS.md` | Petoria migration/port 3007 assumptions do not describe this frontend. The explicit user rules and backend-local instructions establish PetNest boundaries. Referenced sibling `petoria/docs/ai` was not found at the inspected path. |
| [README links](../../README.md) | Links use `docs/REFRESH_TOKENS.md`, `docs/APPEARANCE_AND_LANGUAGES.md` and `docs/LIVE_CHAT.md`; actual existing files are in `libs/docs/`. Use the valid links below without rewriting README in this task. |
| [LIVE_CHAT.md](../../libs/docs/LIVE_CHAT.md) | Says mobile chat is absent; StorefrontLayout and chat/layout tests include it on mobile and desktop. Admin remains separate. |
| [APPEARANCE_AND_LANGUAGES.md](../../libs/docs/APPEARANCE_AND_LANGUAGES.md) | Older green-brand/system-default descriptions differ from current warm orange tokens and explicit `defaultMode="light"` in App/Document. Saved preference still applies. |
| [INTEGRATION_AUDIT.md](../../libs/docs/INTEGRATION_AUDIT.md) | Historical audit predates Liquid Glass/falling leaves and current ESLint exclusions; its tests/schema validation claims were not rerun here. Social buttons currently have no auth handler and display a coming-soon notice, rather than the old notice-click handler. |
| [SOCIAL_AUTH_AUDIT.md](../../libs/docs/SOCIAL_AUTH_AUDIT.md) and [setup](../../libs/docs/SOCIAL_AUTH_SETUP.md) | Plans/setup do not implement providers. The older statement that backend `docs/ai` is absent is now historical; backend docs exist. |
| Docker exclusion policy | Recovery/tooling exclusions are required but not fully implemented in `.dockerignore`; no fix is claimed. |
| Documentation bootstrap restriction | Documentation-only scope applies to the recorded bootstrap task, not a permanent ban on future authorized implementation. |

For current auth reference, use [libs/docs/REFRESH_TOKENS.md](../../libs/docs/REFRESH_TOKENS.md). Preserve existing documents and record discrepancies; source behaviour is the factual reference.
