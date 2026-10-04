---
name: equipment-logic
description: Implement and review SkiResort Equipment catalog contracts, normalized sizes, embedded rental packages, audience, purchase capability, filtering and interactions.
---

# SkiResort Equipment Logic

Use for Equipment functionality. Read AGENTS.md, the current DMM and docs/ai/EQUIPMENT_IMPLEMENTATION.md; current user requirements override historical examples.

## Architecture and contracts

Keep EquipmentModule → EquipmentResolver → EquipmentService → Mongoose Model. Follow Resort and Member/Instructor patterns for DTOs, enums, ObjectIds, queries, guards, errors and tests. DTOs/enums stay under libs, schemas under schemas, features under components. No new packages or architectural abstractions.

Collection: equipments. One size variant per record, with ADMIN-managed quantity and independent prices. Nullable resortId; no owner field or unique catalog identity. Duplicate items are allowed.

Management: createEquipment, updateEquipmentByAdmin, removeEquipmentByAdmin, getAllEquipmentsByAdmin. ADMIN RolesGuard plus current ACTIVE ADMIN database verification. Permanent removal is separate from updates; no cascade. Counters/timestamps are server-managed.

## Current Equipment design

- Categories: SKI, SNOWBOARD, BOOTS, HELMET, POLES, CLOTHING, OTHER.
- Status: AVAILABLE, MAINTENANCE, DELETE. Only AVAILABLE is public; status is not date availability.
- Audience: KIDS, ADULTS, ALL. KIDS/ADULTS searches include ALL; ALL-only search matches ALL.
- Size: nullable category-normalized string. BOOTS use Mondopoint CM (23.5); clothing labels (XL); helmet labels/ranges (52-56 CM); ski/snowboard/poles lengths (160 CM); OTHER uppercase strings. Reuse one helper for writes/filters.
- equipmentRentalRates: nonempty embedded { durationHours, price } packages without IDs. Unique positive whole-hour durations, finite nonnegative KRW package/unit prices, sorted by duration. Derive minimum from shortest package.
- No equipmentPricePerDay, equipmentMinDays, equipmentMinRentalHours or availableQuantity.
- equipmentPurchasable defaults false; purchase price is null when false and required finite >= 0 when true. Every record remains rentable.
- Quantity is an integer >= 0; no automatic deduction/status change.

## Queries and interactions

Use nested inquiry validation, capped pagination and explicit sort allowlists. Size filters require one category. Rental-price ranges require a duration and match the same rate via $elemMatch. No price/size sorting in v1.

Reuse shared EQUIPMENT likes/views/comments and history lookups. The user's latest override requires updateComment to use the original single owner/ACTIVE-filtered findOneAndUpdate: DELETE is only a status change, without counter updates or compensation. Creation and separate admin removal retain their counter behavior. Anonymous reads create no views; authenticated detail counts once per member/Equipment. No counter transactions. Retained comments can be removed after target removal.

## Boundaries and verification

Booking, reservation availability, purchases/orders, checkout, payments and shipping are separate work. No live migration/index synchronization or incidental data rewriting.

Test normalization, final-state purchase/category validation, conditional updates, package filters, authorization, visibility, interactions and compensation. Compile/build both apps and separately compile tests. Distinguish mocks from isolated MongoDB integration and preserve unrelated behavior/historical evidence.
