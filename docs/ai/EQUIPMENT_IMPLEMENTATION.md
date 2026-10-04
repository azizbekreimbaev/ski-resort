# Equipment catalog and client handoff

Implementation date: 2026-10-04. This approved revised Equipment phase replaces the former Equipment daily-price/two-day design in the [DMM](../../SkiResort-Simple-ER.dmm). Resort pricing and its two-day minimum remain unchanged.

## Model and defaults

Collection: `equipments`. One category/audience/optional normalized size variant per document, with its own quantity/prices. Duplicate names/brands/sizes/resorts are allowed. No owner field, secondary/unique catalog index or separate rate collection is declared.

| Field | GraphQL output | Defaults / validation |
|---|---|---|
| _id | String! | Generated ObjectId |
| resortId | String | null; supplied IDs require visible ACTIVE/SOLD_OUT Resort |
| equipmentStatus | EquipmentStatus! | AVAILABLE; AVAILABLE/MAINTENANCE/DELETE |
| equipmentCategory | EquipmentCategory! | Required; SKI/SNOWBOARD/BOOTS/HELMET/POLES/CLOTHING/OTHER |
| equipmentName | String! | Required trimmed nonblank |
| equipmentBrand | String | null; trimmed nonblank when supplied |
| equipmentSize | String | null; canonical category-specific string |
| equipmentAudience | EquipmentAudience! | ALL; KIDS/ADULTS/ALL |
| equipmentRentalRates | [EquipmentRentalRate!]! | Required nonempty array; unique positive Int durationHours, finite nonnegative Float price |
| equipmentPurchasable | Boolean! | false; strict input boolean |
| equipmentPurchasePrice | Float | null when not purchasable; required finite >= 0 when purchasable |
| equipmentQuantity | Int! | Required integer 0–2147483647; manually managed |
| equipmentImages | [String!] | null; empty array allowed |
| equipmentDesc | String | null |
| equipmentViews / equipmentLikes / equipmentComments | Int! | Zero initially; server-managed nonnegative integers |
| createdAt / updatedAt | DateTime! | Server-managed |
| deletedAt | DateTime | null; no timestamp deletion workflow |
| meLiked | [MeLiked!]! | Output-only, empty without member context |

Each embedded rate has required `durationHours: Int!` (1–2147483647) and `price: Float!` (finite >= 0), without its own _id. Prices are KRW per package per unit; purchase price is KRW per unit. Rates are returned in ascending duration order. A 24-hour package describes duration, not calendar-day boundaries.

No equipmentPricePerDay, equipmentMinDays or equipmentMinRentalHours. Minimum is derived from the shortest package. Packages have independent prices: no multiplication/interpolation, hourly derivation or composition. Longer packages need not have increasing prices.

AVAILABLE describes public administrative visibility, not date availability. Quantity zero remains visible when AVAILABLE. No RENTED status, availableQuantity, reservation/purchase deduction or automatic status changes.

## Canonical size and audience

Size normalization trims, applies Unicode NFKC, collapses whitespace and uppercases labels/units. The same Equipment helper handles writes and filters.

| Category | Canonical representation / normalization |
|---|---|
| BOOTS | Mondopoint CM with one decimal: 235 / 235 MM / 23.5 CM → 23.5; 240 → 24.0 |
| CLOTHING | XS/S/M/L/XL/2XL/3XL; xlarge / X-LARGE / Extra Large → XL; XXL/XXXL → 2XL/3XL |
| HELMET | XS/S/M/L/XL or positive ordered CM range: 52.0 - 56.00 cm → 52-56 CM |
| SKI/SNOWBOARD/POLES | Positive CM length: 160 / 160cm → 160 CM |
| OTHER | Normalized nonblank uppercase: one size → ONE SIZE |

Bare two-digit boot integers mean CM; three-digit integers mean MM. Decimal strings mean CM, supporting stable canonical round-tripping. Explicit CM/MM is accepted; half-CM increments are required. No US/EU conversion or physical size limits. Unsupported labels/units and blanks fail; null is allowed in every category. Frontends should label boot values as Mondopoint/CM.

Audience is independent of size. KIDS/ADULTS searches include ALL records; ALL-only matches ALL. Omission includes every audience.

## GraphQL operations

| Operation | Input | Access | Output |
|---|---|---|---|
| createEquipment | EquipmentInput! | ADMIN | Equipment! |
| updateEquipmentByAdmin | EquipmentUpdate! | ADMIN | Equipment! |
| removeEquipmentByAdmin | equipmentId: String! | ADMIN | Removed Equipment! |
| getAllEquipmentsByAdmin | AllEquipmentsInquiry! | ADMIN | Equipments! |
| getEquipment | equipmentId: String! | Public/optional auth | Equipment! |
| getEquipments | EquipmentsInquiry! | Public/optional auth | Equipments! |
| likeTargetEquipment | equipmentId: String! | Authenticated | Equipment! |
| getFavoriteEquipments | EquipmentHistoryInquiry! | Authenticated | Equipments! |
| getVisitedEquipments | EquipmentHistoryInquiry! | Authenticated | Equipments! |

Existing guards/JWT format and /graphql are preserved. ADMIN service operations verify the current database ACTIVE ADMIN using the authenticated identity. RolesGuard already authenticates role-protected calls; AuthGuard protects authenticated social operations.

Create requires category/name/rates/quantity. Status/audience/purchasable default AVAILABLE/ALL/false. Nullable fields are optional. Update requires an object containing _id, not a bare ID string. Omitted fields remain unchanged; null clears nullable fields only. Rates replace the complete array. Identity/counters/timestamps cannot be supplied.

Updates validate the final category/size and purchase state. Conditional predicates protect the previously read dependent values; competing edits/removal return Conflict. Unrelated fields are not written back. Enabling purchase requires price in the same update; disabling it clears price unless a supplied non-null price makes the request invalid. Price-only updates require purchasable=true; zero is allowed.

Status DELETE hides a retained record; AVAILABLE republishes without changing deletedAt. Separate removal permanently deletes and returns the document without cascading. Missing IDs fail. Resort deletion does not delete/hide Equipment. Newly supplied non-null associations are validated; unrelated updates do not revalidate old associations. V1 returns resortId without requiring a join.

## Postman createEquipment smoke test

Send a POST request to your backend's `/graphql` endpoint. In Postman's GraphQL body, paste the query and variables below. Set `Authorization: Bearer YOUR_ADMIN_TOKEN` using a current ACTIVE ADMIN account; the placeholder is not a real credential.

```graphql
mutation CreateEquipment($input: EquipmentInput!) {
  createEquipment(input: $input) {
    _id
    equipmentName
    equipmentCategory
    equipmentAudience
    equipmentSize
    equipmentQuantity
    equipmentStatus
    equipmentRentalRates { durationHours price }
    equipmentPurchasable
    equipmentPurchasePrice
  }
}
```

Variables:

```json
{
  "input": {
    "equipmentCategory": "BOOTS",
    "equipmentName": "Salomon Ski Boots",
    "equipmentBrand": "Salomon",
    "equipmentSize": "235",
    "equipmentAudience": "ADULTS",
    "equipmentStatus": "AVAILABLE",
    "equipmentQuantity": 5,
    "equipmentRentalRates": [
      { "durationHours": 3, "price": 15000 },
      { "durationHours": 6, "price": 25000 },
      { "durationHours": 24, "price": 35000 }
    ],
    "equipmentPurchasable": true,
    "equipmentPurchasePrice": 280000,
    "resortId": null,
    "equipmentImages": [],
    "equipmentDesc": "Comfortable adult ski boots for rental or purchase."
  }
}
```

Expected contract: a generated `_id`, normalized size `23.5`, quantity 5, ascending 3/6/24-hour rates and purchase price 280000 KRW. For rental-only equipment, set `equipmentPurchasable` to false and `equipmentPurchasePrice` to null. Each successful create makes a separate catalog record; duplicate items are allowed.

On 2026-10-04, the user reported everything working well after receiving this request. This is user-reported creation smoke-test success, not an independently inspected response or confirmation that every Equipment operation was manually tested. See [validation history](COMPLETED_TASKS.md) for separately executed checks and their limits.

## Pagination, filters and sorting

Equipments returns required list/metaCounter arrays in the existing TotalCounter shape; empty results return empty arrays. History inputs are page/limit only. Catalog inputs require page >= 1, limit 1–100 and optional sort/direction/search. Omitted search defaults empty; explicit null is rejected.

Filters combine with AND; selection arrays match any listed value and empty arrays mean unrestricted:

- resortId: exact ObjectId association.
- categoryList: category enum list.
- audienceList: audience matching described above.
- sizeList: canonical sizes; a nonempty list requires exactly one category.
- equipmentBrand: escaped case-insensitive exact match.
- text: escaped case-insensitive literal name substring; blank means unrestricted.
- equipmentPurchasable: exact true/false, including false.
- rentalDurationHours: exact configured positive whole-hour package.
- rentalPricesRange: inclusive finite nonnegative ordered { start, end }; requires duration. One $elemMatch ties price/duration to the same rate.
- purchasePricesRange: same range rules; implies purchasable=true, rejecting explicit false.
- equipmentStatus: admin-only enum filter.

Public detail/list/favorites/visited expose AVAILABLE only. Admin lists inspect every status unless filtered. History excludes hidden/missing targets before pagination/counting. Favorite history orders updatedAt DESC; visited orders first-view createdAt DESC, with ID tie-breakers.

Catalog sorts: createdAt, updatedAt, equipmentName, equipmentViews, equipmentLikes, equipmentComments. Default createdAt DESC with _id tie-breaker. Price/size sorting is unsupported.

```graphql
query Equipments($input: EquipmentsInquiry!) {
  getEquipments(input: $input) {
    list {
      _id equipmentName equipmentSize equipmentAudience equipmentQuantity
      equipmentRentalRates { durationHours price }
      equipmentPurchasable equipmentPurchasePrice
      meLiked { myFavorite }
    }
    metaCounter { total }
  }
}
```

```json
{
  "input": {
    "page": 1, "limit": 10,
    "search": {
      "categoryList": ["SNOWBOARD"], "audienceList": ["KIDS"], "sizeList": ["130 CM"],
      "rentalDurationHours": 6, "rentalPricesRange": { "start": 0, "end": 30000 }
    }
  }
}
```

## Example variants

Create payloads with optional fields omitted:

```json
[
  {
    "equipmentCategory": "BOOTS", "equipmentAudience": "ADULTS",
    "equipmentName": "Salomon Ski Boots", "equipmentBrand": "Salomon", "equipmentSize": "23.5", "equipmentQuantity": 5,
    "equipmentRentalRates": [{ "durationHours": 3, "price": 15000 }, { "durationHours": 6, "price": 25000 }, { "durationHours": 24, "price": 35000 }],
    "equipmentPurchasable": true, "equipmentPurchasePrice": 280000
  },
  {
    "equipmentCategory": "SNOWBOARD", "equipmentAudience": "KIDS",
    "equipmentName": "Kids Snowboard", "equipmentSize": "130 CM", "equipmentQuantity": 7,
    "equipmentRentalRates": [{ "durationHours": 6, "price": 10000 }, { "durationHours": 24, "price": 18000 }],
    "equipmentPurchasable": false, "equipmentPurchasePrice": null
  },
  {
    "equipmentCategory": "CLOTHING", "equipmentAudience": "ALL",
    "equipmentName": "Insulated Ski Jacket", "equipmentSize": "XL", "equipmentQuantity": 4,
    "equipmentRentalRates": [{ "durationHours": 3, "price": 12000 }, { "durationHours": 24, "price": 22000 }, { "durationHours": 48, "price": 38000 }],
    "equipmentPurchasable": true, "equipmentPurchasePrice": 150000
  }
]
```

## Interactions and boundaries

EQUIPMENT is additive to CommentGroup/LikeGroup/ViewGroup; current MEMBER/ARTICLE/RESORT contracts remain. Existing comment operations support Equipment. New comments require a visible target and increment its comment counter. By the user's explicit clarification, updateComment uses the original single owner/ACTIVE-filtered update: content edits apply directly and deletion only changes status to DELETE, without changing Equipment counters. Repeated updates after DELETE fail. Anonymous detail creates no view; authenticated detail counts once per member/Equipment.

Creation and separate admin-removal counter failures attempt exact-record compensation. Admin removal of an ACTIVE comment decrements its counter when the Equipment exists; removing an already-DELETE comment does not decrement. Owner status updates have no target dependency and work after target removal. Consequently, equipmentComments is not guaranteed to equal the number of currently ACTIVE comments after owner deletion. Shared Like/View indexes remain unchanged and omit group from indexed identity; legacy group collisions are not reinterpreted.

Booking, purchases/orders, checkout, payments, availability allocation, stock deductions, Lessons and frontend work remain deferred. Future Booking selects a configured package and snapshots its price/quantity; Booking DMM snapshot fields require separate design. Future purchases similarly snapshot catalog purchase price.

No live records/indexes were inspected/changed, and no data migration/deployment occurred. Unexpected old daily-price/RENTED records need separately approved compatibility work. No broad syncIndexes or automatic conversions.

Fresh checks are in [completed tasks](COMPLETED_TASKS.md). Historical diagnostics remain historical. User-reported Instructor testing is not an automated MongoDB integration result.
