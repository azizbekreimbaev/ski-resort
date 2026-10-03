# Backend migration: Nestar → SkiResort

Documentation date: 2026-10-04. SkiResort is the confirmed target; the Petoria wording in the documentation request was corrected by the user. This is a project/brand migration, not a business-domain conversion.

## Original and current project

| Area | Original | Current |
|---|---|---|
| Brand | Nestar / NESTAR / nestar | SkiResort / SKIRESORT / skiresort |
| npm package | `nestar` | `skiresort` |
| API directory | `apps/nestar-api` | `apps/skiresort-api` |
| Batch directory | `apps/nestar-batch` | `apps/skiresort-batch` |
| Default Nest project | `nestar` | `skiresort` |
| Batch Nest project | `nestar-batch` | `skiresort-batch` |
| Production entrypoints | `dist/apps/nestar-{api,batch}/main` | `dist/apps/skiresort-{api,batch}/main` |

The backend remains a two-application NestJS monorepo using TypeScript, Express, code-first GraphQL/Apollo, Mongoose/MongoDB, JWT, local uploads, native WebSockets, and scheduled ranking jobs. Existing property, member, and community functionality remains; the new brand does not establish ski-specific domain functionality. See [architecture](../context/architecture.md).

## Migration goal and naming changes

Remove the old active project identity while preserving behavior. Package and lockfile root metadata, Nest configuration, TypeScript output paths, npm script targets, cross-application imports, greetings, test labels/assertions, documentation, evidence paths, and manifest entries were updated. Dependency versions and script names were preserved.

API `GET /` now returns `Welcome to SKIRESORT API server!`. Batch `GET /` returns `Welcome to SKIRESORT BATCH  server!` (the existing double space is preserved). Six ignored local database-export filenames changed from `Nestar.*.json` to `SkiResort.*.json`, with byte-identical contents; this did not rename live databases or collections.

## Modules and GraphQL

| Area | Implemented change | Preserved contract |
|---|---|---|
| API feature modules | Application parent directory renamed | Auth, Member, Property, BoardArticle, Comment, Follow, Like, View module behavior |
| Batch | Imports now target `../../skiresort-api/...` | Property/Member models, ranking calculations and cron schedules |
| Root HTTP endpoints | Brand text changed | Routes and status behavior |
| GraphQL | No field, type, input, or operation rename | `/graphql`, resolver arguments, guards, DTOs and enums |
| Uploads/WebSockets | No protocol migration | Existing paths, events, storage and implementation |

`sayHello` still returns `GraphQL API Server`. Existing spellings `chechAuth` and `chechAuthRoles` remain public field names. Property, Properties, Agent, Product, Member, Comment, Like, Follow, View, and Notice terminology is intentionally unchanged. Exact operations are in the [API inventory](../context/api-inventory.md).

## MongoDB collections and schemas

| Model | Explicit collection | Migration |
|---|---|---|
| Member | `members` | None |
| Property | `properties` | None |
| BoardArticle | `boardArticles` | None |
| Comment | `comments` | None |
| Follow | `follows` | None |
| Like | `likes` | None |
| View | `views` | None |
| Notice | `notices` | None; remains schema-only |
| Notification | `notifications` | None; remains schema-only |

No schema fields, references, indexes, persisted enum values, collection names, or data were migrated. Live collection/index existence was not verified. See [data model](../context/data-model.md).

## Database example discrepancy

The user explicitly chose to preserve database connections/data and the old database names in `.env.example`. At migration validation, the two examples were still `nestar_dev` and `nestar_prod`. During this documentation pass, `.env.example` already contained `skiresort_dev` and `skiresort_prod`. This later workspace change is observed, not attributed to the completed migration. These documents do not edit or revert it. Example names do not establish the names of live databases; active secret values are not reproduced here.

## Compatibility and verification

External scripts using old Nest project keys or application/output paths must adopt the new identifiers. No legacy path aliases were introduced. Existing GraphQL clients and persisted domain data retain their contracts. Local export filenames must be updated in any external manual import commands. Git history, Git internals, third-party packages, and external resources were outside the branding migration.

Both applications compiled and built successfully; isolated HTTP greeting tests passed. Full database-backed e2e tests and production startup were not run. Existing lint failures remain. See [completed tasks](COMPLETED_TASKS.md) and the [verification record](../context/verification.md).

Historical old-name references in these migration documents are intentional. The earlier zero-reference audit predates `docs/`; future branding scans must distinguish historical documentation from active project identity.
