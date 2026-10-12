# Gemini assistant

The backend exposes `askAssistant` for authenticated members. It answers general skiing questions and searches public SkiResort FAQs, resorts, equipment, and events. It does not save conversations or change application records.

## Configuration and first request

Use Node 20 or newer, install dependencies with `npm install`, and configure the backend `.env`:

```dotenv
GEMINI_API_KEY=your_backend_only_key
# Optional; this is the default:
GEMINI_MODEL=gemini-3.5-flash-lite
```

Keep `.env` out of Git. Never expose the key in frontend configuration or send it to GraphQL. The existing `.env.example` edit was preserved without reading its contents. A missing or blank key disables assistant requests with `Assistant is not configured`; other backend features can still start.

Start the API with `npm run start:dev`. Send requests to its `/graphql` endpoint using an existing login token:

```http
Authorization: Bearer YOUR_LOGIN_TOKEN
Content-Type: application/json
```

```graphql
mutation AskAssistant($input: AssistantInput!) {
  askAssistant(input: $input) {
    answer
    sources {
      type
      id
      title
    }
  }
}
```

First-request variables:

```json
{
  "input": {
    "message": "Which beginner resorts are in Pyeongchang?"
  }
}
```

Follow-up variables:

```json
{
  "input": {
    "message": "What helmets are available for kids?",
    "history": [
      {
        "role": "USER",
        "message": "Which beginner resorts are in Pyeongchang?"
      },
      {
        "role": "ASSISTANT",
        "message": "The previous assistant answer goes here."
      }
    ]
  }
}
```

The future chat UI keeps history in its session and sends the newest bounded entries. Each message is trimmed and must contain 1–2,000 characters. History has at most 10 entries, and message plus history has at most 12,000 characters. Shorten long previous answers before submitting history. Only `USER` and `ASSISTANT` roles are accepted. `sources` is always a list, including `[]` for general advice or empty searches. Sources identify retrieved context, not a guarantee that every retrieved record was mentioned in the answer. Use type and ID to link to the appropriate frontend detail screen; URLs are not invented by the backend.

## Files and request flow

All paths below are relative to `apps/skiresort-api/src`.

| File                                         | Purpose                                                                                                                                                                                                                                                                                       |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/assistant/assistant.module.ts`   | Registers resolver and service; imports configuration, authentication, and the four feature modules that already export their public services.                                                                                                                                                |
| `components/assistant/assistant.resolver.ts` | `@Resolver()` supplies `@Mutation(() => AssistantResponse)`. `@UseGuards(AuthGuard)` validates the login token, `@Args('input')` receives the DTO, and `@AuthMember('_id')` supplies the authenticated member ID. The constructor injects `AssistantService`; `askAssistant` delegates to it. |
| `components/assistant/assistant.service.ts`  | Validates input, enforces limits, constructs the SDK client, sends bounded conversation content, executes approved searches, maps public fields, and returns answer plus deduplicated sources.                                                                                                |
| `components/assistant/assistant.tools.ts`    | Describes the four read-only functions to Gemini. Uses existing enum values and public search fields. No status overrides, member filters, pagination overrides, admin functions, or raw database queries are exposed.                                                                        |
| `libs/dto/assistant/assistant.input.ts`      | Defines `@InputType` classes, GraphQL role enum, trimming, string limits, array limits, and nested validation.                                                                                                                                                                                |
| `libs/dto/assistant/assistant.ts`            | Defines `@ObjectType` response/source classes and the source-type enum. GraphQL returns a required answer and required source list with required type, ID, and title fields.                                                                                                                  |

`ComponentsModule` imports `AssistantModule`, so it is registered under the existing root application. Configuration is explicitly imported in the feature module because the root configuration module is not globally registered. Feature module imports supply exported services through Nest dependency injection; the assistant registers no new Mongoose models and introduces no reverse feature dependency.

For a real request:

1. `AuthGuard` verifies the JWT and attaches the member; `AssistantResolver.askAssistant` passes only the member ID and DTO to the service.
2. `AssistantService.askAssistant` validates a transformed DTO and checks total size, configuration, member rate limit, and concurrent requests. It does not send the member ID or JWT to Gemini.
3. `respond` maps history to SDK `user`/`model` text messages and adds the current message. Server instructions require current searches for project facts and treat history and record descriptions as untrusted data.
4. Gemini can request `searchFaqs`, `searchResorts`, `searchEquipments`, or `searchEvents`. `inquiry` rejects unknown arguments and validates the existing inquiry DTO with fixed `page: 1` and `limit: 5`.
5. `search` delegates to `FaqService.getFaqs`, `ResortService.getResorts(null, input)`, `EquipmentService.getEquipments(null, input)`, or `EventService.getEvents`. Existing services perform their usual Mongoose aggregation and visibility filtering: published FAQs/events, visible resorts including sold-out resorts, and available equipment. Detail reads that increment view counters are not used.
6. Results are mapped to explicitly selected public fields. Member data, owner IDs, credentials, personalization, and unrelated nested fields are excluded. Descriptions/FAQ answers are capped at 2,000 characters. Rental rates are mapped field by field. Actual statuses/dates/prices are included; currency and real-time availability are not inferred.
7. The complete model tool-call content is retained for the next generation, including SDK metadata/thought signatures. Tool responses carry bounded records and a notice that the search is not exhaustive. Source IDs/titles are collected by the server and deduplicated by type and ID.
8. At most four searches run over two tool rounds; the next generation has no tools. The final text becomes `AssistantResponse.answer`. No model-supplied source identifiers are accepted.

There is no assistant CREATE/UPDATE/DELETE database path. Existing feature CRUD methods, public GraphQL operations, schemas, and business rules were preserved. This addition follows the current SkiResort module/resolver/service and shared DTO organization; it does not claim a new Nestar architecture audit.

## Limits, privacy, and errors

- Five started requests per member in a rolling minute and one in-flight request per member. Failures count toward the rate limit; rejected validation, missing configuration, and concurrent attempts do not. Old timestamps are cleaned on each incoming request.
- Limits are in memory per API instance; restarting resets them. Multiple replicas each enforce their own limits. There is no shared rate-limit store.
- One 30-second deadline covers SDK generations and database searches. SDK calls use the same cancellation signal and remaining timeout. A timed-out database read cannot be cancelled; the member lock stays held until it settles, and no further model calls or searches begin afterward.
- Every generation is limited to 1,024 output tokens. A request can use up to three generations. The SDK is configured for one attempt, with no automatic retries, provider fallback, or paid-model fallback.
- Invalid input produces a bad-request error; limits/quota return sanitized 429 errors; timeouts return a sanitized gateway-timeout error; blocked/empty responses, invalid tools, and other upstream failures return sanitized unavailable errors. GraphQL errors use the application's existing formatter; transport HTTP status may remain 200, so the frontend must inspect `errors`.
- Chat history and selected public records are transmitted to Google. Do not send private member information in chat. The backend does not alter the account's billing tier: free-tier quotas and data-use terms are controlled by the Gemini project/model. See [Google pricing](https://ai.google.dev/gemini-api/docs/pricing).
- Grounding instructions reduce invented answers but cannot guarantee model accuracy. Sources represent fetched records; users should verify prices and conditions on their detail pages.
- `LoggingInterceptor` records only operation name, duration, and success/error for operations containing the assistant, including aliases and fragments. It omits request/response text. The pre-existing `AuthGuard` separately logs authorization headers; that remains an explicitly reported existing risk, outside this feature's authentication scope.

## Verification

The SDK installed is `@google/genai` 2.28.0. The synthetic live smoke request to the default `gemini-3.5-flash-lite` model passed using the configured key; no key, project record, or private user text was printed or submitted, and MongoDB was not contacted by that check.

The new service tests mock Gemini and all four feature services. They cover history mapping, configuration defaults, DTO validation, public-field filtering, fixed pagination, result/source bounds, deduplication, tool limits, malformed calls, blocked/empty responses, sanitized provider failures, member rate/concurrency limits, and deadlines. GraphQL tests verify schema nullability, authentication metadata/behavior, resolver dependency injection, and content-free logging. Existing feature tests are run alongside them. No production database bootstrap or migrations are needed.

Final results: `build:api` passed; all 14 relevant test suites passed (282 tests); lint passed for new assistant files, DTOs, and `ComponentsModule`; all scoped formatting checks passed with existing line endings preserved. The changed logging interceptor retains one lint error already present in its original Git version; a baseline comparison found no new lint messages in that file. Diff whitespace checks passed for task-modified tracked files, excluding the preserved user environment example change.

Useful commands:

```powershell
npm run build:api
npm test -- --runInBand apps/skiresort-api/src/components/assistant apps/skiresort-api/src/components/faq apps/skiresort-api/src/components/resort apps/skiresort-api/src/components/equipment apps/skiresort-api/src/components/event
npx eslint apps/skiresort-api/src/components/assistant apps/skiresort-api/src/libs/dto/assistant
npx prettier --check --end-of-line auto apps/skiresort-api/src/components/assistant apps/skiresort-api/src/libs/dto/assistant apps/skiresort-api/src/libs/interceptor/Logging.interceptor.ts docs/backend-refactor/AI_ASSISTANT.md
```

Use direct check commands: the repository's `lint` and `format` scripts automatically rewrite files. This session needed an explicit `C:\Program Files\nodejs` PATH entry because Node was not on the shell PATH. An initial build during dependency installation encountered a transient missing webpack module; the subsequent build succeeded after installation finished. No database-dependent end-to-end bootstrap was run.
