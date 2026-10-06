# Migration decisions

## FAQ backend: 2026-10-07

Separate `faqs` collection beyond the unchanged DMM. Plain text question/answer, DRAFT default and PUBLISHED visibility; duplicates allowed. Public published-only reads; all management uses ADMIN guards plus current ACTIVE ADMIN checks. Any active admin may manage entries; creator is immutable. Partial updates preserve omitted fields; permanent removal has no cascades. No images, categories, custom ordering, frontend or live migration. See [FAQ handoff](FAQ_IMPLEMENTATION.md).

## Events decisions: 2026-10-06

- Separate Events domain beyond the unchanged DMM; no reuse of Notice EVENT category.
- Required scheduled start/end timestamps, end strictly after start, past dates accepted; optional Resort association (ACTIVE/SOLD_OUT when supplied) and location text.
- Require 1–5 distinct existing uploaded images. Upload first through a dedicated ACTIVE ADMIN operation; reserve generic `events` targets. Existing PNG/JPEG formats, public static storage and 15 MB middleware limit remain.
- Default DRAFT; public reads expose PUBLISHED including past Events. Any current ACTIVE ADMIN can manage all Events; server derives immutable creator.
- Partial updates validate dates with conditional predicates; permanent removal retains files and references. No social counters, bookings, registrations, payments, expiration or frontend.

See [Events handoff](EVENT_IMPLEMENTATION.md).

## Resort minimum stay: 2026-10-06

User override: Resort minimum stay is now one day. Creation defaults to 1; create and admin-update values must be integers >= 1. Schema validation and the DMM rule match. Existing records are unchanged; Booking remains deferred. Earlier two-day statements describe historical behavior.

## Resort minimum duration: 2026-10-06

The user changed the Resort minimum to one day, superseding earlier two-day references. Create/update DTOs require positive whole days; GraphQL, service and schema creation defaults are 1. The DMM and current handoff reflect this rule. Existing records are not rewritten; Booking remains deferred.


## Update-flow review: 2026-10-04

Latest explicit clarification: `updateComment` must match the original project flow exactly. The resolver converts `_id` with `shapeIntoMongoObjectId`; the service performs one `findOneAndUpdate` filtered by `_id`, authenticated `memberId` and ACTIVE status, passing `input` with `{ new: true }`. Deletion through this operation only sets commentStatus to DELETE. No target lookup, counter decrement, compensation, retry, manual timestamp or extra service validation. A missing/non-owned/already-deleted comment fails with UPDATE_FAILED. This supersedes the earlier counter-aware owner-deletion design for every comment group. CommentUpdate DTO and separate creation/admin-removal operations remain unchanged. Instructor profile updates still enforce current ACTIVE INSTRUCTOR state in the write predicate. See [review history](COMPLETED_TASKS.md#update-flow-simplification-review-2026-10-04).

## Approved revised Equipment decisions: 2026-10-04

- Replace Equipment daily price/two-day minimum with a nonempty embedded rental-rate array of unique positive integer durationHours and finite nonnegative independent KRW package prices. Sort by duration; derive minimum, with no separate minimum field or rate collection.
- Keep nullable normalized string size and one size variant per record. BOOTS use Mondopoint CM; clothing/helmet labels are normalized, helmet ranges and ski/snowboard/pole lengths use CM. No US/EU conversion, category size enums or physical size bounds.
- Add required audience KIDS/ADULTS/ALL, default ALL. KIDS/ADULTS filters include ALL, while ALL-only matches ALL.
- Add strict purchase capability, default false; purchase price is null unless purchasable, otherwise required finite >= 0. Every record remains rentable; no purchase workflow.
- Status values are AVAILABLE/MAINTENANCE/DELETE. AVAILABLE-only public visibility is administrative state, not booking availability. Zero quantity remains visible; no automatic deduction/status change.
- Keep nullable resort association, no owner field and no unique catalog identity. Duplicate records are allowed. Removal permanently deletes with no cascades.
- Reuse ADMIN guards and current ACTIVE ADMIN service checks. Final-state category/size and purchase validation uses conditional dependent-value predicates during partial updates.
- Rental-price filtering requires a selected duration and same-entry $elemMatch. Price and size sorting are deferred. Preserve pagination, existing social groups and exact-record compensation.
- Revise Equipment DMM/instructions/skill examples as authorized, preserving other domains and historical provenance. Live records/indexes, Booking, payments, purchase checkout, frontend and deployment remain separate work.

See [Equipment handoff](EQUIPMENT_IMPLEMENTATION.md). This supersedes older Equipment daily-pricing/deferral assumptions without changing Resort or Instructor decisions.

As of 2026-10-04. This records decisions made in this session, not an assertion that the session designed every pre-existing subsystem. The confirmed target is SkiResort; no Petoria migration is planned.

## Member → Instructor decisions: 2026-10-04

- Remove AGENT from active Member enums, directory, diagnostic permissions and batch ranking. No aliases or automatic data conversion; final roles are USER/ADMIN/INSTRUCTOR. Historical references below retain their original meaning.
- Preserve MemberInput.memberType and its current optionality. Accept USER/omission, reject ADMIN/INSTRUCTOR/null before the existing signup catch/hash/create flow. No new signup/login architecture.
- Replace getAgents/AgentsInquiry with getInstructors/InstructorsInquiry, preserving directory paging/sorts/nickname text/facet/Member-like behavior and Member return types.
- Use a separate instructorApplications collection with PENDING/APPROVED/REJECTED and immutable snapshots. Reapply after rejection with a new document; one PENDING per Member through a partial unique index.
- Require experience/languages/level/audience on application; optional Resort/bio snapshot; prices only after approval and no certificate infrastructure. Exact scalar field is instructorAudience, values KIDS/ADULTS/FAMILY/PRIVATE.
- Require transactions for submission and review, with a conditional Member timestamp write serializing submission against promotion. Approval promotes the same ACTIVE USER and copies reviewed instructor data; rejection does not change Member.
- Keep existing guards/JWT format and add current database role/status checks to new services. Normal login refreshes role after promotion. Restrict self role updates and generic admin Instructor promotion; defer Instructor reassignment.
- Add nullable instructor profile fields and a dedicated owner mutation. Instructor may edit/clear them without altering application history or general bio; no pricing/booking formula.
- Migrate provider ranking to ACTIVE INSTRUCTOR with existing article/like/view weights 3/2/1; remove property contribution. Preserve cron times and scheduler implementation.
- DMM, live data/indexes, uploads, dependencies, other domains and frontend remain unchanged. Lessons are separate later work. Transaction/index checks and explicitly approved legacy-role cleanup are rollout prerequisites.

See [current Member/Instructor handoff](BACKEND_MIGRATION.md). Earlier role-preservation decisions below are historical and superseded for this phase.

## Resort-first decisions: 2026-10-04

Later user refinement: add resortLevel to Resort uniqueness. Title/location/address/level is the current identity, with omitted/null level normalized to null. Name the four-field index `unique_resort_identity_with_level` so it can be created before selective removal of the obsolete three-field index. Initially documented the manual index change without executing it. Following a reproduced development failure, the user explicitly approved removing only the obsolete index; that development change was executed and verified, preserving the new index and all records. No automatic synchronization or unrelated index change was performed.

Latest explicit override: separate Resort update and removal. Update directly applies only allowed supplied content/status fields with `findOneAndUpdate` and validation; remove permanently deletes with `findOneAndDelete`. Remove the deletion-timestamp and status-retry workflow. Historical soft-removal/restoration decisions below are superseded for Resort. Related records are retained without cascading; no live deletion was performed during implementation.

- Replace the active Property catalog with Resort and retain the resolver/service/module architecture. Retire Property GraphQL contracts without aliases; no stored-data conversion or database/index migration.
- Implement the full Resort catalog and existing-style interaction workflows. Keep SOLD_OUT visible; use soft deletion with admin restoration and preserve references.
- Restrict catalog management to existing ADMIN guards and derive ownership from the authenticated admin. Keep Member/auth unchanged by explicit user choice; verified role-assignment and stale-JWT weaknesses remain.
- Defer Member/instructor migration, Equipment, Booking, anonymous-view nullability and transactional counters. Preserve existing MEMBER/ARTICLE interactions and Member/AGENT ranking while removing Property ranking.
- Preserve DMM Resort fields/enums/nullability; do not invent Resort ranking or booking policies. Implementation defaults and compensation limits are documented in [Resort implementation](RESORT_IMPLEMENTATION.md).
- Later explicit refinement: apply the user's exact ResortLocation and ResortFacilities values to GraphQL DTOs, search validation and Mongoose enum constraints. This overrides the earlier unconstrained location/facility representation while preserving required location and nullable facilities; it does not authorize stored-data conversion or diagram edits.
- Later user-requested duplicate prevention: use the global title/location/address combination, ignoring letter case and trimming title/address edges, across all admins and statuses. Declare a new Resort compound unique index and return clear conflicts on duplicate creation/update. Soft-deleted records retain their identity and can be restored. This authorizes the new schema index declaration, superseding the earlier no-index-change boundary for this index only; live duplicate cleanup and index installation were not performed.

The following decisions describe the earlier branding migration and do not restrict this separately authorized Resort domain work.

## Decisions and tradeoffs

| Decision | Reason | Risk / alternative |
|---|---|---|
| Limit this migration to project branding | User explicitly separated domain migrations from naming work | New brand still exposes the existing property/member vocabulary; domain conversion needs a separate specification |
| Replace case variants consistently | Keep display text, uppercase greetings, and lowercase identifiers coherent | Arbitrary case variants require an audit; unchecked global replacement could change unrelated data |
| Rename both app directories and Nest keys | Old identity must disappear from active project configuration | External build/deployment scripts need new paths; compatibility aliases would retain old identity |
| Retain API/batch topology and the API default | Preserve established startup/build behavior | Batch still depends on API source; a shared library could be a future refactor, but was not implemented |
| Preserve module names and business logic | Avoid coupling branding with behavior changes | Known defects remain; alternatives require independent repair work and meaningful regression tests |
| Preserve GraphQL fields, DTOs and enums | Existing clients must remain compatible | Even misspelled public fields remain; correcting them would require a separate versioning/deprecation decision |
| Preserve MongoDB schemas, collection names and stored data | Avoid accidental empty-database cutover or data loss | Brand/data vocabulary differs; live database renaming would require backup, validation and a cutover plan |
| Preserve database examples, as explicitly requested | Respect the user's chosen exception | Current workspace examples later differ; see discrepancy below rather than assuming a live database migration |
| Preserve dependencies and script names | Reduce unrelated changes and retain workflows | Existing packaging/tooling issues remain; dependency upgrades were not part of the migration |
| Change greeting strings and their stale assertions | Public root responses contained the old brand; old tests expected `Hello World!` | String-consuming clients must accommodate the new response; retaining old strings would violate branding intent |
| Rename ignored export files but preserve bytes | Filename audit found six old-brand local exports | Manual import commands may need updated filenames; stored export data must not be rewritten |
| Refresh manifests and mark evidence historical | Renamed paths/hashes must remain navigable without falsely claiming fresh diagnostic execution | Historical diagnostics are not current proof of every defect; rerun targeted checks when doing repairs |
| Validate greetings in isolated HTTP applications | Exercise real controllers/services without touching MongoDB or running cron jobs | Does not verify full bootstrap, auth, uploads, GraphQL execution or scheduled writes |
| Use temporary Node v24.19.0 | No usable local Node executable was found during migration validation | Temporary runtime is not a committed engine pin or permanent installation; subsequent sessions need a working runtime |
| Keep Git history and third-party internals outside renaming | They are provenance/dependencies, not active project branding | Historical searches can still find old identity; history rewriting would add unrelated risk |
| Create only six documentation files in this task | User explicitly prohibited application source changes | Documentation cannot resolve code defects or the database-example discrepancy |

## Observed architecture, not new decisions

The existing implementation uses a NestJS monorepo, code-first GraphQL, Mongoose, JWT guards, local uploads, native WebSockets and Nest Schedule. These choices were preserved, not newly justified or selected. No module consolidation, GraphQL redesign, collection migration, Next.js migration, infrastructure deployment, or security repair was completed here.

## Database exception and current state

The agreed migration preserved `.env.example` database names. The later documentation inspection found `skiresort_dev` / `skiresort_prod` already in that file, differing from both the agreement and earlier validation. These documents report the discrepancy without changing the file or attributing the change. Preserve active connections and data; resolve the example policy explicitly in future work.

## Evidence boundaries

Original review evidence is dated 2026-10-03. The naming migration and its compiler/build/greeting validation were recorded on 2026-10-04. Historical evidence path substitutions did not rerun the historical probes. See [verification](../../context/verification.md), [backend migration](BACKEND_MIGRATION.md), and [next steps](NEXT_STEPS.md).
