# Migration decisions

As of 2026-10-04. This records decisions made in this session, not an assertion that the session designed every pre-existing subsystem. The confirmed target is SkiResort; no Petoria migration is planned.

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
