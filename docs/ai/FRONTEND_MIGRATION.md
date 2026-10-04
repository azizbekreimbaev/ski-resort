# Next.js frontend migration plan

Target: SkiResort, confirmed by the user. Status: planned only. No Next.js frontend source exists in the inspected backend repository, and no frontend refactor has been completed in this session.

Backend follow-up: the separately authorized Resort phase now retires Property operations/types and replaces catalog interactions with Resort contracts. The mappings below are the earlier branding-only plan. Before frontend work, inspect the actual checkout and apply the current [Resort client handoff](RESORT_IMPLEMENTATION.md); preserving Property requests is no longer a valid current-backend assumption.

## Step-by-step execution

1. Locate the frontend checkout and read its project instructions. Identify Next.js version, App Router versus Pages Router, package manager, actual route tree, component organization, GraphQL client/codegen and test commands. Record concrete paths before editing.
2. Establish baseline build/type/lint/test results and inventory case-insensitive old-brand references in source, assets, filenames, metadata, package configuration, environment examples, tests and documentation. Inspect existing user changes.
3. Replace project branding with `SkiResort`, `SKIRESORT`, or `skiresort` according to context. Update package root metadata and matching lockfile metadata without upgrading dependencies. Update brand-named imports/files atomically.
4. Update layout metadata, page titles, navigation/header/footer text, logo accessible text, manifest names and social preview labels. Inspect brand-bearing images separately; do not invent replacement artwork or silently overwrite user assets.
5. Preserve domain routes, domain components, GraphQL schema fields/arguments, auth flow, upload behavior and persisted browser state. Do not rename storage keys unless a separate compatibility requirement is established.
6. Verify backend URLs against actual deployment configuration. Backend directory renaming does not change `/graphql` or establish a new hostname. Do not guess endpoints or rename external infrastructure.
7. Apply the candidate mappings below only after matching them to real frontend files. Refresh generated GraphQL artifacts only if the frontend's existing workflow requires it; no backend schema rename is needed.
8. Run existing type/build/test commands and review desktop/mobile branding. Exercise supported login/signup, listing/detail, community and protected/admin flows with isolated fixtures or an explicitly approved test environment. Report baseline failures separately.
9. Record actual changed paths and validation outcomes. Audit active frontend branding; allow historical migration documentation and deliberate infrastructure/data compatibility exceptions.

## Candidate page/component mappings

These are behavior-level mappings, not discovered frontend symbols or routes. Exact paths must be filled in after inspecting the frontend. Brand-prefixed names below are conditional examples.

| Old surface, if present | SkiResort target | Route / behavior policy |
|---|---|---|
| Nestar home / layout | Existing home / layout with SkiResort branding | Preserve route and features |
| Nestar header, footer, logo component | SkiResort header, footer, logo branding | Rename symbols/files only if brand-prefixed; preserve props |
| Nestar metadata / app manifest | SkiResort metadata / manifest | Change project name strings; retain unrelated metadata |
| Property list/detail, Property cards/forms | Same Property pages/components | Preserve routes and domain labels |
| Agent directory/profile | Same Agent pages/components | Preserve roles, routes and labels |
| Member profile, signup/login | Same Member/auth pages/components | Preserve auth contracts and redirects |
| BoardArticle/community pages | Same community pages/components | Preserve operation names and fields |
| Comment, Like, Follow and View UI | Same interaction components | Preserve event behavior and API calls |
| Favorites / visited pages | Same favorites / visited pages | Preserve protected access and result handling |
| Property/Member/community admin pages | Same administrative pages | Preserve authorization and mutations |
| Product / Notice UI, if present | Same Product / Notice UI | Do not infer new backend operations from UI labels |

## GraphQL query/mutation rename plan

**No schema-field rename is planned.** Use the existing [API inventory](../../context/api-inventory.md) to verify documents against the actual backend. GraphQL document operation labels are different from schema field names: a brand-prefixed client label may change after checking persisted-query, analytics and generated-hook dependencies; server fields must stay unchanged.

| Existing operations | Kind | Target |
|---|---|---|
| `sayHello`, `chechAuth`, `chechAuthRoles` | Query | Same spelling |
| `getProperties`, `getProperty`, `getAgentProperties`, `getFavorites`, `getVisited` | Query | Same fields and inputs |
| `createProperty`, `updateProperty`, `likeTargetProperty` | Mutation | Same fields and inputs |
| `signup`, `login`, `updateMember`, `likeTargetMember` | Mutation | Same fields and inputs |
| `getMember`, `getAgents`, `getMemberFollowers`, `getMemberFollowings` | Query | Same fields and inputs |
| `subscribe`, `unsubscribe`, `imageUploader`, `imagesUploader` | Mutation | Same fields and inputs |
| `getBoardArticle`, `getBoardArticles`, `getComments` | Query | Same fields and inputs |
| `createBoardArticle`, `updateBoardArticle`, `likeTargetBoardArticle`, `createComment`, `updateComment` | Mutation | Same fields and inputs |
| Existing admin operations | Query / mutation | Preserve exact inventory names and guards |

Do not change selection-set keys, DTO/input names, enum values or cache type policies to ski-domain terms. No new API compatibility layer is needed for branding alone.

## UI terminology

| Before | After |
|---|---|
| Nestar / NESTAR / nestar brand references | SkiResort / SKIRESORT / skiresort |
| Property / Properties / Agent / Product / Member | Unchanged |
| Comment / Like / Follow / View / Notice | Unchanged |

Acceptance: verified active brand surfaces use SkiResort; existing routes and GraphQL requests remain functional; dependency versions are unchanged; unresolved asset/infrastructure exceptions and baseline failures are documented. See [next steps](NEXT_STEPS.md).
