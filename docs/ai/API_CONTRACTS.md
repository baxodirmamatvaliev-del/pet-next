# PetNest Frontend API Contracts

Verified from source on 2026-11-24. This is a static reference, not runtime API verification. Permanent constraints are in [AGENTS.md](../../AGENTS.md). Read the [backend instructions](../../../pet-nest/AGENTS.md) and its [contract reference](../../../pet-nest/docs/ai/API_CONTRACTS.md) when an affected integration changes; backend edits require explicit authorization.

## Endpoints and responsibilities

| Setting | Source behaviour |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base API; development fallback `http://localhost:3002` |
| `NEXT_PUBLIC_API_GRAPHQL_URL` | Explicit endpoint or base plus `/graphql` |
| `NEXT_PUBLIC_API_SOCKET_URL` | Explicit Socket.IO origin or base origin |
| `REACT_APP_API_WS` | Socket origin with HTTP/HTTPS converted to WS/WSS |

[libs/config.ts](../../libs/config.ts) trims URLs and removes a trailing slash. Production requires the base API setting. Frontend defaults to port 3000; configuration is not evidence of an actual running server. Public values are embedded during build. Do not place backend signing/database/provider secrets in these settings.

Frontend sends user intent and renders responses. Backend owns authentication verification, role/ownership enforcement, stock, prices/totals, transactions, order deduplication and payment uniqueness. Preserve its rules rather than reproducing authority in the browser.

## Apollo transport and state

[apollo/client.ts](../../apollo/client.ts) composes `errorLink → authLink → uploadLink`, uses `credentials: 'include'` and `InMemoryCache`, reuses the browser client and creates a separate instance during server execution. Initial cache restoration is supported; no page-level server data loader was found. [_app.tsx](../../pages/_app.tsx) owns ApolloProvider.

`skipRefresh` is used for credential operations; `authRetried` bounds retry after authentication rejection. Do not indiscriminately retry business mutations or replace unauthorized errors with success. Preserve request headers, cache clearing and refetch behaviour. Reactive variables live in [apollo/store.ts](../../apollo/store.ts).

## Operation inventory

Source inventory: **60 central documents (28 queries, 32 mutations)** and **three inline upload definitions**. The three uploads use two root field names, so 63 operation definitions reference 62 distinct backend roots. A static root/argument-name comparison found no mismatches during analysis/bootstrap; it does not establish complete SDL/input/selection compatibility, authorization correctness or live delivery.

| Source | Queries | Mutations |
| --- | --- | --- |
| [user/query.ts](../../apollo/user/query.ts) | 22 | — |
| [user/mutation.ts](../../apollo/user/mutation.ts) | — | 26 |
| [admin/query.ts](../../apollo/admin/query.ts) | 6 | — |
| [admin/mutation.ts](../../apollo/admin/mutation.ts) | — | 6 |

| Domain | Query roots in frontend documents | Mutation roots in frontend documents |
| --- | --- | --- |
| Auth/member | `getMember`, `getAgents` | `signup`, `login`, `refreshToken`, `logout`, `updateMember` |
| Follow | `getMemberFollowers`, `getMemberFollowings` | `subscribe`, `unsubscribe` |
| Product | `getProduct`, `getProducts`, `getFavoriteProducts`, `getVisitedProducts`, `getMyProducts` | `createProduct`, `updateProduct`, `removeProduct`, `likeTargetProduct` |
| Pet | `getPet`, `getPets`, `getMyPets`, `getFavoritePets`, `getVisitedPets` | `createPet`, `updatePet`, `likeTargetPet` |
| Comments/reviews | `getComments` | `createComment`, `updateComment` |
| Cart | `getMyCart` | `addToCart`, `updateCartItem`, `removeCartItem`, `clearCart` |
| Orders/payment | `getOrder`, `getMyOrders` | `createOrder`, `cancelOrder`, `createPayment` |
| Support | `getSupportRecipients`, `getMyInquiries`, `getAssignedInquiries` | `createInquiry`, `answerInquiry` |
| Notifications | `getMyNotifications` | `readNotification` |
| Administration | `getAllProductsByAdmin`, `getAllPetsByAdmin`, `getAllOrdersByAdmin`, `getPaymentByOrderByAdmin`, `getAllMembersByAdmin`, `getAllCommentsByAdmin` | `updateProductByAdmin`, `updatePetByAdmin`, `updateOrderStatusByAdmin`, `confirmPayment`, `updateMemberByAdmin`, `removeCommentByAdmin` |

Frontend does not currently define documents for every backend root; for example, `cancelPayment` exists in the backend but is not a current frontend operation. Do not invent a frontend cancellation contract or assume direct order cancellation updates payment records identically.

## Contract shapes and authorization

- Keep GraphQL string IDs and registered enum names. Frontend `Direction.ASC`/`DESC` serialize as `ASC`/`DESC`, not MongoDB numeric sort values.
- Preserve paginated `list` and `metaCounter: { total: number }[]`; callers commonly read `metaCounter[0]?.total`. Some support operations return plain arrays. Do not normalize all results into a new envelope.
- Preserve nullable output fields and `meLiked`/`meFollowed` arrays.
- Inputs, selections and frontend interfaces must be reviewed together with backend resolver/DTO declarations. Handwritten TypeScript types do not validate network data or provide generated-schema guarantees.
- Protected UI uses authenticated identity; admin layout queries the member role. Exact ADMIN/USER/AGENT role arrays and service ownership rules remain backend authority; ADMIN is not an assumed universal role hierarchy.

Evidence: [common result type](../../libs/types/common.ts), [member types](../../libs/types/member/member.ts), [enums](../../libs/enums/common.enum.ts), [LayoutAdmin](../../libs/components/layout/LayoutAdmin.tsx).

## Authentication contract

| Operation | Request/response convention |
| --- | --- |
| `signup` | MemberInput with nickname/password/phone; returns Member with `accessToken` selected |
| `login` | LoginInput nickname/password; returns AuthPayload with `accessToken` and member |
| `refreshToken` | No explicit token argument; browser sends backend HttpOnly cookie; frontend selects `accessToken` |
| `logout` | Credentialed request; Boolean result; frontend clears session/cache after success |

[Auth entry points](../../libs/auth/index.ts), [session module](../../libs/auth/session.ts) and [refresh guide](../../libs/docs/REFRESH_TOKENS.md) own the flow. Access JWTs are held in memory; backend refresh cookie is `pet_refresh`, HttpOnly, SameSite=Lax, path `/graphql`, Secure in production. Backend access lifetime is 10 minutes and refresh expiry is absolute at 15 days.

Preserve trusted-Origin/CORS/cookie compatibility. Cross-site deployment changes need review of actual cookie policy; `credentials: include` alone does not override browser restrictions. Do not export cookies, expose tokens or use frontend JWT decoding as signature verification. Kakao/email proposals in historical docs are not implemented operations.

## Shopping and payment contract

| Input/result | Fields/invariant |
| --- | --- |
| Cart item input | `productId`, `sku`, and quantity for add/update; remove uses product/SKU |
| Cart output | Items, availability, current unit prices/subtotals, total quantity and total amount |
| CreateOrderInput | `recipientName`, `recipientPhone`, `deliveryAddress`, optional `deliveryNote`; no client totals/card details |
| CreatePaymentInput | `orderId`, `paymentMethod`; no card number, CVC or client amount |
| Admin confirmation | ConfirmPaymentInput uses `paymentId`; updates internal records, not an external charge |

[Checkout](../../pages/checkout/index.tsx) creates the order first, retains it in mounted-page state, then creates payment. If payment creation fails, retry reuses that order. Liquid Glass amount comes from `cart.totalAmount`; order confirmation uses stored order totals. Do not reset this flow as part of a visual change.

`CARD` and `KAKAO_PAY` are preferences in the internal payment flow. No hosted provider fields, checkout SDK, external charge, refund or webhook implementation was found. Test-card context is purely local and is not read by the order/payment handler.

Sources: [cart page](../../pages/cart/index.tsx), [order inputs](../../libs/types/order/order.input.ts), [payment input](../../libs/types/payment/payment.input.ts), [order detail](../../pages/order/detail.tsx), [admin orders](../../libs/components/admin/orders/OrderList.tsx).

## Upload and media contract

| Caller | Inline operation | Target |
| --- | --- | --- |
| [MyProfile](../../libs/components/mypage/MyProfile.tsx) | `imageUploader(file: Upload!, target: String!)` → String | `member` |
| [CreatePet](../../libs/components/pet/CreatePet.tsx) | `imagesUploader(files: [Upload!]!, target: String!)` → Strings | `pet` |
| [CreateProduct](../../libs/components/product/CreateProduct.tsx) | Same multi-image contract | `products` |

These callers build GraphQL multipart `operations` and `map`, obtain a valid access token, and send Axios requests with Bearer and `apollo-require-preflight` headers. They are separate from Apollo's retry chain. Preserve JPEG/PNG selection checks, multi-file limits, object-URL lifecycle and relative `uploads/<target>/...` results. Backend validation, including size/signature checks, remains mandatory. See [security limitations](SECURITY_RULES.md#uploads-and-content).

## Public WebSocket chat

[Chat.tsx](../../libs/components/Chat.tsx) uses native WebSocket at the API root. It waits for auth readiness and encodes the current token into the connection URL; an unauthenticated user still connects/sends as Guest. Never log the resulting token-bearing URL.

Client frame:

```json
{"event":"message","data":"Hello"}
```

Guest server frames:

```json
{"event":"info","totalClients":1,"memberData":null,"action":"Joined"}
{"event":"getMessages","list":[]}
{"event":"message","text":"Hello","memberData":null}
```

Disconnect action is `left`; the count is connections, not unique users. Backend sends five recent messages on connection; client appends subsequent messages. History is backend process memory, not durable/shared storage. Login/logout/refreshed claims recreate the socket; retries cap at 15 seconds. Preserve frame handling, trimmed sending, malformed-frame tolerance and cleanup. Chat is present on desktop/mobile, not the admin shell. Current payload privacy limitations are not fixed by frontend interfaces.

## Socket.IO notifications

[NotificationBell](../../libs/components/NotificationBell.tsx) connects to the API Socket.IO origin (default path `/socket.io/`), obtains a current token through its auth callback, listens for `notification` and refetches GraphQL. Opening the panel refetches; clicking an unread item calls `readNotification` then routes to the referenced entity.

Backend verifies identity and emits to receiver member-ID rooms. Preserve authenticated receiver isolation independently of public chat. The current badge derives from unread records in the fetched 30-item page; no reconnect-specific reconciliation handler was found. Do not document an exact global unread count or guaranteed offline catch-up.

## Change review

For an authorized contract change, review operation variables/selections, handwritten types/enums, callers, auth/role requirements, nullability, pagination, refetch/cache updates and backend resolver/DTO/service behaviour together. Preserve provider-free test mode and upload/event formats. Static compatibility is not a passing live integration test. Never contact production or modify the backend incidentally.
