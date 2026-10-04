---
name: resort-logic
description: Implement and review SkiResort resort-domain functionality across GraphQL operations, DTOs, Mongoose schemas, services, resolvers, enums, filters, sorting, favorites, views, and tests.
---

# SkiResort Resort Logic

Use this skill whenever working with the Resort domain.

## Domain

Resort represents a ski resort that users can browse and book.

Expected concepts include:

- name
- description
- location
- address
- images
- amenities
- difficulty levels
- price per day
- minimum booking days
- availability
- rating
- views
- likes/favorites
- status
- createdAt
- updatedAt

Do not assume every field already exists.

Inspect the existing schema before modifying it.

## Migration

The Resort domain may originate from the legacy Property/Product domain.

Before changing code search for:

- Property
- Properties
- Product
- Products
- property
- properties
- product
- products

Determine whether each reference belongs to the Resort domain before
renaming it.

Do not blindly replace Product with Resort because Product may have been
used for unrelated concepts.

## GraphQL

Review:

- Resort type
- Resort input
- Resort update input
- Resort filters
- Resort sorting
- Resort queries
- Resort mutations
- Resort resolver
- Resort service

Preferred operation naming should follow existing project conventions.

Examples:

createResort
updateResort
removeResort
getResort
getResorts

## Filtering

Where supported, consider filters for:

- location
- price
- difficulty
- amenities
- status
- rating

Preserve existing pagination infrastructure.

## Social Features

When Resort participates in:

- favorites
- likes
- views
- reviews
- comments

update related modules consistently.

Do not create duplicate implementations if reusable infrastructure already
exists.

## Database

Preserve Mongoose conventions already used by the project.

Do not rename an existing MongoDB collection automatically.

Report collection migration requirements separately.

## Validation

After modifications verify:

- GraphQL types compile
- resolver/service signatures match
- DTOs match schema
- filters use valid fields
- enums are consistent
- nullability is consistent
- tests pass
- build succeeds