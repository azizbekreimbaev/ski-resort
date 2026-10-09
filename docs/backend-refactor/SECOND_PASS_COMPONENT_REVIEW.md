# Second-pass complete component review

This supersedes the first pass's resolver-focused implementation scope. Review date: 2026-10-08. Source locations are relative to the corresponding project root. Every current application source file is listed below; tests and original source hashes remain in SOURCE_INVENTORY.md. Final line links are in CODE_NAVIGATION.md.

## Verified patterns and retained behavior

- Resort/Equipment query helpers use Nestar PropertyService.shapeMatchQuery(match, input): void; public aggregation delegates keep existing validation and facets. Method placement follows the same public CRUD/statistics/query/history/admin flow where applicable.
- Event/FAQ use BoardArticleService's explicit awaited persistence result, local detail search and match/sort list flow. Their target-only admin, image, date and status helpers remain.
- Like/View histories use the reference's local match and explicit typed result; exact change/undo semantics remain SkiResort-specific.
- Application matches the existing service query/async style while retaining its whole transactional workflow.
- Member/Article/Comment/Follow/Auth already use their exact Nestar CRUD/composition patterns. Import/declaration layout is aligned; their method bodies and metadata are unchanged.
- All DTO/schema/enum/module metadata, root/batch configuration and socket handlers are structurally unchanged. Formatting uses the identical checked Prettier configuration.

## Completed checks

Both apps type-check and build. All 548 existing offline tests pass; seven database tests remain skipped. Full GraphQL SDL and 132 DTO transformation/validation cases match the original baseline. Every non-format lint diagnostic matches the second-pass baseline by file, rule, severity and message: 154 errors and 19 warnings remain. All 1,913 formatting diagnostics are eliminated and all 114 application source files pass Prettier. AST comparison confirms 107 source structures remain unchanged (trivia and import ordering normalized); only the seven documented service changes differ. All 84 Nestar reference hashes are unchanged.

Existing auth/privacy risks and missing target-visibility rechecks in Comment.getComments remain recorded in the parity plan. Real configured AppModule/e2e and replica-set transaction checks are not run.

## File-by-file final disposition

| SkiResort source | Inspected Nestar file / nearest pattern | Second-pass disposition |
| --- | --- | --- |
| `apps/skiresort-api/src/app.controller.ts` | `apps/nestar-api/src/app.controller.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/app.module.ts` | `apps/nestar-api/src/app.module.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/app.resolver.ts` | `apps/nestar-api/src/app.resolver.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/app.service.ts` | `apps/nestar-api/src/app.service.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/auth/auth.module.ts` | `apps/nestar-api/src/components/auth/auth.module.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/auth/auth.service.ts` | `apps/nestar-api/src/components/auth/auth.service.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/auth/decorators/authMember.decorator.ts` | `apps/nestar-api/src/components/auth/decorators/authMember.decorator.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/auth/decorators/roles.decorator.ts` | `apps/nestar-api/src/components/auth/decorators/roles.decorator.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/auth/guards/auth.guard.ts` | `apps/nestar-api/src/components/auth/guards/auth.guard.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/auth/guards/roles.guard.ts` | `apps/nestar-api/src/components/auth/guards/roles.guard.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/auth/guards/without.guard.ts` | `apps/nestar-api/src/components/auth/guards/without.guard.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/board-article/board-article.module.ts` | `apps/nestar-api/src/components/board-article/board-article.module.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/board-article/board-article.resolver.ts` | `apps/nestar-api/src/components/board-article/board-article.resolver.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/board-article/board-article.service.ts` | `apps/nestar-api/src/components/board-article/board-article.service.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/comment/comment.module.ts` | `apps/nestar-api/src/components/comment/comment.module.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/comment/comment.resolver.ts` | `apps/nestar-api/src/components/comment/comment.resolver.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/comment/comment.service.ts` | `apps/nestar-api/src/components/comment/comment.service.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/components.module.ts` | `apps/nestar-api/src/components/components.module.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/components/equipment/equipment-size.ts` | `apps/nestar-api/src/components/property/property.service.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/components/equipment/equipment.module.ts` | `apps/nestar-api/src/components/property/property.module.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/components/equipment/equipment.resolver.ts` | `apps/nestar-api/src/components/property/property.resolver.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/components/equipment/equipment.service.ts` | `apps/nestar-api/src/components/property/property.service.ts` | shapeMatchQuery, local sort and method organization; admin checks, invariants/CAS and sync history checks preserved |
| `apps/skiresort-api/src/components/event/event.module.ts` | `apps/nestar-api/src/components/board-article/board-article.module.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/components/event/event.resolver.ts` | `apps/nestar-api/src/components/board-article/board-article.resolver.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/components/event/event.service.ts` | `apps/nestar-api/src/components/board-article/board-article.service.ts` | Named create result, detail search and list match/sort; awaited async delegation and grouped methods; dates/files/CAS/errors preserved |
| `apps/skiresort-api/src/components/faq/faq.module.ts` | `apps/nestar-api/src/components/board-article/board-article.module.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/components/faq/faq.resolver.ts` | `apps/nestar-api/src/components/board-article/board-article.resolver.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/components/faq/faq.service.ts` | `apps/nestar-api/src/components/board-article/board-article.service.ts` | Named create result, detail search and list match/sort; awaited async delegation and grouped methods; status/default/null/errors preserved |
| `apps/skiresort-api/src/components/follow/follow.module.ts` | `apps/nestar-api/src/components/follow/follow.module.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/follow/follow.resolver.ts` | `apps/nestar-api/src/components/follow/follow.resolver.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/follow/follow.service.ts` | `apps/nestar-api/src/components/follow/follow.service.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/instructor-application/instructor-application.module.ts` | `apps/nestar-api/src/components/comment/comment.module.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/components/instructor-application/instructor-application.resolver.ts` | `apps/nestar-api/src/components/comment/comment.resolver.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts` | `apps/nestar-api/src/components/comment/comment.service.ts` | sortKey plus named sort; awaited query/transaction delegation; transaction callbacks/session/role checks preserved |
| `apps/skiresort-api/src/components/like/like.module.ts` | `apps/nestar-api/src/components/like/like.module.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/like/like.service.ts` | `apps/nestar-api/src/components/like/like.service.ts` | Local history match and typed Resorts/Equipments result; group/undo/visibility/count/sort unchanged |
| `apps/skiresort-api/src/components/member/member.module.ts` | `apps/nestar-api/src/components/member/member.module.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/member/member.resolver.ts` | `apps/nestar-api/src/components/member/member.resolver.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/member/member.service.ts` | `apps/nestar-api/src/components/member/member.service.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/resort/resort.module.ts` | `apps/nestar-api/src/components/property/property.module.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/components/resort/resort.resolver.ts` | `apps/nestar-api/src/components/property/property.resolver.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/components/resort/resort.service.ts` | `apps/nestar-api/src/components/property/property.service.ts` | shapeMatchQuery(match, input), local sort and Property-like method sequence; synchronous checks, counters and undo preserved |
| `apps/skiresort-api/src/components/view/view.module.ts` | `apps/nestar-api/src/components/view/view.module.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/components/view/view.service.ts` | `apps/nestar-api/src/components/view/view.service.ts` | Local history match and typed Resorts/Equipments result; dedup/undo/visibility/count/sort unchanged |
| `apps/skiresort-api/src/database/database.module.ts` | `apps/nestar-api/src/database/database.module.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/config.ts` | `apps/nestar-api/src/libs/config.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts` | `apps/nestar-api/src/libs/dto/board-article/board-article.input.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/board-article/board-article.ts` | `apps/nestar-api/src/libs/dto/board-article/board-article.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/board-article/board-article.update.ts` | `apps/nestar-api/src/libs/dto/board-article/board-article.update.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/comment/comment.input.ts` | `apps/nestar-api/src/libs/dto/comment/comment.input.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/comment/comment.ts` | `apps/nestar-api/src/libs/dto/comment/comment.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/comment/comment.update.ts` | `apps/nestar-api/src/libs/dto/comment/comment.update.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts` | `apps/nestar-api/src/libs/dto/property/property.input.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/equipment/equipment.ts` | `apps/nestar-api/src/libs/dto/property/property.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts` | `apps/nestar-api/src/libs/dto/property/property.update.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/event/event.input.ts` | `apps/nestar-api/src/libs/dto/board-article/board-article.input.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/event/event.ts` | `apps/nestar-api/src/libs/dto/board-article/board-article.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/event/event.update.ts` | `apps/nestar-api/src/libs/dto/board-article/board-article.update.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/faq/faq.input.ts` | `apps/nestar-api/src/libs/dto/board-article/board-article.input.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/faq/faq.ts` | `apps/nestar-api/src/libs/dto/board-article/board-article.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/faq/faq.update.ts` | `apps/nestar-api/src/libs/dto/board-article/board-article.update.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/follow/follow.input.ts` | `apps/nestar-api/src/libs/dto/follow/follow.input.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/follow/follow.ts` | `apps/nestar-api/src/libs/dto/follow/follow.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts` | `apps/nestar-api/src/libs/dto/comment/comment.input.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts` | `apps/nestar-api/src/libs/dto/comment/comment.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/like/like.input.ts` | `apps/nestar-api/src/libs/dto/like/like.input.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/like/like.ts` | `apps/nestar-api/src/libs/dto/like/like.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts` | `apps/nestar-api/src/libs/dto/member/member.update.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/member/member.input.ts` | `apps/nestar-api/src/libs/dto/member/member.input.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/member/member.ts` | `apps/nestar-api/src/libs/dto/member/member.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/member/member.update.ts` | `apps/nestar-api/src/libs/dto/member/member.update.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/resort/resort.input.ts` | `apps/nestar-api/src/libs/dto/property/property.input.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/resort/resort.ts` | `apps/nestar-api/src/libs/dto/property/property.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/resort/resort.update.ts` | `apps/nestar-api/src/libs/dto/property/property.update.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/dto/view/view.input.ts` | `apps/nestar-api/src/libs/dto/view/view.input.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/dto/view/view.ts` | `apps/nestar-api/src/libs/dto/view/view.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/enums/board-article.enum.ts` | `apps/nestar-api/src/libs/enums/board-article.enum.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/enums/comment.enum.ts` | `apps/nestar-api/src/libs/enums/comment.enum.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/enums/common.enum.ts` | `apps/nestar-api/src/libs/enums/common.enum.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/enums/equipment.enum.ts` | `apps/nestar-api/src/libs/enums/property.enum.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/enums/event.enum.ts` | `apps/nestar-api/src/libs/enums/board-article.enum.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/enums/faq.enum.ts` | `apps/nestar-api/src/libs/enums/board-article.enum.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/enums/instructor-application.enum.ts` | `apps/nestar-api/src/libs/enums/comment.enum.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/enums/like.enum.ts` | `apps/nestar-api/src/libs/enums/like.enum.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/enums/member.enum.ts` | `apps/nestar-api/src/libs/enums/member.enum.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/enums/notice.enum.ts` | `apps/nestar-api/src/libs/enums/notice.enum.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/enums/notification.enum.ts` | `apps/nestar-api/src/libs/enums/notification.enum.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/enums/resort.enum.ts` | `apps/nestar-api/src/libs/enums/property.enum.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/enums/view.enum.ts` | `apps/nestar-api/src/libs/enums/view.enum.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/image-upload.ts` | `apps/nestar-api/src/components/member/member.resolver.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/libs/interceptor/Logging.interceptor.ts` | `apps/nestar-api/src/libs/interceptor/Logging.interceptor.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/libs/types/common.ts` | `apps/nestar-api/src/libs/types/common.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/main.ts` | `apps/nestar-api/src/main.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/schemas/BoardArticle.model.ts` | `apps/nestar-api/src/schemas/BoardArticle.model.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/schemas/Comment.model.ts` | `apps/nestar-api/src/schemas/Comment.model.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/schemas/Equipment.model.ts` | `apps/nestar-api/src/schemas/Property.model.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/schemas/Event.model.ts` | `apps/nestar-api/src/schemas/BoardArticle.model.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/schemas/Faq.model.ts` | `apps/nestar-api/src/schemas/BoardArticle.model.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/schemas/Follow.model.ts` | `apps/nestar-api/src/schemas/Follow.model.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/schemas/InstructorApplication.model.ts` | `apps/nestar-api/src/schemas/Comment.model.ts` | Already consistent; retained after complete review |
| `apps/skiresort-api/src/schemas/Like.model.ts` | `apps/nestar-api/src/schemas/Like.model.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/schemas/Member.model.ts` | `apps/nestar-api/src/schemas/Member.model.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/schemas/Notice.model.ts` | `apps/nestar-api/src/schemas/Notice.model.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/schemas/Notification.model.ts` | `apps/nestar-api/src/schemas/Notification.model.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/schemas/Resort.model.ts` | `apps/nestar-api/src/schemas/Property.model.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/schemas/View.model.ts` | `apps/nestar-api/src/schemas/View.model.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/socket/socket.gateway.ts` | `apps/nestar-api/src/socket/socket.gateway.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-api/src/socket/socket.module.ts` | `apps/nestar-api/src/socket/socket.module.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-batch/src/batch.controller.ts` | `apps/nestar-batch/src/batch.controller.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-batch/src/batch.module.ts` | `apps/nestar-batch/src/batch.module.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-batch/src/batch.service.ts` | `apps/nestar-batch/src/batch.service.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-batch/src/database/database.module.ts` | `apps/nestar-batch/src/database/database.module.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-batch/src/lib/config.ts` | `apps/nestar-batch/src/lib/config.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
| `apps/skiresort-batch/src/main.ts` | `apps/nestar-batch/src/main.ts` | Import grouping and configured formatting; source structure/metadata/business statements unchanged |
