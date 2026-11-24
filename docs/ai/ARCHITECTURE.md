# PetNest Frontend Architecture

Verified from local source on 2026-11-24. This describes implementation, not a live deployment. Permanent policy is in [AGENTS.md](../../AGENTS.md); tooling/status belong in [FRONTEND_CONTEXT.md](FRONTEND_CONTEXT.md).

## Source map

| Location | Responsibility | Evidence |
| --- | --- | --- |
| `pages/` | Pages Router routes and page-level state | [home](../../pages/index.tsx), [product listing](../../pages/product/index.tsx) |
| `pages/_app.tsx` | Apollo/MUI providers, styles, session restoration, SEO defaults and falling leaves | [application](../../pages/_app.tsx) |
| `pages/_document.tsx` | HTML shell, initial theme script and server-injected CSS tokens | [document](../../pages/_document.tsx) |
| `libs/components/` | Shared and domain-specific UI | [storefront](../../libs/components/layout/StorefrontLayout.tsx), [admin](../../libs/components/layout/LayoutAdmin.tsx) |
| `libs/auth/` | Login/signup/logout and in-memory session lifecycle | [entry points](../../libs/auth/index.ts), [sessions](../../libs/auth/session.ts) |
| `libs/hooks/` | Viewport subscription | [device hook](../../libs/hooks/useDeviceDetect.ts) |
| `libs/i18n/` | Typed locale dictionaries, interpolation, enum/error/notification labels | [translation hook](../../libs/i18n/index.ts) |
| `libs/theme/` | Shared semantic light/dark colors | [tokens](../../libs/theme/colors.ts) |
| `libs/types/`, `libs/enums/` | Hand-maintained API result/input types and enums | [results](../../libs/types/common.ts), [direction enum](../../libs/enums/common.enum.ts) |
| `apollo/` | Client links/cache, reactive variables and user/admin operations | [client](../../apollo/client.ts), [store](../../apollo/store.ts) |
| `scss/` | Global/desktop/mobile styles and MUI theme factory | [style guide](../../scss/README.md), [theme](../../scss/MaterialTheme/index.ts) |
| `public/` | Static images/icons/videos, social image and robots file | [robots](../../public/robots.txt) |
| `types/` | Upload-client type declarations | [declaration](../../types/apollo-upload-client.d.ts) |
| `tests/` | Node-based regression tests | [auth tests](../../tests/auth.test.mjs) |
| `deploy/` | Caddy configuration | [Caddyfile](../../deploy/Caddyfile) |

Generated `.next`, `next-env.d.ts`, TypeScript build metadata and `node_modules` are not application source. Local recovery/tooling directories are not architectural boundaries; see [security risks](SECURITY_RULES.md#deployment-and-secrets).

## Routing and rendering

There are 25 page routes, excluding `_app` and `_document`, before locale expansion. Routes use `next/router`, `next/link` and query parameters. No App Router directory or application data-fetching exports (`getServerSideProps`, `getStaticProps`, `getStaticPaths`, `getInitialProps`) were found. `pages/api/` is empty. No middleware/proxy implementation was found.

| Area | Existing routes |
| --- | --- |
| Storefront | `/`, `/product`, `/product/detail`, `/agent` |
| Community | `/pet`, `/pet/detail`, `/member/detail` |
| Listing forms | `/pet/create`, `/pet/edit`, `/product/create`, `/product/edit` |
| Account | `/account/join`, `/mypage` |
| Shopping | `/cart`, `/checkout`, `/order/detail` |
| Support | `/cs` |
| Admin | `/_admin`, `/_admin/overview`, `/_admin/users`, `/_admin/pets`, `/_admin/products`, `/_admin/orders`, `/_admin/inquiries`, `/_admin/comments` |

Detail IDs are query parameters, for example `/product/detail?id=...`; these are not `[id].tsx` routes. MyPage categories and support tabs also live in the URL. Admin root redirects to overview in a client effect.

The source is compatible with automatic static page-shell optimization and client-side Apollo fetching. `ssrMode` in Apollo and initial-cache restoration support do not prove page-level SSR data fetching. No new build was run for this documentation. Consult the installed Next.js Pages Router documentation before version-sensitive changes.

Evidence: [Next configuration](../../next.config.ts), [product detail](../../pages/product/detail.tsx), [MyPage](../../pages/mypage/index.tsx), [support](../../pages/cs/index.tsx), [admin root](../../pages/_admin/index.tsx).

## Layouts and reusable components

`LayoutHome`, `LayoutBasic` and `LayoutFull` are HOCs around `StorefrontLayout`. The shared shell owns Top, Footer, exactly one public Chat and mobile bottom navigation. `LayoutAdmin` independently waits for session/member information and gates its UI on ADMIN membership; server authorization remains authoritative.

Existing reusable components include ProductCard, PetCard, [TeamLanyardRail](../../libs/components/agent/TeamLanyardRail.tsx), CardCarousel, ListingError, ThemeToggle and LanguageSwitcher. The agent listing maps public `getAgents` fields into compact animated badges; the old AgentCard/grid implementation was removed. Domain folders group homepage, product, pet, agent, mypage, cs, admin and checkout components. Preserve these structures rather than creating a competing layout system.

Evidence: [LayoutBasic](../../libs/components/layout/LayoutBasic.tsx), [LayoutHome](../../libs/components/layout/LayoutHome.tsx), [LayoutFull](../../libs/components/layout/LayoutFull.tsx), [CardCarousel](../../libs/components/homepage/CardCarousel.tsx), [ListingError](../../libs/components/common/ListingError.tsx).

## Data and effect boundaries

- Apollo provides normalized caching, one browser client and a separate client on server execution. Error/auth/upload links are composed in that order.
- Reactive variables contain user JWT claims, cart count and auth readiness. Local forms, lists and selections use React state; query results are often copied into local state.
- Queries commonly use `network-only` or `cache-and-network`, `skip`, completion handlers and explicit refetches. Preserve reset/synchronization behaviour when changing them.
- DemoCardProvider is scoped to the checkout cart form. It shares ephemeral visual card state with the preview; order/payment handlers do not consume card details.
- Public chat uses native WebSocket. Private notifications use Socket.IO plus GraphQL refetching. Neither is an Apollo subscription.
- Frontend renders server totals and sends user intent. Backend services own permissions, inventory, prices, transactions and persistent records.

Evidence: [Apollo client](../../apollo/client.ts), [reactive store](../../apollo/store.ts), [DemoCardProvider](../../libs/components/checkout/DemoCard.tsx), [checkout](../../pages/checkout/index.tsx), [contracts](API_CONTRACTS.md).

## Code conventions

[TypeScript configuration](../../tsconfig.json) enables strict checking, ES2017 target, bundler resolution, isolated modules, incremental metadata and `@/*` paths. Relative imports remain common. Interfaces/enums and the broad optional result interface `T` are handwritten; no GraphQL client code-generation setup was found.

Function components, hooks, `Handler` suffixes and STATES/APOLLO REQUESTS/HANDLERS sections are common. Application code often uses tabs/single quotes; tests/config files vary. No root Prettier configuration was found. Follow nearby code and the [SCSS guide](../../scss/README.md); do not reformat unrelated files. [ESLint](../../eslint.config.mjs) uses Next core-web-vitals and TypeScript rules.
