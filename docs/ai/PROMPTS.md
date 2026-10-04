# Session prompts and reusable follow-ups

Confirmed target: SkiResort. The later documentation request initially said Petoria; the user selected "Use SkiResort (Recommended)". Preserve this correction in future sessions.

The later Resort-first phase is implemented. For current domain/API behavior, read [Resort implementation](RESORT_IMPLEMENTATION.md) and [completed tasks](COMPLETED_TASKS.md). Branding-only prompts below retain their original scope; they do not describe the current Resort contracts or authorize the deferred Member/Equipment/Booking phases.

## Useful original prompts

The following are excerpts, not a complete transcript.

### Naming migration request

> I want you to perform a COMPLETE PROJECT-WIDE BRAND/PROJECT NAMING MIGRATION.
>
> CURRENT PROJECT NAME: Nestar / NESTAR / nestar
>
> NEW PROJECT NAME: SkiResort / SKIRESORT / skiresort
>
> This task is ONLY a project/brand naming migration.

### Domain constraint

> Do NOT yet change business-domain terminology such as: Property, Properties, Agent, Product, Member, Comment, Like, Follow, View, Notice.
>
> Those domain migrations will be handled separately later.

### Repository identity goal

> Completely remove the old Nestar project identity from the repository and replace it with SkiResort while preserving all existing functionality.

### Database clarification

The user selected **Keep examples too**, explicitly preserving the existing database examples in addition to real connections/data. Later workspace inspection found SkiResort names already in `.env.example`; do not assume this observation changes that earlier decision or proves a live database migration.

### Documentation constraint

> Do not change application source code.
>
> Only create documentation files.
>
> Be precise and technical. Use markdown tables where useful.

## Reusable prompts

### Resume with evidence

```text
Read docs/BACKEND_MIGRATION.md, docs/DECISIONS.md, docs/COMPLETED_TASKS.md,
docs/NEXT_STEPS.md and applicable project instructions. Inspect current source
and git status before acting. The confirmed brand is SkiResort, not Petoria.
Distinguish historical validation from fresh checks. Do not infer completed
frontend work, live database migration, deployment or commits. Report any
documentation/current-source discrepancy before changing policy-sensitive files.
```

### Inspect the frontend

```text
Inspect the provided Next.js frontend repository for the SkiResort branding
migration. Identify its router, actual pages/components, GraphQL client/codegen,
brand assets and validation commands. Replace candidate mappings from
docs/FRONTEND_MIGRATION.md with verified paths. Plan only; preserve domain
terminology, routes, GraphQL fields/inputs and persisted data. Do not guess URLs.
```

### Implement frontend branding

```text
Implement the verified Nestar → SkiResort frontend branding plan. Read project
instructions and preserve existing user changes. Update brand strings, filenames,
metadata and package/lockfile identity without upgrading dependencies. Preserve
Property, Properties, Agent, Product, Member, Comment, Like, Follow, View and
Notice; keep GraphQL schema contracts and domain routes unchanged. Inspect
assets before editing them. Run appropriate existing checks and distinguish
baseline failures from regressions. Document exact changed paths and exceptions.
```

### Plan backend repairs separately

```text
Review the current source behind findings F01–F07 in context/review-findings.md.
Prepare a decision-complete repair plan for role escalation, password handling,
token/account status checks, upload containment, sensitive logging and secret
validation. Reverify each finding; do not treat old evidence as fresh proof.
Keep these repairs separate from branding and domain migration. Specify useful
regression tests and compatibility impacts. Do not implement changes yet.
```

### Verify naming and compatibility

```text
Audit active SkiResort project naming, application paths, scripts and output
entrypoints. Allow historical references in docs and context provenance, Git
history/internals and third-party packages. Explicitly inspect database-example
policy against the user's earlier preservation decision. Do not rename live
databases or stored records. Run non-fixing checks; use isolated greeting tests
without connecting to MongoDB or starting cron jobs. Report scope and limits.
```

### Refresh documentation only

```text
Update only the six Markdown documents under docs from current source and session
evidence. Preserve the distinction between completed work, observed workspace
changes and proposed next tasks. Confirm SkiResort as the target. Do not modify
application source, configuration, database values or other documentation files.
Validate local links and report which facts were verified versus carried forward
from historical records. Never include secrets or private data.
```

Refer to [completed tasks](COMPLETED_TASKS.md) for validation limits and [next steps](NEXT_STEPS.md) for priorities. These prompts express task intent; execution remains subject to the active collaboration mode and project instructions.
