# Code review guide

## Start with the flow being changed

| Area | Entry points | Supporting code |
| --- | --- | --- |
| App setup and theme | `pages/_app.tsx`, `pages/_document.tsx` | `scss/MaterialTheme/`, `libs/theme/` |
| Session and authentication | `libs/auth/index.ts` | `libs/auth/session.ts`, `apollo/client.ts`, `tests/auth.test.mjs` |
| API operations | `apollo/user/`, `apollo/admin/` | `libs/types/`, `libs/enums/` |
| Public page layouts | `libs/components/layout/` | `Top.tsx`, `Footer.tsx`, `MobileMenu.tsx` |
| Chat | `libs/components/Chat.tsx` | `scss/pc/_chat.scss`, `scss/mobile/_chat.scss`, `tests/chat.test.mjs` |
| Notifications | `libs/components/NotificationBell.tsx` | `libs/i18n/notifications.ts` |
| Product and pet forms | `libs/components/product/CreateProduct.tsx`, `libs/components/pet/CreatePet.tsx` | Creation/edit pages, user mutations |
| Cart and checkout | `pages/cart/index.tsx`, `pages/checkout/index.tsx` | Order/payment types and mutations |
| Admin | `pages/_admin/`, `libs/components/admin/` | `apollo/admin/`, `scss/pc/admin/` |
| Translation | `libs/i18n/index.ts`, `libs/i18n/locales/` | `tests/i18n.test.mjs` |

Components generally declare props and defaults first, then state, Apollo operations, effects, handlers, computed values and rendering. Desktop/mobile branches stay beside each other so both can be reviewed together. Keep lifecycle setup next to cleanup, particularly for sockets, browser listeners and timers.

## Formatting

Run `yarn format` to apply the repository format and `yarn format:check` to verify it. The configuration is in `.prettierrc.json`; generated output and dependencies are ignored. JSX props, object fields and complex expressions expand across lines when needed. Keep comments focused on why a decision exists.

## Validation

Before committing, run `yarn format:check`, `yarn lint`, `yarn typecheck` and `yarn test`. For a production build, supply the public backend variables described in `DEPLOYMENT.md` and run `yarn build`. Tests currently cover sessions, chat and translations; rendering checks do not substitute for live backend tests of checkout, uploads or payments.
