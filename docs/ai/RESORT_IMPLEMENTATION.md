# Resort implementation and client handoff

Implementation date: 2026-10-04. This is the first business-domain migration after the completed branding migration. The source of truth for Resort fields is [SkiResort-Simple-ER.dmm](../../SkiResort-Simple-ER.dmm).

Later user refinement on 2026-10-04: location and facilities now use the explicitly supplied `ResortLocation` and `ResortFacilities` enums. This adds enum constraints to the DMM's original string/array representation without changing the diagram or its nullability.

## Implemented domain

The API now registers Resort instead of Property. It retains the existing NestJS resolver/service/module pattern, code-first GraphQL, Mongoose, JWT guards and `/graphql` endpoint. Feature files remain under `components/resort`, DTOs under `libs/dto/resort`, enums under `libs/enums`, and the schema under `schemas/Resort.model.ts`, within `apps/skiresort-api/src`.

`Resort` uses collection `resorts`, with only the DMM persisted fields:

| Field | GraphQL type | Persisted requirement |
|---|---|---|
| `_id`, `memberId` | String! | Required ObjectId; memberId references members |
| `resortStatus` | ResortStatus! | Required; ACTIVE, SOLD_OUT, DELETE |
| `resortTitle`, `resortAddress` | String! | Required |
| `resortLocation` | ResortLocation! | Required; stored enum string |
| `resortPricePerDay` | Float! | Required, finite and nonnegative |
| `resortMinDays` | Int! | Required, integer >= 2 |
| `resortImages` | [String!]! | Required array; an empty array is allowed |
| `resortViews`, `resortLikes`, `resortComments` | Int! | Required nonnegative integer counters |
| `createdAt`, `updatedAt` | DateTime! | Required automatic timestamps |
| `resortLevel` | ResortLevel | Nullable; BEGINNER, INTERMEDIATE, ADVANCED, MIXED |
| `resortFacilities` | [ResortFacilities!] | Nullable array of enum strings |
| `resortDesc` | String | Nullable |
| `deletedAt` | DateTime | Nullable, server-managed |

Creation defaults to ACTIVE, minimum days 2, and zero counters. The authenticated admin becomes `memberId`; clients cannot assign ownership, status, counters or timestamps during creation. Output-only `memberData` and `meLiked` are aggregation fields, not persisted Resort fields. Missing owners do not discard resorts, and joins exclude passwords, access tokens and authorization values.

Later user-requested uniqueness refinement: the combination of title, location, address and level identifies a Resort globally, across admins and all statuses, including DELETE. Different levels permit otherwise identical resorts. Omitted/null levels share the same identity value, null. Creation trims title/address and checks duplicates using case-insensitive English collation (`strength: 2`). Changing prices, images or ownership does not make the same identity a new Resort. Creation rejects duplicates with `A resort with this title, location, address and level already exists`. Permanent removal releases that identity.

The schema declares the four-field compound unique index `unique_resort_identity_with_level` with the same collation, protecting concurrent creations and identity-changing updates once MongoDB has built it. Duplicate-key errors from creation/updates become the same clear conflict. The pre-check alone does not prevent concurrent writes. Existing duplicate records must be resolved explicitly before the index can build. The original schema refinement did not perform live index/data operations; a later explicitly approved development index change is recorded below.

Changing a Mongoose schema index does not modify an installed MongoDB index. The previous three-field `unique_resort_identity` would still reject different-level resorts. On the intended database, create the new four-field index successfully before dropping that specific superseded index. Do not use automatic `syncIndexes` or drop unrelated indexes. After inspecting both installed indexes and receiving explicit user approval, the obsolete index was removed from the configured development database on 2026-10-04. The four-field unique index was verified before and after removal; records were unchanged. Other databases remain unverified. Equivalent manual commands are:

```javascript
db.resorts.createIndex(
  { resortLocation: 1, resortTitle: 1, resortAddress: 1, resortLevel: 1 },
  {
    unique: true,
    name: "unique_resort_identity_with_level",
    collation: { locale: "en", strength: 2 }
  }
);
// Run only after the new index was created successfully.
if (db.resorts.getIndexes().some(index => index.name === "unique_resort_identity")) {
  db.resorts.dropIndex("unique_resort_identity");
}
```

Image arrays of strings, nonnegative pricing, default values and admin-only management are implementation choices. Location/facility enum values follow the later explicit user instruction. The DMM establishes the fields, original status/level enums and two-day minimum, but does not establish those additional policies. No booking-duration enforcement or booking availability is implemented because Booking remains deferred.

`ResortLocation` values: PYEONGCHANG, JEONGSEON, HONGCHEON, CHUNCHEON, WONJU, HOENGSEONG, YANGYANG, GWANGJU_GYEONGGI, ICHEON, POCHEON, MUJU.

`ResortFacilities` values: SKI_LIFT, EQUIPMENT_RENTAL, SKI_SCHOOL, RESTAURANT, CAFE, ACCOMMODATION, PARKING, SHUTTLE_BUS, LOCKER, FIRST_AID, SLED_PARK.

## GraphQL operations

| Access | Operation | Input / output |
|---|---|---|
| Public, optional auth | `getResort(resortId: String!)` | Resort |
| Public, optional auth | `getResorts(input: ResortsInquiry!)` | Resorts |
| Authenticated | `likeTargetResort(resortId: String!)` | Resort |
| Authenticated | `getFavoriteResorts(input: ResortHistoryInquiry!)` | Resorts |
| Authenticated | `getVisitedResorts(input: ResortHistoryInquiry!)` | Resorts |
| ADMIN | `createResort(input: ResortInput!)` | Resort |
| ADMIN | `updateResortByAdmin(input: ResortUpdate!)` | Resort |
| ADMIN | `getAllResortsByAdmin(input: AllResortsInquiry!)` | Resorts |
| ADMIN | `removeResortByAdmin(resortId: String!)` | Resort; permanently deletes and returns the removed record |

`Resorts` returns `{ list, metaCounter }`, retaining the existing array of `TotalCounter` objects. An empty result returns empty arrays. Inputs use GraphQL String IDs and validate 24-character hexadecimal ObjectIds before aggregation.

`ResortInput` requires title, location, address, daily price and images; minimum days is optional with default 2. Level, facilities and description are nullable. `ResortUpdate` requires `_id`; content fields and status are optional. Omitted values are unchanged; nullable fields can be cleared with null, while null is rejected for required persisted fields. Ownership, counters and timestamps are not update fields.

Update requests must supply an object for `$input`, not the ID string itself. GraphQL rejects a string before guards, validation pipes or resolvers execute. The resolver uses the existing `shapeIntoMongoObjectId` approach to convert `input._id` after the global validation pipe validates the input; the service receives the converted ID. Validated scalar/search ID conversion also delegates to this existing helper. Removal passes the ObjectId directly to its separate delete query.

```graphql
mutation UpdateResort($input: ResortUpdate!) {
  updateResortByAdmin(input: $input) {
    _id
    resortStatus
    resortPricePerDay
  }
}
```

Example variables:

```json
{
  "input": {
    "_id": "6ac1c176c0a836d7637ea8df",
    "resortStatus": "SOLD_OUT"
  }
}
```

List/history inquiry inputs require integer `page >= 1` and `1 <= limit <= 100`. Catalog/admin lists accept optional `sort`, `direction` and `search`. Sort fields are `createdAt`, `updatedAt`, `resortTitle`, `resortPricePerDay`, `resortLikes`, `resortViews` and `resortComments`; the default is createdAt DESC with an _id tie-breaker.

`ResortSearch` supports `memberId`, `locationList`, `levelList`, `facilities`, `pricesRange: { start, end }` and `text`. Locations/levels match any supplied value; facilities must contain all supplied values. Price endpoints are inclusive, finite, nonnegative and ordered. Text performs an escaped, case-insensitive literal title search. `AllResortSearch` additionally accepts `resortStatus`.

Creation, updates, output fields and search filters now use the location/facility enum types, including `locationList: [ResortLocation!]` and `facilities: [ResortFacilities!]`. Clients must send/select the supplied enum values instead of arbitrary location/facility strings. Any existing free-form stored values would need an explicitly planned mapping before enum serialization; no stored records were inspected or rewritten by this refinement.

Public detail, catalog, favorites and visited lists include ACTIVE and SOLD_OUT and exclude DELETE. Admin lists include all statuses unless filtered. By a later explicit user instruction, update now uses one `findOneAndUpdate` for supplied allowed content/status fields with validators; it does not read/retry status or manage `deletedAt`. Setting DELETE hides a retained record, and setting ACTIVE/SOLD_OUT makes a retained record visible without changing an existing `deletedAt`. The separate remove operation uses `findOneAndDelete`, permanently deleting the Resort document. It returns the removed record, or a not-found error if absent. Related records are not cascaded or rewritten, and permanently removed resorts cannot be restored through update. This supersedes the original soft-removal policy.

Existing `createComment`, `updateComment`, `getComments` and `removeCommentByAdmin` operations support `commentGroup: RESORT`. Comment inquiry now accepts optional `search.commentGroup`; omitted groups include only currently supported MEMBER, ARTICLE and RESORT records, hiding stored legacy PROPERTY groups. New Resort comments require a visible Resort. `resortComments` counts ACTIVE comments and decrements only an actual active deletion/removal. Repeated owner deletion does not decrement twice.

## Breaking changes and preserved data

| Retired contract | Replacement |
|---|---|
| `createProperty`, `getProperty`, `getProperties` | `createResort`, `getResort`, `getResorts` |
| `updateProperty`, `updatePropertyByAdmin` | `updateResortByAdmin`, restricted to ADMIN |
| `getAllPropertiesByAdmin`, `removePropertyByAdmin` | Resort equivalents; removal permanently deletes by later user instruction |
| `likeTargetProperty` | `likeTargetResort` |
| `getFavorites`, `getVisited` | `getFavoriteResorts`, `getVisitedResorts` |
| `getAgentProperties` | Retired; admins use getAllResortsByAdmin |
| Property DTOs, fields, statuses and locations | Resort DTOs and DMM fields; rewrite client selections/variables |
| PROPERTY in LikeGroup/ViewGroup/CommentGroup | RESORT; existing MEMBER/ARTICLE behavior retained |

There are no compatibility aliases. Clients must update query fields, selection sets, input type names and enum values together. No frontend source was changed, and no frontend completion is claimed.

The API no longer reads the `properties` collection for catalog/history operations. Existing properties and PROPERTY interaction records remain stored unchanged. New Resort documents use new ObjectIds; there is no automatic data conversion or reinterpretation of old references. Existing member/interaction indexes, database names, connections and uploads were not migrated or deleted. Existing likes/views unique indexes still constrain memberId plus reference ID without the group; conflicting legacy-group duplicates are rejected rather than changing another group's record.

Property ranking jobs and the Property part of batch rollback were removed. Member/AGENT ranking and its current formula/schedule remain unchanged. No Resort ranking field/job was added. The two-application topology and dependency versions are unchanged.

## Boundaries and validation

Member/instructor fields and roles, Equipment, Booking, notifications, anonymous-view nullability, availability and booking/cancellation policies are deferred. Views are recorded only for authenticated members, once per member/Resort. Resort creation does not change memberProperties.

Auth was intentionally left unchanged. Existing public role-assignment/self-update and stale-JWT weaknesses therefore remain; existing ADMIN guards do not establish secure role provisioning. This migration does not claim to repair those findings.

Like/view matching includes group discrimination. Actual record changes drive counter changes; failed counter writes attempt to reverse the exact affected interaction. Failed compensation is reported while preserving the original counter error. These separate writes do not guarantee atomicity after crashes, ambiguous network failures or compensation failure. No reconciliation scheduler or live index replacement was introduced.

Validation outcomes are recorded in [completed tasks](COMPLETED_TASKS.md). Tests use mocks and in-memory schema/GraphQL validation without MongoDB or scheduled jobs. They do not establish live database integration, deployment or stored-data migration correctness.
