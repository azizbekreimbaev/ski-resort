# SkiResort Backend — Nestar-Reference Refactoring Rules

## Mission

Refactor the **existing SkiResort NestJS backend** so that its implementation style, file organization, module structure, dependency-injection patterns, GraphQL resolvers, services, DTOs, input types, object types, schemas, and cross-module interactions are consistent with the **existing Nestar backend**.

I already understand the Nestar codebase and want to understand, explain, maintain, and defend **every line of the finished SkiResort backend** in the same way. Prefer the actual patterns demonstrated by Nestar over introducing your own preferred architecture.

**Critical distinction:**
- **Nestar = reference for HOW code is organized and written.**
- **SkiResort = authority for WHAT the application must do.**
- The goal is the **Nestar coding style applied to SkiResort business requirements**, not a migration of Nestar business data or features.

## When these instructions apply

Use this workflow when the user requests the Nestar-reference backend audit or refactor. A request to write, review, or explain these instructions is a documentation task; it does not itself start the application refactor.

For an audit-only request, complete the requested review and migration documents without editing application source. For an authorized refactor, complete the audits and migration map first, then proceed through safe, documented batches. Unrelated tasks do not trigger a whole-backend rewrite.

## Repository locations and access

Reference (READ ONLY):
- `C:\Users\Aziz\Desktop\nestar`
- Primary reference source: `C:\Users\Aziz\Desktop\nestar\apps\nestar-api\src`

Target (the ONLY application you may modify):
- `C:\Users\Aziz\Desktop\skiresort`
- Discover the real backend application folder and `src` path instead of assuming its name.

Work from the SkiResort repository root. Before proceeding:
1. Verify that both project directories exist and are readable from the current Codex session.
2. Locate the target backend using the workspace configuration and actual file tree.
3. Read applicable nested `AGENTS.md` instructions, if any.
4. Inspect root `package.json`, workspace configuration, TypeScript configuration, path aliases, backend package scripts, and module import paths in both projects.
5. Review Nestar as a **read-only external reference**. Never edit, format, rename, delete, install into, or run migrations against Nestar.
6. If reference files are inaccessible, clearly report the blocked path. **Do not pretend to have inspected Nestar, and do not begin a speculative refactor.**
7. Inspect `git status` and the existing diff before editing SkiResort. Preserve pre-existing user changes and untracked files; do not reset, restore, overwrite, or discard them. Treat the current working tree as the behavioral baseline and distinguish existing changes from this task's edits.

Never copy `.git`, Git configuration, repository history, secrets, `.env` values, production credentials, deployment settings, or old remote links from Nestar into SkiResort. No runtime imports may point into the local Nestar directory.

## Non-negotiable implementation rules

1. **Review before editing.** Do not start rewriting merely because a SkiResort file looks different. First identify the corresponding Nestar implementation and the existing SkiResort behavior.
2. **Do not add unrelated logic.** No new endpoints, GraphQL operations, fields, entities, features, workflows, queues, caches, payment logic, storage redesigns, extra abstractions, utilities, or packages unless explicitly requested.
3. **Do not redesign.** Do not replace Nestar's style with Clean Architecture, DDD, CQRS, generic base repositories, universal CRUD services, abstract factories, or new framework conventions.
4. **Preserve SkiResort contracts.** Keep existing domain names, data shape, schema fields, enum values, role rules, permission checks, state transitions, GraphQL query/mutation names and response semantics, filters, sorting, pagination, and errors unless a documented incompatibility requires attention.
5. **Preserve working behavior.** The refactor should be behavior-preserving by default. If an existing defect, security risk, or important mismatch appears, report it; do not silently expand the scope.
6. **Preserve security.** Never remove authentication, authorization, input validation, ownership checks, or sensitive-data restrictions merely to resemble Nestar. Do not reproduce an unsafe pattern from the reference.
7. **Prefer existing Nestar patterns.** Use equivalent naming, grouping, decorator usage, constructor injection, private/public access modifiers, async/await structure, service composition, error handling, and query conventions where suitable for SkiResort.
8. **No broad find-and-replace migration.** Adapt each component deliberately. Never rename a SkiResort domain concept to a Nestar concept merely for superficial similarity.
9. **Keep changes reviewable.** Refactor one coherent component or dependency group at a time, review the diff, and run relevant checks before continuing. Do not delete working code without proving it is replaced safely.
10. **No unauthorized project changes.** Do not change the frontend, Git history, remotes, infrastructure, deployment, or unrelated files as part of this backend-style refactor.
11. **Do not rewrite code that already matches.** Mark matching components as reviewed with no change needed. A complete refactor means every relevant component was assessed, not that every file was changed.

## Phase 1 — Thorough Nestar architecture audit (BEFORE changing SkiResort)

Read **every relevant source file**, not merely filenames or selected snippets, in the Nestar backend, especially:

The audit covers authored backend source, imported shared source, applicable tests, and configuration needed to understand the backend. Exclude dependencies, build output, and generated artifacts from exhaustive source reading; inspect generated GraphQL schemas when needed to establish or verify the public contract. Maintain a per-file review inventory and record unread files explicitly.

### Bootstrap and root application
- `src/main.ts`: bootstrap sequence, NestFactory, global configuration, middleware, pipes, filters, guards, interceptors, CORS, GraphQL setup, and listen behavior.
- Root `app.module.ts`: `imports`, `providers`, `controllers`, `exports`, configuration, database integration, and component registration.
- Root `app.controller.ts`, `app.service.ts`, and `app.resolver.ts` where present: especially health/status endpoints, their purpose, and how they are wired.
- Any root configuration, constants, enums, and shared application providers.

### Shared infrastructure and persistence
- Every file under the backend's `database`, `libs`, and `schemas` folders, wherever those folders actually exist.
- Follow imports into other repository-level shared `libs` or packages where required to understand how the backend works.
- MongoDB/Mongoose model registration, schema definitions, providers, connections, database utilities, collections, indexes, common filters, and query construction.
- Shared helpers, exceptions, enum registration, authentication/authorization pieces, and reusable decorators.

### Every component / API module
- Traverse **every** folder and `.ts` file under `src/components` and any equivalent feature directories.
- For **each** feature, read its module, resolver/controller (whichever exists), service, DTOs, inputs, outputs/object types, enums, schemas, interfaces, and related helpers.
- Trace each public GraphQL query/mutation or REST route end-to-end, including which service methods it calls and which database operations are performed.
- Trace components that reuse one another (especially comment-like shared features): importing/exporting a module, injecting a service, associating records, resolving relationships, and avoiding dependency cycles.

### Exact conventions to extract from real code
Examine and record the **actual Nestar implementations** of:
- Nest decorators: `@Module`, `@Injectable`, `@Controller`, `@Get`, `@Post`, `@UseGuards`, and any application-specific decorators in use.
- GraphQL decorators: `@Resolver`, `@Query`, `@Mutation`, `@ResolveField`/`@ResolveProperty`, `@Args`, `@Context`, `@InputType`, `@ObjectType`, `@ArgsType`, `@Field`, `@ID`, and `registerEnumType`, where used.
- Mongoose decorators/APIs: `@Schema`, `@Prop`, `SchemaFactory`, `@InjectModel`, `Model`, query methods, aggregation, population, and pagination, where used.
- DTO construction: input versus output classes, required/optional fields, defaults, nested types, arrays, ID handling, enums, validation/transform decorators, and mapped types if used.
- Module wiring: `imports`, `providers`, `controllers`, `exports`, model registration, dependency injection, and `forwardRef` only where actually necessary.
- Service coding style: constructor injection, parameter types, method ordering/naming, async/await, CRUD flows, query construction, exceptions, mapping, updates, and deletes.
- Resolver coding style: exact GraphQL decorators, arguments, authentication context, delegation to services, and return types.
- Conventions for file naming, folders, imports, aliases, status enums, timestamps, database IDs, auth/roles, error messages, and comments.

**Do not guess which Nestar conventions exist. Verify them against actual source files.** If a listed framework feature is not used by Nestar, do not introduce it just because it is listed above.

If Nestar contains differing implementations of the same pattern, select the closest analogue for the SkiResort component and cite the exact reference and reason. Do not invent a universal Nestar convention from inconsistent examples.

## Phase 2 — Audit the complete current SkiResort backend

Read the corresponding SkiResort files and folders to the same depth. Inventory:
- Bootstrap/root application and any health-check controller/service.
- Main `AppModule` imports/providers/controllers/exports.
- Database connection/configuration and shared libs.
- All GraphQL types, DTOs, inputs, object types, enums, and Mongoose schemas.
- All component modules, resolvers/controllers, services, and their injected dependencies.
- All currently implemented CRUD behavior and non-CRUD business rules.
- All shared or cross-feature paths: comments, users/members, authentication, favorites, follows, resorts, equipment, instructors/applications, bookings, events, community, and any **other modules actually present**. Do not fabricate missing modules.

Compare corresponding implementations **line by line where patterns differ**, rather than inferring from folder names. Record the existing SkiResort contracts before touching them.

Before source edits, run the relevant existing checks when they can run safely without production services. Record baseline failures separately so they are not misreported as refactor regressions. Capture existing API operation names, argument and return types, GraphQL nullability/defaults, validation, persisted schema options/indexes, and important success/error behavior for comparison after each batch.

## Phase 3 — Write an evidence-based migration map

Before editing application source, create/update:
- `docs/backend-refactor/NESTAR_ARCHITECTURE_REVIEW.md`
- `docs/backend-refactor/SKIRESORT_PARITY_PLAN.md`

Keep these documents specific and concise, with **actual file paths and code references**, not generic NestJS tutorials. Include:
1. A file/folder inventory confirming what was inspected in both projects, with per-file review status, code references, and explicit pending or blocked entries.
2. A bootstrap/dependency graph showing `main.ts` -> `AppModule` -> feature module -> resolver/controller -> service -> model/database; show shared-service calls between features.
3. A component-by-component comparison table: `SkiResort file | Nestar reference file/pattern | Difference | Intended adjustment | Behavior that must stay unchanged`.
4. An inventory of GraphQL queries/mutations or REST routes, input/output types, schema fields, module imports/exports, guards, and relevant cross-module consumers.
5. Any features with **no appropriate Nestar analogue**; preserve their business logic and apply the nearest verified structural convention without inventing new domain behavior.
6. Identified risks: contract changes, circular dependencies, schema compatibility, auth, validation, broken imports, and behavior changes.
7. A dependency-ordered, small-batch implementation plan.

Do not claim review completeness if any relevant file was not opened/read. Record blockers and gaps explicitly.

## Phase 4 — Refactor SkiResort using Nestar conventions

Follow the recorded migration map and apply changes in dependency order. Once the user has authorized the refactor, proceed with safe batches within that scope without requesting approval for every component. Report differences that require a contract, behavior, or security decision before making that particular change.

1. Shared types, enums, database/schema registration, and common infrastructure **only where a mismatch requires changes**.
2. Root application wiring and bootstrapping **only where needed**.
3. Individual feature DTOs, inputs, object types, and schemas.
4. Feature modules, resolvers/controllers, and services, one coherent component group at a time.
5. Cross-module injections, imports/exports, shared actions (such as comments attached to other domain entities), and end-to-end call chains.

For every refactored component:
- Mirror the corresponding **verified Nestar code organization and method style**, adapted to SkiResort fields and requirements.
- Keep resolver/controller methods thin if Nestar does; implement business logic in services according to Nestar's actual pattern.
- Keep GraphQL DTOs, schema entities, and service signatures consistent with each other.
- Preserve the database model, existing records, collection names, and public API unless change is explicitly justified and requested.
- Reuse shared feature services and their module exports in the same manner as Nestar rather than duplicating logic.
- Do not copy irrelevant Nestar classes, fields, route names, authorization rules, or entity associations.
- Match naming and coding patterns without forcing identical statements when behavior genuinely differs.
- Avoid speculative fixes, extra comments on every line, or unnecessary new helper methods.
- After each coherent edit: inspect `git diff`, validate imports/dependencies, type-check, and run the smallest relevant available tests.

If copying Nestar style would change behavior, security, or persisted data, **stop that particular change**, document the difference, and preserve SkiResort's current behavior until the conflict is resolved. Continue safe independent changes when possible.

## Phase 5 — Verification and teaching-oriented explanation

Run the repository's **existing** scripts where available (discover actual commands first):
- TypeScript build/type-check.
- Lint/format check, scoped to the backend and changed files where supported. Inspect scripts first; use check mode rather than automatic fixes or repository-wide formatting that would alter unrelated or pre-existing edits.
- Existing unit/integration tests relevant to changed modules.
- GraphQL schema generation/validation and application bootstrap or health endpoint checks, if these can be done without contacting production services.

Never run destructive database operations or production migrations as part of this task. If a test requires a database or credentials not available, report it as **not run**, not passed.

Create/update `docs/backend-refactor/CODE_WALKTHROUGH.md` to help me study the finished backend. For each completed component, explain in clear, practical language:
- Each file's exact purpose and its analogous Nestar file.
- What its major decorators, imports, constructor dependencies, DTO fields, and return types do.
- How a real request flows through resolver/controller -> service -> schema/model -> response.
- How CREATE, READ, UPDATE, and DELETE are implemented (where present), including important conditions and errors.
- How another module reuses this component and why imports/exports/providers are configured that way.
- What was changed, what was intentionally preserved, and any remaining differences from Nestar.
- Point to exact file paths, class names, and method names, so I can trace and understand the implementation statement by statement.

This explanation is documentation **about the existing code**, not a request to add large teaching comments inside source files.

## Completion criteria and reporting

A feature in the authorized refactor is complete, whether changed or already matching, only when:
- The corresponding Nestar pattern has been inspected and documented (or the absence of an analogue is recorded).
- Its SkiResort-specific behavior and public contracts are preserved.
- Module/resolver/service/DTO/schema wiring is consistent and type-checks.
- Existing relevant tests pass, or limitations are honestly reported.
- Its cross-module consumers still work.
- Its code walkthrough is written and understandable.

After every working batch, report:
1. Modules/files inspected and changed.
2. Specific Nestar patterns applied, with file-path evidence.
3. SkiResort logic/contracts deliberately preserved.
4. Verification commands and outcomes.
5. Risks, blockers, and next uncompleted components.

**Begin with the complete source audit and migration map, not immediate rewriting.** Then implement systematically in small batches. Do not claim the whole backend is finished until every relevant module has been inspected, refactored where needed, and verified.
