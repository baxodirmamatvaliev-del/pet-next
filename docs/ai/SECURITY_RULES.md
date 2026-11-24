# PetNest Frontend Security Reference

Verified from source on 2026-11-24. Permanent rules are in [AGENTS.md](../../AGENTS.md). Known limitations below are review findings, not fixes performed by documentation and not evidence of production exploitation.

## Sessions and authorization

[Session code](../../libs/auth/session.ts) stores access JWTs only in memory, removes the legacy localStorage key, restores from a credentialed refresh request and coordinates refresh through a shared promise, optional browser Web Locks and session-version checks. Requests have a 15-second session timeout; access tokens refresh near expiry. [Apollo](../../apollo/client.ts) bounds authentication retry. [Auth entry points](../../libs/auth/index.ts) clear account cache during transitions; [_app](../../pages/_app.tsx) handles cross-tab logout.

Preserve backend-owned HttpOnly cookies, trusted origins/CORS and rotation compatibility. Backend policy is 10-minute JWTs and absolute 15-day refresh sessions. Never store either token in localStorage or expose a refresh token to JavaScript. The logout storage event carries only a timestamp. Theme/language preference storage is not authorization state.

`jwt-decode` reads claims, not signatures. [Admin layout](../../libs/components/layout/LayoutAdmin.tsx) obtains the member role from GraphQL; backend guards and service ownership checks remain authoritative. Preserve exact role contracts; do not infer ADMIN inheritance. Do not add a frontend bypass for server rejection.

Known limits:

- Initial restoration catches network failure and retains its completed startup promise; no automatic recovery retry was found.
- Web Locks fallback only coordinates within a tab. Browser/cookie behaviour needs actual browser verification when authorized.
- Some account/cart/checkout branches use user identity without waiting for auth readiness, so temporary guest UI is possible.
- Kakao/email have inactive UI and historical proposals; Google/Apple and real provider auth are not implemented. Do not fake successful authentication.

See the existing [refresh guide](../../libs/docs/REFRESH_TOKENS.md) for detailed flow; historical pass claims are not new verification.

## Personal data and real-time channels

[GET_MEMBER](../../apollo/user/query.ts) selects phone/address with other profile fields, including for public profile callers. Hiding fields in JSX does not prevent delivery or caching. Do not expand private-field exposure. Proper public/owner projection is a backend contract issue requiring separately authorized work.

[Chat](../../libs/components/Chat.tsx) encodes an access token in its WebSocket URL. Preserve compatible guest access but never log/copy credential-bearing URLs. The backend can forward a broader member object than the frontend interface lists; TypeScript types and frame checks do not redact extra network fields. This concern is also recorded in the [backend security reference](../../../pet-nest/docs/ai/SECURITY_RULES.md).

Public chat must remain separate from [Socket.IO notifications](../../libs/components/NotificationBell.tsx). Backend authenticated receiver rooms provide isolation. Preserve cleanup and avoid duplicate connections; never expose notification/member payloads to public chat. Badge counts are limited to the fetched 30-record page, and no reconnect reconciliation handler was found. Raw chat history accumulates client-side after the five-message initial history; no ongoing client cap was found.

React renders chat text rather than injected HTML. Do not replace that with unsafe HTML or log private payloads for debugging. Backend chat spam/identity/payload controls cannot be implemented authoritatively with client checks alone.

## Test checkout and payment

[DemoCardProvider](../../libs/components/checkout/DemoCard.tsx) holds test details only in mounted checkout state. [Visual fields](../../libs/components/checkout/LiquidGlassCheckout.tsx) have no form names and disable autocomplete; they are not consumed by the [order/payment handler](../../pages/checkout/index.tsx). Validation/formatting and live preview are local. CVC is password-masked in the input but displayed on the synthetic card's back; it is not secure hosted collection.

Never persist, log, send to GraphQL/REST/analytics, or capture real card data. Use synthetic values during authorized verification and keep test-mode/no-real-charge warnings prominent. There is no implemented hosted payment provider/SDK flow to reuse at present. Luhn/expiry validation and warnings do not technically stop someone typing real details; do not describe them as provider-grade protection.

CreateOrderInput carries delivery information; CreatePaymentInput carries only order ID and payment method. Display server totals. Internal admin confirmation is not an external charge. Provider collection, refunds and webhooks require explicit authorization and a secure provider design; do not implement them incidentally.

Evidence: [order input](../../libs/types/order/order.input.ts), [payment input](../../libs/types/payment/payment.input.ts), [admin payment UI](../../libs/components/admin/orders/OrderList.tsx). Direct order cancellation/payment consistency belongs to backend services; respect [backend instructions](../../../pet-nest/AGENTS.md).

## Uploads and content

Preserve authenticated multipart operations/map and preflight headers in [MyProfile](../../libs/components/mypage/MyProfile.tsx), [CreatePet](../../libs/components/pet/CreatePet.tsx) and [CreateProduct](../../libs/components/product/CreateProduct.tsx). Keep targets `member`, `pet`, `products`, relative media paths, JPEG/PNG checks, selection limits, previews and object-URL cleanup. Backend MIME/signature/size validation remains authoritative.

Known upload limits: repeated Axios logic bypasses Apollo's authentication retry and has no explicit upload timeout. No coordinated orphan cleanup was found after upload succeeds but entity save fails. Do not delete server media or change backend storage as a frontend-only fix. New shared utilities should address an actual scoped need rather than introduce speculative layers.

[SweetAlert helpers](../../libs/sweetAlert.ts) use `title` for messages. Treat future untrusted content as text and review escaping; do not assume arbitrary HTML is safe. No application `dangerouslySetInnerHTML` use was found during analysis. [Configured headers](../../next.config.ts) include nosniff, frame denial, referrer policy and restricted permissions; no explicit CSP was found. Do not claim complete XSS/accessibility/security compliance from these observations.

## Deployment and secrets

Only public endpoint settings belong in `NEXT_PUBLIC_*`. Never expose backend signing keys, provider secrets, passwords, cookies, tokens, private member data or environment backups. Do not print environment values or token-bearing network objects in diagnostics.

[Dockerfile](../../Dockerfile) uses `COPY . .` in its builder stage. [.dockerignore](../../.dockerignore) excludes root environment files, `.next`, Git and dependencies, but does not cover inspected `.icloud-recovery-backup-20261124`, `.next-icloud-backup-1795498408016`, `Agent-Reach/`, `.agent-reach-venv/` or every alternate environment-backup name. Git ignores and ESLint exclusions do not protect Docker context. Such files can reach the context/builder; this does not prove inclusion in the final runtime image.

The permanent exclusion rule is required policy, not completed remediation. Review/fix exclusions within an authorized configuration change before building with these directories present. Do not inspect or copy backup secrets into docs. Preserve non-root runtime, standalone output, public build-time variables, health checks, persistent upload volume and [Caddy](../../deploy/Caddyfile). Do not overwrite production environment files or contact/deploy to production without permission.

## Verification boundaries

Use isolated environments and synthetic accounts/orders/payment details. Routine testing must not touch production accounts, orders or payments. Browser activity, application startup and builds require compatible task authorization. Do not install Playwright automatically. Never present mocked Node tests, static contract checks or historical reports as current live security/payment/concurrency proof. Report backend issues separately; this frontend task grants no backend mutation authority.
