# SkiResort context index

Snapshot 2026-10-03, source commit `87305630809152f8f256ab1226ba89bf47e84553`. These files describe the inspected backend. Current source and the user's current request take precedence; recommendations are not already implemented policy.

Read [review findings](review-findings.md) first for critical auth and upload defects. Use [architecture](architecture.md) to locate work, [API inventory](api-inventory.md) for 40 resolver contracts, [DTO reference](dto-reference.md) for every field/enum, [authentication](auth.md), [data model](data-model.md), and [business rules](business-rules.md) for behavior. [Code standards](code-standards.md) separates configured rules from proposals. [Dependencies](dependencies.md), [operations](operations.md), and [verification](verification.md) cover tooling and checks. [File review](file-review.md) has all 95 file entries; [source manifest](source-manifest.json) records hashes and line counts.

All 82 first-party TypeScript files were read. Vendor/generated code, uploads, Git internals and secret environment values are excluded. The lockfile was parsed structurally. This review creates context and skills; it does not fix the application defects.

## Branding migration

Project names and paths were updated to SkiResort on 2026-10-04. Review diagnostics in evidence remain historical results from 2026-10-03; embedded branding and paths have been updated, not rerun. The source manifest records current file hashes after the naming migration while retaining the original review commit as provenance. Database example names are intentionally retained.
