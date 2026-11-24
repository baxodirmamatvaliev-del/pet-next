# PetNest Frontend Decisions

## Recording policy

Record source-supported existing architecture separately from new authorized decisions and proposals. Include observation/decision date, status, context/evidence, consequences and verification limits. Do not invent adoption dates, motives or approvals.

Entries D-001 through D-007 describe existing source observed on 2026-11-24; their original adoption dates are unknown. They were not implemented by this documentation task.

## D-001 — Retain Pages Router and existing layout boundaries

**Status:** Existing architecture, observed.

- Evidence: [pages](../../pages), [StorefrontLayout](../../libs/components/layout/StorefrontLayout.tsx), [LayoutAdmin](../../libs/components/layout/LayoutAdmin.tsx), [Next config](../../next.config.ts).
- The frontend uses query-driven detail routes, HOC storefront wrappers and a separate admin shell. Public data loads through client-side Apollo; no page data-loader exports were found.
- Consequence: preserve route/query semantics and layouts; App Router migration or repository reorganization needs explicit authorization. Apollo `ssrMode` is not proof of SSR product data.

## D-002 — Retain Apollo and backend-authoritative domain contracts

**Status:** Existing architecture, observed.

- Evidence: [Apollo client](../../apollo/client.ts), [operations](API_CONTRACTS.md#operation-inventory), [handwritten results](../../libs/types/common.ts), [backend rules](../../../pet-nest/AGENTS.md).
- Normalized cache, reactive variables, local state and explicit refetching are the current data model. User/admin operations and multipart uploads share backend GraphQL contracts.
- Consequence: review selections, inputs, types/enums and backend resolver/DTOs together; preserve list/metaCounter arrays, string IDs and nullability. Inventory/prices/transactions/permissions stay server-side. No additional state framework is authorized by this observation.

## D-003 — Keep access JWTs in memory and refresh cookies backend-controlled

**Status:** Existing architecture, observed.

- Evidence: [sessions](../../libs/auth/session.ts), [auth entry points](../../libs/auth/index.ts), [Apollo links](../../apollo/client.ts), [existing refresh guide](../../libs/docs/REFRESH_TOKENS.md).
- Refresh is single-flight in a tab, uses Web Locks when available, guards late responses with session versions and retries Apollo authentication once. Logout clears memory/cache and broadcasts a timestamp.
- Consequence: do not persist tokens, remove cookie credentials or turn decoded JWT claims into authorization. Startup network recovery and Web Locks fallback remain limitations, not resolved decisions.

## D-004 — Share semantic colors across MUI and SCSS

**Status:** Existing architecture, observed.

- Evidence: [colors](../../libs/theme/colors.ts), [MUI theme](../../scss/MaterialTheme/index.ts), [document](../../pages/_document.tsx), [SCSS guide](../../scss/README.md).
- Shared light/dark token names drive MUI and CSS. Current brand colors are warm orange/cream; locale dictionaries support English, Uzbek, Korean and Russian.
- Consequence: preserve semantic styling, typed translations and theme initialization. Existing Korean-only Liquid Glass messages are documented limitations; older green/system-default prose is historical. Adding another UI framework is not part of normal component work.

## D-005 — Separate guest public chat from private notifications

**Status:** Existing architecture, observed.

- Evidence: [Chat](../../libs/components/Chat.tsx), [NotificationBell](../../libs/components/NotificationBell.tsx), [storefront shell](../../libs/components/layout/StorefrontLayout.tsx).
- Native WebSocket chat allows guests on mobile/desktop. Socket.IO authenticates private notifications; backend receiver rooms provide isolation.
- Consequence: preserve protocols, reconnect/cleanup and one chat instance. Do not merge transports, require login for public chat or log token URLs/member payloads. Current notification reconciliation/count and backend payload privacy issues remain open.

## D-006 — Keep Liquid Glass as local test-card presentation

**Status:** Existing implementation, observed; no external payment provider implemented.

- Evidence: [water engine](../../libs/components/checkout/LiquidGlassWater.tsx), [visual form](../../libs/components/checkout/LiquidGlassCheckout.tsx), [DemoCard context](../../libs/components/checkout/DemoCard.tsx), [checkout orchestration](../../pages/checkout/index.tsx).
- WebGL/spring/CSS effects and editable preview state are local; order/payment mutations do not consume number/CVC. Internal payment confirmation is not an external charge.
- Consequence: preserve animation/fallback/resource cleanup, attribution, dynamic totals and test warnings. Real card collection/provider/refund/webhook work needs separate authorization; do not reinterpret the visual demo as secure hosted payment input.

## D-007 — Preserve Yarn/Webpack and standalone Docker/Caddy deployment

**Status:** Existing workflow, observed; lockfile/build-context risks remain open.

- Evidence: [package scripts](../../package.json), [README](../../README.md), [Dockerfile](../../Dockerfile), [Compose](../../compose.prod.yml), [Caddy](../../deploy/Caddyfile).
- Frontend uses Yarn and Webpack scripts, standalone output and non-root runtime. Both Yarn/npm lockfiles exist; backend separately uses npm.
- Consequence: preserve both locks until authorized cleanup, public build-time configuration and deployment boundaries. Existing backup/tooling exclusions are incomplete; documentation is not a configuration fix.

## D-008 — Establish a frontend-specific instruction and reference system

**Status:** Authorized documentation decision, 2026-11-24.

- Context: the user requested permanent PetNest frontend rules, replacing reliance on unrelated ancestor Petoria assumptions, with seven focused supporting documents.
- Decision: extend [AGENTS.md](../../AGENTS.md) after its unchanged managed Next.js block. Preserve [CLAUDE.md](../../CLAUDE.md) and all existing guides. Keep policy concise, evidence in focused references, and historical discrepancies in [FRONTEND_CONTEXT.md](FRONTEND_CONTEXT.md#documentation-conflicts).
- Consequence: backend instructions are read-only integration references, not frontend package-manager policy. Explicit task restrictions override normal implementation checks. Documentation-only bootstrap restrictions apply to the recorded task, not all future work.
- Verification: managed-block/CLAUDE and existing-guide preservation, local links/anchors, inventories, scripts and documentation-only Git diff. No application tests/build/browser/API/database verification was performed. See [COMPLETED_TASKS.md](COMPLETED_TASKS.md).
