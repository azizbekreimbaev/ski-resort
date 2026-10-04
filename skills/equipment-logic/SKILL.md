
---
name: equipment-logic
description: Implement and review the SkiResort equipment rental domain including GraphQL API, DTOs, schemas, inventory, pricing, availability, filtering, services, resolvers, and tests.
---

# SkiResort Equipment Logic

Use this skill whenever creating or modifying ski equipment functionality.

## Domain

Equipment represents rentable ski-related equipment.

Typical fields:

- name
- category
- brand
- description
- images
- size
- pricePerDay
- quantity
- availableQuantity
- status
- createdAt
- updatedAt

Inspect existing project conventions before defining exact fields.

## Equipment Categories

Possible categories include:

- SKI
- SNOWBOARD
- BOOTS
- HELMET
- POLES
- CLOTHING
- OTHER

Do not introduce unnecessary categories without a product requirement.

## Architecture

Follow existing SkiResort NestJS architecture:

EquipmentModule
    ↓
EquipmentResolver
    ↓
EquipmentService
    ↓
Equipment Mongoose Model

Use the same patterns already used by Resort where appropriate.

## GraphQL

Expected operations may include:

createEquipment
updateEquipment
removeEquipment
getEquipment
getEquipmentList

Follow existing naming conventions if they differ.

## Inventory

Equipment availability must consider inventory.

Do not allow booking logic to assume unlimited quantity.

Keep:

quantity >= 0

and validate rental quantities appropriately.

## Pricing

Use the canonical equipment price field consistently.

Example:

pricePerDay

Do not duplicate pricing calculations across resolver and service layers.

Booking price calculation should ultimately belong to booking/business
logic.

## Permissions

Typical permissions:

USER
- browse equipment
- rent equipment

INSTRUCTOR
- browse equipment

ADMIN
- create equipment
- update equipment
- remove/deactivate equipment
- manage inventory

Use the project's existing authorization infrastructure.

## Validation

Check:

- GraphQL operations
- DTOs
- schemas
- enums
- inventory fields
- filters
- pagination
- authorization
- tests
- build