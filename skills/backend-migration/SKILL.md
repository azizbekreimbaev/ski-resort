---
name: backend-migration
description: Transform the existing SkiResort NestJS backend from legacy real-estate concepts into ski-resort concepts while preserving the current NestJS, GraphQL, MongoDB, authentication, and shared architecture.
---

# SkiResort Backend Migration

Use this skill when modifying existing backend code as part of the
SkiResort domain migration.

## Main Goal

Transform the existing application into a Ski Resort platform without
unnecessarily rewriting the existing architecture.

Preserve reusable infrastructure including:

- NestJS module structure
- GraphQL architecture
- MongoDB/Mongoose integration
- authentication
- JWT handling
- authorization
- pagination
- filtering
- file uploads
- shared utilities
- error handling
- logging

## Target Domain

The primary SkiResort entities are:

- Member
- Resort
- Equipment

Member roles:

- USER
- INSTRUCTOR
- ADMIN

## Migration Rules

Before modifying code:

1. Search for all affected references.
2. Identify related resolver, service, DTO, schema and enum files.
3. Check GraphQL operations that depend on the affected entity.
4. Check frontend/API compatibility where applicable.
5. Preserve unrelated working functionality.

Do not blindly perform repository-wide replacements for domain entities.

Domain migrations must be performed separately and intentionally.

Example:

Property -> Resort

must include review of:

- schema
- DTOs
- inputs
- enums
- resolver
- service
- GraphQL operations
- filters
- sorting
- database queries
- tests

## Architecture

Preserve the existing flow:

GraphQL Resolver
    ↓
Service
    ↓
Mongoose Model
    ↓
MongoDB

Do not introduce a new architectural pattern unless necessary.

## Validation

After meaningful modifications run the available:

- TypeScript typecheck
- lint
- tests
- build

Fix errors introduced by the migration.

Do not silently fix unrelated existing issues.

## Safety

Never:

- delete existing user data
- rename MongoDB collections without explicit approval
- change authentication behavior unnecessarily
- expose secrets
- modify production credentials
- reset Git changes
- remove unrelated functionality

## Completion Report

Report:

- files modified
- files created
- files deleted
- domain changes
- GraphQL changes
- database implications
- tests executed
- unresolved issues