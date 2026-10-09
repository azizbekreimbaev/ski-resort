# Root, shared infrastructure, socket and batch audit

Current working-tree audit on 2026-10-08. Nestar is read only. This audit precedes source changes in this turn; earlier refactoring already present in SkiResort is the baseline.

## Read inventory

Every file named here was read fully. Paths beginning with apps/nestar are relative to C:/Users/Aziz/Desktop/nestar; other paths are relative to SkiResort. Auth/member, social and catalog/content DTOs/schemas/tests are inventoried in the three companion audit documents.

| Read group | Nestar | SkiResort | Disposition |
| --- | --- | --- | --- |
| Instructions/configuration | AGENTS.md, package.json, nest-cli.json, tsconfig.json, tsconfig.build.json, eslint.config.mjs, .prettierrc, apps/nestar-api/tsconfig.app.json, apps/nestar-batch/tsconfig.app.json | Corresponding root files and apps/skiresort-api/tsconfig.app.json, apps/skiresort-batch/tsconfig.app.json | Same single npm package, Nest workspace, relative imports, empty aliases; no changes |
| API root | apps/nestar-api/src/main.ts, app.module.ts, app.controller.ts, app.service.ts, app.resolver.ts | apps/skiresort-api/src/main.ts, app.module.ts, app.controller.ts, app.service.ts, app.resolver.ts | Already matches; preserve greetings and configuration |
| Assembly/database | apps/nestar-api/src/components/components.module.ts, database/database.module.ts | apps/skiresort-api/src/components/components.module.ts, database/database.module.ts | Same module/model registration pattern; preserve target feature list |
| Shared helpers | apps/nestar-api/src/libs/config.ts, libs/types/common.ts, libs/enums/common.enum.ts, libs/interceptor/Logging.interceptor.ts | Corresponding API files, plus libs/config.spec.ts and libs/image-upload.ts | Preserve ID/group/projection/upload safeguards and existing errors |
| Schema-only features | apps/nestar-api/src/schemas/Notice.model.ts, Notification.model.ts, libs/enums/notice.enum.ts, notification.enum.ts | Corresponding API files | Already matches; no active API; preserve unused persisted definitions |
| Socket | apps/nestar-api/src/socket/socket.module.ts, socket.gateway.ts | Corresponding API files and socket.gateway.spec.ts | Same gateway/module and frame behavior; no changes |
| Batch | apps/nestar-batch/src/main.ts, batch.module.ts, batch.controller.ts, batch.service.ts, database/database.module.ts, lib/config.ts | Corresponding SkiResort batch files plus batch.service.spec.ts | Already uses Nestar structure; preserve instructor-only target jobs/formula |
| E2E | apps/nestar-api/test/app.e2e-spec.ts, jest-e2e.json; apps/nestar-batch/test/app.e2e-spec.ts, jest-e2e.json | Corresponding SkiResort tests/configurations | Fully read; not executed because they import real database/application modules |

There is no repository-level shared libs directory or independent backend package.json in either discovered workspace. No nested AGENTS.md was found. No dependency installation, reference execution, live database access or migration was performed.

## Exact root wiring and request flow

Nestar apps/nestar-api/src/main.ts:bootstrap is the reference for SkiResort main.ts:bootstrap. Both create AppModule, install ValidationPipe and LoggingInterceptor, enable CORS, register upload middleware (15,000,000-byte limit, ten files), expose /uploads, install native WsAdapter, and listen on PORT_API or 3000. Do not introduce new middleware/guards/filters.

AppModule imports ConfigModule.forRoot, code-first Apollo GraphQLModule, ComponentsModule, DatabaseModule and SocketModule. It registers AppController and AppService/AppResolver. The existing formatError extracts the same message/code branches. No @ResolveField, mapped DTO utilities, raw-schema replacement or new architecture is warranted.

GET / -> AppController.getHello -> AppService.getHello -> "Welcome to SKIRESORT API server!". @Controller/@Get register the route; constructor injection supplies AppService. GraphQL sayHello -> AppResolver.sayHello -> "GraphQL API Server": this resolver injects no AppService. These greetings indicate application responsiveness, not database health.

DatabaseModule uses MongooseModule.forRootAsync/useFactory to select the existing environment URI and exports MongooseModule. Its @InjectConnection constructor reports readyState. Each feature module's forFeature registration and service's matching @InjectModel name provide Model<T>. Raw new Schema definitions remain the persistence authority. Never bootstrap this module against an unknown environment merely to verify compilation.

## Shared helpers and consumers

libs/types/common.ts exports T (the existing dictionary) and StatisticModifier. libs/enums/common.enum.ts retains every Message string and the ASC=1/DESC=-1 GraphQL Direction enum.

libs/config.ts keeps the verified Nestar helper grouping and adapted instructor sort names. validateMongoObjectId adds a target boundary requiring an existing ObjectId or exactly 24 hexadecimal characters; it deliberately throws synchronously. lookupAuthMemberLiked additionally matches likeGroup. lookupFavorite/lookupVisit exclude credential fields from owner joins. These are behavior/security differences to preserve.

libs/image-upload.ts has no reference file equivalent. Its existing saveImageUpload implementation is reused by MemberResolver and EventService: validate filename/MIME/relative target, generate a filename, create the directory, exclusively open wx, await the stream pipeline, and remove only its owned partial file on failure. assertGenericUploadTarget reserves events for the administrative operation. Preserve current target errors, returned relative URLs and stream cleanup.

LoggingInterceptor already follows Nestar's Observable/tap timing/logging style. It logs GraphQL request/response fragments without redaction; this is an existing security issue, not evidence that redaction is present. No security behavior was weakened for stylistic parity.

## Socket and schema-only features

SocketModule imports AuthModule and provides SocketGateway. The gateway verifies an optional URL token through AuthService; failure becomes a guest. handleConnection stores identity, increments count, broadcasts info/joined and sends history to the new client. handleMessage broadcasts to all open clients, including sender, and retains the last five frames. handleDisconnect removes identity and broadcasts info/left to others. @WebSocketGateway, @WebSocketServer and @SubscribeMessage register this existing transport behavior; there is no database model/CRUD path.

Notice/Notification schemas and enums have no active module/resolver. NotificationGroup.PROPERTY, propertyId and its Property ref remain compatibility definitions. Do not rename/remove them or invent domain APIs.

## Batch compatibility

BatchModule imports configuration, DatabaseModule and ScheduleModule, registers MemberSchema directly from the API, and provides BatchService/BatchController. BatchController's @Cron handlers await their injected service and retain existing catch/log behavior.

SkiResort batchRollback resets only ACTIVE INSTRUCTOR member ranks. batchTopInstructors selects active instructors with rank zero, computes memberArticles*3 + memberLikes*2 + memberViews, and awaits Promise.all of updates. It has no Resort rank job and does not use memberProperties in that formula. Nestar's property/agent jobs are reference business behavior and are not copied. API DTO/schema/enum changes must continue to type-check this direct consumer.

## Baseline verification

Both app no-emit checks passed using the already-installed local Node 20 executable. The normal sandbox produced EPERM resolving C:/Users/Aziz; automatically reviewed elevated local checks succeeded. No installation was performed.

The complete existing Jest baseline ran with SKIRESORT_TEST_MONGO_URI empty: 31 suites / 548 tests passed; one suite / seven disposable-replica-set tests skipped. The socket suite includes an isolated localhost WsAdapter test. All 114 non-test application source files passed Prettier --check. Full non-fixing lint is recorded separately in the parity plan; lint success must not be inferred from compilation.

Real AppModule/BatchModule startup and configured e2e remain not run: both can select a real database, and batch startup schedules writes.

