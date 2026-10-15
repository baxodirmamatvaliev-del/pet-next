# Live chat

The desktop and mobile Home, Basic and Full layouts include the nestar-style public chat. The floating launcher opens a 380px community panel with member names, online connection status, avatars and Enter/send controls. The panel uses PetNest theme colors and translations in all four languages. Phones use a full-screen panel with safe-area spacing, 44px touch controls and 16px input text. The Visual Viewport API keeps the composer above the on-screen keyboard. Admin layouts do not render chat.

`libs/components/Chat.tsx` uses native WebSocket, independently of Socket.IO notifications. The chat URL comes from `NEXT_PUBLIC_API_SOCKET_URL` (falling back to `NEXT_PUBLIC_API_URL`), with HTTP/HTTPS converted to WS/WSS. Existing deployment variables cover both connections.

The component waits for session restoration, obtains the current in-memory access token, and connects with `?token=...`. Login, logout and refreshed user claims recreate the connection. Disconnections retry with exponential delays capped at 15 seconds; unmount closes the socket and cancels retries. Each new connection receives history from the backend, including after page navigation.

Outgoing payload: `{ "event": "message", "data": "text" }`.
Incoming events: `info` updates `totalClients`; `getMessages` replaces history from `list`; `message` appends `text` and optional `memberData`. Message ownership compares `memberData._id` to the JWT `sub`. Guests can participate, matching the backend. Notifications retain their existing Socket.IO client.

The backend holds the latest five messages in process memory. Chat history resets when the API restarts. The online badge counts connections rather than unique members.
