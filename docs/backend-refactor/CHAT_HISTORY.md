# Durable shared chat

## Setup

Create a free Redis database in the [Upstash console](https://console.upstash.com/), choosing a region near the backend. Keep it on the free plan; do not enable a paid upgrade for this feature. Current free limits are 256 MB and 500,000 commands per month; monitor usage in the console. See [pricing](https://upstash.com/pricing/redis).

Configure these values in the backend environment (local `.env` for development):

```dotenv
UPSTASH_REDIS_REST_URL=https://YOUR_DATABASE.upstash.io
UPSTASH_REDIS_REST_TOKEN=YOUR_SERVER_TOKEN
CHAT_HISTORY_KEY=skiresort:development:chat:messages
```

Production must use its own key (`skiresort:production:chat:messages`) or a separate database. The key is explicit and mandatory; the application does not infer it. Missing values or a non-HTTPS URL prevent API startup. Invalid credentials are detected when a storage operation runs. Never commit or send tokens to the frontend. MongoDB configuration remains required for the rest of the application.

Upstash [persistence is enabled by default](https://upstash.com/docs/redis/features/durability); the free tier does not include the additional replica redundancy of paid tiers. Keep eviction disabled. This feature sets no expiration and does not provide an archive or backup. Older messages are permanently removed. Existing process-memory history is not migrated.

## Files and logic

- `apps/skiresort-api/src/socket/chat-message.ts` defines `ChatMessage` and `ChatMember`. Public identity contains only `_id`, `memberNick`, and `memberImage`; guest identity is `null`.
- `chat-history.service.ts` provides one configured Redis client. Its constructor validates configuration, disables telemetry and automatic pipelining, sets a fresh five-second abort signal per request, and disables retries. `getMessages` reads the newest 500 in oldest-first order. `appendMessage` sends JSON through `APPEND_CHAT_MESSAGE`: Redis executes append and trim without interleaving another command. No separate cleanup job is required.
- `socket.gateway.ts` verifies the optional token and constructs the public identity. `enqueue` serializes reads and save/broadcast operations for this single backend instance, and recovers its promise chain after failure. `handleConnection` loads history before registering a visitor for live delivery. Its registration, joined event, and history send are synchronous within the queued operation. `handleMessage` validates text, generates metadata, saves, then echoes to all active clients. `handleDisconnect` removes only registered clients, avoiding duplicate departures or negative counts. `sendError` and `emitMessage` skip closed sockets.
- `socket.module.ts` imports the existing authentication module and provides the gateway and history service. MongoDB models are not involved in chat storage.

Source comments explain these blocks and the reasons for the ordering, privacy, and failure handling.

## Wire contract

Continue using the native `WsAdapter` WebSocket connection and optional `?token=...` authentication. Missing or invalid tokens remain guests, who can read and post.

Send:

```json
{"event":"message","data":"Hello"}
```

Live message, also stored in history:

```json
{"event":"message","id":"server-generated-uuid","createdAt":"2026-10-12T00:00:00.000Z","text":"Hello","memberData":{"_id":"member-id","memberNick":"Skier","memberImage":"image-path"}}
```

On successful connection, receive the existing `info` joined frame followed by `{"event":"getMessages","list":[...]}`. The list contains zero to 500 messages, oldest first. `info` retains `totalClients`, `action`, and `memberData`, now restricted to public identity. Join/leave events are not persisted. IDs and timestamps are additive fields; profile narrowing is intentional. Frontend rendering must use public identity fields and handle the error event. No frontend source is changed here.

A visitor loading history receives no live messages until history is sent. Sends queued before its read appear in history; sends queued afterward appear live. This avoids duplicates and gaps within the single running instance. Clients should wait for `getMessages` before posting; messages from unregistered or disconnected clients are ignored.

Valid messages are nonblank strings with at most 2,000 JavaScript string code units. Original whitespace is preserved for valid strings.

Errors have `{"event":"error","code":"...","message":"..."}`:

| Code | Behavior |
| --- | --- |
| `INVALID_MESSAGE` | Reject blank, non-string, or oversized input before storage. |
| `MESSAGE_SAVE_FAILED` | Do not broadcast; send an error only to the sender. |
| `HISTORY_UNAVAILABLE` | Do not announce joined or send empty history; close with code 1013 so the client can reconnect. |

A network timeout can occur after Redis committed a write. The message may therefore appear in later history even though no live echo was sent. Automatic retries are disabled to avoid duplicating uncertain writes. This is not an exactly-once delivery protocol. A backend crash between persistence and broadcast has the same recovery behavior.

## Verification and limitations

Gateway tests cover empty and bounded history, oldest-first order, gateway recreation, public identity, guests, validation, persistence-before-echo, concurrent sends, both history races, closed sockets, departure counts, storage failures, and the real local WebSocket transport using mocked storage. Service tests cover configuration, timeout/retry options, command arguments, and error propagation. Mock retention tests do not prove the Lua script executes correctly on a live Redis server.

Run:

```powershell
npm run build:api
npm test -- --runInBand apps/skiresort-api/src/socket
node node_modules/eslint/bin/eslint.js apps/skiresort-api/src/socket/*.ts
```

Live verification requires a dedicated development key: send more than 500 messages, reconnect and confirm the newest 500, restart the backend, and confirm the same history remains. Never run this against the production chat key. Credentials were not provided for this implementation, so live script execution, restart persistence, and credential validation have not been verified against Upstash.

Only one backend instance is supported for coordinated live delivery. A second instance could share history but would not share broadcasts or presence. There is no reconnect backoff, client acknowledgement, automatic replay to existing clients, moderation, or rate limiting added by this change. The serialization queue favors correctness over throughput; each storage call can take up to five seconds, and queued operations can wait longer. Monitor database command usage and application warnings without logging tokens or message bodies.

### Implementation check results

- Baseline before edits: original socket suite passed (6 tests).
- Updated chat suites: passed (27 tests across gateway and history service).
- `npm run build:api`: passed.
- Scoped ESLint without fixes: passed.
- `git diff --check`: passed.
- Live Upstash checks: not run; the three chat configuration values are absent from the local `.env`.
