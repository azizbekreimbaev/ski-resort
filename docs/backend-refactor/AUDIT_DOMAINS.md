# Resort, equipment, event, FAQ and instructor application audit

Review date: 2026-10-08. The current working tree, including its existing edits and untracked update DTOs, is the behavioral baseline. No application files were changed during this audit. This is a scoped supplement to the root architecture review and parity plan, not a claim that this agent reviewed the other components.

`S/` below means `apps/skiresort-api/src/` in SkiResort. `N/` means `C:/Users/Aziz/Desktop/nestar/apps/nestar-api/src/`; that external source was read only. Every file in the following ledger was opened and read completely, with numbered lines. Counts and line references describe the pre-edit working tree. Root AGENTS.md was read; no nested instructions were found under `apps` or `docs`.

## Per-file read ledger

### Reference: eight complete files

| Path | Lines | Inspected evidence |
| --- | ---: | --- |
| `N/components/property/property.module.ts` | 25 | `forFeature`, imported service modules, resolver/service providers, exported PropertyService |
| `N/components/property/property.resolver.ts` | 158 | All eleven operations, guards, roles, AuthMember, ID conversion and async delegation |
| `N/components/property/property.service.ts` | 336 | Every CRUD/list/history/interaction method; private `shapeMatchQuery`; Member/View/Like service calls |
| `N/libs/dto/property/property.input.ts` | 276 | All create/range/search/inquiry fields, validation and GraphQL metadata |
| `N/libs/dto/property/property.update.ts` | 106 | Explicit update class; optional content; internal timestamps |
| `N/libs/dto/property/property.ts` | 116 | Property, Properties, relationship fields, String IDs and counters |
| `N/libs/enums/property.enum.ts` | 34 | Enum values and registerEnumType names |
| `N/schemas/Property.model.ts` | 116 | Raw Schema, fields/defaults/references/options and compound unique index |

### Target: 64 complete files

| Path under S/ | Lines | Review status / anchor |
| --- | ---: | --- |
| `components/resort/resort.module.ts` | 20 | Read: Resort/Like/View/Auth wiring |
| `components/resort/resort.resolver.ts` | 117 | Read: all nine operations |
| `components/resort/resort.service.ts` | 388 | Read: all public methods and private helpers |
| `components/resort/resort.graphql.spec.ts` | 208 | Read: operation/type/enum/nullability and update-object contract |
| `components/resort/resort.resolver.spec.ts` | 242 | Read: guards, identity forwarding and synchronous malformed-ID errors |
| `components/resort/resort.service.spec.ts` | 583 | Read: identity, filters, counters, compensation, update/delete semantics |
| `libs/dto/resort/resort.input.ts` | 219 | Read: create, prices, public/admin search and inquiries |
| `libs/dto/resort/resort.update.ts` | 89 | Read: required ID and omitted/null field semantics |
| `libs/dto/resort/resort.ts` | 82 | Read: Resort/Resorts output and nullable relationships |
| `libs/dto/resort/resort.validation.spec.ts` | 307 | Read: all validation cases, nested searches and defaults |
| `libs/enums/resort.enum.ts` | 54 | Read: statuses, levels, eleven locations and eleven facilities |
| `schemas/Resort.model.ts` | 78 | Read: all fields/options/index/collation |
| `schemas/Resort.model.spec.ts` | 137 | Read: exact field set, defaults, uniqueness, arrays and validators |
| `components/equipment/equipment.module.ts` | 25 | Read: Equipment/Member models and Resort/Like/View/Auth imports |
| `components/equipment/equipment.resolver.ts` | 122 | Read: all nine operations |
| `components/equipment/equipment.service.ts` | 552 | Read: every CRUD/list/history/interaction method and helper |
| `components/equipment/equipment-size.ts` | 101 | Read: all category-specific normalization branches |
| `components/equipment/equipment-size.spec.ts` | 48 | Read: canonical size and rejection cases |
| `components/equipment/equipment.graphql.spec.ts` | 168 | Read: package model, guards, ID conversion, GraphQL rejection |
| `components/equipment/equipment.interactions.spec.ts` | 222 | Read: comment reuse/compensation and favorite/visited pipelines |
| `components/equipment/equipment.service.spec.ts` | 463 | Read: final-state validation, current-admin checks, CAS, interactions/history |
| `libs/dto/equipment/equipment.input.ts` | 250 | Read: nested rates, create/search/public/admin/history inputs |
| `libs/dto/equipment/equipment.update.ts` | 111 | Read: complete explicit update fields |
| `libs/dto/equipment/equipment.ts` | 68 | Read: EquipmentRentalRate/Equipment/Equipments |
| `libs/dto/equipment/equipment.validation.spec.ts` | 78 | Read: defaults, invalid final states, update nulls, nested inquiries |
| `libs/enums/equipment.enum.ts` | 24 | Read: category/audience/status enum registration |
| `schemas/Equipment.model.ts` | 104 | Read: nested schema, integer constraints, hook and options |
| `schemas/Equipment.model.spec.ts` | 75 | Read: rate/size normalization, validation, nullable fields, no indexes |
| `components/event/event.module.ts` | 22 | Read: Event/Member models, Auth/Resort, service export |
| `components/event/event.resolver.ts` | 95 | Read: all eight operations including upload |
| `components/event/event.service.ts` | 286 | Read: content/file/date/admin checks, CRUD, detail/list and upload cleanup |
| `components/event/event.graphql.spec.ts` | 83 | Read: scalar/default/update schema and actual roles guard |
| `components/event/event.service.spec.ts` | 357 | Read: all CRUD/filter/date/upload/path/admin cases; temporary-file cleanup |
| `libs/dto/event/event.input.ts` | 128 | Read: create/search/inherited pagination |
| `libs/dto/event/event.update.ts` | 76 | Read: explicit independent update DTO; no create default |
| `libs/dto/event/event.ts` | 40 | Read: Event/Events output fields/nullability |
| `libs/enums/event.enum.ts` | 8 | Read: DRAFT/PUBLISHED registration |
| `schemas/Event.model.ts` | 50 | Read: exact persisted fields, image validator and date hook |
| `schemas/Event.model.spec.ts` | 44 | Read: defaults/collection/images/date validation |
| `components/faq/faq.module.ts` | 20 | Read: Faq/Member models, Auth, providers/export |
| `components/faq/faq.resolver.ts` | 80 | Read: all seven operations |
| `components/faq/faq.service.ts` | 180 | Read: CRUD, admin/content/detail/list helpers |
| `components/faq/faq.graphql.spec.ts` | 80 | Read: defaults/update schema and actual roles guard |
| `components/faq/faq.service.spec.ts` | 216 | Read: content omission, publication, admin, pagination and hard delete |
| `components/faq/faq.validation.spec.ts` | 78 | Read: DTO/schema trims, null/status and nested search behavior |
| `libs/dto/faq/faq.input.ts` | 95 | Read: create/search/inherited pagination |
| `libs/dto/faq/faq.update.ts` | 39 | Read: required ID and explicit optional content/status fields |
| `libs/dto/faq/faq.ts` | 30 | Read: Faq/Faqs output fields |
| `libs/enums/faq.enum.ts` | 8 | Read: DRAFT/PUBLISHED registration |
| `schemas/Faq.model.ts` | 18 | Read: all fields/options; no declared indexes |
| `components/instructor-application/instructor-application.module.ts` | 24 | Read: Application/Member models, Member/Resort/Auth imports/export |
| `components/instructor-application/instructor-application.resolver.ts` | 96 | Read: all six operations; role/private-result/ID boundaries |
| `components/instructor-application/instructor-application.service.ts` | 308 | Read: all transaction, role, pending, read/list and review methods |
| `components/instructor-application/instructor-application.graphql.spec.ts` | 129 | Read: application/member contract, private fields and removed AGENT rejection |
| `components/instructor-application/instructor-application.resolver.spec.ts` | 205 | Read: USER/ADMIN/INSTRUCTOR guards, identity and synchronous ID rejection |
| `components/instructor-application/instructor-application.service.spec.ts` | 356 | Read: submission/concurrent timestamp, pending/review/promote/error behavior |
| `components/instructor-application/instructor-application.integration.spec.ts` | 266 | Read: opt-in isolated replica-set lifecycle; intentionally not executed |
| `libs/dto/instructor-application/instructor-application.input.ts` | 127 | Read: submission/search/list/reject validation and transforms |
| `libs/dto/instructor-application/instructor-application.ts` | 59 | Read: snapshot/review/output nullability |
| `libs/dto/instructor-application/instructor-application.validation.spec.ts` | 121 | Read: application and profile validations |
| `libs/dto/member/instructor-profile.update.ts` | 76 | Read: nullable instructor fields/prices/transforms |
| `libs/enums/instructor-application.enum.ts` | 11 | Read: PENDING/APPROVED/REJECTED registration |
| `schemas/InstructorApplication.model.ts` | 58 | Read: all fields/defaults/options and partial pending index |
| `schemas/InstructorApplication.model.spec.ts` | 126 | Read: application/member roles, defaults/references/index and validators |

No files in the assigned groups remain unread. Shared Member/Comment/Like/View/Auth implementations are audited separately by the other review agents; dependency searches and the assigned interaction/integration tests establish the consumers below without claiming those files were fully read by this agent.

## Verified reference patterns and intended adjustments

`N/components/property/property.module.ts:11` registers the model in its owning feature module, supplies resolver/service providers, imports modules exposing reusable services, and exports PropertyService. `property.resolver.ts:18` uses constructor DI and thin explicit public methods. The service owns Mongo operations and its private `shapeMatchQuery` mutates the match object (`property.service.ts:164`); list methods use match/sort/facet/skip/limit/count (`:129`, `:205`, `:265`). DTOs are explicit classes in separate `.input.ts`, `.update.ts`, and output `.ts` files. `property.input.ts:163`, `:202`, `:240` declares each inquiry's page/limit/sort/direction/search locally; admin search classes are independent (`:194`, `:229`). No `extends`, `isAbstract`, or `PartialType` occurs anywhere in the reference API DTO folder (verified by repository search).

| SkiResort file | Nestar reference | Current difference | Intended adjustment | Preserve |
| --- | --- | --- | --- | --- |
| `S/libs/dto/resort/resort.input.ts` | `N/libs/dto/property/property.input.ts:163/229/240` | AllResortSearch inherits public search; public/admin inquiries inherit ResortHistoryInquiry | Preserve inheritance: independent-field attempt changed ordered errors; exact baseline restored | Exact fields/enums/scalars/defaults/validators/transforms, search initializer, omission/null behavior and both error orders |
| `S/libs/dto/equipment/equipment.input.ts` | Same independent search/inquiry classes | AllEquipmentSearch inherits EquipmentSearch; inquiries inherit EquipmentHistoryInquiry | Preserve inheritance/history DTO: attempted expansion restored | Package/search validation, defaults, max 100, public GraphQL names, history argument type and ordered errors |
| `S/libs/dto/event/event.input.ts` | Same independent search/inquiry classes | AllEventSearch inherits EventSearch; private abstract EventPagination supplies inquiry fields | Preserve inherited admin search and private pagination: attempted expansion restored | Optional search, exact date/status/image validation, DRAFT create-only default and ordered errors |
| `S/libs/dto/faq/faq.input.ts` | Same independent search/inquiry classes | AllFaqSearch inherits FaqSearch; private abstract FaqPagination supplies fields | Preserve inherited classes: attempted expansion restored | Existing field types, search validation, sort whitelist, nullable status, create-only default and ordered errors |
| All five feature modules | `N/components/property/property.module.ts` | Domain dependencies differ | Already match; no change | Exact model tokens/imports/providers/exports; no forwardRef/cycle |
| All five feature resolvers | `N/components/property/property.resolver.ts` | Resort/equipment/application have synchronous delegations/ID validation | Retain explicit public thin methods; do not convert async boundaries | Synchronous malformed-ID throws; all operations/args/guards/return types |
| Resort/equipment services | `N/components/property/property.service.ts` | Safety/business helpers beyond property CRUD | Keep current service bodies and required helpers | Visibility, projections, counter compensation, conditional updates, validation and errors |
| Event/FAQ services/resolvers/update DTOs | Verified closest explicit Property pattern; no business analogue | Publication/content/image/schedule logic has no property counterpart | Already match structural separation and typed delegation; retain | Published-only public reads, active-admin checks, null/omission, files/date checks |
| Application service/DTOs/schema | Property DI/service separation only; no workflow analogue | Transactions and Member promotion have no equivalent | Retain complete transaction workflow | Sessions, pending unique index, role checks, review snapshot/history and promotion |
| All five schemas/enums/output/update DTO groups | `N/schemas/Property.model.ts`, `N/libs/enums/property.enum.ts`, DTO equivalents | SkiResort domain fields and stronger validation/nullability | Already match raw-schema and explicit-decorator style; no persisted changes | Every path/default/ref/validator/hook/index/collection/options and enum value |

The recorded initial implementation plan was to expand the four input files in dependency order, one domain at a time, with diff review, exact schema/effective validation metadata parity, no-emit type-check and focused existing tests. The root completed the whole-backend audit/map barrier before those attempts. Additional ordered-error checks proved the independent-class adjustment incompatible with the existing response behavior, so all four attempted source edits were restored to their exact pre-task working-tree snapshots. No helper, framework convention, package, operation or field was introduced to force stylistic parity.

## Public operation contracts

All operation arguments are non-null at GraphQL level unless explicitly noted. AuthMember supplies server identity and is not a client argument. All scalar IDs below are `String!`.

| Feature | Queries | Mutations | Access and result |
| --- | --- | --- | --- |
| Resort | `getResort(resortId): Resort!`; `getResorts(input: ResortsInquiry!): Resorts!`; `getAllResortsByAdmin(input: AllResortsInquiry!): Resorts!`; `getFavoriteResorts(input: ResortsInquiry!): Resorts!`; `getVisitedResorts(input: ResortsInquiry!): Resorts!` | `createResort(input: ResortInput!): Resort!`; `updateResortByAdmin(input: ResortUpdate!): Resort!`; `removeResortByAdmin(resortId): Resort!`; `likeTargetResort(resortId): Resort!` | Reads use WithoutGuard; create/admin list/update/remove ADMIN RolesGuard; like/history AuthGuard |
| Equipment | `getEquipment(equipmentId): Equipment!`; `getEquipments(input: EquipmentsInquiry!): Equipments!`; `getAllEquipmentsByAdmin(input: AllEquipmentsInquiry!): Equipments!`; `getFavoriteEquipments(input: EquipmentHistoryInquiry!): Equipments!`; `getVisitedEquipments(input: EquipmentsInquiry!): Equipments!` | `createEquipment(input: EquipmentInput!): Equipment!`; `updateEquipmentByAdmin(input: EquipmentUpdate!): Equipment!`; `removeEquipmentByAdmin(equipmentId): Equipment!`; `likeTargetEquipment(equipmentId): Equipment!` | Reads WithoutGuard; catalog ADMIN RolesGuard plus service ACTIVE-admin recheck; likes/history AuthGuard |
| Event | `getEvent(eventId): Event!`; `getEvents(input: EventsInquiry!): Events!`; `getEventByAdmin(eventId): Event!`; `getAllEventsByAdmin(input: AllEventsInquiry!): Events!` | `createEvent(input: EventInput!): Event!`; `updateEventByAdmin(input: EventUpdate!): Event!`; `removeEventByAdmin(eventId): Event!`; `uploadEventImages(files: [Upload!]!): [String!]!` | Public queries have no guard; all admin operations RolesGuard ADMIN and service ACTIVE-admin recheck |
| FAQ | `getFaq(faqId): Faq!`; `getFaqs(input: FaqsInquiry!): Faqs!`; `getFaqByAdmin(faqId): Faq!`; `getAllFaqsByAdmin(input: AllFaqsInquiry!): Faqs!` | `createFaq(input: FaqInput!): Faq!`; `updateFaqByAdmin(input: FaqUpdate!): Faq!`; `removeFaqByAdmin(faqId): Faq!` | Same public/admin separation as Event |
| Application | `getMyInstructorApplication: InstructorApplication` (nullable); `getAllInstructorApplicationsByAdmin(input: InstructorApplicationsInquiry!): InstructorApplications!`; `getInstructorApplicationByAdmin(applicationId): InstructorApplication!` | `createInstructorApplication(input: InstructorApplicationInput!): InstructorApplication!`; `approveInstructorApplicationByAdmin(applicationId): InstructorApplication!`; `rejectInstructorApplicationByAdmin(input: InstructorApplicationReject!): InstructorApplication!` | Submission USER RolesGuard; own query AuthGuard; remaining ADMIN RolesGuard; service reads current active roles |

## DTO and persistence contracts

`@Field` defines the client-facing GraphQL field, whereas `@Is...`, `@Min`, `@Max`, `@ValidateNested` and transforms define runtime input checks. Their values must remain separate and unchanged. `String` ID fields hold ObjectIds internally. `Int` cannot replace price `Float`; changing `nullable` or `defaultValue` changes the public API. `@IsOptional` permits null; `@ValidateIf(value !== undefined)` validates explicit null rather than skipping it.

Resort required create fields are title/address (trimmed nonblank strings), location enum, finite nonnegative Float price and string image array (empty permitted). Int minimum days defaults to 1 in both class and GraphQL metadata; supplied values must be >=1 integers. Level/facilities/description allow null. ResortSearch has nullable memberId, locationList, levelList, facilities, pricesRange, text; nested finite/nonnegative Float price endpoints require end >= start. AllResortSearch adds nullable status. Inquiries require page Int >=1 and limit Int 1..100; optional sort uses seven listed resort keys; direction is Direction; omitted search creates an empty typed search object, explicit null fails validation. Update requires Mongo ID, accepts only existing optional content/status fields, rejects null for required persisted fields, and permits clearing level/facilities/description. Outputs contain all persisted resort fields plus nullable Member owner and nullable MeLiked list; Resorts.metaCounter is nullable. Persisted fields are resortStatus/title/location/address/pricePerDay/minDays/level/images/facilities/desc/views/likes/comments, memberId and deletedAt, plus _id/timestamps. `Resort.model.ts:66` uses `resorts`, timestamps and `versionKey:false`; all three counters default to zero and cannot be negative/fractional. The unique index at :69 covers location/title/address/level, including deleted records, with `en` strength-2 collation; default level is null.

EquipmentInput requires category enum, trimmed nonblank name, Int quantity 0..2147483647, and a nonempty nested rental rate array. Rates require integer durationHours 1..2147483647 and finite nonnegative Float price. Optional defaults are AVAILABLE status, ALL audience, false purchasable; explicit null for these fails. Resort/brand/size/purchase price/images/description permit null with their existing validators. Public search contains resortId/categoryList/audienceList/sizeList/brand/text/purchasable/rentalDurationHours/rentalPricesRange/purchasePricesRange; admin search adds status. Search and rate objects use Type/ValidateNested; inquiries preserve page/limit bounds, six sort keys, Direction and typed empty search defaults. Update has required Mongo ID, no defaults and exact nullable/omission rules. Equipment output includes every persisted path and non-null `[MeLiked!]!`, with nullable resort/brand/size/purchase price/images/description/deletedAt; Equipments.list and metaCounter are non-null arrays. `Equipment.model.ts:77` uses `equipments`, timestamps, no version key and no declared indexes. Fields are resortId/status/category/name/brand/size/audience/rentalRates/purchasable/purchasePrice/quantity/images/desc/views/likes/comments/deletedAt. Nested rate schema suppresses _id. Existing validation hook canonicalizes sizes/sorts rates and checks purchase capability; service duplicates final-state checks deliberately for partial updates.

EventInput requires trimmed nonblank title/description, 1..5 unique string image paths, and Date start/end; optional nullable status has GraphQL DRAFT default but explicit null fails. Location/resort allow null. EventSearch has nullable text/resortId; AllEventSearch adds status. Both inquiries require page>=1, limit 1..100, whitelist createdAt/updatedAt/eventStartDate and Direction; search is optional with no initializer/default and explicit null fails. Update requires string Mongo ID and has no default status; null is permitted only for location/resort. Outputs include _id/title/desc/images/startDate/endDate/status/location/resortId/memberId/timestamps, with only location/resort nullable; Events.list/metaCounter are non-null. `Event.model.ts:38` uses `events`, timestamps, no version key and no declared indexes. DRAFT default, member/resort refs, image count/uniqueness/path regex and end-after-start hook are preserved.

FaqInput requires trimmed nonblank question/answer; optional status has GraphQL DRAFT default and rejects explicit null. FaqSearch has nullable text, AllFaqSearch adds status. Inquiries preserve page/limit bounds, createdAt/updatedAt whitelist, Direction and optional search without default; explicit null search fails. Update requires Mongo ID, has no defaults and rejects explicit null content/status. Every Faq output field (_id/question/answer/status/memberId/timestamps) and Faqs.list/metaCounter is non-null. `Faq.model.ts:16` uses `faqs`, timestamps, no version key and no declared indexes; status defaults to DRAFT.

InstructorApplicationInput requires nonnegative Int experience, nonempty string languages trimmed by Transform and matched against non-whitespace, level/audience enums; nullable resort Mongo ID/description are optional. Applicant/status/review/price fields are not inputs. Inquiry requires page>=1, limit 1..100, createdAt/updatedAt/reviewedAt sort, Direction and typed empty search; search allows status/memberId. Reject requires Mongo ID and trimmed nonblank reason. Output/persisted fields are memberId/status/experience/languages/level/audience/resortId/description/reviewedBy/reviewedAt/rejectionReason plus ID/timestamps. Resort/description/review fields are nullable; list is non-null and metaCounter nullable. `InstructorApplication.model.ts:44` uses `instructorApplications`, timestamps and no version key; pending default and null optional defaults remain. Its named partial unique memberId index (:47) applies only to PENDING. InstructorProfileUpdate stays separate, nullable, role-restricted in Member, and preserves finite nonnegative Float weekly prices.

## Request flows and component walkthrough

Each module imports MongooseModule.forFeature to make its model token injectable. `@Injectable` lets Nest construct the service; `@InjectModel('...')` supplies that registered Mongo model. `@Resolver` registers GraphQL operations, `@Query`/`@Mutation` declare output types, `@Args` supplies input DTOs, guards enforce authorization, and `@AuthMember('_id')` supplies server identity. Output DTOs declare response shape, not database persistence. Raw schemas declare persisted data, collection names, constraints and timestamps. Enums explicitly register their GraphQL names. These are the same responsibilities as the inspected Property files.

### Resort

`ResortResolver.createResort` passes authenticated ADMIN identity to `ResortService.createResort` (:76). The service trims identity, checks global case-insensitive duplication, picks only allowed content, creates ACTIVE with server-owned counters/owner/minimum days, returns toObject, and maps database duplicate-key races to the existing ConflictException. Other persistence errors propagate. `getResort` (:111) aggregates visible ACTIVE/SOLD_OUT records with a credential-excluding member lookup; missing owners are retained. Anonymous reads return no new view; authenticated reads call ViewService.recordViewWithChange, increment only newly inserted views, undo on failed counter write, and query LikeService for meLiked. Nestar's getProperty is the analogy, but its unsafe/full owner retrieval and ACTIVE-only status must not be copied.

`getResorts` (:180) and admin list (:253) shape filters then call listResorts (:300). Location/level use $in; facilities uses $all; member IDs are validated; price range is ordered; text is regex-escaped. Admin may include deleted status. List validates bounds/sort, uses stable `_id` tie-breaker and match/sort/facet with skip/limit and count; empty output remains empty arrays. Favorites/visited delegate to Like/View with unchanged resolver ResortsInquiry contracts. `likeTargetResort` (:230) asserts visibility, toggles exact association, changes counter only for nonzero modifier, compensates failure, and returns current meLiked.

Admin update (:261) writes only supplied allowed fields/status with runValidators, neither requires ACTIVE nor creates deletedAt lifecycle changes. Hard deletion (:282) returns the removed record or NotFoundException. `resortStatsEditor` (:150) validates counter key/modifier, requires visible target for increments, protects decrements against underflow and permits deleted-target decrements. CommentService consumes assertVisibleResort/resortStatsEditor. Equipment/Event/application/Member instructor profile consume assertVisibleResort. Resort intentionally does not import MemberModule: the safe owner aggregation avoids a Member/Resort cycle.

### Equipment

`EquipmentResolver` forwards identity/DTOs and converts scalar/update IDs without changing synchronous error boundaries. `createEquipment` (:75) rechecks current ACTIVE ADMIN, validates/normalizes the final EquipmentInput, verifies an optional visible Resort, creates, then formats output with sorted rates/non-null meLiked. No uniqueness rule exists; identical variants can be created. `equipment-size.ts:24` canonicalizes NFKC/case/spacing, boot centimetres in half increments, clothes/helmet labels, helmet ranges, ski/snowboard/pole lengths and OTHER free text; there is no Nestar business equivalent.

`getEquipment` (:87), like (:261), counters (:130), favorites (:245) and visited (:253) follow the Resort/Property composition while preserving EQUIPMENT group, exact undo and output normalization. `shapeMatchQuery` (:173) validates search, normalizes size filters only with one category, expands KIDS/ADULTS audiences to include ALL, escapes literal name/brand regexes, matches rental duration/price in one $elemMatch, and requires purchase capability for purchase price. Lists use validated stable sort/facet/count.

Admin update (:296) reads current record, picks supplied fields, derives purchase-price clearing, requires price in the same update when enabling purchase, validates the merged final state, writes only supplied normalized fields, and compares original category/size or purchasable/price when those dependent fields change. A lost conditional update throws existing ConflictException. Removal (:358) returns hard-deleted equipment; hidden/missing visibility checks fail before interactions. CommentService validates/increments equipment on creation and invokes commentRemoved (:382) on admin removal; a removed target has no counter, while an existing failed counter must be compensated. Owner comment soft deletion deliberately does not decrement equipment counters (tested in equipment.interactions.spec.ts:95).

### Event

`EventResolver` already uses public async Promise methods and awaited service delegation. Public detail/list calls EventService.detail/list with publication filtering; admin methods recheck current ACTIVE ADMIN first. Create (:51) validates/transforms content, verifies existing safe event image paths and optional visible Resort, checks end strictly after start (past dates accepted), derives creator, and returns the created object. Update (:89) accepts only supplied allowed fields, rejects empty changes, validates merged dates and includes old dates in the write filter; lost date compare throws reload/retry ConflictException. Updates do not reset status or creator. Remove (:130) hard-deletes and retains image files.

Upload (:143) is ADMIN-only, accepts 1..5 files with PNG/JPEG extension, calls existing saveImageUpload, waits for every settlement and removes successful files if one fails. content (:185) rejects paths outside uploads/events and symlink/nonfile/realpath mismatch. These safety and lifecycle helpers remain because no Nestar event counterpart exists. Listing (:246) validates DTO, filters published publicly or optional admin status, validates resort filter, escapes title/description text, and retains stable sort/facet/empty result.

### FAQ

`FaqResolver` is already a thin public async layer. Create (:35) rechecks active admin, validates/trims allowed question/answer/status, derives creator and returns object. Public detail (:45 -> :132) selects only PUBLISHED; admin detail (:61) permits drafts after role check. Public/admin list use list (:142), DTO validation, escaped question/answer text, stable sort/facet/count and empty arrays. Update (:69) rejects empty changes, validates only supplied allowed fields, preserves creator/status omission, and writes runValidators. Hard delete (:93) returns removed Faq or existing NotFoundException. Faq exports its service without inventing another consumer.

### Instructor application

Submission resolver enforces USER; service createInstructorApplication (:42) opens a Connection.transaction, rechecks ACTIVE USER inside the session, rejects existing pending application, validates optional visible Resort, conditionally touches Member.updatedAt with a monotonic timestamp to serialize against promotion, creates only the PENDING applicant snapshot and returns toObject. The unique partial index handles concurrent submissions; only duplicate-key errors map to the pending ConflictException. Submission does not promote or write instructor profile fields.

Own read (:121) uses authenticated member identity and latest createdAt/_id ordering; no application returns null. Admin list/detail (:132/:183) recheck current active ADMIN; lists validate pagination/sort/status/member filters and return facet results. Approval (:197) rechecks admin and pending application in one transaction, verifies Resort, conditionally records APPROVED/review metadata, then calls exported MemberService.promoteMemberToInstructor with the same session and reviewed snapshot. Promotion failure rolls back the review. Rejection (:237) requires trimmed reason, conditionally records REJECTED/review metadata inside a transaction, and leaves Member unchanged. Repeated/concurrent review throws ConflictException; missing application throws NotFoundException. No DELETE operation exists and none is added. MemberModule and ResortModule exports make service reuse explicit; application is never injected back into Member.

## Risks, baseline and verification boundary

The root's current-run baseline passed both existing app no-emit type-checks and the complete Jest suite: 548 tests passed, seven skipped (31 suites passed, one skipped), with SKIRESORT_TEST_MONGO_URI cleared. Historical completion claims in pre-existing documents are not reused as current verification evidence.

Do not change synchronous Resort filter/ID errors or Equipment history/ID validation: direct consumers/tests assert throws, not rejected promises. Do not remove validation for closer visual similarity, replace projected joins with Nestar's unrestricted owners, change visible statuses, remove compensation/CAS/transactions, loosen current-role checks, or copy Property business fields. DTO inheritance removal requires full schema comparison and effective inherited validation/transform checks before/after; class names, nested Type targets, defaults and null rules must stay exact. Existing schemas/models are reviewed and retained, including all collections, indexes and hooks.

The isolated Mongo integration suite is read but not run: no disposable transaction-capable test database was supplied. No AppModule bootstrap, environment file load, production database connection, migration, index creation or reference execution is authorized/needed for these batches. Cross-module interactions use current tests and offline DI/schema checks; production end-to-end behavior is not claimed as tested. All assigned source is now retained: most files already match the verified structure, and the remaining DTO inheritance is an explicit behavior-preservation exception rather than an uncompleted speculative rewrite.

## Final batch outcome: retain both existing validation boundaries

Verification completed on 2026-10-09. Each attempted input-only batch passed API no-emit TypeScript checking, complete sorted GraphQL schema/effective validator metadata equality across 18 exported classes and 1,000 cases, and its existing focused tests: Resort 62, Equipment 43, Event 44, FAQ 38. Those results alone were insufficient to declare behavior parity because the initial probe normalized error ordering.

An independent raw probe compared transformed values, unsorted class-validator properties/constraints, and actual default `ValidationPipe.getResponse()` arrays for 18 classes and 1,104 cases, including 285 baseline accepted inputs. Former subclass fields must precede formerly inherited fields in a flattened declaration to preserve the original validation messages. With that order, raw validation and transformed values matched exactly.

GraphQL builds inherited input fields in parent-first order. A separate probe compared unsorted `coerceInputValue` and `getVariableValues` errors for 17 exposed input types and 572 coercion cases with identical client object ordering, including omitted and explicit-null page/limit plus invalid Direction/nested text. The attempted child-first independent classes changed 12 input field orders and produced 16 changed error arrays across the public/admin inquiries: errors for invalid child fields preceded missing/invalid page/limit, whereas the baseline emitted page/limit first. Moving fields parent-first preserved GraphQL ordering but changed ValidationPipe ordering. Direct independent field declarations therefore cannot preserve both observable error responses at once.

Following AGENTS.md's instruction to stop a style change that alters behavior, only this task's four input-file edits were restored from the current-run snapshot, not from Git. SHA-256 equality confirmed all four match the pre-task working-tree bytes, preserving the user's earlier source changes and untracked files. DTO inheritance, private Event/Faq pagination classes, all existing services/guards/modules/schemas and the initial per-file line references remain valid. No final application source changes were made by this audit agent. The scoped audit and walkthrough above record the verified Nestar patterns and the precise reason this remaining implementation difference is retained.
