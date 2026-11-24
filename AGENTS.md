<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — PetNest Frontend

Scope: `/Users/user/Desktop/pet-next` and its descendants. Explicit task restrictions take precedence. Do not inherit unrelated Petoria migration assumptions or backend port 3007. Keep frontend and backend responsibilities separate.

## 1. General Rules

- Analyze before editing; preserve the existing architecture, conventions, GraphQL/Apollo integration and user changes.
- Make small, incremental improvements to functionality and UI/UX. Do not rewrite the application or remove working functionality unless safely replaced.
- Reuse existing components and utilities. Avoid unnecessary dependencies, integrations, architectural layers and unrelated changes.
- Do not edit generated files, `node_modules` or `.next` output. Do not commit, push or deploy without permission.

## 2. Documentation

Read the relevant [README](README.md), [deployment guide](DEPLOYMENT.md), [stylesheet guide](scss/README.md) and documents in [libs/docs](libs/docs). Read the [backend instructions](../pet-nest/AGENTS.md) when integration contracts are affected.

Maintain focused supporting references:

- [ARCHITECTURE.md](docs/ai/ARCHITECTURE.md): folders, routing, layouts and data flow.
- [FRONTEND_CONTEXT.md](docs/ai/FRONTEND_CONTEXT.md): tooling, versions, feature status and documentation conflicts.
- [API_CONTRACTS.md](docs/ai/API_CONTRACTS.md): GraphQL, auth, uploads, chat and notifications.
- [UI_UX_RULES.md](docs/ai/UI_UX_RULES.md): design, animation, responsive, localization and accessibility guidance.
- [SECURITY_RULES.md](docs/ai/SECURITY_RULES.md): security boundaries and known risks.
- [DECISIONS.md](docs/ai/DECISIONS.md): observed architecture and authorized decisions.
- [COMPLETED_TASKS.md](docs/ai/COMPLETED_TASKS.md): completed changes and actual verification.

Document verified facts only. Distinguish implementation, incomplete integrations, historical plans and known risks. Record conflicts and use verified source behaviour as the factual reference. Preserve existing guides; link details rather than duplicating them. Preserve the managed Next.js block above and `CLAUDE.md`'s existing reference.

## 3. Project Architecture

Preserve Next.js 16, React 19, TypeScript, **Pages Router**, Apollo Client/GraphQL, MUI/Emotion, SCSS, native WebSocket and Socket.IO Client.

Keep existing boundaries: `pages/` routes/page logic; `libs/components/` shared/domain UI; `libs/auth/` sessions; `libs/hooks/` hooks; `libs/i18n/` translations; `libs/theme/` tokens; `libs/types/` and `libs/enums/` contracts; `apollo/` operations/client/reactive state; `scss/` styles; `public/` assets; `tests/` regression tests.

Preserve layout wrappers, `StorefrontLayout` and `LayoutAdmin`. Do not migrate to App Router, add another state framework or reorganize the project without authorization. Consult installed Next.js documentation before version-sensitive changes.

## 4. Package Manager

Use **Yarn** for all frontend commands; do not use npm, pnpm or Bun. Preserve both `yarn.lock` and `package-lock.json` until an explicitly authorized lockfile cleanup. Do not update dependencies unnecessarily or add packages when existing capabilities suffice. Backend commands remain npm-specific.

Available commands, subject to task authorization:

```bash
yarn install --frozen-lockfile
yarn dev
yarn typecheck
yarn lint
yarn test
yarn test:auth
yarn test:i18n
yarn build
yarn start
```

Preserve the existing Webpack-based Next.js scripts. These commands are a reference, not an instruction to install, start servers or build during every task.

## 5. GraphQL and Backend Integration

Backend: `/Users/user/Desktop/pet-nest`. Local API default: `http://localhost:3002`; GraphQL: `http://localhost:3002/graphql`. Frontend development defaults to port 3000. Verify actual runtime configuration when necessary.

- Preserve `ApolloProvider`, `InMemoryCache`, authentication links and upload integration.
- Preserve queries, mutations, inputs, enums, string IDs, nullable fields, `list` and `metaCounter` arrays.
- Preserve cache updates, refetch behaviour and reactive variables; verify affected operations against backend resolvers and DTOs.
- Do not invent fields/endpoints, bypass backend validation/authorization or modify backend source without explicit authorization.
- Keep authoritative prices, inventory, permissions and database transactions on the backend.

## 6. Authentication and Session Management

- Preserve nickname login and nickname/phone/password signup, in-memory access JWTs, backend-controlled HttpOnly refresh cookies and credentialed requests.
- Preserve refresh-rotation compatibility, single-flight refresh, cross-tab coordination, session-version checks and bounded Apollo authentication retry.
- Preserve authentication-transition cache clearing, cross-tab logout, redirect safety and loading/error states. Respect `authReadyVar` before authentication-dependent states where applicable.
- Do not store access or refresh tokens in localStorage or expose credentials. Frontend role checks are UI controls, not authoritative security.
- Kakao, email, Google and Apple authentication are not working integrations unless actually implemented and verified. Do not simulate provider authentication or expose provider secrets through `NEXT_PUBLIC_*`.

## 7. UI/UX and Design System

- Preserve PetNest branding and warm orange identity unless a redesign is requested. Use semantic tokens from `libs/theme/colors.ts`.
- Keep typography, spacing, borders, shadows and component states consistent; reuse existing UI and MUI/Emotion/SCSS conventions.
- Do not add Tailwind, shadcn/ui, Radix or another UI framework without authorization. Scope component-specific styles.
- Preserve handlers, state, business logic, functional inputs/buttons and loading, disabled, empty, error and success states during visual changes.
- Preserve keyboard accessibility and visible focus. Do not replace working functionality with static mockups.

## 8. External UI Components and Animations

For authorized 21st.dev or other external UI, inspect the original implementation, dependencies and applicable license. Preserve required attribution/notices, requested appearance, interactions, animations, transitions, hover/focus and 3D effects. Adapt to existing MUI/SCSS; do not install unnecessary animation/style libraries or substitute static approximations.

For Liquid Glass Checkout, preserve WebGL water shaders, spring-based tilt/flip, ripples, water levels, processing effects and interactive preview. Preserve CSS fallback, context recovery, reduced motion, visibility-based management and animation-frame/observer/listener/GPU cleanup.

Preserve falling leaves, account background video, carousel motion and header animations unless explicitly requested otherwise. Avoid memory leaks and unnecessary CPU/GPU work.

## 9. Responsive Design

Support desktop, tablet and mobile. Preserve the 760px device breakpoint unless an intentional migration is requested. Check desktop/mobile branches and tablet styles; preserve bottom navigation, drawer, safe-area spacing and chat position/interaction.

Avoid overflow, overlap and inaccessible controls. Verify resizing across breakpoints while preserving state/functionality. Suggested viewport widths: mobile 390px; tablet 768px and 1024px; desktop 1440px.

## 10. Localization and Dark Mode

Preserve English, Uzbek, Korean and Russian, Next.js locale routing and locale preference. Reuse typed dictionaries; translate new content, errors, placeholders, labels and accessibility strings. Avoid unnecessary hardcoded Korean/English.

Preserve light/dark behaviour and semantic tokens. Verify contrast, backgrounds, borders and interactive states in both themes. Document existing localization limitations without rewriting unrelated components.

## 11. State Management and Data Fetching

Preserve normalized caching, `userVar`, `cartCountVar`, `authReadyVar`, URL filters/pagination and synchronization/reset behaviour. Use local state for local UI; avoid duplicate sources of truth and unnecessary requests/refetches. Clean up effects, timers, subscriptions and listeners. Do not add Redux, Zustand, TanStack Query or another state framework without authorization; avoid speculative abstractions.

## 12. WebSocket and Notifications

- Preserve native public chat, guest access and desktop/mobile availability, event names, envelopes, connection restoration and bounded reconnection delays.
- Preserve authenticated Socket.IO notifications, receiver isolation and refetching. Keep public chat and private notifications separate.
- Preserve socket/timer cleanup. Do not create duplicate connections or chat instances.
- Do not log token-bearing URLs or private member information. Frontend types do not remove sensitive fields from network payloads.

## 13. Shopping, Checkout and Payment

Preserve product browsing, variants/SKUs, quantities, cart operations, order creation/cancellation and retries reusing an already-created order. Preserve payment contracts and backend-authoritative totals. Do not hardcode real prices, manipulate authoritative amounts or simulate successful external payments.

Liquid Glass Checkout currently provides **test-card interaction only**. Keep card details ephemeral and isolated in local checkout state. Never send card numbers/CVC to GraphQL, REST or analytics, persist them in localStorage/sessionStorage/cookies, or log/expose real card data. Verify with synthetic data. Distinguish test payment records from external charges; real card collection requires an authorized secure payment-provider integration.

## 14. Uploads and Media

Preserve GraphQL multipart contracts, authenticated requests, Apollo preflight headers, targets `member`, `pet`, `products` and relative backend media paths. Preserve MIME checks, selection limits and preview behaviour; clean up object URLs. Do not delete media unnecessarily or bypass backend validation. Do not add cloud storage, a CDN or upload libraries without authorization.

## 15. Performance, SEO and Accessibility

Preserve metadata, canonical URLs, locale SEO, private/editing noindex rules and security headers. Avoid unnecessary rendering, requests/dependencies and interaction-blocking animations. Preserve reduced motion, semantic HTML, accessible labels and keyboard navigation. Do not claim SSR data fetching, accessibility compliance or performance improvements without verification.

## 16. Security and Personal Data

Never expose secrets, tokens, passwords or payment data, log private member payloads or increase phone/address exposure. Do not trust unverified JWT claims for authorization; preserve authentication/ownership boundaries. Avoid unsafe HTML. Hidden JSX is not network privacy protection.

Report backend security issues separately instead of making unauthorized backend edits. Use isolated test environments and synthetic data; never use production accounts, orders or payments for routine testing.

## 17. Environment and Deployment

Preserve Docker, standalone Next.js, Caddy, non-root runtime and environment/configuration boundaries. Keep secrets out of `NEXT_PUBLIC_*`; account for public build-time configuration. Verify Docker exclusions before building: recovery/environment backups and unrelated tooling must be excluded. Do not overwrite production environment files, deploy or access production servers without permission.

Backup exclusions are policy, not a completed fix; see [known deployment risks](docs/ai/SECURITY_RULES.md#deployment-and-secrets).

## 18. Workflow

1. Read instructions/relevant docs; inspect Git status and preserve user changes.
2. Analyze affected components, current behaviour, contracts, dependencies and side effects.
3. Make minimal, incremental changes; run `yarn typecheck` after each implementation phase.
4. Run relevant lint/tests. For UI changes, use available authorized Playwright/browser tools; do not automatically install browser-test dependencies.
5. Verify desktop/tablet/mobile, dark mode and relevant translations; run `yarn build` when appropriate.
6. Review the final diff and remove unnecessary changes.
7. Update `docs/ai/COMPLETED_TASKS.md` after major work and record architectural decisions in `docs/ai/DECISIONS.md`.
8. Summarize changed files, actual verification and remaining issues.

Explicit read-only/documentation-only restrictions override implementation checks. Never claim unexecuted tests, builds or browser checks passed. Distinguish static checks, mocks and real browser/backend verification.

## 19. Code Readability and Commit Messages

Use clear names, straightforward flow and small, focused functions/components. Follow existing naming/formatting, avoid confusing duplication, overengineering, speculative abstractions and unnecessary comments. Prefer the simplest correct, secure, maintainable solution; keep changes easy to review.

After each implementation task, suggest a short English Conventional Commit describing the actual changes. Never automatically execute `git commit` or `git push`.

```text
feat(auth): update login and signup UI
feat(checkout): integrate animated card preview
fix(chat): improve guest reconnection
fix(ui): resolve mobile layout overflow
refactor(product): simplify product card rendering
```
