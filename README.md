# PetNest frontend

Next.js Pages Router storefront for pets and products, with an admin panel, Apollo GraphQL, cookie-based sessions, four languages and light/dark themes.

## Local development

Use Yarn. Copy `.env.example` to `.env.development` and set the backend addresses (local default: port 3002).

```bash
yarn install
yarn dev
```

Open `http://localhost:3000`. Login and refresh require the backend and its HttpOnly refresh cookie. Access tokens remain in browser memory.

## Checks before committing

```bash
yarn lint
yarn typecheck
yarn test
```

Production builds require the public backend URL at build time. Set the variables from `.env.production.example`, then run `yarn build`. See [DEPLOYMENT.md](DEPLOYMENT.md) for Docker and hosting.

## Integrations

- Apollo GraphQL handles queries, mutations and uploads.
- Socket.IO delivers member notifications.
- Native WebSocket handles the public live chat; it shares the backend port with notifications.

See [session documentation](docs/REFRESH_TOKENS.md), [appearance and languages](docs/APPEARANCE_AND_LANGUAGES.md) and [live chat](docs/LIVE_CHAT.md).
