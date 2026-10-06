# Completed tasks and validation

## Events CRUD domain: 2026-10-06

Implemented Event schema/DTOs/enum/module/service/resolver and registered the module. The new `events` collection has required scheduled dates, 1–5 distinct existing Event image paths, nullable location/Resort association, immutable server-derived creator, timestamps and default DRAFT/PUBLISHED status. Public list/detail expose PUBLISHED including past Events; ACTIVE ADMIN operations manage all Events. Updates preserve omitted fields and condition date edits on the previously read pair. Removal permanently deletes only the Event document.

Added dedicated admin Event uploads using the existing shared storage helper, fixed `uploads/events` destination, PNG/JPEG MIME/extension checks and whole-request failure cleanup. Existing middleware retains its 15,000,000-byte per-file limit. Generic image upload mutations now reject the reserved Events namespace; unrelated upload behavior and pre-existing stream-repair edits are preserved. No DMM edit, dependency change, live database operation, frontend, booking/registration/payment/social integration or deployment.

Fresh executed checks:

| Check | Result | Boundary |
|---|---|---|
| Four focused Jest suites | Passed: 63 tests | Event service, generated GraphQL/real role guards, Mongoose schema and generic upload regressions; temporary files and mocked persistence |
| API and batch TypeScript noEmit/incremental false | Passed | No startup/database connection |
| Separate Event/upload test compilation | Passed | Temporary explicit test config; application configs exclude tests |
| API and explicit batch production builds | Passed | Bundles generated; applications/scheduler not executed |
| Scoped non-fixing ESLint | Passed: zero diagnostics | All new Event source/spec files and shared image-upload helper; no whole-repository lint claim |
| Local Markdown links and Git patch whitespace | Passed | Event handoff and affected migration documents; existing workspace edits retained |

Validation used the discovered local Node v20.19.0 runtime and existing installed dependencies. Initial scoped lint/type diagnostics were corrected and final checks passed. Live MongoDB aggregation and conditional-update concurrency, full bootstrap, multipart HTTP transport/size-limit behavior and deployment were not exercised. The image size limit is existing middleware configuration, not newly proven by the isolated tests. Uploaded files remain public static assets, including draft/unattached images. See [Events client handoff and examples](EVENT_IMPLEMENTATION.md).

## Resort one-day minimum validation: 2026-10-06

Changed create/update validation, GraphQL/service/schema defaults and DMM minimum to 1 day. Larger positive whole-day minima remain valid. Updated current handoff and instructions; preserved existing stored records and unrelated workspace edits.

Fresh checks: four isolated Resort suites passed (114 tests); after adding further boundary cases, the DTO suite passed (54 tests). API and batch TypeScript no-emit checks passed. Patch whitespace check passed. No live MongoDB, full bootstrap, Booking enforcement or deployment was tested.

## Resort minimum duration: 2026-10-06

The user changed the Resort minimum to one day, superseding earlier two-day references. Create/update DTOs require positive whole days; GraphQL, service and schema creation defaults are 1. The DMM and current handoff reflect this rule. Existing records are not rewritten; Booking remains deferred.

Fresh validation: four focused Jest suites passed (114 tests), both API and batch TypeScript noEmit/incremental false checks passed, and git diff --check passed. Tests exercise DTO boundaries, schema defaults, GraphQL defaults and mocked service creation. No live database operations, application startup or deployment.


## Image upload stream repair: 2026-10-06

The reported `Unexpected error value: false` came from imageUploader rejecting a destination stream error with `false`, losing the original filesystem error. Both upload mutations now use a shared image-upload helper that creates missing destination directories, opens a new file exclusively, uses stream.pipeline for source/destination errors and removes its partial file on failure. Single uploads propagate the real error. Existing relative URLs, guards, MIME whitelist and multi-upload partial-success handling remain unchanged. Target paths accept slash-separated letters/digits/underscore/hyphen directory names and reject absolute paths/traversal before creating directories. The original underlying filesystem error cannot be recovered from the supplied log; missing directories are a supported repair case, not a confirmed diagnosis of that request.

Fresh validation: 12 isolated filesystem/resolver Jest tests passed, API TypeScript noEmit/incremental false passed, non-fixing lint on the new helper/spec passed, and patch whitespace passed. Tests use generated temporary directories and cover missing folders, successful single/multi upload, source errors/cleanup, destination errors, existing-file preservation, target validation and retained filename/MIME checks. Initial test failures exposed and resolved an immediate-source-error cleanup race. No database, full server startup, deployment or live client upload test. Batch behavior and broader upload content verification/symlink policies were outside this fix; MIME remains client-declared. Existing user changes were preserved.

## Instructor directory follow state and repeated subscribe: 2026-10-05

Added the existing authenticated-member follow lookup to the paginated getInstructors list, using the requesting member as followerId and each instructor's _id as followingId. Results now populate meFollowed alongside meLiked; clients must select meFollowed { myFollowing } to display the saved state after refresh.

Repeated subscribe requests now return the existing relationship after a duplicate-key rejection for that pair. Only the successful new insert increments memberFollowings/memberFollowers, including competing insert requests. The unique followingId/followerId schema index, GraphQL mutation contract, self-follow rejection and unsubscribe behavior remain unchanged. Other creation failures still fail; no stored counters or relationships were repaired.

Fresh validation: two focused Jest suites passed (31 tests), and both API/batch TypeScript noEmit checks passed. Tests cover the directory pipeline, anonymous lookup, new/duplicate/concurrent subscription behavior, counter increments, unrelated errors, self-follow rejection and retained unique index. Persistence/concurrency are mocked; no live MongoDB integration, frontend edits, application startup, index changes or deployment. Existing follow creation and counter updates remain separate writes.

## Exact original comment update flow restored: 2026-10-04

The user clarified that the preceding simplification still added unwanted deletion logic. Replaced updateComment with the supplied original flow: resolver converts `_id` using shapeIntoMongoObjectId; service makes one findOneAndUpdate using `_id`, authenticated memberId and ACTIVE status, passes input directly with new=true, throws UPDATE_FAILED on no match and returns the result. CommentUpdate DTO remains unchanged. Removed the catalog deletion helper, preliminary reads, counter updates, compensation, retries, manual timestamps and additional service validation from this operation. Setting DELETE is only a status change; subsequent owner updates fail the ACTIVE predicate. Creation and separate admin removal remain unchanged. This supersedes the owner-deletion behavior described in earlier entries below.

Updated regression expectations and current handoffs/skill. Fresh validation: 22 Jest suites and 420 tests passed; 7 existing opt-in MongoDB tests skipped. API and separate test TypeScript compilation, scoped non-fixing lint on Comment service/spec and Equipment interaction spec, and patch whitespace checks passed. No live database operations or application startup. Owner deletion does not decrement target comment counters, so those counters can differ from ACTIVE comment counts.

## Update-flow simplification review: 2026-10-04

- Reviewed Comment resolver/service/module and Resort, Equipment and Member update paths against the original direct resolver-to-service-to-`findOneAndUpdate` style.
- Comment content edits now use one owner/ACTIVE-filtered update, without a preliminary catalog lookup. Only content/status are writable; null content/status and invalid status are rejected. Deleted comments cannot be restored by an ordinary edit.
- Consolidated duplicate Resort/Equipment soft-deletion methods into one catalog deletion path. Kept once-only counter decrement, repeated-deletion handling, conditional compensation and missing Equipment target behavior. Deletion requires this additional work because it changes a target counter as well as the comment.
- Removed unused ViewModule from CommentModule. The existing resolver already follows the requested simple flow and remains unchanged.
- Removed the redundant Instructor profile pre-read. Its single update still filters by the authenticated member ID and current ACTIVE INSTRUCTOR database state, preserves field allowlists/Resort validation and refreshes the token on success.
- Resort and general Member updates already follow the direct pattern. Retained their existing authorization rules. Equipment retains final-state size/category and purchase-price checks and conditional writes, which enforce approved cross-field rules rather than an extra architectural layer.

Fresh checks: 22 Jest suites passed, 428 tests passed; the existing opt-in MongoDB suite's 7 tests remained skipped. Both application TypeScript configurations, separate test compilation and both builds passed. Non-fixing lint passed for Comment service/module/spec and Member service spec. Member service retains 165 errors and zero warnings, matching its HEAD baseline count; no broad formatting cleanup was performed. No live database tests, migration, index changes or deployment.

## Equipment creation manual test report: 2026-10-04

After receiving the Postman `createEquipment` mutation and variables, the user reported that everything was working well for now. Record this as user-reported Equipment creation smoke-test success; no response payload or broader manual test matrix was inspected. The reusable request is in the [Equipment handoff](EQUIPMENT_IMPLEMENTATION.md#postman-createequipment-smoke-test).

This report does not establish coverage of all Equipment operations or replace isolated MongoDB concurrency/aggregation tests. Booking planning is the next recommended domain step, with policies still to be agreed in [next steps](NEXT_STEPS.md). This documentation update does not implement Booking or rerun the implementation checks recorded below.

## Revised Equipment catalog implementation: 2026-10-04

- Implemented Equipment schema/enums/DTOs/module/service/resolver with one normalized size variant per record, KIDS/ADULTS/ALL audience, independent embedded whole-hour KRW rental packages and optional purchase capability. Removed daily Equipment pricing/minimum days and RENTED; minimum is derived from the shortest configured package. Quantity remains manually managed catalog inventory, including zero.
- Added current ACTIVE ADMIN verification to Equipment management, final-state category/size and purchase validation, conditional dependent-value update predicates, package filters via same-entry $elemMatch, AVAILABLE-only public visibility and permanent removal without cascade. Nullable Resort association and duplicate catalog records are supported; no Equipment owner or secondary/unique index.
- Integrated EQUIPMENT likes/views/comments, favorites/visited and exact-record compensation using existing shared modules. Authenticated detail counts once per member/Equipment; anonymous detail creates no view. Retained comments remain removable after their Equipment target is permanently deleted.
- Updated Equipment DMM only; verified every other table, relationship and diagram metadata matches HEAD. Updated current instructions, local Equipment skill and domain/client handoffs while preserving historical records.
- No Booking, purchase/order/checkout/payment, availability deduction, frontend, live records/index changes, data migration or deployment. Existing Resort and Member/Instructor production behavior remain unchanged.

### Fresh executed validation

| Check | Result | Boundary |
|---|---|---|
| API and batch TypeScript configurations, noEmit/incremental false | Passed | No application/database startup |
| Separate compilation of all current source specs | Passed | Temporary config with explicit Node/Jest type roots; scaffold e2e excluded |
| Full discovered Jest run, in-band/no-cache | Passed: 22 suites, 421 tests | Schemas, DTOs, generated GraphQL, current-role predicates and mocked persistence/interactions |
| Existing opt-in MongoDB integration suite | Skipped: 7 tests | No isolated test URI/server supplied; no connection made |
| API and explicit skiresort-batch builds | Passed | Production bundles generated; server/scheduler not started |
| Non-fixing ESLint on 15 new TS files plus three rewritten interaction services | Passed: zero diagnostics | Scoped check; no global configuration changes |
| Non-fixing ESLint on all 24 changed/new TS files | Failed: 24 errors, zero warnings | Five legacy wiring/enum files retain existing formatting debt; HEAD-source stdin comparison confirms unchanged counts per file (8/1/7/4/4). No new diagnostics remain |
| DMM JSON and unrelated-definition comparison | Passed | Only Equipment table changed; removed/new fields verified |
| Active Equipment legacy-field/status audit | Passed | Daily-price/min-days/RENTED references occur only in negative tests |
| Local Markdown links | Passed: 59 targets across 10 documents | docs/ai, AGENTS.md and Equipment skill |
| Patch whitespace | Passed | Git line-ending notices are not whitespace failures |

Validation used the discovered temporary Node v24.19.0 runtime and existing installed dependencies. Initial test/lint/compiler failures were corrected before the final successful checks above; no new test framework, dependency changes or repo-wide formatting was introduced. MongoDB conditional-write/concurrency and aggregation correctness remain unverified in a real database until explicitly isolated integration testing. Counter compensation is best effort, not transactional or crash-safe.

The user reports Instructor workflow testing worked as expected. That is user-reported evidence, not a newly executed automated MongoDB integration result. Existing Instructor transaction/index rollout prerequisites remain separately recorded.

See [Equipment client handoff](EQUIPMENT_IMPLEMENTATION.md) for exact fields, normalization, filters, operations, examples and future Booking/Purchase boundaries. Historical diagnostics below retain provenance.

## Member → Instructor implementation: 2026-10-04

- Removed AGENT from active enums, directory, diagnostic permissions and batch code. getInstructors/InstructorsInquiry replace the old provider contracts without aliases; only ACTIVE INSTRUCTOR Members match. Existing paging/sorting/nickname search/facet/Member-like behavior remains.
- Preserved MemberInput.memberType, signup/login shape, hashing and JWT behavior. Explicit USER/omission signup works; privileged/null roles are rejected before hashing/creation. Self role changes and generic admin Instructor promotion/reassignment are denied; ordinary USER/ADMIN admin operations remain.
- Added nine nullable Member instructor fields with exact instructorAudience scalar spelling and enums. Dedicated Instructor profile updates check current role/status, allowed fields, Resort references and prices, permit nullable clearing, and return a refreshed token.
- Implemented separate instructorApplications model/module/DTOs and USER submit/latest-status plus ADMIN list/detail/approval/rejection. Immutable snapshots preserve rejected history; required experience/languages/level/audience, optional Resort/bio, no prices/certificates. Submission/review use transactions and a pending-only unique index declaration. Approval promotes the same ACTIVE USER atomically; rejection never modifies Member.
- Migrated ranking/reset to ACTIVE INSTRUCTOR with existing article/like/view weights 3/2/1 and no property contribution. Retained schedules/async implementation. Updated shared Resort tests only for Member enum/query references.
- Updated current instructions and client/domain handoff while preserving historical evidence and unchanged DMM. No live records/indexes, credentials, uploads, dependencies, frontend, unrelated domains or deployment were changed.

### Fresh validation

| Check | Result | Boundary |
|---|---|---|
| Both application TypeScript configurations, noEmit/incremental false | Passed | No server/database startup |
| Separate compilation including all current source unit/integration specs | Passed | Temporary config with explicit Node/Jest type roots; scaffold e2e excluded |
| Default Jest run, in-band/no-cache | Passed: 16 suites, 279 tests | Mocked persistence, actual guards, schema/DTO validation and generated GraphQL |
| Isolated MongoDB integration suite | Skipped: 7 tests | Requires SKIRESORT_TEST_MONGO_URI on an explicitly isolated transaction-capable server; no connection made |
| API and explicit batch builds | Passed | Bundles only; scheduler/server not started |
| Scoped non-fixing ESLint on all new source/spec files | Passed: zero diagnostics | No global lint configuration changes |
| Non-fixing ESLint on changed tracked TS plus new files | Failed: 631 errors, 6 warnings | Modified legacy files retain formatting/type debt; HEAD-source comparison also fails. Scoped count, not whole-project baseline |
| Patch whitespace and changed-document local links | Passed | Historical diagnostics retain provenance |
| Active source reference audit | Passed | Old role/query/typo terms occur only in negative tests; unrelated dependencies/tooling/history retained |

Validation used available temporary Node v24.19.0 with installed dependencies. A formatting-induced incomplete directory object literal was caught and corrected before final compiler/test validation; the final run above passed. MongoDB atomicity/concurrency and installed-index guarantees remain unverified until the opt-in integration suite runs. Transaction/index capability and separately approved cleanup of any persisted AGENT records are rollout prerequisites; retained legacy values may otherwise fail GraphQL serialization. They must never automatically become INSTRUCTOR. Current ADMIN provenance and broader password-update/stale-JWT/upload/logging defects remain separately scoped.

See [Member/Instructor client handoff](BACKEND_MIGRATION.md). Lessons, Equipment, Booking, payments and frontend remain deferred.

## Earlier migration history

Session migration date: 2026-10-04. Confirmed branding migration: Nestar → SkiResort. No Petoria migration was completed. The separately authorized Resort domain implementation is recorded below; later sections preserve the earlier branding-only work and historical validation.

## Approved development Resort index replacement: 2026-10-04

Investigated the user's BEGINNER/ADVANCED creation failure. Read-only inspection of the configured development database confirmed both the obsolete three-field `unique_resort_identity` and the four-field `unique_resort_identity_with_level`, with only the supplied BEGINNER resort present. The old index was still rejecting different levels, and generic duplicate-error handling hid that index's identity.

After explicit user approval, revalidated both exact index definitions and the replacement's unique/collation settings, removed only `unique_resort_identity`, and verified that `_id_` and the four-field unique index remain. No records were inserted, changed or removed. The ADVANCED request was not submitted on the user's behalf; the user can retry it. Production and unrelated indexes were not modified. The two focused unit suites also passed again (59 tests); no live insertion test was performed.

## Resort uniqueness includes level: 2026-10-04

Preserved the user's addition of resortLevel to the creation pre-check and schema index. Normalized omitted/null level to null, updated the duplicate error and tests, and named the four-field index `unique_resort_identity_with_level`. An installed old three-field index still rejects different levels until selectively removed after the new index builds; the manual commands are documented in [Resort client handoff](RESORT_IMPLEMENTATION.md). No live index/data operations were performed.

Fresh validation passed: two affected Jest suites (59 tests), both application TypeScript checks and separate unit-spec compilation. Patch whitespace and 30 local documentation links passed. Scoped non-fixing lint found one pre-existing constructor-spacing error in ResortService; no unrelated formatting was rewritten. The tests verify matching/index configuration with mocked persistence, not live MongoDB index replacement.

## Separate Resort update and permanent removal: 2026-10-04

By the user's explicit override, update now performs one validated `findOneAndUpdate` for allowed supplied content/status fields. Removed the status read/retry and deletion-timestamp workflow. Removal independently performs `findOneAndDelete`, returns the removed Resort and rejects missing records. Related records are retained without cascading. Earlier soft-removal/timestamp behavior below is historical and superseded.

Fresh validation passed: the two affected service/resolver suites (50 tests), both application TypeScript checks, separate unit-spec compilation, scoped non-fixing lint, whitespace checks and local documentation links. No live database deletion or application/batch startup was performed.

## Resort update request and ID flow review: 2026-10-04

Reviewed Resort module/resolver/service wiring, DTOs, API GraphQL configuration and existing BoardArticle update flow. Resort now converts update `input._id` in the resolver using the existing `shapeIntoMongoObjectId` helper. The validated ID helper also delegates conversion to that existing helper, and soft deletion keeps the ObjectId instead of converting it back to a string. GraphQL still exposes `_id` as String and requires `$input` to be a ResortUpdate object; the reported bare-ID variable error occurs before the resolver executes. Added the correct mutation/variables example to [Resort client handoff](RESORT_IMPLEMENTATION.md).

Fresh checks passed: all 10 discovered unit suites (176 tests), both application TypeScript checks, separate unit-spec compilation, API and batch builds, scoped non-fixing lint on the changed Resort files/specs, and whitespace/local documentation-link checks. The shared config file retains 67 existing lint errors (the same count as its HEAD baseline), with no diagnostics on the changed ID-conversion line. Tests exercise real GraphQL input coercion and the existing validation pipe plus mocked persistence; no live database, frontend checkout or batch jobs were started.

## Resort uniqueness refinement: 2026-10-04

Added a case-insensitive, trimmed title/location/address creation pre-check and declared the matching compound unique Resort index. Identity is global across admins and all statuses, including soft-deleted resorts. Creation and updates map duplicate-key failures to a clear conflict; unrelated persistence errors remain unchanged. No live records or indexes were inspected, rewritten or removed; existing duplicates must be resolved before MongoDB can build the new index, and concurrent-write protection requires that index.

Fresh validation: the two affected Jest suites passed (52 tests), both application TypeScript checks passed, targeted unit-test TypeScript compilation passed, and the API build passed. Scoped non-fixing lint and patch whitespace checks passed. These isolated tests verify query/index configuration and mocked duplicate failures; they do not establish live MongoDB index installation or concurrent integration behavior.

## Location/facility enum refinement: 2026-10-04

Added the user's exact `ResortLocation` and `ResortFacilities` enum values and GraphQL registration. Updated Resort output/create/update/search DTOs, element validation and Mongoose constraints. Location remains required; facilities remain nullable and accept an empty array. This explicitly supersedes the earlier free-form representation without modifying the DMM, records, indexes or database connections. Client enum types and stored-value compatibility are documented in [Resort implementation](RESORT_IMPLEMENTATION.md).

Fresh follow-up checks passed: both application TypeScript configurations, separate unit-spec compiler, API build, four affected Jest suites with 92 tests, scoped lint on the five production files and four affected specs, and patch whitespace. No live database or full application startup was used. The previous implementation's complete-suite/build/lint results below remain its historical validation, not a newly repeated full lint/batch-build run.

## Resort-first implementation: 2026-10-04

- Replaced the active Property component, schema, DTOs and enums with Resort, matching DMM Resort fields/nullability and the existing NestJS resolver/service/module pattern.
- Implemented public catalog/detail, ADMIN catalog management, soft deletion/restoration, authenticated likes/views/favorites/visited, and Resort comments with active-comment counters.
- Rewired interaction groups/lookups, protected joined credentials, validated nested inputs/IDs, and added duplicate handling plus exact-record compensation for failed counter writes.
- Removed Property batch ranking/model dependencies and its rollback work; retained Member/AGENT ranking, Member/auth contracts, existing stored records, uploads, databases and live indexes.
- Documented intentional Property GraphQL removal and client replacements in [Resort implementation](RESORT_IMPLEMENTATION.md). Updated affected decisions/next steps and corrected handoff context links.

### Fresh validation for Resort work

| Check | Result | Boundary |
|---|---|---|
| Both application TypeScript configurations, noEmit/incremental false | Passed | Application configurations exclude tests |
| Separate compiler configuration explicitly including all 10 new unit-spec files | Passed | Temporary configuration; existing e2e suites excluded |
| Default Jest discovery/run, no cache | Passed: 10 suites, 127 tests | Mocked services/models, schema validation and fake auth; no MongoDB |
| Isolated actual GraphQL schema generation | Passed | Resort plus existing Member/BoardArticle resolver metadata; no full application bootstrap |
| Existing guard execution with fabricated identities | Passed | Anonymous/wrong-role denials, ADMIN forwarding, public/authenticated behavior; no real JWT deployment test |
| API and explicit skiresort-batch npm builds | Passed | Both production bundles generated; no application/scheduler execution |
| Lint for new Resort files/specs and rewritten interaction/comment services | Passed: zero diagnostics | Existing partially modified legacy files retain lint debt |
| Whole-project non-fixing ESLint, 92 TypeScript files | Failed: 2,127 errors, 20 warnings | Fresh observed totals, distinct from historical 3,214/24; legacy formatting/type debt not repaired wholesale |
| Local Markdown links in docs/ai | Passed: 27 links | File-target checks across the seven handoff documents |
| git diff --check | Passed | Line-ending notices are not whitespace failures |
| Live MongoDB integration, full bootstrap/e2e, deployment, stored-data/index migration | Not run | No database connection or scheduled jobs started |

Validation used the available local temporary Node v24.19.0 runtime and installed dependencies, without changing dependency versions. A broader root-config compiler probe encountered existing e2e supertest import/type issues; the targeted new-unit-spec compiler passed separately. A Jest-only UUID mock isolates the installed ESM image-name dependency from unrelated unit tests.

Member/instructor migration, Equipment and Booking remain deferred. Auth was deliberately unchanged, so verified role-assignment and stale-JWT weaknesses still affect administrative trust. Compensation is best effort, not a transactional guarantee; existing group-less unique indexes remain stricter than group-aware matching. No frontend changes, live-data conversion, commit or publication is claimed.

## Completed work

| Area | Changed files / modules | Result |
|---|---|---|
| Application directories | `apps/nestar-api` → `apps/skiresort-api`; `apps/nestar-batch` → `apps/skiresort-batch` | Both application trees renamed |
| Package identity | `package.json`, `package-lock.json`; local `node_modules/.package-lock.json` root name | `skiresort`; dependency entries preserved |
| Build and startup | `nest-cli.json`, both `tsconfig.app.json` files, root npm script targets | New Nest keys, source/output paths, production entrypoints and e2e config target |
| Batch/API coupling | Batch `src/batch.module.ts` and `src/batch.service.ts` | Shared schema/DTO/enum imports target renamed API directory |
| Runtime branding | API `src/app.service.ts`, batch `src/batch.service.ts` | SKIRESORT HTTP greeting strings |
| Existing tests | Both `test/app.e2e-spec.ts` files | Greeting assertions updated; batch describe label renamed |
| Project documentation | `README.md`; affected `context/*.md` inventories/review documents | Current project commands, brand, paths and provenance |
| Evidence and manifest | `context/evidence/eslint.json`, `context/source-manifest.json`, `context/verification.md` | Embedded brand/path updates; refreshed hashes/line counts; historical evidence distinguished from executed migration checks |
| Generated outputs | `dist/apps/skiresort-api/main.js`, `dist/apps/skiresort-batch/main.js` | Old generated application outputs removed; both applications rebuilt |
| Ignored local exports | `uploads/SkiResort.{boardArticles,comments,likes,members,properties,views}.json` | Six filenames renamed; SHA-256 contents unchanged |

No business-domain modules, GraphQL operations/types, MongoDB schemas/collections, stored records, dependency versions, cron behavior, upload logic or auth implementation were refactored. Known defects were reviewed previously, not repaired by the naming migration.

## Validation recorded in this session

| Check | Result | Boundary |
|---|---|---|
| API TypeScript `--noEmit --incremental false` | Passed | Application compiler config excludes tests |
| Batch TypeScript `--noEmit --incremental false` | Passed | Same boundary |
| Default API Nest/webpack build | Passed | New production bundle exists |
| Explicit `skiresort-batch` Nest/webpack build | Passed | New production bundle exists |
| Isolated API and batch HTTP `GET /` | Passed | Actual controllers/services; inert batch models; no database or scheduler |
| Comparison of 86 application files against Git | Passed | Only planned branding/path substitutions and greeting assertion changes |
| Dependency lock comparison | Passed | Package name changed; dependency entries unchanged |
| Export SHA-256 checks | Passed | All six renamed exports byte-identical |
| Manifest and local link checks | Passed | 95 manifest targets; 13 then-current local Markdown links |
| Non-fixing ESLint across 82 TypeScript files | Failed: 3,214 errors, 24 warnings | Totals match the historical baseline; not repaired |
| Git whitespace checks | Passed | Existing line-ending notices are not whitespace failures |
| Full database-backed e2e / live production startup | Not run | No claim of complete runtime integration coverage |

Validation used temporary Node v24.19.0 and installed dependencies without dependency updates. Compiler/build/greeting results are migration checks; older mocked defect probes in `context/evidence` remain historical. See [verification](../../context/verification.md).

## Current-state caveats

The initial audit allowed only the two retained database example names. Later, before documentation creation, `.env.example` was observed with SkiResort database example names; this differs from the user's preservation decision and was not changed in this documentation task. See [backend migration](BACKEND_MIGRATION.md).

These six documents intentionally contain historical Nestar references. They were added after the earlier naming audit, so a repository-wide raw search now requires historical-documentation exceptions. No frontend source was available; no frontend work or deployment was completed. Existing workspace edits are not evidence of a commit or publication.
