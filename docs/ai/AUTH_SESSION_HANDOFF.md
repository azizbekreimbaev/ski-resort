# Authentication session handoff

Implemented locally on 2026-10-13. Frontend: `http://localhost:3000`; API: `http://localhost:3007/graphql`. No frontend implementation or production deployment is included.

## GraphQL contracts

All session operations use **POST /graphql**, `Content-Type: application/json`, `X-CSRF-Protection: 1` and browser credentials. They do not require an Authorization header. Browser Origin must match the configured allowlist. Originless Postman/curl/server clients still need the CSRF header. Refresh tokens exist only in the cookie, never in arguments, response JSON, browser storage or application logs.

```graphql
type Mutation {
  signup(input: MemberInput!): Member!
  login(input: LoginInput!): Member!
  googleLogin(input: GoogleLoginInput!): Member!
  refreshToken: RefreshTokenPayload!
  logout: Boolean!
}
type RefreshTokenPayload { accessToken: String! }
input LoginInput {
  memberNick: String!
  memberPassword: String!
}
input MemberInput {
  memberNick: String!
  memberPassword: String!
  memberPhone: String!
  memberType: MemberType
  memberAuthType: MemberAuthType
}
input GoogleLoginInput {
  idToken: String!
  memberNick: String
  memberPhone: String
}
```

Nickname/password lengths remain 3–12 for local signup/login; phone must be nonempty. Signup accepts omitted memberType or USER, rejects ADMIN/INSTRUCTOR/null. Auth-type enum is PHONE/EMAIL/TELEGRAPH/GOOGLE; existing signup semantics are unchanged. Google accepts a Firebase Google ID token, optional 3–12 character nickname and optional nonempty phone. Google verification, collision handling, role restrictions and account-blocking behavior are unchanged.

The existing Member object and all selectable fields remain unchanged; `accessToken: String` is still nullable in the schema and populated by successful authentication. Password/Firebase UID are not selectable. The authoritative full Member response definition is [member.ts](../../apps/skiresort-api/src/libs/dto/member/member.ts). There is no refreshToken field added to Member.

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) { _id memberNick memberType memberStatus accessToken }
}
# variables: {"input":{"memberNick":"skier","memberPassword":"password"}}

mutation Signup($input: MemberInput!) {
  signup(input: $input) { _id memberNick memberType accessToken }
}
# variables: {"input":{"memberNick":"skier","memberPassword":"password","memberPhone":"01012345678"}}

mutation GoogleLogin($input: GoogleLoginInput!) {
  googleLogin(input: $input) { _id memberNick memberType accessToken }
}
# variables: {"input":{"idToken":"<Firebase Google ID token>"}}

mutation RefreshSession { refreshToken { accessToken } }
mutation LogoutSession { logout }
query ProtectedSmokeTest { chechAuth }
```

Example login JSON response for that selection:

```json
{"data":{"login":{"_id":"<member id>","memberNick":"skier","memberType":"USER","memberStatus":"ACTIVE","accessToken":"<JWT>"}}}
```

Refresh request/response:

```json
{"query":"mutation RefreshSession { refreshToken { accessToken } }"}
```

```json
{"data":{"refreshToken":{"accessToken":"<new JWT>"}}}
```

Logout request/response:

```json
{"query":"mutation LogoutSession { logout }"}
```

```json
{"data":{"logout":true}}
```

Logout revokes only the cookie's device session and clears its cookie. Missing/malformed/unknown/already-revoked tokens still produce true and clear the cookie. A consumed token also identifies its family for logout. Database failures return an error rather than falsely reporting successful revocation.

## Cookies, origins and configuration

| Setting | Behavior |
|---|---|
| Cookie name | skiresort_refresh |
| HttpOnly | Always; JavaScript cannot read the refresh token |
| Secure | Always in NODE_ENV=production; false for local HTTP |
| SameSite | Lax; production frontend and API must be same-site |
| Path | /graphql; same attributes used to clear it |
| Domain | Omitted (API host-only) unless AUTH_COOKIE_DOMAIN is explicitly configured |
| Expires | Absolute session expiry; rotation never extends it |
| ACCESS_TOKEN_TTL_SECONDS | Positive integer; default 900 (15 minutes) |
| REFRESH_TOKEN_TTL_SECONDS | Positive integer; default 2592000 (30 days) |
| AUTH_ALLOWED_ORIGINS | Comma-separated exact origins; defaults to http://localhost:3000 outside production |
| Production origins | Required explicitly, HTTPS only, without paths/trailing slashes/wildcards |
| SECRET_TOKEN | Required nonempty signing secret; never use the example placeholder |

Example production relationship: frontend `https://app.example.com`, API `https://api.example.com/graphql`, allowlist `https://app.example.com`. These are illustrative, not inferred deployment URLs. Host-only cookies are sufficient: browsers send them to the API host. Credentialed CORS uses exact allowed origins, not arbitrary reflected origins. Both deployments must be HTTPS and same-site; unrelated hosting domains need a separately reviewed cookie/deployment change.

Apollo CSRF prevention stays enabled. Send `Apollo-Require-Preflight: true` for existing multipart uploads; the session header does not replace the upload preflight header. Upload field names and stream behavior are unchanged.

## Errors and rotation

Read `errors[].extensions.code`, not just HTTP status or message. GraphQL resolver errors normally use HTTP 200. Top-level non-null mutation failures normally produce `data: null`:

```json
{"errors":[{"extensions":{"code":"REFRESH_TOKEN_EXPIRED"},"message":"REFRESH_TOKEN_EXPIRED"}],"data":null}
```

| Code | Meaning / frontend action |
|---|---|
| ACCESS_TOKEN_EXPIRED | Required bearer token expired; coordinate one refresh and retry the failed operation once |
| ACCESS_TOKEN_MISSING | No bearer header; restore session once at application startup if appropriate; otherwise show login |
| ACCESS_TOKEN_INVALID | Malformed/invalid bearer token; clear local auth and show login; do not loop |
| FORBIDDEN | Insufficient permission; show permission error, never refresh |
| REFRESH_TOKEN_INVALID | Missing/malformed/unknown cookie token; return to login |
| REFRESH_TOKEN_EXPIRED | Known current token exceeded absolute session lifetime; return to login |
| REFRESH_TOKEN_REVOKED | Session revoked, or member deleted/inactive; return to login |
| REFRESH_TOKEN_REUSED | Consumed token presented; entire device family revoked; return to login |
| MEMBER_BLOCKED | Current database member is BLOCK; all its refresh sessions revoked; return to login |
| CSRF_FAILED | Wrong method, missing session header or disallowed origin; correct client configuration, do not refresh/retry automatically |

Existing credential login/signup/Google errors retain their prior messages and semantics. Optional-auth reads retain guest fallback when the bearer token is absent/invalid/expired.

Every successful refresh replaces the cookie and consumes its prior hash atomically. Each login creates a new independent device session. There is no overlap/grace period: concurrent use of one token allows at most one rotation, and the duplicate revokes that family, including the winner's replacement. A winner may already have received an access JWT, which retains its normal lifetime. Later uses of an already-revoked family return REFRESH_TOKEN_REVOKED. Revocation takes precedence over expiration; reuse detection precedes expiration for consumed tokens.

Successful password changes and BLOCK/DELETE updates revoke all member refresh sessions; supplied string passwords are now bcrypt-hashed. Ordinary profile changes do not create or rotate a refresh session. Profile operations that already returned accessToken still do so. Existing null-field behavior and update permissions are preserved.

Logout/revocation does not invalidate already-issued access JWTs. New JWTs expire after 15 minutes by default; old 30-day JWTs keep their original expiry. Session expiry is enforced by the service, not TTL timing. Expired session records are retained for seven additional days before MongoDB TTL cleanup; after removal an old token is unknown and returns REFRESH_TOKEN_INVALID. Rotation history contains hashes only.

A lost refresh response is ambiguous: the server may already have consumed the token. Do not automatically replay refresh after network errors or enable automatic retry middleware for it. Prompt reauthentication if safe recovery cannot be established. Do not log requests, cookies, authorization headers, variables, token responses or cookie-jar contents in frontend telemetry/proxies.

## Apollo integration steps

1. Configure the existing HttpLink/upload link with `credentials: 'include'`. Include `X-CSRF-Protection: 1` for login/signup/Google/refresh/logout (it may be included globally). Keep existing upload preflight headers.
2. Keep the access JWT in the existing auth state; prefer memory for new integration. Attach `Authorization: Bearer <JWT>` through the auth link. Do not attempt to read the HttpOnly cookie or store a refresh token in localStorage.
3. After login/signup/Google login, save Member.accessToken and existing member state. On a page reload, restore once through refreshToken before protected requests. Use `fetchPolicy: 'no-cache'` for renewal/auth operations; avoid caching refresh payloads.
4. Use one shared promise for all refresh callers in one tab. Route the refresh request through a bare fetch or a client path that bypasses the auth-error/retry link. Update the auth token before queued operations resume. Retry a failed protected operation only once and only on ACCESS_TOKEN_EXPIRED. Rebuild its Authorization header from the new token.
5. Coordinate tabs sharing the cookie with a Web Locks lock (for example `skiresort-session`) plus BroadcastChannel. Acquire the lock before refresh; check whether a peer already published a replacement access token for the failed JWT, and reuse it instead of refreshing again. Publish the new access token/auth generation while holding the lock. Never broadcast the refresh cookie. If these browser APIs are unavailable, use a single refresh owner such as a shared worker; do not independently refresh from every tab.
6. Coordinate logout with that same lock. Stop queued refresh/retries, await any known in-flight renewal, call logout with credentials, then clear local token/member state and Apollo cache and broadcast logout. Suppress late responses from the previous auth generation. If logout fails over the network, clear local auth but report that server revocation was not confirmed.
7. Terminal refresh errors clear local auth/cache and show login. CSRF/configuration errors need configuration repair. FORBIDDEN never triggers refresh. No automatic refresh retries or background multi-tab refresh loops.

Version-independent bare refresh transport (wrap this in the coordination above):

```js
async function requestNewAccessToken() {
  const response = await fetch('http://localhost:3007/graphql', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Protection': '1',
    },
    body: JSON.stringify({
      query: 'mutation RefreshSession { refreshToken { accessToken } }',
    }),
  });
  const result = await response.json();
  if (!response.ok || result.errors?.length) {
    throw new Error(result.errors?.[0]?.extensions?.code ?? 'REFRESH_TRANSPORT_FAILED');
  }
  return result.data.refreshToken.accessToken;
}
```

## Manual smoke test

Run against a development API and a test member only. Cookie jars contain secrets: keep them private and delete them afterward. These bash/curl examples do not print tokens; the final protected request uses the newly returned access token through your API client's bearer configuration.

```sh
curl -s -c cookies.txt -o login.json http://localhost:3007/graphql \
  -H 'Content-Type: application/json' -H 'X-CSRF-Protection: 1' \
  --data '{"query":"mutation { login(input: {memberNick: \"skier\", memberPassword: \"password\"}) { accessToken } }"}'
curl -s -b cookies.txt -c cookies.txt -o refresh.json http://localhost:3007/graphql \
  -H 'Content-Type: application/json' -H 'X-CSRF-Protection: 1' \
  --data '{"query":"mutation { refreshToken { accessToken } }"}'
curl -s -b cookies.txt -c cookies.txt http://localhost:3007/graphql \
  -H 'Content-Type: application/json' -H 'X-CSRF-Protection: 1' \
  --data '{"query":"mutation { logout }"}'
```

In Postman use the same URL/JSON/headers and cookie jar, then copy refreshToken.accessToken privately to the protected query's bearer setting. Verify `{ chechAuth }`, repeat refresh after logout, and test old-token reuse using an isolated saved cookie. Do not issue duplicate refreshes during normal frontend operation.

## Backend implementation and verification boundary

AuthModule registers the Member and RefreshSession models and exports SessionService. MemberResolver checks CSRF before existing authentication service calls, then sets the cookie through SessionService.create. SessionResolver is thin and has no access guard. SessionService loads current Member status, signs a JWT through AuthService, and conditionally rotates the session document. MemberService revokes sessions after successful sensitive updates. No dependency cycle or external runtime import is introduced.

The isolated GraphQL tests run real JWT signing/verification, password hashing/comparison, Nest guards, error formatting, cookies and HTTP requests with fixture persistence/Firebase identity. The optional `session.integration.spec.ts` uses only explicit `SKIRESORT_TEST_MONGO_URI`, creates a uniquely named disposable database and safely removes only that database. Never point it at a production server. Full deployment, real Google provider credentials, live MongoDB concurrency and frontend integration are not claimed unless separately recorded in [completed tasks](COMPLETED_TASKS.md).
