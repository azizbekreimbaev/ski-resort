# Backend migration: Nestar → SkiResort

## FAQ backend: 2026-10-07

Implemented FAQ GraphQL public reads and ACTIVE ADMIN CRUD using the existing Events pattern, with plain text question/answer and DRAFT/PUBLISHED status. Separate `faqs` collection; no DMM change, frontend or live migration. See [FAQ handoff](FAQ_IMPLEMENTATION.md) and [fresh checks](COMPLETED_TASKS.md).

## Events domain: 2026-10-06

Implemented a separate `events` collection with scheduled dates, 1–5 images, optional Resort/location, DRAFT/PUBLISHED status, public published-only reads and ACTIVE ADMIN CRUD/uploads. Permanent removal retains files and references; generic upload targets reserve the Events namespace. Events are an approved extension beyond the unchanged DMM. See [client handoff](EVENT_IMPLEMENTATION.md) and [fresh validation](COMPLETED_TASKS.md). No live database migration, frontend or deployment is claimed.

## Resort minimum stay: 2026-10-06

User override: Resort minimum stay is now one day. Creation defaults to 1; create and admin-update values must be integers >= 1. Schema validation and the DMM rule match. Existing records are unchanged; Booking remains deferred. Earlier two-day statements describe historical behavior.

## Resort minimum duration: 2026-10-06

The user changed the Resort minimum to one day, superseding earlier two-day references. Create/update DTOs require positive whole days; GraphQL, service and schema creation defaults are 1. The DMM and current handoff reflect this rule. Existing records are not rewritten; Booking remains deferred.


## Image upload stream repair: 2026-10-06

imageUploader and imagesUploader now create missing target folders and share pipeline-based stream handling with partial-file cleanup. Single-upload errors retain the original exception instead of rejecting with false. Existing GraphQL fields, guards, relative URL format and multi-upload partial-success behavior are preserved; unsafe absolute/traversal targets are rejected before directory creation. See [executed checks and limits](COMPLETED_TASKS.md#image-upload-stream-repair-2026-10-06). Broader historical upload/security findings are not claimed fully resolved.

## Instructor follow-state repair: 2026-10-05

getInstructors now includes the existing meFollowed lookup for each listed instructor and the requesting member. Clients should select meFollowed { myFollowing } in their query to preserve the Follow/Unfollow state after refresh. Repeated subscribe requests return the existing relationship without incrementing follow counters again; the unique pair index remains unchanged. See [fresh validation and limits](COMPLETED_TASKS.md#instructor-directory-follow-state-and-repeated-subscribe-2026-10-05).

## Equipment catalog implementation: 2026-10-04

The subsequent [update-flow review](COMPLETED_TASKS.md#update-flow-simplification-review-2026-10-04) removed a redundant Instructor profile read. The user's later clarification replaces owner comment updates/deletion with the exact original single-update flow: DELETE is only a status change, without target counters or compensation. Equipment cross-field validation and existing public contracts remain intact.

The user subsequently reported successful Equipment creation testing after receiving the Postman request. See the [reusable smoke test](EQUIPMENT_IMPLEMENTATION.md#postman-createequipment-smoke-test) and [test-report scope](COMPLETED_TASKS.md#equipment-creation-manual-test-report-2026-10-04). Booking specification is the next recommended domain step; its policies and implementation remain pending.

The approved revised Equipment phase is implemented locally. It registers EquipmentModule with admin catalog management, public list/detail, likes/views/comments, favorites and visited history. The Equipment DMM now uses one normalized size variant per record, required KIDS/ADULTS/ALL audience, independent embedded whole-hour rental packages and optional catalog purchase capability. Daily Equipment price/minimum days and RENTED are removed; the shortest package defines the minimum. Resort's daily pricing/two-day minimum and Member/Instructor behavior remain unchanged.

ADMIN Equipment operations reuse RolesGuard and check current database ACTIVE ADMIN. Partial updates validate final dependent fields and use conditional predicates for category/size and purchase fields. Public visibility is AVAILABLE-only; quantity is manually managed, including zero. Permanent removal retains references, and retained Equipment comments can be removed after target deletion. New EQUIPMENT group values preserve existing social contracts and exact-record compensation, without social transactions or new indexes.

No Booking, orders, checkout, payments, availability deduction, frontend, live database/index migration or deployment. See [Equipment client handoff](EQUIPMENT_IMPLEMENTATION.md) and [fresh validation](COMPLETED_TASKS.md). Earlier Equipment deferral and unchanged-DMM statements below are historical snapshots superseded only for this phase.

Documentation date: 2026-10-04. SkiResort is the confirmed target; the Petoria wording in the documentation request was corrected by the user. The original branding migration and later domain phases are recorded separately below.

## Member → Instructor implementation: 2026-10-04

The approved domain phase is implemented locally using the existing NestJS resolver/service/module and Mongoose patterns. Final `MemberType` values are USER, ADMIN and INSTRUCTOR. AGENT is removed from active source; no legacy account is automatically promoted. No database, collection, record, installed index, upload, JWT format or dependency was migrated. Lessons, Equipment, Booking and payments remain deferred.

### Member compatibility and breaking directory change

`signup(input: MemberInput!)` and its response stay intact. `MemberInput.memberType` remains optional/nullable in GraphQL: explicit USER and omission work, while explicit ADMIN, INSTRUCTOR or null are rejected before hashing/persistence. Omission uses the existing USER schema default; supplied privileged roles are not silently replaced. Login, password hashing and token issuance retain their existing implementation.

`getAgents` becomes `getInstructors(input: InstructorsInquiry!)`, returning `Members` with `list` and `metaCounter`. There are no aliases for the old operation, input, search type or role. Instructor directory fields remain page, limit, sort, direction and required search with optional nickname text. Sorts remain createdAt, updatedAt, memberLikes, memberViews and memberRank. Existing regex search, pagination/facet and Member-like lookup behavior is preserved. Only ACTIVE INSTRUCTOR members match.

`chechAuthRoles` keeps its spelling and now permits USER/INSTRUCTOR, excluding ADMIN as before. General `updateMember` keeps its existing input and profile behavior but prohibits role changes; unchanged supplied roles are accepted and excluded from writes. Generic admin updates retain USER↔ADMIN operations and conditionally match the current role when changing it. They cannot assign INSTRUCTOR to a non-instructor or reassign an Instructor; dedicated application approval is authoritative. Instructor fields are not added to generic `MemberUpdate`.

### Application GraphQL contracts

| Operation | Guard / current database check | Return |
|---|---|---|
| createInstructorApplication(input: InstructorApplicationInput!) | Existing USER RolesGuard; ACTIVE USER | InstructorApplication |
| getMyInstructorApplication | Existing AuthGuard; ACTIVE authenticated owner | Latest InstructorApplication or null |
| getAllInstructorApplicationsByAdmin(input: InstructorApplicationsInquiry!) | Existing ADMIN RolesGuard; ACTIVE ADMIN | InstructorApplications |
| getInstructorApplicationByAdmin(applicationId: String!) | Existing ADMIN RolesGuard; ACTIVE ADMIN | InstructorApplication |
| approveInstructorApplicationByAdmin(applicationId: String!) | Existing ADMIN RolesGuard; ACTIVE ADMIN | InstructorApplication |
| rejectInstructorApplicationByAdmin(input: InstructorApplicationReject!) | Existing ADMIN RolesGuard; ACTIVE ADMIN | InstructorApplication |
| updateInstructorProfile(input: InstructorProfileUpdate!) | Existing INSTRUCTOR RolesGuard; ACTIVE INSTRUCTOR | Member with refreshed token |

Application input requires `instructorExperienceYears` (integer >= 0), a nonempty array of trimmed nonblank `instructorLanguages`, `instructorLevel` (BEGINNER/INTERMEDIATE/ADVANCED/ALL) and scalar `instructorAudience` (KIDS/ADULTS/FAMILY/PRIVATE). Nullable Resort ID and memberDesc bio snapshot are optional. Prices and certificates are excluded. Server derives memberId; applicants cannot supply status, reviewer, timestamps or identity.

`instructorApplications` is an explicitly named new collection. Each submission stores its snapshot, PENDING/APPROVED/REJECTED status and nullable reviewedBy, reviewedAt and rejectionReason. Rejected members submit a new document; previous applications remain unchanged. There are no pending edits, withdrawal or removal operations. Admin rejection requires an input object with `_id` and trimmed nonblank `rejectionReason`.

Admin list inquiries require page >= 1 and limit 1–100. Optional search filters are applicationStatus and memberId; sorts are createdAt, updatedAt and reviewedAt, with existing Direction. Default ordering is createdAt DESC with an _id tie-breaker. List output preserves `list`/`metaCounter`; empty results have empty arrays. Application data has no public query or full Member join.

### Atomicity and instructor profile

Submission and both review operations require MongoDB transactions using the existing connection. Submission conditionally advances the applicant's updatedAt timestamp to serialize against promotion/role changes without modifying role or profile. A schema-declared unique partial index named `unique_pending_instructor_application` constrains memberId only while status is PENDING. Duplicate-key failures become clear conflicts. The index must exist for database-enforced uniqueness.

Approval conditionally marks PENDING as APPROVED and promotes the same ACTIVE USER within one transaction, copying Resort association, experience, languages, level and audience. Errors roll back both writes. Repeated/competing terminal decisions fail with Conflict. Rejection records reviewer/time/reason and never modifies Member. Optional Resort references use existing ACTIVE/SOLD_OUT visibility and are checked again before approval; Resort changes do not cascade.

The members schema/output adds nullable instructorResortId, instructorExperienceYears, instructorLanguages, instructorLevel, **instructorAudience**, and instructorPrice1Week through instructorPrice4Weeks. Normal USER records have no populated instructor data. Prices stay null until set by the approved Instructor. Application bio does not overwrite existing Member bio. Instructor profile updates permit editing/clearing the nine instructor fields; omitted values remain unchanged and prices must be finite/nonnegative. Snapshots remain immutable.

Existing guards/JWT format are preserved; new services also check current database role/status. Approval does not rewrite a user's old JWT. The Instructor must use normal login to obtain an INSTRUCTOR token before role-guarded profile access. No separate signup/login/account is created.

### Batch, clients and rollout boundaries

Provider ranking is now `batchTopInstructors` / `BATCH_TOP_INSTRUCTORS`, with unchanged cron time 01:00:40 and existing asynchronous update pattern. Rollback at 01:00:00 targets ACTIVE INSTRUCTOR members. Rank is `3 * memberArticles + 2 * memberLikes + memberViews`; the obsolete property term is removed without substituting a lesson factor. Existing counters remain stored fields.

Clients must update getAgents/AgentsInquiry to getInstructors/InstructorsInquiry, remove AGENT enum assumptions and use the exact instructorAudience name. No frontend source or deployment was changed. Applications and audience are approved extensions beyond the unchanged DMM.

Before rollout, verify transaction-capable MongoDB and the exact pending index. Do not run broad syncIndexes or alter unrelated indexes. Existing persisted AGENT records, if any, require a separate explicitly approved cleanup decision; they are not approved instructors and are not rewritten, hidden or aliased here. Returning a retained AGENT value can fail GraphQL enum serialization, including login/admin/member joins, so resolve this before deployment. Existing ADMIN provenance and broader stale-token/password-update/upload/logging defects are not repaired by this phase.

An opt-in integration suite uses only `SKIRESORT_TEST_MONGO_URI`, does not load .env/AppModule and creates a unique `skiresort_instructor_test_<ObjectId>` database. It validates uniqueness, review races and transaction rollback, then removes only its generated database. Default tests skip it. Current executed validation and limits are in [completed tasks](COMPLETED_TASKS.md).

## Later Resort domain migration: 2026-10-04

The Resort-first implementation now replaces the active Property feature with Resort. It implements the DMM Resort schema, catalog/admin operations, likes/views/comments and Resort favorites/visited lists; it removes Property-specific batch jobs. Member/instructor, Equipment and Booking migration remain deferred. Existing data, databases, uploads, indexes and auth were preserved. See [Resort implementation and client handoff](RESORT_IMPLEMENTATION.md) for breaking GraphQL changes, current behavior and limits, and [completed tasks](COMPLETED_TASKS.md) for fresh checks.

The remaining sections record the earlier branding migration and its then-current Property contracts. They are historical snapshots, not the current Resort API inventory.

## Original and current project

| Area | Original | Current |
|---|---|---|
| Brand | Nestar / NESTAR / nestar | SkiResort / SKIRESORT / skiresort |
| npm package | `nestar` | `skiresort` |
| API directory | `apps/nestar-api` | `apps/skiresort-api` |
| Batch directory | `apps/nestar-batch` | `apps/skiresort-batch` |
| Default Nest project | `nestar` | `skiresort` |
| Batch Nest project | `nestar-batch` | `skiresort-batch` |
| Production entrypoints | `dist/apps/nestar-{api,batch}/main` | `dist/apps/skiresort-{api,batch}/main` |

The backend remains a two-application NestJS monorepo using TypeScript, Express, code-first GraphQL/Apollo, Mongoose/MongoDB, JWT, local uploads, native WebSockets, and scheduled ranking jobs. Existing property, member, and community functionality remains; the new brand does not establish ski-specific domain functionality. See [architecture](../../context/architecture.md).

## Migration goal and naming changes

Remove the old active project identity while preserving behavior. Package and lockfile root metadata, Nest configuration, TypeScript output paths, npm script targets, cross-application imports, greetings, test labels/assertions, documentation, evidence paths, and manifest entries were updated. Dependency versions and script names were preserved.

API `GET /` now returns `Welcome to SKIRESORT API server!`. Batch `GET /` returns `Welcome to SKIRESORT BATCH  server!` (the existing double space is preserved). Six ignored local database-export filenames changed from `Nestar.*.json` to `SkiResort.*.json`, with byte-identical contents; this did not rename live databases or collections.

## Modules and GraphQL

| Area | Implemented change | Preserved contract |
|---|---|---|
| API feature modules | Application parent directory renamed | Auth, Member, Property, BoardArticle, Comment, Follow, Like, View module behavior |
| Batch | Imports now target `../../skiresort-api/...` | Property/Member models, ranking calculations and cron schedules |
| Root HTTP endpoints | Brand text changed | Routes and status behavior |
| GraphQL | No field, type, input, or operation rename | `/graphql`, resolver arguments, guards, DTOs and enums |
| Uploads/WebSockets | No protocol migration | Existing paths, events, storage and implementation |

`sayHello` still returns `GraphQL API Server`. Existing spellings `chechAuth` and `chechAuthRoles` remain public field names. Property, Properties, Agent, Product, Member, Comment, Like, Follow, View, and Notice terminology is intentionally unchanged. Exact operations are in the [API inventory](../../context/api-inventory.md).

## MongoDB collections and schemas

| Model | Explicit collection | Migration |
|---|---|---|
| Member | `members` | None |
| Property | `properties` | None |
| BoardArticle | `boardArticles` | None |
| Comment | `comments` | None |
| Follow | `follows` | None |
| Like | `likes` | None |
| View | `views` | None |
| Notice | `notices` | None; remains schema-only |
| Notification | `notifications` | None; remains schema-only |

No schema fields, references, indexes, persisted enum values, collection names, or data were migrated. Live collection/index existence was not verified. See [data model](../../context/data-model.md).

## Database example discrepancy

The user explicitly chose to preserve database connections/data and the old database names in `.env.example`. At migration validation, the two examples were still `nestar_dev` and `nestar_prod`. During this documentation pass, `.env.example` already contained `skiresort_dev` and `skiresort_prod`. This later workspace change is observed, not attributed to the completed migration. These documents do not edit or revert it. Example names do not establish the names of live databases; active secret values are not reproduced here.

## Compatibility and verification

External scripts using old Nest project keys or application/output paths must adopt the new identifiers. No legacy path aliases were introduced. Existing GraphQL clients and persisted domain data retain their contracts. Local export filenames must be updated in any external manual import commands. Git history, Git internals, third-party packages, and external resources were outside the branding migration.

Both applications compiled and built successfully; isolated HTTP greeting tests passed. Full database-backed e2e tests and production startup were not run. Existing lint failures remain. See [completed tasks](COMPLETED_TASKS.md) and the [verification record](../../context/verification.md).

Historical old-name references in these migration documents are intentional. The earlier zero-reference audit predates `docs/`; future branding scans must distinguish historical documentation from active project identity.
