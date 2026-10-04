# SkiResort Backend Agent Instructions

SkiResort is a NestJS GraphQL backend monorepo being adapted from a real-estate platform to a ski-resort platform. The target domain is defined in [SkiResort-Simple-ER.dmm](SkiResort-Simple-ER.dmm); the completed branding migration did not implement that domain.

## Read First

Read all six project-context documents before beginning work:

- [Backend migration](docs/ai/BACKEND_MIGRATION.md)
- [Decisions](docs/ai/DECISIONS.md)
- [Frontend migration](docs/ai/FRONTEND_MIGRATION.md)
- [Completed tasks](docs/ai/COMPLETED_TASKS.md)
- [Next steps](docs/ai/NEXT_STEPS.md)
- [Prompts](docs/ai/PROMPTS.md)

Read the DMM before domain work: it is the source of truth for target collections, fields, required/nullable flags, relationships, enum values and recorded business rules. The six handoff documents record migration history, accepted decisions, remaining work and validation status. Earlier branding-only restrictions describe that earlier task; they do not override a current request to implement the DMM domain.

Inspect Git status and applicable nested instructions before editing. Preserve existing user changes. Current user instructions take precedence over historical plans; verify documentation against current source. Backlogs and reusable prompts do not independently authorize implementation.

## Project Shape

This repository is a TypeScript/NestJS backend monorepo with one dependency graph:

| Application | Source | Nest project key | Production output |
|---|---|---|---|
| API (default) | `apps/skiresort-api/src` | `skiresort` | `dist/apps/skiresort-api/main.js` |
| Scheduled batch | `apps/skiresort-batch/src` | `skiresort-batch` | `dist/apps/skiresort-batch/main.js` |

The API uses Express, code-first GraphQL/Apollo, Mongoose/MongoDB, JWT guards, local filesystem uploads and native WebSockets. Batch jobs use Nest Schedule and import API schemas, DTOs and enums directly. Changes to shared definitions may affect both applications. Do not introduce architecture changes as incidental cleanup.

- Keep the existing NestJS resolver/service/module pattern based on MVC and dependency injection. Resolvers handle GraphQL transport and guards; services implement business logic and persistence; modules wire models, providers, imports and exports.
- Keep DTOs and enums under `apps/skiresort-api/src/libs/dto` and `apps/skiresort-api/src/libs/enums`; keep Mongoose schemas under `apps/skiresort-api/src/schemas` (schemas are not currently under `libs`). Feature modules remain under `apps/skiresort-api/src/components`.
- Keep shared auth, member, like, view, comment, follow, board-article and socket modules reusable as the catalog changes.

Current source registers Auth, Member, InstructorApplication, Resort, BoardArticle, Comment, Follow, Like and View modules. Notice and Notification have schema definitions without active feature registration. Equipment, Booking and Lesson remain deferred. Verify current source before relying on this snapshot.

Detailed references are in [architecture](context/architecture.md), [API inventory](context/api-inventory.md), [data model](context/data-model.md), [code standards](context/code-standards.md) and [review findings](context/review-findings.md).

## Domain Rules

- Use `SkiResort` / `SKIRESORT` / `skiresort` for project identity and Resort, Equipment, Booking and Instructor terminology for the target domain.
- Do not introduce pet-shop/product enums or real-estate fields into new ski-domain contracts. Property and AGENT APIs are retired; historical documentation retains their provenance. Do not reintroduce aliases or reinterpret legacy data.
- Users, admins and instructors share `members`; do not create a separate instructor collection. Implemented `memberType` values are `USER`, `ADMIN`, `INSTRUCTOR`. Persisted AGENT records, if any, need separately approved cleanup and must never automatically become INSTRUCTOR.
- Instructor-only fields are nullable: `instructorResortId`, `instructorExperienceYears`, `instructorLanguages`, `instructorLevel`, `instructorAudience`, and `instructorPrice1Week` through `instructorPrice4Weeks`. Audience is a scalar enum: `KIDS`, `ADULTS`, `FAMILY`, `PRIVATE`; it is an approved extension beyond the unchanged DMM.
- Public signup retains optional MemberInput.memberType, accepting USER/omission and rejecting privileged/null roles. Self updates cannot change role. Only ADMIN application approval promotes ACTIVE USER to INSTRUCTOR; generic admin updates cannot bypass it. Instructor reassignment and Lessons are deferred.
- Applications use separate `instructorApplications` PENDING/APPROVED/REJECTED snapshots. Submission/review require transactions and a pending-only unique memberId index; deployment must verify both. New operations reuse guards and additionally check current database role/status. See [Member/Instructor handoff](docs/ai/BACKEND_MIGRATION.md).
- `getInstructors` / `InstructorsInquiry` replace the provider directory. Batch ranks ACTIVE INSTRUCTOR using article/like/view weights 3/2/1, existing schedules and no property contribution. Local implementation does not imply live data/index changes.
- Resort bookings require a minimum of two days (`resortMinDays`); equipment rentals require a minimum of two days (`equipmentMinDays`).
- One `bookings` collection stores resort bookings, equipment rentals and instructor bookings. It includes the booking member, type, nullable target IDs, start/end dates, quantity, total price and status. `instructorId` references a member, not a separate instructor model.
- Preserve DMM field spelling, collection casing and required/nullable flags, including nullable `equipments.resortId` and `views.memberId`. Generic comments, likes and views use their group enum plus reference ID; follows remain member-to-member, including instructors.
- The DMM does not specify resort-owner roles, instructor booking duration, date inclusivity, price formulas, availability/concurrency policy, cancellation policy or notification resource discrimination. Do not present inferred policies as diagram rules; resolve them when relevant implementation needs them.

### Target Collections

| Collection | Purpose / references |
|---|---|
| `members` | Users, admins and instructors; nullable instructor resort association |
| `resorts` | Bookable ski resorts; `memberId` references `members` |
| `equipments` | Rental equipment; nullable `resortId` references `resorts` |
| `bookings` | `memberId` references `members`; nullable `resortId`, `equipmentId`, `instructorId` reference their targets |
| `boardArticles` | Community posts; `memberId` references `members` |
| `comments` | Article/resort/equipment comments; `memberId` and polymorphic `commentRefId` |
| `likes` | Member/article/resort/equipment likes; `memberId` and polymorphic `likeRefId` |
| `views` | Member/article/resort/equipment views; nullable `memberId` and polymorphic `viewRefId` |
| `follows` | `followingId` and `followerId` reference `members` |
| `notifications` | Required `receiverId`, nullable `authorId` reference `members`; nullable `resourceId` |
| `notices` | Admin notices; `memberId` references `members` |

### Target Enum Values

These are the exact DMM field values, not a claim that current TypeScript enums already match.

| Field(s) | Values |
|---|---|
| `memberType` | `USER`, `ADMIN`, `INSTRUCTOR` |
| `memberStatus` | `ACTIVE`, `BLOCK`, `DELETE` |
| `memberAuthType` | `EMAIL`, `PHONE` |
| `instructorLevel` | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `ALL` |
| `resortStatus` | `ACTIVE`, `SOLD_OUT`, `DELETE` |
| `resortLevel` | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `MIXED` |
| `equipmentStatus` | `AVAILABLE`, `RENTED`, `MAINTENANCE`, `DELETE` |
| `equipmentCategory` | `SKI`, `SNOWBOARD`, `BOOTS`, `HELMET`, `POLES`, `CLOTHING`, `OTHER` |
| `bookingType` | `RESORT`, `EQUIPMENT`, `INSTRUCTOR` |
| `bookingStatus` | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| `articleCategory` | `FREE`, `REVIEW`, `NEWS`, `QNA` |
| `articleStatus`, `commentStatus`, `noticeStatus` | `ACTIVE`, `DELETE` |
| `commentGroup` | `ARTICLE`, `RESORT`, `EQUIPMENT` |
| `likeGroup`, `viewGroup` | `MEMBER`, `ARTICLE`, `RESORT`, `EQUIPMENT` |
| `notificationType` | `BOOKING`, `COMMENT`, `LIKE`, `FOLLOW`, `SYSTEM` |
| `notificationStatus` | `UNREAD`, `READ` |
| `noticeCategory` | `GENERAL`, `RESORT`, `EVENT`, `SYSTEM` |

## Compatibility and Migration Boundaries

- Preserve GraphQL field names, arguments, DTOs, enum values and client contracts outside the requested migration scope. The default endpoint is `/graphql`; existing `chechAuth` and `chechAuthRoles` spellings remain public contracts.
- Implementing target schemas does not authorize moving, deleting or renaming live databases or stored records. Plan data and client compatibility explicitly when replacing legacy collections or enum values; preserve unrelated references and indexes.
- Keep dependency versions stable for branding/documentation tasks. Do not mix upgrades, large formatting changes or unrelated defect repairs into them.
- Historical old-name references in migration documents and provenance are intentional. Branding audits must distinguish active identity from historical documentation, Git internals and third-party packages.

## Database and runtime boundaries

The user originally chose to preserve database example names as well as live connections/data. Later inspection found `.env.example` already using SkiResort example names. This discrepancy is documented in `docs/ai`; do not automatically revert the file or rename databases to reconcile it. Follow the current task's instructions and clarify only when resolving that policy is necessary.

Do not expose `.env` secrets, tokens, credentials or private exported data in commands, logs, documentation or final responses. Treat ignored `uploads/` content as data; preserve its contents and avoid incidental rewrites. `dist/` is generated output, not application source.

Full application startup and e2e suites may connect to MongoDB; batch startup can execute scheduled jobs. Use isolated fixtures or a known test environment for tests that write data. Isolated controller/service tests do not establish full bootstrap or database integration correctness.

## Workflow

1. Analyze relevant source, DMM definitions and context before editing. Historical review findings describe existing issues, not defects caused by the branding migration; reverify them before repair.
2. Keep changes small, within the requested scope and consistent with existing project patterns. Documentation-only tasks must not change application source or configuration.
3. Do not remove working logic unless it is replaced safely. Trace resolver/service/module wiring, DTOs, schema references, aggregation lookups, authorization and batch dependencies for each domain change.
4. Use current application/project paths in imports, scripts and output references. Do not restore old project aliases as an incidental compatibility workaround.
5. Update `docs/ai/COMPLETED_TASKS.md` after major completed work, and update affected decisions/migration/next-step documents when within scope. Record implemented work separately from target design.
6. Add or update focused regression tests when behavior changes. Avoid tests that merely duplicate trivial naming substitutions.

No Next.js frontend source is present in this backend checkout. Frontend mappings in `docs/ai` are candidates; inspect the actual frontend repository and its instructions before implementing them. Do not invent routes, component paths or deployment URLs.

## Validation

Use an available Node/npm runtime and installed dependencies. Do not assume the temporary runtime used in the historical migration remains available.

```sh
# Compile both application configurations without writing incremental metadata
node node_modules/typescript/bin/tsc --project apps/skiresort-api/tsconfig.app.json --noEmit --incremental false
node node_modules/typescript/bin/tsc --project apps/skiresort-batch/tsconfig.app.json --noEmit --incremental false

# Build the default API and explicit batch application
npm run build
npm run build -- skiresort-batch

# Inspect lint without rewriting source
node node_modules/eslint/bin/eslint.js "apps/**/*.ts"

# Check patch whitespace
git diff --check
```

Choose checks appropriate to the change. Application compiler configurations exclude tests, so passing these checks does not verify test compilation. `npm run lint` includes `--fix`; do not use it as a read-only check. `npm run format` also rewrites files. For documentation-only edits, check Markdown links and the diff; builds are unnecessary.

The migration record reports 3,214 lint errors and 24 warnings as a historical baseline. Do not treat those totals as a guaranteed current result or repair all of them incidentally. Report newly observed failures separately from existing ones. Verify test discovery before claiming coverage; the historical default Jest run discovered no tests.

## Documentation and handoff

Keep completed work, proposed next tasks and observed workspace changes distinct. When a task changes migration state, update relevant `docs/ai` documents if within scope. Link from the document's actual location: repository-root context links from `docs/ai` require `../../context/...`.

Preserve dates and provenance of historical diagnostics; editing embedded paths or branding does not rerun a check. Refresh affected source-manifest hashes/line counts when maintaining that artifact, without presenting its original commit as the current tree.

Final reports should state what changed, which checks actually ran, their results and material limits. Do not infer frontend completion, live data migration, deployment, commits or publication from local file edits. Distinguish historical validation from checks executed for the current task.
