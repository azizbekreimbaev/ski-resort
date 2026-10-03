# Next-session priorities

Prepared 2026-10-04. This is the requested "tomorrow" backlog for the next working session, not a scheduled job or authorization to implement unrelated repairs. Target remains SkiResort; domain conversion is deferred.

## Backend cleanup

| Priority | Task | Completion criterion |
|---|---|---|
| P0 | Review existing workspace changes and resolve the `.env.example` discrepancy with the user's preservation decision | Example policy is explicitly settled; no live database rename or data movement |
| P0 | Plan repairs for public signup ADMIN assignment and self-profile role promotion (F01/F02) | Protected role policy and regression cases agreed before implementation |
| P1 | Plan password hashing, token/account status checks, upload containment, sensitive logging and required-secret validation (F03–F07) | Changes are independently scoped and tested; no domain naming changes |
| P2 | Plan counter/lifecycle consistency, nested input constraints, nullable updates and reliable batch ordering | Targeted behavior and regression tests specified from current source |
| P2 | Address test/tooling and production packaging issues, then reduce lint debt in bounded changes | Baseline remains traceable; avoid a repository-wide formatting rewrite mixed with feature fixes |

The defects above are existing review findings, not effects of the brand migration. Reverify source before repair. See [review findings](../context/review-findings.md).

## Frontend migration

1. **P0:** Locate the actual Next.js repository and inspect instructions, routes, components, client configuration and current user changes.
2. **P1:** Replace candidate mappings in [frontend migration](FRONTEND_MIGRATION.md) with verified paths and baseline results.
3. **P1:** Migrate frontend project branding and metadata to SkiResort while preserving routes, domain terms, GraphQL fields and dependency versions.
4. **P2:** Review brand assets and deployment configuration; record decisions requiring actual asset/endpoint information.

## Testing

1. **P0:** Ensure a usable Node/npm runtime exists and reproduce both compiler/build checks when code changes warrant them.
2. **P1:** Run full integration/e2e coverage in an isolated test environment; prevent accidental cron execution or writes to production data. Document the environment and what was exercised.
3. **P1:** Add meaningful regression coverage for each authorized defect repair, especially privilege escalation, password handling and upload path containment.
4. **P2:** Run frontend build/type checks and UI/GraphQL smoke tests after frontend edits; compare failures against its own baseline.
5. **P2:** Verify external deployment scripts reference the new project/output paths when deployment work is requested. No deployment was performed in this session.

## Documentation

1. **P0:** Reconcile database-example documentation after the policy decision; retain accurate distinction between sample names and live databases.
2. **P1:** Keep completed work and future proposals separate; update actual frontend mappings and validation evidence only after execution.
3. **P2:** Refresh affected source manifest entries if source changes; preserve the date/provenance of historical diagnostics.
4. **P2:** Audit active branding with explicit exceptions for migration-history documents, Git internals and third-party dependencies.

Useful follow-up prompts are in [PROMPTS.md](PROMPTS.md). No ski-domain schema, GraphQL or UI terminology migration should begin without a separate specification.
