# Source contract inventory

Pre-refactor evidence, generated from the inspected TypeScript source. Paths are relative to the named repository. Line numbers refer to this audit snapshot. Declarations below preserve decorator arguments, scalar types, defaults and validation; service entries list callable signatures. Schema definitions and module metadata are recorded literally because they are persisted and dependency contracts. See the parity plan for business flow and retained exceptions.

## nestar

### `apps/nestar-api/src/app.controller.ts`

```typescript
L4 @Controller() class AppController

L6 constructor(private readonly appService: AppService)

L8 @Get()
  getHello(): string
```

### `apps/nestar-api/src/app.module.ts`

```typescript
L13 @Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      uploads: true,
      autoSchemaFile: true,
      formatError: (errors: T) => {
        const graphQLFormattedError = {
          extensions: { code: errors?.extensions?.code },  // BOSHQA YAXSHIROQ VARIANT TOPILMADI
          message: errors?.extensions?.exception?.response?.message || errors?.extensions?.response?.message || errors?.message,
        };
        console.log("GRAPHQL GLOBAL ERROR", graphQLFormattedError)
        return graphQLFormattedError
      }
    }),
    ComponentsModule, DatabaseModule, SocketModule],

  controllers: [AppController],
  providers: [AppService, AppResolver],
}) class AppModule
```

### `apps/nestar-api/src/app.resolver.ts`

```typescript
L4 @Resolver() class AppResolver

L6 @Query(() => String)
    public sayHello(): string
```

### `apps/nestar-api/src/app.service.ts`

```typescript
L3 @Injectable() class AppService

L5 getHello(): string
```

### `apps/nestar-api/src/components/auth/auth.module.ts`

```typescript
L6 @Module({
    imports: [
        HttpModule,
        JwtModule.register({
            secret: `${process.env.SECRET_TOKEN}`,
            signOptions: { expiresIn: "30d" }
        })
    ],
    providers: [AuthService],
    exports: [AuthService],
}) class AuthModule
```

### `apps/nestar-api/src/components/auth/auth.service.ts`

```typescript
L8 @Injectable() class AuthService

L11 constructor(private jwtService: JwtService)

L13 public async hashPassword(memberPassword: string): Promise<string>

L20 public async comparePasswords(password: string, hashedPassword: string | undefined): Promise<string>

L24 public async createToken(member: Member): Promise<string>

L36 public async verifyAuth(token: string): Promise<Member>
```

### `apps/nestar-api/src/components/auth/guards/auth.guard.ts`

```typescript
L5 @Injectable() class AuthGuard implements CanActivate

L7 constructor(private authService: AuthService)

L9 async canActivate(context: ExecutionContext | any): Promise<boolean>
```

### `apps/nestar-api/src/components/auth/guards/roles.guard.ts`

```typescript
L6 @Injectable() class RolesGuard implements CanActivate

L8 constructor(
		private reflector: Reflector,
		private authService: AuthService,
	)

L13 async canActivate(context: ExecutionContext | any): Promise<boolean>
```

### `apps/nestar-api/src/components/auth/guards/without.guard.ts`

```typescript
L4 @Injectable() class WithoutGuard implements CanActivate

L6 constructor(private authService: AuthService)

L8 async canActivate(context: ExecutionContext | any): Promise<boolean>
```

### `apps/nestar-api/src/components/board-article/board-article.module.ts`

```typescript
L11 @Module({
  imports: [MongooseModule.forFeature([{
    name: "BoardArticle",
    schema: BoardArticleSchema
  }]),

    AuthModule,
    ViewModule,
    MemberModule,
    LikeModule
  ],

  providers: [BoardArticleResolver, BoardArticleService],
  exports: [BoardArticleService]
}) class BoardArticleModule
```

### `apps/nestar-api/src/components/board-article/board-article.resolver.ts`

```typescript
L16 @Resolver() class BoardArticleResolver

L18 constructor(private readonly boardArticleService: BoardArticleService)

L20 @UseGuards(AuthGuard)
    @Mutation(() => BoardArticle)
    public async createBoardArticle(
        @Args('input') input: BoardArticleInput,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticle>

L31 @UseGuards(WithoutGuard)
    @Query(() => BoardArticle)
    public async getBoardArticle(
        @Args('articleId') input: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticle>

L42 @UseGuards(AuthGuard)
    @Mutation(() => BoardArticle)
    public async updateBoardArticle(
        @Args('input') input: BoardArticleUpdate,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticle>

L54 @UseGuards(WithoutGuard)
    @Query((returns) => BoardArticles)
    public async getBoardArticles(
        @Args('input') input: BoardArticlesInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticles>

L64 @UseGuards(AuthGuard)
    @Mutation(() => BoardArticle)
    public async likeTargetBoardArticle(@Args("articleId") input: string,
        @AuthMember("_id") memberId: ObjectId
    ): Promise<BoardArticle>

L77 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Query((returns) => BoardArticles)
    public async getAllBoardArticlesByAdmin(
        @Args('input') input: AllBoardArticlesInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticles>

L89 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(() => BoardArticle)
    public async updateBoardArticleByAdmin(
        @Args('input') input: BoardArticleUpdate,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticle>

L102 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation((returns) => BoardArticle)
    public async removeBoardArticleByAdmin(
        @Args('articleId') input: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticle>
```

### `apps/nestar-api/src/components/board-article/board-article.service.ts`

```typescript
L18 @Injectable() class BoardArticleService

L20 constructor(@InjectModel("BoardArticle") private readonly boardArticleModel: Model<BoardArticle>,
        private memberService: MemberService,
        private viewService: ViewService,
        private likeService: LikeService,
    )

L26 public async createBoardArticle(
        memberId: ObjectId,
        input: BoardArticleInput
    ): Promise<BoardArticle>

L50 public async getBoardArticle(memberId: ObjectId, articleId: ObjectId): Promise<BoardArticle>

L91 public async boardArticleStatsEditor(input: StatisticModifier): Promise<BoardArticle>

L108 public async updateBoardArticle(memberId: ObjectId, input: BoardArticleUpdate): Promise<BoardArticle>

L140 public async getBoardArticles(memberId: ObjectId, input: BoardArticlesInquiry): Promise<BoardArticles>

L189 public async likeTargetBoardArticle(memberId: ObjectId, likeRefId: ObjectId): Promise<BoardArticle>

L217 public async getAllBoardArticlesByAdmin(input: AllBoardArticlesInquiry): Promise<BoardArticles>

L252 public async updateBoardArticleByAdmin(input: BoardArticleUpdate): Promise<BoardArticle>

L279 public async removeBoardArticleByAdmin(articleId: ObjectId): Promise<BoardArticle>
```

### `apps/nestar-api/src/components/comment/comment.module.ts`

```typescript
L13 @Module({
  imports: [MongooseModule.forFeature([
    {
      name: "Comment",
      schema: CommentSchema
    }]),
    AuthModule,
    ViewModule,
    MemberModule,
    PropertyModule,
    BoardArticleModule
  ],

  providers: [CommentResolver, CommentService]
}) class CommentModule
```

### `apps/nestar-api/src/components/comment/comment.resolver.ts`

```typescript
L17 @Resolver() class CommentResolver

L19 constructor(private readonly commentService: CommentService)

L21 @UseGuards(AuthGuard)
    @Mutation((returns) => Comment)
    public async createComment(
        @Args('input') input: CommentInput,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Comment>

L31 @UseGuards(AuthGuard)
    @Mutation((returns) => Comment)
    public async updateComment(
        @Args('input') input: CommentUpdate,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Comment>

L44 @UseGuards(WithoutGuard)
    @Query((returns) => Comments)
    public async getComments(
        @Args('input') input: CommentsInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Comments>

L59 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation((returns) => Comment)
    public async removeCommentByAdmin(@Args('commentId') input: string): Promise<Comment>
```

### `apps/nestar-api/src/components/comment/comment.service.ts`

```typescript
L16 @Injectable() class CommentService

L18 constructor(
        @InjectModel('Comment') private readonly commentModel: Model<Comment>,
        private readonly memberService: MemberService,
        private readonly propertyService: PropertyService,
        private readonly boardArticleService: BoardArticleService,
    )

L25 public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment>

L65 public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment>

L82 public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments>

L108 public async removeCommentByAdmin(input: ObjectId): Promise<Comment>
```

### `apps/nestar-api/src/components/components.module.ts`

```typescript
L11 @Module({
  imports: [
    MemberModule,
    PropertyModule,
    AuthModule,
    CommentModule,
    LikeModule,
    ViewModule,
    FollowModule,
    BoardArticleModule,
  ],
}) class ComponentsModule
```

### `apps/nestar-api/src/components/follow/follow.module.ts`

```typescript
L9 @Module({
    imports: [
        MongooseModule.forFeature([{ name: "Follow", schema: FollowSchema }]),
        AuthModule,
        MemberModule
    ],
    providers: [FollowResolver, FollowService],
    exports: [FollowService]
}) class FollowModule
```

### `apps/nestar-api/src/components/follow/follow.resolver.ts`

```typescript
L12 @Resolver() class FollowResolver

L14 constructor(private readonly followService: FollowService)

L16 @UseGuards(AuthGuard)
    @Mutation((returns) => Follower)
    public async subscribe(
        @Args('input') input: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Follower>

L27 @UseGuards(AuthGuard)
    @Mutation((returns) => Follower)
    public async unsubscribe(
        @Args('input') input: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Follower>

L39 @UseGuards(WithoutGuard)
    @Query((returns) => Followings)
    public async getMemberFollowings(
        @Args('input') input: FollowInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Followings>

L51 @UseGuards(WithoutGuard)
    @Query((returns) => Followers)
    public async getMemberFollowers(
        @Args('input') input: FollowInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Followers>
```

### `apps/nestar-api/src/components/follow/follow.service.ts`

```typescript
L12 @Injectable() class FollowService

L14 constructor(@InjectModel("Follow") private readonly followModel: Model<Follower | Following>,
        private memberService: MemberService,

    )

L20 public async subscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower>

L36 private async registerSubscription(followerId: ObjectId, followingId: ObjectId): Promise<Follower>

L49 public async unsubscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower>

L67 public async getMemberFollowings(memberId: ObjectId, input: FollowInquiry): Promise<Followings>

L99 public async getMemberFollowers(memberId: ObjectId, input: FollowInquiry): Promise<Followers>
```

### `apps/nestar-api/src/components/like/like.module.ts`

```typescript
L6 @Module({
    imports: [MongooseModule.forFeature([
        {
            name: "Like",
            schema: LikeSchema
        }
    ])],

    providers: [LikeService],
    exports: [LikeService]
}) class LikeModule
```

### `apps/nestar-api/src/components/like/like.service.ts`

```typescript
L14 @Injectable() class LikeService

L16 constructor(@InjectModel("Like") private readonly likeModel: Model<Like>,
    )

L19 public async toggleLike(input: LikeInput): Promise<number>

L42 public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]>

L52 public async getFavoriteProperties(memberId: ObjectId, inqut: OrdinaryInquiry): Promise<Properties>
```

### `apps/nestar-api/src/components/member/member.module.ts`

```typescript
L11 @Module({
    imports: [
        MongooseModule.forFeature([{ name: "Member", schema: MemberSchema }]),
        MongooseModule.forFeature([{ name: "Follow", schema: FollowSchema }]),
        AuthModule,
        ViewModule,
        LikeModule
    ],
    providers: [MemberResolver, MemberService],
    exports: [MemberService]
}) class MemberModule
```

### `apps/nestar-api/src/components/member/member.resolver.ts`

```typescript
L20 @Resolver() class MemberResolver

L22 constructor(private readonly memberService: MemberService)

L24 @Mutation(() => Member)
    public async signup(@Args("input") input: MemberInput): Promise<Member>

L31 @Mutation(() => Member)
    public async login(@Args("input") input: LoginInput): Promise<Member>

L37 @UseGuards(AuthGuard)
    @Query(() => String)
    public async chechAuth(@AuthMember("memberNick") memberNick: string): Promise<String>

L44 @Roles(MemberType.AGENT, MemberType.USER)
    @UseGuards(RolesGuard)
    @UseGuards(AuthGuard)
    @Query(() => String)
    public async chechAuthRoles(@AuthMember() authMember: Member): Promise<String>

L55 @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async updateMember(
        @Args("input") input: MemberUpdate,
        @AuthMember("_id") memberId: ObjectId): Promise<Member>

L67 @UseGuards(WithoutGuard)
    @Query(() => Member)
    public async getMember(@Args("memberId") input: string, @AuthMember("_id") memberId: ObjectId): Promise<Member>

L77 @UseGuards(WithoutGuard)
    @Query(() => Members)
    public async getAgents(@Args("input") input: AgentsInquiry, @AuthMember("_id") memberId: ObjectId): Promise<Members>

L85 @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async likeTargetMember(@Args("memberId") input: string,
        @AuthMember("_id") memberId: ObjectId
    ): Promise<Member>

L101 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Query(() => Members)
    public async getAllMembersByAdmin(@Args("input") input: MembersInquiry): Promise<Members>

L110 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(() => Member)
    public async updateMemberByAdmin(@Args("input") input: MemberUpdate): Promise<Member>

L122 @UseGuards(AuthGuard)
    @Mutation((returns) => String)
    public async imageUploader(
        @Args({ name: 'file', type: () => GraphQLUpload })
        { createReadStream, filename, mimetype }: FileUpload,
        @Args('target') target: String,
    ): Promise<string>

L151 @UseGuards(AuthGuard)
    @Mutation((returns) => [String])
    public async imagesUploader(
        @Args('files', { type: () => [GraphQLUpload] })
        files: Promise<FileUpload>[],
        @Args('target') target: String,
    ): Promise<string[]>
```

### `apps/nestar-api/src/components/member/member.service.ts`

```typescript
L20 @Injectable() class MemberService

L23 constructor(
        @InjectModel("Member") private readonly memberModel: Model<Member>,
        @InjectModel("Follow") private readonly followModel: Model<Follower | Following>,
        private authService: AuthService,
        private viewService: ViewService,
        private likeService: LikeService,

    )

L32 public async signup(input: MemberInput): Promise<Member>

L51 public async login(input: LoginInput): Promise<Member>

L86 public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member>

L100 public async getMember(memberId: ObjectId | null, targetId: ObjectId): Promise<Member>

L144 private async checkSubscription(followerId: ObjectId, followingId: ObjectId): Promise<MeFollowed[]>

L153 public async getAgents(memberId: ObjectId, input: AgentsInquiry): Promise<Members>

L184 public async likeTargetMember(memberId: ObjectId, likeRefId: ObjectId): Promise<Member>

L213 public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members>

L243 public async updateMemberByAdmin(input: MemberUpdate): Promise<Member>

L257 public async memberStatsEditor(input: StatisticModifier): Promise<Member>
```

### `apps/nestar-api/src/components/property/property.module.ts`

```typescript
L11 @Module({
  imports: [MongooseModule.forFeature([
    {
      name: "Property",
      schema: PropertySchema
    }]),
    AuthModule,
    ViewModule,
    MemberModule,
    LikeModule
  ],
  providers: [PropertyResolver, PropertyService],
  exports: [PropertyService]
}) class PropertyModule
```

### `apps/nestar-api/src/components/property/property.resolver.ts`

```typescript
L16 @Resolver() class PropertyResolver

L18 constructor(private readonly propertyService: PropertyService)

L20 @Roles(MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Mutation(() => Property)
    public async createProperty(
        @Args("input") input: PropertyInput,
        @AuthMember("_id") memberId: ObjectId): Promise<Property>

L32 @UseGuards(WithoutGuard)
    @Query(() => Property)
    public async getProperty(
        @Args('propertyId') input: string,
        @AuthMember("_id") memberId: ObjectId
    ): Promise<Property>

L44 @Roles(MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Mutation(() => Property)
    public async updateProperty(
        @Args("input") input: PropertyUpdate,
        @AuthMember("_id") memberId: ObjectId
    ): Promise<Property>

L60 @UseGuards(WithoutGuard)
    @Query((returns) => Properties)
    public async getProperties(
        @Args('input') input: PropertiesInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Properties>

L72 @UseGuards(AuthGuard)
    @Query((returns) => Properties)
    public async getFavorites(
        @Args('input') input: OrdinaryInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Properties>

L85 @UseGuards(AuthGuard)
    @Query((returns) => Properties)
    public async getVisited(
        @Args('input') input: OrdinaryInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Properties>

L100 @Roles(MemberType.AGENT)
    @UseGuards(RolesGuard)
    @Query((returns) => Properties)
    public async getAgentProperties(
        @Args('input') input: AgentPropertiesInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Properties>

L112 @UseGuards(AuthGuard)
    @Mutation(() => Property)
    public async likeTargetProperty(@Args("propertyId") input: string,
        @AuthMember("_id") memberId: ObjectId
    ): Promise<Property>

L126 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Query((returns) => Properties)
    public async getAllPropertiesByAdmin(
        @Args('input') input: AllPropertiesInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Properties>

L138 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(() => Property)
    public async updatePropertyByAdmin(@Args("input") input: PropertyUpdate):
        Promise<Property>

L148 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(() => Property)
    public async removePropertyByAdmin(@Args("input") input: string): Promise<Property>
```

### `apps/nestar-api/src/components/property/property.service.ts`

```typescript
L20 @Injectable() class PropertyService

L22 constructor(@InjectModel("Property")
    private readonly propertyModel: Model<Property>,
        private memberService: MemberService,
        private viewService: ViewService,
        private likeService: LikeService
    )

L29 public async createProperty(input: PropertyInput): Promise<Property>

L53 public async getProperty(memberId: ObjectId, propertyId: ObjectId): Promise<Property>

L77 public async propertyStatsEditor(input: StatisticModifier): Promise<Property>

L94 public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property>

L129 public async getProperties(memberId: ObjectId, input: PropertiesInquiry): Promise<Properties>

L164 private shapeMatchQuery(match: T, input: PropertiesInquiry): void

L196 public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties>

L200 public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties>

L205 public async getAgentProperties(memberId: ObjectId, input: AgentPropertiesInquiry): Promise<Properties>

L240 public async likeTargetProperty(memberId: ObjectId, likeRefId: ObjectId): Promise<Property>

L265 public async getAllPropertiesByAdmin(input: AllPropertiesInquiry): Promise<Properties>

L297 public async updatePropertyByAdmin(input: PropertyUpdate): Promise<Property>

L327 public async removePropertyByAdmin(propertyId: ObjectId): Promise<Property>
```

### `apps/nestar-api/src/components/view/view.module.ts`

```typescript
L6 @Module({
  imports: [MongooseModule.forFeature([{ name: "View", schema: ViewSchema }])],
  providers: [ViewService],
  exports: [ViewService]
}) class ViewModule
```

### `apps/nestar-api/src/components/view/view.service.ts`

```typescript
L14 @Injectable() class ViewService

L16 constructor(@InjectModel("View") private readonly viewModel: Model<View>)

L19 public async recordView(input: ViewInput): Promise<View | null>

L32 private async checkViewExistance(input: ViewInput): Promise<View | null>

L43 public async getVisitedProperties(memberId: ObjectId, inqut: OrdinaryInquiry): Promise<Properties>
```

### `apps/nestar-api/src/database/database.module.ts`

```typescript
L6 @Module({
    imports: [MongooseModule.forRootAsync({
        useFactory: () => ({
            uri: process.env.NODE_ENV === "production" ? process.env.MONGO_PROD : process.env.MONGO_DEV
        }),

    })],
    exports: [MongooseModule],
}) class DatabaseModule

L16 constructor(@InjectConnection() private readonly connection: Connection)
```

### `apps/nestar-api/src/libs/config.ts`

```typescript
L95 interface LookupAuthMemberFollowed {
    followerId: T,
    followingId: string
}
```

### `apps/nestar-api/src/libs/dto/board-article/board-article.input.ts`

```typescript
L8 @InputType() class BoardArticleInput

L10 @IsNotEmpty()
	@Field(() => BoardArticleCategory)
	articleCategory!: BoardArticleCategory;

L14 @IsNotEmpty()
	@Length(3, 50)
	@Field(() => String)
	articleTitle!: string;

L19 @IsNotEmpty()
	@Length(3, 250)
	@Field(() => String)
	articleContent!: string;

L24 @IsOptional()
	@Field(() => String, { nullable: true })
	articleImage?: string;

L28 memberId?: ObjectId;

L31 @InputType() class BAISearch

L33 @IsOptional()
	@Field(() => BoardArticleCategory, { nullable: true })
	articleCategory?: BoardArticleCategory;

L37 @IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;

L41 @IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;

L46 @InputType() class BoardArticlesInquiry

L48 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

L53 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;

L58 @IsOptional()
	@IsIn(availableBoardArticleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

L63 @IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

L67 @IsNotEmpty()
	@Field(() => BAISearch)
	search!: BAISearch;

L72 @InputType() class ABAISearch

L74 @IsOptional()
	@Field(() => BoardArticleStatus, { nullable: true })
	articleStatus?: BoardArticleStatus;

L78 @IsOptional()
	@Field(() => BoardArticleCategory, { nullable: true })
	articleCategory?: BoardArticleCategory;

L83 @InputType() class AllBoardArticlesInquiry

L85 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

L90 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;

L95 @IsOptional()
	@IsIn(availableBoardArticleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

L100 @IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

L104 @IsNotEmpty()
	@Field(() => ABAISearch)
	search!: ABAISearch;
```

### `apps/nestar-api/src/libs/dto/board-article/board-article.ts`

```typescript
L7 @ObjectType() class BoardArticle

L9 @Field(() => String)
	_id!: ObjectId;

L12 @Field(() => BoardArticleCategory)
	articleCategory!: BoardArticleCategory;

L15 @Field(() => BoardArticleStatus)
	articleStatus!: BoardArticleStatus;

L18 @Field(() => String)
	articleTitle!: string;

L21 @Field(() => String)
	articleContent!: string;

L24 @Field(() => String, { nullable: true })
	articleImage?: string;

L27 @Field(() => Int)
	articleViews!: number;

L30 @Field(() => Int)
	articleLikes!: number;

L33 @Field(() => Int)
	articleComments!: number;

L36 @Field(() => String)
	memberId!: ObjectId;

L39 @Field(() => Date)
	createdAt!: Date;

L42 @Field(() => Date)
	updatedAt!: Date;

L47 @Field(() => Member, { nullable: true })
	memberData?: Member;

L51 @Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[]

L56 @ObjectType() class BoardArticles

L58 @Field(() => [BoardArticle])
	list!: BoardArticle[];

L61 @Field(() => [TotalCounter], { nullable: true })
	metaCounter!: TotalCounter[];
```

### `apps/nestar-api/src/libs/dto/board-article/board-article.update.ts`

```typescript
L6 @InputType() class BoardArticleUpdate

L8 @IsNotEmpty()
	@Field(() => String)
	_id!: ObjectId;

L12 @IsOptional()
	@Field(() => BoardArticleStatus, { nullable: true })
	articleStatus?: BoardArticleStatus;

L16 @IsOptional()
	@Length(3, 50)
	@Field(() => String, { nullable: true })
	articleTitle?: string;

L21 @IsOptional()
	@Length(3, 250)
	@Field(() => String, { nullable: true })
	articleContent?: string;

L26 @IsOptional()
	@Field(() => String, { nullable: true })
	articleImage?: string;
```

### `apps/nestar-api/src/libs/dto/comment/comment.input.ts`

```typescript
L8 @InputType() class CommentInput

L10 @IsNotEmpty()
	@Field(() => CommentGroup)
	commentGroup!: CommentGroup;

L14 @IsNotEmpty()
	@Length(1, 100)
	@Field(() => String)
	commentContent!: string;

L19 @IsNotEmpty()
	@Field(() => String)
	commentRefId!: ObjectId;

L23 memberId?: ObjectId;

L26 @InputType() class CISearch

L28 @IsNotEmpty()
	@Field(() => String)
	commentRefId!: ObjectId;

L33 @InputType() class CommentsInquiry

L35 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

L40 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;

L45 @IsOptional()
	@IsIn(availableCommentSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

L50 @IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

L54 @IsNotEmpty()
	@Field(() => CISearch)
	search!: CISearch;
```

### `apps/nestar-api/src/libs/dto/comment/comment.ts`

```typescript
L6 @ObjectType() class Comment

L8 @Field(() => String)
	_id!: ObjectId;

L11 @Field(() => CommentStatus)
	commentStatus!: CommentStatus;

L14 @Field(() => CommentGroup)
	commentGroup!: CommentGroup;

L17 @Field(() => String)
	commentContent!: string;

L20 @Field(() => String)
	commentRefId!: ObjectId;

L23 @Field(() => String)
	memberId!: ObjectId;

L26 @Field(() => Date)
	createdAt!: Date;

L29 @Field(() => Date)
	updatedAt!: Date;

L34 @Field(() => Member, { nullable: true })
	memberData?: Member;

L38 @ObjectType() class Comments

L40 @Field(() => [Comment])
	list!: Comment[];

L43 @Field(() => [TotalCounter], { nullable: true })
	metaCounter!: TotalCounter[];
```

### `apps/nestar-api/src/libs/dto/comment/comment.update.ts`

```typescript
L6 @InputType() class CommentUpdate

L8 @IsNotEmpty()
	@Field(() => String)
	_id!: ObjectId;

L12 @IsOptional()
	@Field(() => CommentStatus, { nullable: true })
	commentStatus?: CommentStatus;

L16 @IsOptional()
	@Length(1, 100)
	@Field(() => String, { nullable: true })
	commentContent?: string;
```

### `apps/nestar-api/src/libs/dto/follow/follow.input.ts`

```typescript
L5 @InputType() class FollowSearch

L7 @IsOptional()
	@Field(() => String, { nullable: true })
	followingId?: ObjectId;

L11 @IsOptional()
	@Field(() => String, { nullable: true })
	followerId?: ObjectId;

L16 @InputType() class FollowInquiry

L18 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

L23 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;

L28 @IsNotEmpty()
	@Field(() => FollowSearch)
	search!: FollowSearch;
```

### `apps/nestar-api/src/libs/dto/follow/follow.ts`

```typescript
L6 @ObjectType() class MeFollowed

L8 @Field(() => String)
	followingId!: ObjectId;

L11 @Field(() => String)
	followerId!: ObjectId;

L14 @Field(() => Boolean)
	myFollowing!: boolean;

L18 @ObjectType() class Follower

L20 @Field(() => String)
	_id!: ObjectId;

L23 @Field(() => String)
	followingId!: ObjectId;

L26 @Field(() => String)
	followerId!: ObjectId;

L29 @Field(() => Date)
	createdAt!: Date;

L32 @Field(() => Date)
	updatedAt!: Date;

L37 @Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

L40 @Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];

L43 @Field(() => Member, { nullable: true })
	followerData?: Member;

L47 @ObjectType() class Following

L49 @Field(() => String)
	_id!: ObjectId;

L52 @Field(() => String)
	followingId!: ObjectId;

L55 @Field(() => String)
	followerId!: ObjectId;

L58 @Field(() => Date)
	createdAt!: Date;

L61 @Field(() => Date)
	updatedAt!: Date;

L66 @Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

L69 @Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];

L72 @Field(() => Member, { nullable: true })
	followingData?: Member;

L76 @ObjectType() class Followings

L78 @Field(() => [Following])
	list!: Following[];

L81 @Field(() => [TotalCounter], { nullable: true })
	metaCounter!: TotalCounter[];

L85 @ObjectType() class Followers

L87 @Field(() => [Follower])
	list!: Follower[];

L90 @Field(() => [TotalCounter], { nullable: true })
	metaCounter!: TotalCounter[];
```

### `apps/nestar-api/src/libs/dto/like/like.input.ts`

```typescript
L6 @InputType() class LikeInput

L8 @IsNotEmpty()
	@Field(() => String)
	memberId!: ObjectId;

L12 @IsNotEmpty()
	@Field(() => String)
	likeRefId!: ObjectId;

L16 @IsNotEmpty()
	@Field(() => LikeGroup)
	likeGroup!: LikeGroup;
```

### `apps/nestar-api/src/libs/dto/like/like.ts`

```typescript
L5 @ObjectType() class MeLiked

L7 @Field(() => String)
	memberId!: ObjectId;

L10 @Field(() => String)
	likeRefId!: ObjectId;

L13 @Field(() => Boolean)
	myFavorite!: boolean;

L17 @ObjectType() class Like

L19 @Field(() => String)
	_id!: ObjectId;

L22 @Field(() => LikeGroup)
	likeGroup!: LikeGroup;

L25 @Field(() => String)
	likeRefId!: ObjectId;

L28 @Field(() => String)
	memberId!: ObjectId;

L31 @Field(() => Date)
	createdAt!: Date;

L34 @Field(() => Date)
	updatedAt!: Date;
```

### `apps/nestar-api/src/libs/dto/member/member.input.ts`

```typescript
L8 @InputType() class MemberInput

L10 @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberNick!: string

L15 @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberPassword!: string

L20 @IsNotEmpty()
    @Field(() => String)
    memberPhone!: string

L24 @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType

L28 @IsOptional()
    @Field(() => MemberAuthType, { nullable: true })
    memberAuthType?: MemberAuthType

L34 @InputType() class LoginInput

L36 @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberNick!: string

L41 @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberPassword!: string

L47 @InputType() class AISearch

L49 @IsOptional()         /// ???????????????????
    @Field(() => String, { nullable: true })
    text?: string

L55 @InputType() class AgentsInquiry

L57 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page!: number;

L62 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit!: number;

L67 @IsOptional()
    @IsIn(availableAgentSorts)
    @Field(() => String, { nullable: true })
    sort?: string

L72 @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: string

L76 @IsNotEmpty()
    @Field(() => AISearch)
    search!: AISearch

L82 @InputType() class MISearch

L84 @IsOptional()
    @Field(() => MemberStatus, { nullable: true })
    memberStatus?: MemberStatus

L88 @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType

L93 @IsOptional()         /// ???????????????????
    @Field(() => String, { nullable: true })
    text?: string

L99 @InputType() class MembersInquiry

L101 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page!: number;

L106 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit!: number;

L111 @IsOptional()
    @IsIn(availableMemberSorts)
    @Field(() => String, { nullable: true })
    sort?: string

L116 @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: string

L120 @IsNotEmpty()
    @Field(() => MISearch)
    search!: MISearch
```

### `apps/nestar-api/src/libs/dto/member/member.ts`

```typescript
L8 @ObjectType() class Member

L11 @Field(() => String)
    _id!: ObjectId;

L15 @Field(() => MemberType)
    memberType!: MemberType;

L18 @Field(() => MemberStatus)
    memberStatus!: MemberStatus;

L21 @Field(() => MemberAuthType)
    memberAuthType!: MemberAuthType;

L24 @Field(() => String)
    memberPhone!: string;

L27 @Field(() => String)
    memberNick!: string;

L30 memberPassword?: string

L32 @Field(() => String, { nullable: true })
    memberFullName?: string;

L35 @Field(() => String)
    memberImage!: string;

L38 @Field(() => String, { nullable: true })
    memberAddress?: string;

L41 @Field(() => String, { nullable: true })
    memberDesc?: string;

L45 @Field(() => Int)
    memberProperties!: number;

L48 @Field(() => Int)
    memberArticles!: number;

L51 @Field(() => Int)
    memberFollowers!: number;

L54 @Field(() => Int)
    memberFollowings!: number;

L57 @Field(() => Int)
    memberPoints!: number;

L60 @Field(() => Int)
    memberLikes!: number;

L63 @Field(() => Int)
    memberViews!: number;

L66 @Field(() => Int)
    memberComments!: number;

L69 @Field(() => Int)
    memberRank!: number;

L72 @Field(() => Int)
    memberWarnings!: number;

L75 @Field(() => Int)
    memberBlocks!: number;

L78 @Field(() => Date, { nullable: true })
    deletedAt?: Date;

L81 @Field(() => Date,)
    createdAt?: Date;

L84 @Field(() => Date,)
    updatedAt?: Date;

L86 @Field(() => String, { nullable: true })
    accessToken?: string;

L91 @Field(() => [MeLiked], { nullable: true })
    meLiked?: MeLiked[]

L94 @Field(() => [MeFollowed], { nullable: true })
    meFollowed?: MeFollowed[]

L100 @ObjectType() class TotalCounter

L102 @Field(() => Int, { nullable: true })
    total?: number

L107 @ObjectType() class Members

L109 @Field(() => [Member])
    list!: Member[]

L112 @Field(() => [TotalCounter], { nullable: true })
    metaCounter?: TotalCounter[]
```

### `apps/nestar-api/src/libs/dto/member/member.update.ts`

```typescript
L5 @InputType() class MemberUpdate

L9 @IsNotEmpty()
    @Field(() => String)
    _id?: string

L14 @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType

L18 @IsOptional()
    @Field(() => MemberStatus, { nullable: true })
    memberStatus?: MemberStatus

L22 @IsOptional()
    @Field(() => String, { nullable: true })
    memberPhone?: string

L26 @IsOptional()
    @Length(3, 12)
    @Field(() => String, { nullable: true })
    memberNick?: string

L31 @IsOptional()
    @Length(3, 12)
    @Field(() => String, { nullable: true })
    memberPassword?: string

L36 @IsOptional()
    @Length(3, 100)
    @Field(() => String, { nullable: true })
    memberFullName?: string

L41 @IsOptional()
    @Field(() => String, { nullable: true })
    memberImage?: string

L45 @IsOptional()
    @Field(() => String, { nullable: true })
    memberAddress?: string

L49 @IsOptional()
    @Field(() => String, { nullable: true })
    memberDesc?: string

L53 deleteAt?: Date
```

### `apps/nestar-api/src/libs/dto/property/property.input.ts`

```typescript
L9 @InputType() class PropertyInput

L12 @IsNotEmpty()
    @Field(() => PropertyType)
    propertyType!: PropertyType

L16 @IsNotEmpty()
    @Field(() => PropertyLocation)
    propertyLocation!: PropertyLocation

L20 @IsNotEmpty()
    @Length(3, 100)
    @Field(() => String)
    propertyAddress!: string

L25 @IsNotEmpty()
    @Length(3, 100)
    @Field(() => String)
    propertyTitle!: string

L30 @IsNotEmpty()
    @Field(() => Number)
    propertyPrice!: number

L34 @IsNotEmpty()
    @Field(() => Number)
    propertySquare!: number

L38 @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Field(() => Int)
    propertyBeds!: number

L44 @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Field(() => Int)
    propertyRooms!: number

L50 @IsNotEmpty()
    @Field(() => [String])
    propertyImages!: string[]

L54 @IsOptional()
    @Length(5, 500)
    @Field(() => String, { nullable: true })
    propertyDesc?: string

L59 @IsOptional()
    @Field(() => Boolean, { nullable: true })
    propertyBarter?: boolean

L63 @IsOptional()
    @Field(() => Boolean, { nullable: true })
    propertyRent?: boolean

L68 memberId?: ObjectId

L70 @IsOptional()
    @Field(() => Date, { nullable: true })
    constructedAt?: Date

L78 @InputType() class PricesRange

L80 @Field(() => Int)
    start!: number;

L83 @Field(() => Int)
    end!: number;

L88 @InputType() class SquaresRange

L90 @Field(() => Int)
    start!: number;

L93 @Field(() => Int)
    end!: number;

L98 @InputType() class PeriodsRange

L100 @Field(() => Date)
    start!: Date;

L103 @Field(() => Date)
    end!: Date;

L107 @InputType() class PISearch

L110 @IsOptional()
    @Field(() => String, { nullable: true })
    memberId?: ObjectId;

L115 @IsOptional()
    @Field(() => [PropertyLocation], { nullable: true })
    locationList?: PropertyLocation[];

L120 @IsOptional()
    @Field(() => [PropertyType], { nullable: true })
    typeList?: PropertyType[];

L125 @IsOptional()
    @Field(() => [Int], { nullable: true })
    roomsList?: number[];

L130 @IsOptional()
    @Field(() => [Int], { nullable: true })
    bedsList?: number[];

L135 @IsOptional()
    @IsIn(availableOptions, { each: true })
    @Field(() => [String], { nullable: true })
    options?: string[];

L141 @IsOptional()
    @Field(() => PricesRange, { nullable: true })
    pricesRange?: PricesRange;

L146 @IsOptional()
    @Field(() => PeriodsRange, { nullable: true })
    periodsRange?: PeriodsRange;

L151 @IsOptional()
    @Field(() => SquaresRange, { nullable: true })
    squaresRange?: SquaresRange;

L156 @IsOptional()
    @Field(() => String, { nullable: true })
    text?: string;

L162 @InputType() class PropertiesInquiry

L165 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page!: number;

L171 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit!: number;

L177 @IsOptional()
    @IsIn(availablePropertySorts)
    @Field(() => String, { nullable: true })
    sort?: string;

L183 @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: Direction;

L188 @IsNotEmpty()
    @Field(() => PISearch)
    search!: PISearch;

L193 @InputType() class APISearch

L195 @IsOptional()
    @Field(() => PropertyStatus, { nullable: true })
    propertyStatus?: PropertyStatus;

L201 @InputType() class AgentPropertiesInquiry

L203 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page!: number;

L208 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit!: number;

L213 @IsOptional()
    @IsIn(availablePropertySorts)
    @Field(() => String, { nullable: true })
    sort?: string;

L218 @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: Direction;

L222 @IsNotEmpty()
    @Field(() => APISearch)
    search!: APISearch;

L228 @InputType() class ALPISearch

L230 @IsOptional()
    @Field(() => PropertyStatus, { nullable: true })
    propertyStatus?: PropertyStatus;

L234 @IsOptional()
    @Field(() => [PropertyLocation], { nullable: true })
    propertyLocationList?: PropertyLocation[];

L239 @InputType() class AllPropertiesInquiry

L241 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page!: number;

L246 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit!: number;

L251 @IsOptional()
    @IsIn(availablePropertySorts)
    @Field(() => String, { nullable: true })
    sort?: string;

L256 @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: Direction;

L260 @IsNotEmpty()
    @Field(() => ALPISearch)
    search!: ALPISearch;

L265 @InputType() class OrdinaryInquiry

L267 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page!: number;

L272 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit!: number;
```

### `apps/nestar-api/src/libs/dto/property/property.ts`

```typescript
L8 @ObjectType() class Property

L11 @Field(() => String)
    _id!: ObjectId;

L14 @Field(() => PropertyType)
    propertyType!: PropertyType

L17 @Field(() => PropertyStatus)
    propertyStatus!: PropertyStatus

L20 @Field(() => PropertyLocation)
    propertyLocation!: PropertyLocation

L23 @Field(() => String)
    propertyAddress!: string

L27 @Field(() => String)
    propertyTitle!: string

L31 @Field(() => Number)
    propertyPrice!: number

L35 @Field(() => Number)
    propertySquare!: number

L38 @Field(() => Int)
    propertyBeds!: number

L42 @Field(() => Int)
    propertyRooms!: number

L46 @Field(() => Int)
    propertyViews!: number

L50 @Field(() => Int)
    propertyLikes!: number

L54 @Field(() => Int)
    propertyComments!: number

L58 @Field(() => Int)
    propertyRank!: number

L62 @Field(() => [String])
    propertyImages!: string[]

L67 @Field(() => String, { nullable: true })
    propertyDesc?: string

L70 @Field(() => Boolean)
    propertyBarter!: boolean

L73 @Field(() => Boolean)
    propertyRent!: boolean

L77 @Field(() => String)
    memberId!: ObjectId

L81 @Field(() => Date, { nullable: true })
    soldAt?: Date;

L84 @Field(() => Date, { nullable: true })
    deletedAt?: Date;

L87 @Field(() => Date, { nullable: true })
    constructedAt?: Date;

L90 @Field(() => Date,)
    createdAt!: Date;

L93 @Field(() => Date,)
    updatedAt!: Date;

L98 @Field(() => Member, { nullable: true })
    memberData?: Member

L101 @Field(() => [MeLiked], { nullable: true })
    meLiked?: MeLiked[]

L108 @ObjectType() class Properties

L111 @Field(() => [Property])
    list!: Property[];

L114 @Field(() => [TotalCounter], { nullable: true })
    metaCounter!: TotalCounter[];
```

### `apps/nestar-api/src/libs/dto/property/property.update.ts`

```typescript
L17 @InputType() class PropertyUpdate

L20 @IsNotEmpty()
    @Field(() => String)
    _id!: ObjectId;

L25 @IsOptional()
    @Field(() => PropertyType, { nullable: true })
    propertyType?: PropertyType;

L30 @IsOptional()
    @Field(() => PropertyStatus, { nullable: true })
    propertyStatus?: PropertyStatus;

L35 @IsOptional()
    @Field(() => PropertyLocation, { nullable: true })
    propertyLocation?: PropertyLocation;

L40 @IsOptional()
    @Length(3, 100)
    @Field(() => String, { nullable: true })
    propertyAddress?: string;

L46 @IsOptional()
    @Length(3, 100)
    @Field(() => String, { nullable: true })
    propertyTitle?: string;

L52 @IsOptional()
    @Field(() => Number, { nullable: true })
    propertyPrice?: number;

L57 @IsOptional()
    @Field(() => Number, { nullable: true })
    propertySquare?: number;

L62 @IsOptional()
    @IsInt()
    @Min(1)
    @Field(() => Int, { nullable: true })
    propertyBeds?: number;

L69 @IsOptional()
    @IsInt()
    @Min(1)
    @Field(() => Int, { nullable: true })
    propertyRooms?: number;

L76 @IsOptional()
    @Field(() => [String], { nullable: true })
    propertyImages?: string[];

L81 @IsOptional()
    @Length(5, 500)
    @Field(() => String, { nullable: true })
    propertyDesc?: string;

L87 @IsOptional()
    @Field(() => Boolean, { nullable: true })
    propertyBarter?: boolean;

L92 @IsOptional()
    @Field(() => Boolean, { nullable: true })
    propertyRent?: boolean;

L97 soldAt?: Date;

L100 deletedAt?: Date;

L103 @IsOptional()
    @Field(() => Date, { nullable: true })
    constructedAt?: Date;
```

### `apps/nestar-api/src/libs/dto/view/view.input.ts`

```typescript
L6 @InputType() class ViewInput

L9 @IsNotEmpty()
    @Field(() => String)
    memberId!: ObjectId

L13 @IsNotEmpty()
    @Field(() => String)
    viewRefId!: ObjectId

L18 @IsNotEmpty()
    @Field(() => ViewGroup)
    viewGroup!: ViewGroup
```

### `apps/nestar-api/src/libs/dto/view/view.ts`

```typescript
L6 @ObjectType() class View

L9 @Field(() => String)
    _id!: ObjectId;

L12 @Field(() => String)
    viewGroup!: ViewGroup

L15 @Field(() => String)
    viewRefId!: ObjectId

L18 @Field(() => String)
    memberId!: ObjectId

L21 @Field(() => Date, { nullable: true })
    deletedAt?: Date;

L24 @Field(() => Date,)
    createdAt?: Date;

L27 @Field(() => Date,)
    updatedAt?: Date;
```

### `apps/nestar-api/src/libs/enums/board-article.enum.ts`

```typescript
L3 export enum BoardArticleCategory {
	FREE = 'FREE',
	RECOMMEND = 'RECOMMEND',
	NEWS = 'NEWS',
	HUMOR = 'HUMOR',
}

L9 registerEnumType(BoardArticleCategory, {
	name: 'BoardArticleCategory',
});

L13 export enum BoardArticleStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

L17 registerEnumType(BoardArticleStatus, {
	name: 'BoardArticleStatus',
});
```

### `apps/nestar-api/src/libs/enums/comment.enum.ts`

```typescript
L3 export enum CommentStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

L7 registerEnumType(CommentStatus, {
	name: 'CommentStatus',
});

L11 export enum CommentGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	PROPERTY = 'PROPERTY',
}

L16 registerEnumType(CommentGroup, {
	name: 'CommentGroup',
});
```

### `apps/nestar-api/src/libs/enums/common.enum.ts`

```typescript
L3 export enum Message {
    SOMETHING_WENT_WRONG = 'Something went wrong!',
    NO_DATA_FOUND = 'No data found!',
    CREATE_FAILED = 'Create failed!',
    UPDATE_FAILED = 'Update failed!',
    REMOVE_FAILED = 'Remove failed!',
    UPLOAD_FAILED = 'Upload failed!',
    BAD_REQUEST = 'Bad Request',

    USED_MEMBER_NICK_OR_PHONE = "Already used member nick or phone",
    NO_MEMBER_NICK = 'No member with that member nick!',
    BLOCKED_USER = 'You have been blocked!',
    WRONG_PASSWORD = 'Wrong password, try again!',
    NOT_AUTHENTICATED = 'You are not authenticated, please login first!',
    TOKEN_NOT_EXIST = 'Bearer token is not provided!',
    ONLY_SPECIFIC_ROLES_ALLOWED = 'Allowed only for members with specific roles!',
    NOT_ALLOWED_REQUEST = 'Not Allowed Request!',
    PROVIDE_ALLOWED_FORMAT = 'Please provide jpg, jpeg or png images!',
    SELF_SUBSCRIPTION_DENIED = 'Self subscription is denied!',
}

L25 export enum Direction {
    ASC = 1,
    DESC = -1
}

L30 registerEnumType(Direction, {
    name: "Direction"
})
```

### `apps/nestar-api/src/libs/enums/like.enum.ts`

```typescript
L3 export enum LikeGroup {
	MEMBER = 'MEMBER',
	PROPERTY = 'PROPERTY',
	ARTICLE = 'ARTICLE',
}

L8 registerEnumType(LikeGroup, {
	name: 'LikeGroup',
});
```

### `apps/nestar-api/src/libs/enums/member.enum.ts`

```typescript
L3 export enum MemberType {
    USER = "USER",
    AGENT = "AGENT",
    ADMIN = "ADMIN"
}

L9 registerEnumType(MemberType, { name: "MemberType" })

L11 export enum MemberStatus {
    ACTIVE = "ACTIVE",
    BLOCK = "BLOCK",
    DELETE = "DELETE"
}

L16 registerEnumType(MemberStatus, { name: "MemberStatus" })

L19 export enum MemberAuthType {
    PHONE = "PHONE",
    EMAIL = "EMAIL",
    TELEGRAPH = "TELEGRAPH"
}

L25 registerEnumType(MemberAuthType, { name: "MemberAuthType" })
```

### `apps/nestar-api/src/libs/enums/notice.enum.ts`

```typescript
L3 export enum NoticeCategory {
	FAQ = 'FAQ',
	TERMS = 'TERMS',
	INQUIRY = 'INQUIRY',
}

L8 registerEnumType(NoticeCategory, {
	name: 'NoticeCategory',
});

L12 export enum NoticeStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

L17 registerEnumType(NoticeStatus, {
	name: 'NoticeStatus',
});
```

### `apps/nestar-api/src/libs/enums/notification.enum.ts`

```typescript
L3 export enum NotificationType {
	LIKE = 'LIKE',
	COMMENT = 'COMMENT',
}

L7 registerEnumType(NotificationType, {
	name: 'NotificationType',
});

L11 export enum NotificationStatus {
	WAIT = 'WAIT',
	READ = 'READ',
}

L15 registerEnumType(NotificationStatus, {
	name: 'NotificationStatus',
});

L19 export enum NotificationGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	PROPERTY = 'PROPERTY',
}

L24 registerEnumType(NotificationGroup, {
	name: 'NotificationGroup',
});
```

### `apps/nestar-api/src/libs/enums/property.enum.ts`

```typescript
L3 export enum PropertyType {
	APARTMENT = 'APARTMENT',
	VILLA = 'VILLA',
	HOUSE = 'HOUSE',
}

L8 registerEnumType(PropertyType, {
	name: 'PropertyType',
});

L12 export enum PropertyStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}

L17 registerEnumType(PropertyStatus, {
	name: 'PropertyStatus',
});

L21 export enum PropertyLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}

L32 registerEnumType(PropertyLocation, {
	name: 'PropertyLocation',
});
```

### `apps/nestar-api/src/libs/enums/view.enum.ts`

```typescript
L3 export enum ViewGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	PROPERTY = 'PROPERTY',
}

L8 registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
```

### `apps/nestar-api/src/libs/interceptor/Logging.interceptor.ts`

```typescript
L7 @Injectable() class LoggingInterceptor implements NestInterceptor

L11 private readonly logger: Logger = new Logger();

L15 intercept(context: ExecutionContext, next: CallHandler): Observable<any>

L50 private stringify(context: ExecutionContext): string
```

### `apps/nestar-api/src/libs/types/common.ts`

```typescript
L3 export interface T {
    [key: string]: any
}

L8 export interface StatisticModifier {
    _id: ObjectId;
    targetKey: string;
    modifier: number
}
```

### `apps/nestar-api/src/schemas/BoardArticle.model.ts`

```typescript
L4 const BoardArticleSchema = new Schema(
	{
		articleCategory: {
			type: String,
			enum: BoardArticleCategory,
			required: true,
		},

		articleStatus: {
			type: String,
			enum: BoardArticleStatus,
			default: BoardArticleStatus.ACTIVE,
		},

		articleTitle: {
			type: String,
			required: true,
		},

		articleContent: {
			type: String,
			required: true,
		},

		articleImage: {
			type: String,
		},

		articleLikes: {
			type: Number,
			default: 0,
		},

		articleViews: {
			type: Number,
			default: 0,
		},

		articleComments: {
			type: Number,
			default: 0,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'boardArticles' },
);
```

### `apps/nestar-api/src/schemas/Comment.model.ts`

```typescript
L4 const CommentSchema = new Schema(
	{
		commentStatus: {
			type: String,
			enum: CommentStatus,
			default: CommentStatus.ACTIVE,
		},

		commentGroup: {
			type: String,
			enum: CommentGroup,
			required: true,
		},

		commentContent: {
			type: String,
			required: true,
		},

		commentRefId: {
			type: Schema.Types.ObjectId,
			required: true,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true, collection: 'comments' },
);
```

### `apps/nestar-api/src/schemas/Follow.model.ts`

```typescript
L3 const FollowSchema = new Schema(
	{
		followingId: {
			type: Schema.Types.ObjectId,
			required: true,
		},

		followerId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true, collection: "follows" },
);

L18 FollowSchema.index({ followingId: 1, followerId: 1 }, { unique: true });
```

### `apps/nestar-api/src/schemas/Like.model.ts`

```typescript
L4 const LikeSchema = new Schema(
	{
		likeGroup: {
			type: String,
			enum: ViewGroup,
			required: true,
		},

		likeRefId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'likes' },
);

L26 LikeSchema.index({ memberId: 1, likeRefId: 1 }, { unique: true });
```

### `apps/nestar-api/src/schemas/Member.model.ts`

```typescript
L5 const MemberSchema = new Schema({
    memberType: {
        type: String,
        enum: MemberType,
        default: MemberType.USER
    },


    memberStatus: {
        type: String,
        enum: MemberStatus,
        default: MemberStatus.ACTIVE
    },

    memberAuthType: {
        type: String,
        enum: MemberAuthType,
        default: MemberAuthType.PHONE
    },


    memberPhone: {
        type: String,
        index: { unique: true, sparse: true },
        required: true
    },


    memberNick: {
        type: String,
        index: { unique: true, sparse: true },
        required: true
    },

    memberPassword: {
        type: String,
        select: false,
        required: true
    },

    memberFullName: {
        type: String,
    },

    memberImage: {
        type: String,
        default: ""
    },


    memberAddress: {
        type: String,
    },

    memberDesc: {
        type: String,
    },

    memberProperties: {
        type: Number,
        default: 0
    },

    memberArticles: {
        type: Number,
        default: 0
    },

    memberFollowers: {
        type: Number,
        default: 0
    },

    memberFollowings: {
        type: Number,
        default: 0
    },

    memberPoints: {
        type: Number,
        default: 0
    },

    memberLikes: {
        type: Number,
        default: 0
    },

    memberViews: {
        type: Number,
        default: 0
    },

    memberComments: {
        type: Number,
        default: 0
    },

    memberRank: {
        type: Number,
        default: 0
    },

    memberWarnings: {
        type: Number,
        default: 0
    },

    memberBlocks: {
        type: Number,
        default: 0
    },

    deletedAt: {
        type: Date
    }


},
    { timestamps: true, collection: "members" }

)
```

### `apps/nestar-api/src/schemas/Notice.model.ts`

```typescript
L4 const NoticeSchema = new Schema(
	{
		noticeCategory: {
			type: String,
			enum: NoticeCategory,
			required: true,
		},

		noticeStatus: {
			type: String,
			enum: NoticeStatus,
			default: NoticeStatus.ACTIVE,
		},

		noticeTitle: {
			type: String,
			required: true,
		},

		noticeContent: {
			type: String,
			required: true,
		},
		
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'notices' },
);
```

### `apps/nestar-api/src/schemas/Notification.model.ts`

```typescript
L4 const NotificationSchema = new Schema(
	{
		notificationType: {
			type: String,
			enum: NotificationType,
			required: true,
		},

		notificationStatus: {
			type: String,
			enum: NotificationStatus,
			default: NotificationStatus.WAIT,
		},

		notificationGroup: {
			type: String,
			enum: NotificationGroup,
			required: true,
		},

		notificationTitle: {
			type: String,
			required: true,
		},

		notificationDesc: {
			type: String,
		},

		authorId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		receiverId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		propertyId: {
			type: Schema.Types.ObjectId,
			ref: 'Property',
		},

		articleId: {
			type: Schema.Types.ObjectId,
			ref: 'BoardArticle',
		},
	},
	{ timestamps: true, collection: 'notifications' },
);
```

### `apps/nestar-api/src/schemas/Property.model.ts`

```typescript
L4 const PropertySchema = new Schema(
	{
		propertyType: {
			type: String,
			enum: PropertyType,
			required: true,
		},

		propertyStatus: {
			type: String,
			enum: PropertyStatus,
			default: PropertyStatus.ACTIVE,
		},

		propertyLocation: {
			type: String,
			enum: PropertyLocation,
			required: true,
		},

		propertyAddress: {
			type: String,
			required: true,
		},

		propertyTitle: {
			type: String,
			required: true,
		},

		propertyPrice: {
			type: Number,
			required: true,
		},

		propertySquare: {
			type: Number,
			required: true,
		},

		propertyBeds: {
			type: Number,
			required: true,
		},

		propertyRooms: {
			type: Number,
			required: true,
		},

		propertyViews: {
			type: Number,
			default: 0,
		},

		propertyLikes: {
			type: Number,
			default: 0,
		},

		propertyComments: {
			type: Number,
			default: 0,
		},

		propertyRank: {
			type: Number,
			default: 0,
		},

		propertyImages: {
			type: [String],
			required: true,
		},

		propertyDesc: {
			type: String,
		},

		propertyBarter: {
			type: Boolean,
			default: false,
		},

		propertyRent: {
			type: Boolean,
			default: false,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

		constructedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'properties' },
);

L114 PropertySchema.index({ propertyType: 1, propertyLocation: 1, propertyTitle: 1, propertyPrice: 1 }, { unique: true });
```

### `apps/nestar-api/src/schemas/View.model.ts`

```typescript
L4 const ViewSchema = new Schema(
	{
		viewGroup: {
			type: String,
			enum: ViewGroup,
			required: true,
		},

		viewRefId: {
			type: Schema.Types.ObjectId,
			required: true,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'views' },
);

L26 ViewSchema.index({ memberId: 1, viewRefId: 1 }, { unique: true });
```

### `apps/nestar-api/src/socket/socket.gateway.ts`

```typescript
L10 interface MessagePayload {
  event: string;
  text: string;
  memberData: Member | null
}

L16 interface InfoPayload {
  event: string;
  totalClients: number;
  memberData: Member | null;
  action: string
}

L24 @WebSocketGateway({ transports: ['websocket'], secure: false }) class SocketGateway

L26 private logger: Logger = new Logger("SocketEventGateway")

L27 private summaryClient: number = 0

L29 private clientsAuthMap = new Map<WebSocket, Member | null>()

L30 private messagesList: MessagePayload[] = []

L33 constructor(private authService: AuthService)

L35 @WebSocketServer()
  server!: Server;

L39 public afterInit(server: Server)

L44 private async retrieveAuth(req: any): Promise<Member | null>

L57 public async handleConnection(client: WebSocket, req: any[])

L85 public async handleDisconnect(client: WebSocket)

L109 @SubscribeMessage('message')
  public async handleMessage(client: any, payload: string): Promise<void>

L135 private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload)

L144 private emitMessage(message: InfoPayload | MessagePayload)
```

### `apps/nestar-api/src/socket/socket.module.ts`

```typescript
L5 @Module({
  imports: [AuthModule],
  providers: [SocketGateway],
}) class SocketModule
```

### `apps/nestar-batch/src/batch.controller.ts`

```typescript
L7 @Controller() class BatchController

L9 private logger: Logger = new Logger("BatchController")

L10 constructor(private readonly batchService: BatchService)

L12 @Timeout(1000)
  handleTimeout()

L17 @Cron("00 00 01 * * *", { name: BATCH_ROLLBACK })
  public async batchRollback()

L29 @Cron("20 00 01 * * *", { name: BATCH_TOP_PROPERTIES })
  public async batchTopProperties()

L42 @Cron("40 00 01 * * *", { name: BATCH_TOP_AGENTS })
  public async batchTopAgents()

L61 @Get()
  getHello(): string
```

### `apps/nestar-batch/src/batch.module.ts`

```typescript
L11 @Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: "Property", schema: PropertySchema }]),
    MongooseModule.forFeature([{ name: "Member", schema: MemberSchema }]),
  ],
  controllers: [BatchController],
  providers: [BatchService],
}) class BatchModule
```

### `apps/nestar-batch/src/batch.service.ts`

```typescript
L8 @Injectable() class BatchService

L10 constructor(
    @InjectModel("Property") private readonly propertyModel: Model<Property>,
    @InjectModel("Member") private readonly memberModel: Model<Member>
  )

L15 public async batchRollback(): Promise<void>

L36 public async batchTopProperties(): Promise<void>

L52 public async batchTopAgents(): Promise<void>

L70 getHello(): string
```

### `apps/nestar-batch/src/database/database.module.ts`

```typescript
L6 @Module({
    imports: [MongooseModule.forRootAsync({
        useFactory: () => ({
            uri: process.env.NODE_ENV === "production" ? process.env.MONGO_PROD : process.env.MONGO_DEV
        }),

    })],
    exports: [MongooseModule],
}) class DatabaseModule

L16 constructor(@InjectConnection() private readonly connection: Connection)
```

## skiresort

### `apps/skiresort-api/src/app.controller.ts`

```typescript
L4 @Controller() class AppController

L6 constructor(private readonly appService: AppService)

L8 @Get()
  getHello(): string
```

### `apps/skiresort-api/src/app.module.ts`

```typescript
L13 @Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      uploads: true,
      autoSchemaFile: true,
      formatError: (errors: T) => {
        const graphQLFormattedError = {
          extensions: { code: errors?.extensions?.code },  // BOSHQA YAXSHIROQ VARIANT TOPILMADI
          message: errors?.extensions?.exception?.response?.message || errors?.extensions?.response?.message || errors?.message,
        };
        console.log("GRAPHQL GLOBAL ERROR", graphQLFormattedError)
        return graphQLFormattedError
      }
    }),
    ComponentsModule, DatabaseModule, SocketModule],

  controllers: [AppController],
  providers: [AppService, AppResolver],
}) class AppModule
```

### `apps/skiresort-api/src/app.resolver.ts`

```typescript
L4 @Resolver() class AppResolver

L6 @Query(() => String)
    public sayHello(): string
```

### `apps/skiresort-api/src/app.service.ts`

```typescript
L3 @Injectable() class AppService

L5 getHello(): string
```

### `apps/skiresort-api/src/components/auth/auth.module.ts`

```typescript
L6 @Module({
    imports: [
        HttpModule,
        JwtModule.register({
            secret: `${process.env.SECRET_TOKEN}`,
            signOptions: { expiresIn: "30d" }
        })
    ],
    providers: [AuthService],
    exports: [AuthService],
}) class AuthModule
```

### `apps/skiresort-api/src/components/auth/auth.service.ts`

```typescript
L8 @Injectable() class AuthService

L11 constructor(private jwtService: JwtService)

L13 public async hashPassword(memberPassword: string): Promise<string>

L20 public async comparePasswords(password: string, hashedPassword: string | undefined): Promise<string>

L24 public async createToken(member: Member): Promise<string>

L36 public async verifyAuth(token: string): Promise<Member>
```

### `apps/skiresort-api/src/components/auth/guards/auth.guard.ts`

```typescript
L5 @Injectable() class AuthGuard implements CanActivate

L7 constructor(private authService: AuthService)

L9 async canActivate(context: ExecutionContext | any): Promise<boolean>
```

### `apps/skiresort-api/src/components/auth/guards/roles.guard.ts`

```typescript
L6 @Injectable() class RolesGuard implements CanActivate

L8 constructor(
		private reflector: Reflector,
		private authService: AuthService,
	)

L13 async canActivate(context: ExecutionContext | any): Promise<boolean>
```

### `apps/skiresort-api/src/components/auth/guards/without.guard.ts`

```typescript
L4 @Injectable() class WithoutGuard implements CanActivate

L6 constructor(private authService: AuthService)

L8 async canActivate(context: ExecutionContext | any): Promise<boolean>
```

### `apps/skiresort-api/src/components/board-article/board-article.module.ts`

```typescript
L11 @Module({
  imports: [MongooseModule.forFeature([{
    name: "BoardArticle",
    schema: BoardArticleSchema
  }]),

    AuthModule,
    ViewModule,
    MemberModule,
    LikeModule
  ],

  providers: [BoardArticleResolver, BoardArticleService],
  exports: [BoardArticleService]
}) class BoardArticleModule
```

### `apps/skiresort-api/src/components/board-article/board-article.resolver.ts`

```typescript
L16 @Resolver() class BoardArticleResolver

L18 constructor(private readonly boardArticleService: BoardArticleService)

L20 @UseGuards(AuthGuard)
    @Mutation(() => BoardArticle)
    public async createBoardArticle(
        @Args('input') input: BoardArticleInput,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticle>

L31 @UseGuards(WithoutGuard)
    @Query(() => BoardArticle)
    public async getBoardArticle(
        @Args('articleId') input: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticle>

L42 @UseGuards(AuthGuard)
    @Mutation(() => BoardArticle)
    public async updateBoardArticle(
        @Args('input') input: BoardArticleUpdate,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticle>

L54 @UseGuards(WithoutGuard)
    @Query((returns) => BoardArticles)
    public async getBoardArticles(
        @Args('input') input: BoardArticlesInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticles>

L64 @UseGuards(AuthGuard)
    @Mutation(() => BoardArticle)
    public async likeTargetBoardArticle(@Args("articleId") input: string,
        @AuthMember("_id") memberId: ObjectId
    ): Promise<BoardArticle>

L77 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Query((returns) => BoardArticles)
    public async getAllBoardArticlesByAdmin(
        @Args('input') input: AllBoardArticlesInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticles>

L89 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(() => BoardArticle)
    public async updateBoardArticleByAdmin(
        @Args('input') input: BoardArticleUpdate,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticle>

L102 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation((returns) => BoardArticle)
    public async removeBoardArticleByAdmin(
        @Args('articleId') input: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<BoardArticle>
```

### `apps/skiresort-api/src/components/board-article/board-article.service.ts`

```typescript
L18 @Injectable() class BoardArticleService

L20 constructor(@InjectModel("BoardArticle") private readonly boardArticleModel: Model<BoardArticle>,
        private memberService: MemberService,
        private viewService: ViewService,
        private likeService: LikeService,
    )

L26 public async createBoardArticle(
        memberId: ObjectId,
        input: BoardArticleInput
    ): Promise<BoardArticle>

L50 public async getBoardArticle(memberId: ObjectId, articleId: ObjectId): Promise<BoardArticle>

L91 public async boardArticleStatsEditor(input: StatisticModifier): Promise<BoardArticle>

L108 public async updateBoardArticle(memberId: ObjectId, input: BoardArticleUpdate): Promise<BoardArticle>

L140 public async getBoardArticles(memberId: ObjectId, input: BoardArticlesInquiry): Promise<BoardArticles>

L189 public async likeTargetBoardArticle(memberId: ObjectId, likeRefId: ObjectId): Promise<BoardArticle>

L217 public async getAllBoardArticlesByAdmin(input: AllBoardArticlesInquiry): Promise<BoardArticles>

L252 public async updateBoardArticleByAdmin(input: BoardArticleUpdate): Promise<BoardArticle>

L279 public async removeBoardArticleByAdmin(articleId: ObjectId): Promise<BoardArticle>
```

### `apps/skiresort-api/src/components/comment/comment.module.ts`

```typescript
L12 @Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Comment',
        schema: CommentSchema,
      },
    ]),
    AuthModule,
    MemberModule,
    ResortModule,
    EquipmentModule,
    BoardArticleModule,
  ],

  providers: [CommentResolver, CommentService],
}) class CommentModule
```

### `apps/skiresort-api/src/components/comment/comment.resolver.ts`

```typescript
L17 @Resolver() class CommentResolver

L19 constructor(private readonly commentService: CommentService)

L21 @UseGuards(AuthGuard)
    @Mutation((returns) => Comment)
    public async createComment(
        @Args('input') input: CommentInput,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Comment>

L31 @UseGuards(AuthGuard)
    @Mutation((returns) => Comment)
    public async updateComment(
        @Args('input') input: CommentUpdate,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Comment>

L44 @UseGuards(WithoutGuard)
    @Query((returns) => Comments)
    public async getComments(
        @Args('input') input: CommentsInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Comments>

L59 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation((returns) => Comment)
    public async removeCommentByAdmin(@Args('commentId') input: string): Promise<Comment>
```

### `apps/skiresort-api/src/components/comment/comment.service.ts`

```typescript
L25 @Injectable() class CommentService

L27 private readonly logger = new Logger(CommentService.name);

L29 constructor(
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
    private readonly memberService: MemberService,
    private readonly resortService: ResortService,
    private readonly boardArticleService: BoardArticleService,
    private readonly equipmentService: EquipmentService,
  )

L37 public async createComment(
    memberId: ObjectId,
    input: CommentInput,
  ): Promise<Comment>

L147 public async updateComment(
    memberId: ObjectId,
    input: CommentUpdate,
  ): Promise<Comment>

L167 public async getComments(
    memberId: ObjectId,
    input: CommentsInquiry,
  ): Promise<Comments>

L211 public async removeCommentByAdmin(input: ObjectId): Promise<Comment>
```

### `apps/skiresort-api/src/components/components.module.ts`

```typescript
L15 @Module({
  imports: [
    MemberModule,
    InstructorApplicationModule,
    ResortModule,
    EquipmentModule,
    EventModule,
    FaqModule,
    AuthModule,
    CommentModule,
    LikeModule,
    ViewModule,
    FollowModule,
    BoardArticleModule,
  ],
}) class ComponentsModule
```

### `apps/skiresort-api/src/components/equipment/equipment.module.ts`

```typescript
L11 @Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Equipment', schema: EquipmentSchema },
      { name: 'Member', schema: MemberSchema },
    ]),
    AuthModule,
    ResortModule,
    LikeModule,
    ViewModule,
  ],
  providers: [EquipmentResolver, EquipmentService],
  exports: [EquipmentService],
}) class EquipmentModule
```

### `apps/skiresort-api/src/components/equipment/equipment.resolver.ts`

```typescript
L24 @Resolver() class EquipmentResolver

L26 constructor(private readonly equipmentService: EquipmentService)

L28 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Equipment)
  createEquipment(
    @Args('input') input: EquipmentInput,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Equipment>

L38 @UseGuards(WithoutGuard)
  @Query(() => Equipment)
  getEquipment(
    @Args('equipmentId') equipmentId: string,
    @AuthMember('_id') memberId: Types.ObjectId | null,
  ): Promise<Equipment>

L50 @UseGuards(WithoutGuard)
  @Query(() => Equipments)
  getEquipments(
    @Args('input') input: EquipmentsInquiry,
    @AuthMember('_id') memberId: Types.ObjectId | null,
  ): Promise<Equipments>

L59 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Equipments)
  getAllEquipmentsByAdmin(
    @Args('input') input: AllEquipmentsInquiry,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Equipments>

L69 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Equipment)
  updateEquipmentByAdmin(
    @Args('input') input: EquipmentUpdate,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Equipment>

L80 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Equipment)
  removeEquipmentByAdmin(
    @Args('equipmentId') equipmentId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  ): Promise<Equipment>

L93 @UseGuards(AuthGuard)
  @Mutation(() => Equipment)
  likeTargetEquipment(
    @Args('equipmentId') equipmentId: string,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Equipment>

L105 @UseGuards(AuthGuard)
  @Query(() => Equipments)
  getFavoriteEquipments(
    @Args('input') input: EquipmentHistoryInquiry,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Equipments>

L114 @UseGuards(AuthGuard)
  @Query(() => Equipments)
  getVisitedEquipments(
    @Args('input') input: EquipmentsInquiry,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Equipments>
```

### `apps/skiresort-api/src/components/equipment/equipment.service.ts`

```typescript
L63 @Injectable() class EquipmentService

L65 private readonly logger = new Logger(EquipmentService.name);

L67 constructor(
    @InjectModel('Equipment') private readonly equipmentModel: Model<Equipment>,
    private readonly likeService: LikeService,
    private readonly viewService: ViewService,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private readonly resortService: ResortService,
  )

L75 public async createEquipment(
    adminId: MongoId,
    input: EquipmentInput,
  ): Promise<Equipment>

L87 private async assertAdmin(adminId: MongoId): Promise<void>

L99 private output(equipment: Equipment): Equipment

L109 private normalizeContent(
    input: EquipmentInput | EquipmentUpdate | Record<string, unknown>,
  ): Record<string, unknown>

L153 public async assertVisibleEquipment(
    equipmentId: MongoId,
  ): Promise<Equipment>

L164 public async getEquipment(
    memberId: MongoId | null,
    equipmentId: MongoId,
  ): Promise<Equipment>

L207 public async getEquipments(
    memberId: MongoId | null,
    input: EquipmentsInquiry,
  ): Promise<Equipments>

L217 public async getAllEquipmentsByAdmin(
    adminId: MongoId,
    input: AllEquipmentsInquiry,
  ): Promise<Equipments>

L228 public async updateEquipmentByAdmin(
    adminId: MongoId,
    input: EquipmentUpdate,
  ): Promise<Equipment>

L290 public async removeEquipmentByAdmin(
    adminId: MongoId,
    equipmentId: MongoId,
  ): Promise<Equipment>

L303 public async likeTargetEquipment(
    memberId: MongoId,
    equipmentId: MongoId,
  ): Promise<Equipment>

L326 public getFavoriteEquipments(
    memberId: MongoId,
    input: EquipmentHistoryInquiry,
  ): Promise<Equipments>

L334 public getVisitedEquipments(
    memberId: MongoId,
    input: EquipmentHistoryInquiry,
  ): Promise<Equipments>

L342 public async commentRemoved(equipmentId: MongoId): Promise<void>

L360 private validatePagination(input: EquipmentHistoryInquiry): void

L371 public async equipmentStatsEditor(input: {
    _id: MongoId;
    targetKey: EquipmentCounter;
    modifier: number;
  }): Promise<Equipment>

L403 private pickContent(
    input: EquipmentInput | EquipmentUpdate,
  ): Record<string, unknown>

L413 private searchMatch(
    search?: EquipmentSearch | null,
  ): Record<string, unknown>

L485 private async listEquipments(
    memberId: MongoId | null,
    input: EquipmentsInquiry | AllEquipmentsInquiry,
    match: Record<string, unknown>,
  ): Promise<Equipments>

L529 private likeInput(memberId: MongoId, equipmentId: MongoId): LikeInput

L537 private async compensate(
    undo: () => Promise<void>,
    interaction: string,
  ): Promise<void>
```

### `apps/skiresort-api/src/components/event/event.module.ts`

```typescript
L10 @Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Event', schema: EventSchema },
      { name: 'Member', schema: MemberSchema },
    ]),
    AuthModule,
    ResortModule,
  ],
  providers: [EventResolver, EventService],
  exports: [EventService],
}) class EventModule
```

### `apps/skiresort-api/src/components/event/event.resolver.ts`

```typescript
L19 @Resolver() class EventResolver

L21 constructor(private readonly eventService: EventService)

L23 @Query(() => Event)
  getEvent(@Args('eventId') eventId: string)

L28 @Query(() => Events)
  getEvents(@Args('input') input: EventsInquiry)

L33 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Event)
  createEvent(
    @Args('input') input: EventInput,
    @AuthMember('_id') adminId: Types.ObjectId,
  )

L43 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Event)
  updateEventByAdmin(
    @Args('input') input: EventUpdate,
    @AuthMember('_id') adminId: Types.ObjectId,
  )

L53 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Event)
  removeEventByAdmin(
    @Args('eventId') eventId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  )

L63 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Event)
  getEventByAdmin(
    @Args('eventId') eventId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  )

L73 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Events)
  getAllEventsByAdmin(
    @Args('input') input: AllEventsInquiry,
    @AuthMember('_id') adminId: Types.ObjectId,
  )

L83 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => [String])
  uploadEventImages(
    // graphql-upload v13 exposes its scalar without usable ESLint type metadata.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    @Args('files', { type: () => [GraphQLUpload] })
    files: Promise<ImageUpload>[],
    @AuthMember('_id') adminId: Types.ObjectId,
  )
```

### `apps/skiresort-api/src/components/event/event.service.ts`

```typescript
L43 @Injectable() class EventService

L45 constructor(
    @InjectModel('Event') private readonly eventModel: Model<Event>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private readonly resortService: ResortService,
  )

L51 private async assertAdmin(adminId: Types.ObjectId): Promise<void>

L63 private async content(input: EventInput | EventUpdate, update = false)

L100 private validateDates(start: unknown, end: unknown): void

L111 async createEvent(
    adminId: Types.ObjectId,
    input: EventInput,
  ): Promise<Event>

L123 async updateEventByAdmin(
    adminId: Types.ObjectId,
    input: EventUpdate,
  ): Promise<Event>

L164 async removeEventByAdmin(
    adminId: Types.ObjectId,
    eventId: string,
  ): Promise<Event>

L177 async getEvent(eventId: string): Promise<Event>

L181 async getEventByAdmin(
    adminId: Types.ObjectId,
    eventId: string,
  ): Promise<Event>

L189 private async detail(eventId: string, admin: boolean): Promise<Event>

L201 async getEvents(input: EventsInquiry): Promise<Events>

L205 async getAllEventsByAdmin(
    adminId: Types.ObjectId,
    input: AllEventsInquiry,
  ): Promise<Events>

L213 private async list(
    input: EventsInquiry | AllEventsInquiry,
    admin: boolean,
  ): Promise<Events>

L253 async uploadEventImages(
    adminId: Types.ObjectId,
    files: Promise<ImageUpload>[],
  ): Promise<string[]>
```

### `apps/skiresort-api/src/components/faq/faq.module.ts`

```typescript
L9 @Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Faq', schema: FaqSchema },
      { name: 'Member', schema: MemberSchema },
    ]),
    AuthModule,
  ],
  providers: [FaqResolver, FaqService],
  exports: [FaqService],
}) class FaqModule
```

### `apps/skiresort-api/src/components/faq/faq.resolver.ts`

```typescript
L17 @Resolver() class FaqResolver

L19 constructor(private readonly faqService: FaqService)

L21 @Query(() => Faq)
  getFaq(@Args('faqId') faqId: string)

L26 @Query(() => Faqs)
  getFaqs(@Args('input') input: FaqsInquiry)

L31 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Faq)
  createFaq(
    @Args('input') input: FaqInput,
    @AuthMember('_id') adminId: Types.ObjectId,
  )

L41 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Faq)
  updateFaqByAdmin(
    @Args('input') input: FaqUpdate,
    @AuthMember('_id') adminId: Types.ObjectId,
  )

L51 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Faq)
  removeFaqByAdmin(
    @Args('faqId') faqId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  )

L61 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Faq)
  getFaqByAdmin(
    @Args('faqId') faqId: string,
    @AuthMember('_id') adminId: Types.ObjectId,
  )

L71 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Faqs)
  getAllFaqsByAdmin(
    @Args('input') input: AllFaqsInquiry,
    @AuthMember('_id') adminId: Types.ObjectId,
  )
```

### `apps/skiresort-api/src/components/faq/faq.service.ts`

```typescript
L28 @Injectable() class FaqService

L30 constructor(
    @InjectModel('Faq') private readonly faqModel: Model<Faq>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
  )

L35 private async assertAdmin(adminId: Types.ObjectId): Promise<void>

L47 private content(input: FaqInput | FaqUpdate, update = false)

L61 async createFaq(adminId: Types.ObjectId, input: FaqInput): Promise<Faq>

L69 async updateFaqByAdmin(
    adminId: Types.ObjectId,
    input: FaqUpdate,
  ): Promise<Faq>

L93 async removeFaqByAdmin(adminId: Types.ObjectId, faqId: string): Promise<Faq>

L103 async getFaq(faqId: string): Promise<Faq>

L107 async getFaqByAdmin(adminId: Types.ObjectId, faqId: string): Promise<Faq>

L112 private async detail(faqId: string, admin: boolean): Promise<Faq>

L124 async getFaqs(input: FaqsInquiry): Promise<Faqs>

L128 async getAllFaqsByAdmin(
    adminId: Types.ObjectId,
    input: AllFaqsInquiry,
  ): Promise<Faqs>

L136 private async list(
    input: FaqsInquiry | AllFaqsInquiry,
    admin: boolean,
  ): Promise<Faqs>
```

### `apps/skiresort-api/src/components/follow/follow.module.ts`

```typescript
L9 @Module({
    imports: [
        MongooseModule.forFeature([{ name: "Follow", schema: FollowSchema }]),
        AuthModule,
        MemberModule
    ],
    providers: [FollowResolver, FollowService],
    exports: [FollowService]
}) class FollowModule
```

### `apps/skiresort-api/src/components/follow/follow.resolver.ts`

```typescript
L12 @Resolver() class FollowResolver

L14 constructor(private readonly followService: FollowService)

L16 @UseGuards(AuthGuard)
    @Mutation((returns) => Follower)
    public async subscribe(
        @Args('input') input: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Follower>

L27 @UseGuards(AuthGuard)
    @Mutation((returns) => Follower)
    public async unsubscribe(
        @Args('input') input: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Follower>

L39 @UseGuards(WithoutGuard)
    @Query((returns) => Followings)
    public async getMemberFollowings(
        @Args('input') input: FollowInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Followings>

L51 @UseGuards(WithoutGuard)
    @Query((returns) => Followers)
    public async getMemberFollowers(
        @Args('input') input: FollowInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Followers>
```

### `apps/skiresort-api/src/components/follow/follow.service.ts`

```typescript
L12 @Injectable() class FollowService

L14 constructor(@InjectModel("Follow") private readonly followModel: Model<Follower | Following>,
        private memberService: MemberService,

    )

L20 public async subscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower>

L38 private async registerSubscription(followerId: ObjectId, followingId: ObjectId): Promise<{ result: Follower; created: boolean }>

L57 public async unsubscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower>

L75 public async getMemberFollowings(memberId: ObjectId, input: FollowInquiry): Promise<Followings>

L107 public async getMemberFollowers(memberId: ObjectId, input: FollowInquiry): Promise<Followers>
```

### `apps/skiresort-api/src/components/instructor-application/instructor-application.module.ts`

```typescript
L11 @Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'InstructorApplication', schema: InstructorApplicationSchema },
      { name: 'Member', schema: MemberSchema },
    ]),
    AuthModule,
    MemberModule,
    ResortModule,
  ],
  providers: [InstructorApplicationResolver, InstructorApplicationService],
  exports: [InstructorApplicationService],
}) class InstructorApplicationModule
```

### `apps/skiresort-api/src/components/instructor-application/instructor-application.resolver.ts`

```typescript
L21 @Resolver() class InstructorApplicationResolver

L23 constructor(
    private readonly applicationService: InstructorApplicationService,
  )

L27 @Roles(MemberType.USER)
  @UseGuards(RolesGuard)
  @Mutation(() => InstructorApplication)
  createInstructorApplication(
    @Args('input') input: InstructorApplicationInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<InstructorApplication>

L37 @UseGuards(AuthGuard)
  @Query(() => InstructorApplication, { nullable: true })
  getMyInstructorApplication(
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<InstructorApplication | null>

L45 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => InstructorApplications)
  getAllInstructorApplicationsByAdmin(
    @Args('input') input: InstructorApplicationsInquiry,
    @AuthMember('_id') adminId: ObjectId,
  ): Promise<InstructorApplications>

L58 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => InstructorApplication)
  getInstructorApplicationByAdmin(
    @Args('applicationId') applicationId: string,
    @AuthMember('_id') adminId: ObjectId,
  ): Promise<InstructorApplication>

L71 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => InstructorApplication)
  approveInstructorApplicationByAdmin(
    @Args('applicationId') applicationId: string,
    @AuthMember('_id') adminId: ObjectId,
  ): Promise<InstructorApplication>

L84 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => InstructorApplication)
  rejectInstructorApplicationByAdmin(
    @Args('input') input: InstructorApplicationReject,
    @AuthMember('_id') adminId: ObjectId,
  ): Promise<InstructorApplication>
```

### `apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts`

```typescript
L31 @Injectable() class InstructorApplicationService

L33 constructor(
    @InjectModel('InstructorApplication')
    private readonly applicationModel: Model<InstructorApplication>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    @InjectConnection() private readonly connection: Connection,
    private readonly memberService: MemberService,
    private readonly resortService: ResortService,
  )

L42 public async createInstructorApplication(
    memberId: MongoId,
    input: InstructorApplicationInput,
  ): Promise<InstructorApplication>

L121 public async getMyInstructorApplication(
    memberId: MongoId,
  ): Promise<InstructorApplication | null>

L132 public async getAllInstructorApplicationsByAdmin(
    adminId: MongoId,
    input: InstructorApplicationsInquiry,
  ): Promise<InstructorApplications>

L182 public async getInstructorApplicationByAdmin(
    adminId: MongoId,
    applicationId: MongoId,
  ): Promise<InstructorApplication>

L196 public async approveInstructorApplicationByAdmin(
    adminId: MongoId,
    applicationId: MongoId,
  ): Promise<InstructorApplication>

L236 public async rejectInstructorApplicationByAdmin(
    adminId: MongoId,
    input: InstructorApplicationReject,
  ): Promise<InstructorApplication>

L273 private async assertActiveRole(
    memberId: MongoId,
    role?: MemberType,
    session?: ClientSession,
  ): Promise<Member>

L292 private async pendingApplication(
    applicationId: MongoId,
    session: ClientSession,
  ): Promise<InstructorApplication>
```

### `apps/skiresort-api/src/components/like/like.module.ts`

```typescript
L6 @Module({
    imports: [MongooseModule.forFeature([
        {
            name: "Like",
            schema: LikeSchema
        }
    ])],

    providers: [LikeService],
    exports: [LikeService]
}) class LikeModule
```

### `apps/skiresort-api/src/components/like/like.service.ts`

```typescript
L18 export interface LikeChange {
  modifier: number;
  undo: () => Promise<void>;
}

L23 @Injectable() class LikeService

L25 constructor(@InjectModel('Like') private readonly likeModel: Model<Like>)

L27 public async toggleLike(input: LikeInput): Promise<number>

L31 public async toggleLikeWithChange(input: LikeInput): Promise<LikeChange>

L72 public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]>

L80 public async getFavoriteResorts(
    memberId: ObjectId | Types.ObjectId,
    input: ResortHistoryInquiry,
  ): Promise<Resorts>

L137 public async getFavoriteEquipments(
    memberId: ObjectId | Types.ObjectId,
    input: EquipmentHistoryInquiry,
  ): Promise<Equipments>
```

### `apps/skiresort-api/src/components/member/member.module.ts`

```typescript
L12 @Module({
    imports: [
        MongooseModule.forFeature([{ name: "Member", schema: MemberSchema }]),
        MongooseModule.forFeature([{ name: "Follow", schema: FollowSchema }]),
        AuthModule,
    ResortModule,
        ViewModule,
        LikeModule
    ],
    providers: [MemberResolver, MemberService],
    exports: [MemberService]
}) class MemberModule
```

### `apps/skiresort-api/src/components/member/member.resolver.ts`

```typescript
L24 @Resolver() class MemberResolver

L26 constructor(private readonly memberService: MemberService)

L28 @Mutation(() => Member)
    public async signup(@Args("input") input: MemberInput): Promise<Member>

L35 @Mutation(() => Member)
    public async login(@Args("input") input: LoginInput): Promise<Member>

L41 @UseGuards(AuthGuard)
    @Query(() => String)
    public async chechAuth(@AuthMember("memberNick") memberNick: string): Promise<String>

L48 @Roles(MemberType.INSTRUCTOR, MemberType.USER)
    @UseGuards(RolesGuard)
    @UseGuards(AuthGuard)
    @Query(() => String)
    public async chechAuthRoles(@AuthMember() authMember: Member): Promise<String>

L59 @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async updateMember(
        @Args("input") input: MemberUpdate,
        @AuthMember("_id") memberId: ObjectId): Promise<Member>

L71 @UseGuards(WithoutGuard)
    @Query(() => Member)
    public async getMember(@Args("memberId") input: string, @AuthMember("_id") memberId: ObjectId): Promise<Member>

L81 @UseGuards(WithoutGuard)
    @Query(() => Members)
  public async getInstructors(
    @Args('input') input: InstructorsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Members>

L92 @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async likeTargetMember(@Args("memberId") input: string,
        @AuthMember("_id") memberId: ObjectId
    ): Promise<Member>

L103 @Roles(MemberType.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @Mutation(() => Member)
  public async updateInstructorProfile(
    @Args('input') input: InstructorProfileUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member>

L116 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Query(() => Members)
    public async getAllMembersByAdmin(@Args("input") input: MembersInquiry): Promise<Members>

L125 @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(() => Member)
    public async updateMemberByAdmin(@Args("input") input: MemberUpdate): Promise<Member>

L137 @UseGuards(AuthGuard)
    @Mutation((returns) => String)
    public async imageUploader(
        @Args({ name: 'file', type: () => GraphQLUpload })
        { createReadStream, filename, mimetype }: FileUpload,
        @Args('target') target: string,
    ): Promise<string>

L151 @UseGuards(AuthGuard)
    @Mutation((returns) => [String])
    public async imagesUploader(
        @Args('files', { type: () => [GraphQLUpload] })
        files: Promise<FileUpload>[],
        @Args('target') target: string,
    ): Promise<string[]>
```

### `apps/skiresort-api/src/components/member/member.service.ts`

```typescript
L36 @Injectable() class MemberService

L39 constructor(
        @InjectModel("Member") private readonly memberModel: Model<Member>,
        @InjectModel("Follow") private readonly followModel: Model<Follower | Following>,
        private authService: AuthService,
        private viewService: ViewService,
        private likeService: LikeService,
    private resortService: ResortService,
    )

L48 public async signup(input: MemberInput): Promise<Member>

L73 public async login(input: LoginInput): Promise<Member>

L108 public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member>

L130 public async getMember(memberId: ObjectId | null, targetId: ObjectId): Promise<Member>

L174 private async checkSubscription(followerId: ObjectId, followingId: ObjectId): Promise<MeFollowed[]>

L183 public async getInstructors(
    memberId: ObjectId,
    input: InstructorsInquiry,
  ): Promise<Members>

L221 public async likeTargetMember(memberId: ObjectId, likeRefId: ObjectId): Promise<Member>

L250 public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members>

L280 public async updateMemberByAdmin(input: MemberUpdate): Promise<Member>

L312 public async promoteMemberToInstructor(
    memberId: ObjectId | Types.ObjectId,
    application: InstructorApplication,
    session: ClientSession,
  ): Promise<Member>

L349 public async updateInstructorProfile(
    memberId: ObjectId,
    input: InstructorProfileUpdate,
  ): Promise<Member>

L394 private generalProfileFields(input: MemberUpdate): Record<string, unknown>

L411 public async memberStatsEditor(input: StatisticModifier): Promise<Member>
```

### `apps/skiresort-api/src/components/resort/resort.module.ts`

```typescript
L10 @Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Resort', schema: ResortSchema }]),
    AuthModule,
    LikeModule,
    ViewModule,
  ],
  providers: [ResortResolver, ResortService],
  exports: [ResortService],
}) class ResortModule
```

### `apps/skiresort-api/src/components/resort/resort.resolver.ts`

```typescript
L24 @Resolver() class ResortResolver

L26 constructor(private readonly resortService: ResortService)

L28 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Resort)
  createResort(
    @Args('input') input: ResortInput,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Resort>

L38 @UseGuards(WithoutGuard)
  @Query(() => Resort)
  getResort(
    @Args('resortId') resortId: string,
    @AuthMember('_id') memberId: Types.ObjectId | null,
  ): Promise<Resort>

L50 @UseGuards(WithoutGuard)
  @Query(() => Resorts)
  getResorts(
    @Args('input') input: ResortsInquiry,
    @AuthMember('_id') memberId: Types.ObjectId | null,
  ): Promise<Resorts>

L59 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Resorts)
  getAllResortsByAdmin(
    @Args('input') input: AllResortsInquiry,
  ): Promise<Resorts>

L68 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Resort)
  updateResortByAdmin(@Args('input') input: ResortUpdate): Promise<Resort>

L76 @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Resort)
  removeResortByAdmin(@Args('resortId') resortId: string): Promise<Resort>

L85 @UseGuards(AuthGuard)
  @Mutation(() => Resort)
  likeTargetResort(
    @Args('resortId') resortId: string,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Resort>

L97 @UseGuards(AuthGuard)
  @Query(() => Resorts)
  getFavoriteResorts(
    @Args('input') input: ResortsInquiry,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Resorts>

L106 @UseGuards(AuthGuard)
  @Query(() => Resorts)
  getVisitedResorts(
    @Args('input') input: ResortsInquiry,
    @AuthMember('_id') memberId: Types.ObjectId,
  ): Promise<Resorts>
```

### `apps/skiresort-api/src/components/resort/resort.service.ts`

```typescript
L67 @Injectable() class ResortService

L69 private readonly logger = new Logger(ResortService.name);

L71 constructor(
    @InjectModel('Resort') private readonly resortModel: Model<Resort>,
    private readonly likeService: LikeService,
    private readonly viewService: ViewService,
  )

L77 public async createResort(
    memberId: MongoId,
    input: ResortInput,
  ): Promise<Resort>

L112 public async assertVisibleResort(resortId: MongoId): Promise<Resort>

L121 public async getResort(
    memberId: MongoId | null,
    resortId: MongoId,
  ): Promise<Resort>

L160 public getResorts(
    memberId: MongoId | null,
    input: ResortsInquiry,
  ): Promise<Resorts>

L170 public getAllResortsByAdmin(input: AllResortsInquiry): Promise<Resorts>

L177 public async updateResortByAdmin(input: ResortUpdate): Promise<Resort>

L198 public async removeResortByAdmin(resortId: MongoId): Promise<Resort>

L207 public async likeTargetResort(
    memberId: MongoId,
    resortId: MongoId,
  ): Promise<Resort>

L230 public getFavoriteResorts(
    memberId: MongoId,
    input: ResortHistoryInquiry,
  ): Promise<Resorts>

L237 public getVisitedResorts(
    memberId: MongoId,
    input: ResortHistoryInquiry,
  ): Promise<Resorts>

L244 public async resortStatsEditor(input: {
    _id: MongoId;
    targetKey: ResortCounter;
    modifier: number;
  }): Promise<Resort>

L274 private pickContent(
    input: ResortInput | ResortUpdate,
  ): Record<string, unknown>

L284 private isDuplicateKeyError(error: unknown): boolean

L293 private duplicateResortError(): ConflictException

L299 private searchMatch(search?: ResortSearch | null): Record<string, unknown>

L322 private async listResorts(
    memberId: MongoId | null,
    input: ResortsInquiry | AllResortsInquiry,
    match: Record<string, unknown>,
  ): Promise<Resorts>

L364 private likeInput(memberId: MongoId, resortId: MongoId): LikeInput

L372 private async compensate(
    undo: () => Promise<void>,
    interaction: string,
  ): Promise<void>
```

### `apps/skiresort-api/src/components/view/view.module.ts`

```typescript
L6 @Module({
  imports: [MongooseModule.forFeature([{ name: "View", schema: ViewSchema }])],
  providers: [ViewService],
  exports: [ViewService]
}) class ViewModule
```

### `apps/skiresort-api/src/components/view/view.service.ts`

```typescript
L19 export interface ViewChange {
  record: View | null;
  undo: () => Promise<void>;
}

L24 @Injectable() class ViewService

L26 constructor(@InjectModel('View') private readonly viewModel: Model<View>)

L28 public async recordView(input: ViewInput): Promise<View | null>

L32 public async recordViewWithChange(input: ViewInput): Promise<ViewChange>

L63 public async getVisitedResorts(
    memberId: ObjectId | Types.ObjectId,
    input: ResortHistoryInquiry,
  ): Promise<Resorts>

L120 public async getVisitedEquipments(
    memberId: ObjectId | Types.ObjectId,
    input: EquipmentHistoryInquiry,
  ): Promise<Equipments>
```

### `apps/skiresort-api/src/database/database.module.ts`

```typescript
L6 @Module({
    imports: [MongooseModule.forRootAsync({
        useFactory: () => ({
            uri: process.env.NODE_ENV === "production" ? process.env.MONGO_PROD : process.env.MONGO_DEV
        }),

    })],
    exports: [MongooseModule],
}) class DatabaseModule

L16 constructor(@InjectConnection() private readonly connection: Connection)
```

### `apps/skiresort-api/src/libs/config.ts`

```typescript
L99 interface LookupAuthMemberFollowed {
    followerId: T,
    followingId: string
}
```

### `apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts`

```typescript
L8 @InputType() class BoardArticleInput

L10 @IsNotEmpty()
	@Field(() => BoardArticleCategory)
	articleCategory!: BoardArticleCategory;

L14 @IsNotEmpty()
	@Length(3, 50)
	@Field(() => String)
	articleTitle!: string;

L19 @IsNotEmpty()
	@Length(3, 250)
	@Field(() => String)
	articleContent!: string;

L24 @IsOptional()
	@Field(() => String, { nullable: true })
	articleImage?: string;

L28 memberId?: ObjectId;

L31 @InputType() class BAISearch

L33 @IsOptional()
	@Field(() => BoardArticleCategory, { nullable: true })
	articleCategory?: BoardArticleCategory;

L37 @IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;

L41 @IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;

L46 @InputType() class BoardArticlesInquiry

L48 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

L53 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;

L58 @IsOptional()
	@IsIn(availableBoardArticleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

L63 @IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

L67 @IsNotEmpty()
	@Field(() => BAISearch)
	search!: BAISearch;

L72 @InputType() class ABAISearch

L74 @IsOptional()
	@Field(() => BoardArticleStatus, { nullable: true })
	articleStatus?: BoardArticleStatus;

L78 @IsOptional()
	@Field(() => BoardArticleCategory, { nullable: true })
	articleCategory?: BoardArticleCategory;

L83 @InputType() class AllBoardArticlesInquiry

L85 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

L90 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;

L95 @IsOptional()
	@IsIn(availableBoardArticleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

L100 @IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

L104 @IsNotEmpty()
	@Field(() => ABAISearch)
	search!: ABAISearch;
```

### `apps/skiresort-api/src/libs/dto/board-article/board-article.ts`

```typescript
L7 @ObjectType() class BoardArticle

L9 @Field(() => String)
	_id!: ObjectId;

L12 @Field(() => BoardArticleCategory)
	articleCategory!: BoardArticleCategory;

L15 @Field(() => BoardArticleStatus)
	articleStatus!: BoardArticleStatus;

L18 @Field(() => String)
	articleTitle!: string;

L21 @Field(() => String)
	articleContent!: string;

L24 @Field(() => String, { nullable: true })
	articleImage?: string;

L27 @Field(() => Int)
	articleViews!: number;

L30 @Field(() => Int)
	articleLikes!: number;

L33 @Field(() => Int)
	articleComments!: number;

L36 @Field(() => String)
	memberId!: ObjectId;

L39 @Field(() => Date)
	createdAt!: Date;

L42 @Field(() => Date)
	updatedAt!: Date;

L47 @Field(() => Member, { nullable: true })
	memberData?: Member;

L51 @Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[]

L56 @ObjectType() class BoardArticles

L58 @Field(() => [BoardArticle])
	list!: BoardArticle[];

L61 @Field(() => [TotalCounter], { nullable: true })
	metaCounter!: TotalCounter[];
```

### `apps/skiresort-api/src/libs/dto/board-article/board-article.update.ts`

```typescript
L6 @InputType() class BoardArticleUpdate

L8 @IsNotEmpty()
	@Field(() => String)
	_id!: ObjectId;

L12 @IsOptional()
	@Field(() => BoardArticleStatus, { nullable: true })
	articleStatus?: BoardArticleStatus;

L16 @IsOptional()
	@Length(3, 50)
	@Field(() => String, { nullable: true })
	articleTitle?: string;

L21 @IsOptional()
	@Length(3, 250)
	@Field(() => String, { nullable: true })
	articleContent?: string;

L26 @IsOptional()
	@Field(() => String, { nullable: true })
	articleImage?: string;
```

### `apps/skiresort-api/src/libs/dto/comment/comment.input.ts`

```typescript
L19 @InputType() class CommentInput

L21 @IsNotEmpty()
  @IsEnum(CommentGroup)
  @Field(() => CommentGroup)
  commentGroup!: CommentGroup;

L26 @IsNotEmpty()
  @Length(1, 100)
  @Field(() => String)
  commentContent!: string;

L31 @IsNotEmpty()
  @IsMongoId()
  @Field(() => String)
  commentRefId!: ObjectId;

L36 memberId?: ObjectId;

L39 @InputType() class CISearch

L41 @IsNotEmpty()
  @IsMongoId()
  @Field(() => String)
  commentRefId!: ObjectId;

L46 @IsOptional()
  @IsEnum(CommentGroup)
  @Field(() => CommentGroup, { nullable: true })
  commentGroup?: CommentGroup;

L52 @InputType() class CommentsInquiry

L54 @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Field(() => Int)
  page!: number;

L60 @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Field(() => Int)
  limit!: number;

L66 @IsOptional()
  @IsIn(availableCommentSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

L71 @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

L76 @IsNotEmpty()
  @ValidateNested()
  @Type(() => CISearch)
  @Field(() => CISearch)
  search!: CISearch;
```

### `apps/skiresort-api/src/libs/dto/comment/comment.ts`

```typescript
L6 @ObjectType() class Comment

L8 @Field(() => String)
	_id!: ObjectId;

L11 @Field(() => CommentStatus)
	commentStatus!: CommentStatus;

L14 @Field(() => CommentGroup)
	commentGroup!: CommentGroup;

L17 @Field(() => String)
	commentContent!: string;

L20 @Field(() => String)
	commentRefId!: ObjectId;

L23 @Field(() => String)
	memberId!: ObjectId;

L26 @Field(() => Date)
	createdAt!: Date;

L29 @Field(() => Date)
	updatedAt!: Date;

L34 @Field(() => Member, { nullable: true })
	memberData?: Member;

L38 @ObjectType() class Comments

L40 @Field(() => [Comment])
	list!: Comment[];

L43 @Field(() => [TotalCounter], { nullable: true })
	metaCounter!: TotalCounter[];
```

### `apps/skiresort-api/src/libs/dto/comment/comment.update.ts`

```typescript
L6 @InputType() class CommentUpdate

L8 @IsNotEmpty()
	@Field(() => String)
	_id!: ObjectId;

L12 @IsOptional()
	@Field(() => CommentStatus, { nullable: true })
	commentStatus?: CommentStatus;

L16 @IsOptional()
	@Length(1, 100)
	@Field(() => String, { nullable: true })
	commentContent?: string;
```

### `apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts`

```typescript
L38 @InputType() class EquipmentRentalRateInput

L40 @IsInt() @Min(1) @Max(2147483647) @Field(() => Int) durationHours!: number;

L41 @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float)
  price!: number;

L46 @InputType() class EquipmentInput

L48 @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  resortId?: string | null;

L53 @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EquipmentStatus)
  @Field(() => EquipmentStatus, {
    nullable: true,
    defaultValue: EquipmentStatus.AVAILABLE,
  })
  equipmentStatus?: EquipmentStatus = EquipmentStatus.AVAILABLE;

L61 @IsEnum(EquipmentCategory)
  @Field(() => EquipmentCategory)
  equipmentCategory!: EquipmentCategory;

L65 @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  equipmentName!: string;

L71 @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  equipmentBrand?: string | null;

L78 @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  equipmentSize?: string | null;

L84 @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EquipmentAudience)
  @Field(() => EquipmentAudience, {
    nullable: true,
    defaultValue: EquipmentAudience.ALL,
  })
  equipmentAudience?: EquipmentAudience = EquipmentAudience.ALL;

L92 @IsArray()
  @ArrayMinSize(1)
  @Type(() => EquipmentRentalRateInput)
  @ValidateNested({ each: true })
  @Field(() => [EquipmentRentalRateInput])
  equipmentRentalRates!: EquipmentRentalRateInput[];

L99 @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  equipmentPurchasable?: boolean = false;

L104 @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  equipmentPurchasePrice?: number | null;

L110 @IsInt()
  @Min(0)
  @Max(2147483647)
  @Field(() => Int)
  equipmentQuantity!: number;

L116 @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  equipmentImages?: string[] | null;

L122 @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  equipmentDesc?: string | null;

L127 @InputType() class EquipmentPricesRange

L129 @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float)
  start!: number;

L133 @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float)
  end!: number;

L138 @InputType() class EquipmentSearch

L140 @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  resortId?: string;

L144 @IsOptional()
  @IsArray()
  @IsEnum(EquipmentCategory, { each: true })
  @Field(() => [EquipmentCategory], { nullable: true })
  categoryList?: EquipmentCategory[];

L149 @IsOptional()
  @IsArray()
  @IsEnum(EquipmentAudience, { each: true })
  @Field(() => [EquipmentAudience], { nullable: true })
  audienceList?: EquipmentAudience[];

L154 @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  sizeList?: string[];

L159 @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  equipmentBrand?: string;

L165 @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  text?: string;

L169 @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  equipmentPurchasable?: boolean;

L173 @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2147483647)
  @Field(() => Int, { nullable: true })
  rentalDurationHours?: number;

L179 @IsOptional()
  @IsObject()
  @Type(() => EquipmentPricesRange)
  @ValidateNested()
  @Field(() => EquipmentPricesRange, { nullable: true })
  rentalPricesRange?: EquipmentPricesRange;

L185 @IsOptional()
  @IsObject()
  @Type(() => EquipmentPricesRange)
  @ValidateNested()
  @Field(() => EquipmentPricesRange, { nullable: true })
  purchasePricesRange?: EquipmentPricesRange;

L192 @InputType() class AllEquipmentSearch extends EquipmentSearch

L194 @IsOptional()
  @IsEnum(EquipmentStatus)
  @Field(() => EquipmentStatus, { nullable: true })
  equipmentStatus?: EquipmentStatus;

L199 @InputType() class EquipmentHistoryInquiry

L201 @IsInt() @Min(1) @Field(() => Int) page!: number;

L202 @IsInt() @Min(1) @Max(100) @Field(() => Int) limit!: number;

L205 @InputType() class EquipmentsInquiry extends EquipmentHistoryInquiry

L207 @IsOptional()
  @IsIn(availableEquipmentSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

L211 @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

L215 @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => EquipmentSearch)
  @ValidateNested()
  @Field(() => EquipmentSearch, { nullable: true })
  search: EquipmentSearch = new EquipmentSearch();

L223 @InputType() class AllEquipmentsInquiry extends EquipmentHistoryInquiry

L225 @IsOptional()
  @IsIn(availableEquipmentSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

L229 @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

L233 @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => AllEquipmentSearch)
  @ValidateNested()
  @Field(() => AllEquipmentSearch, { nullable: true })
  search: AllEquipmentSearch = new AllEquipmentSearch();
```

### `apps/skiresort-api/src/libs/dto/equipment/equipment.ts`

```typescript
L10 @ObjectType() class EquipmentRentalRate

L12 @Field(() => Int) durationHours!: number;

L13 @Field(() => Float) price!: number;

L15 @ObjectType() class Equipment

L17 @Field(() => String) _id!: Types.ObjectId;

L18 @Field(() => String, { nullable: true }) resortId?: Types.ObjectId | null;

L19 @Field(() => EquipmentStatus) equipmentStatus!: EquipmentStatus;

L20 @Field(() => EquipmentCategory) equipmentCategory!: EquipmentCategory;

L21 @Field(() => String) equipmentName!: string;

L22 @Field(() => String, { nullable: true }) equipmentBrand?: string | null;

L23 @Field(() => String, { nullable: true }) equipmentSize?: string | null;

L24 @Field(() => EquipmentAudience) equipmentAudience!: EquipmentAudience;

L25 @Field(() => [EquipmentRentalRate])
  equipmentRentalRates!: EquipmentRentalRate[];

L27 @Field(() => Boolean) equipmentPurchasable!: boolean;

L28 @Field(() => Float, { nullable: true }) equipmentPurchasePrice?:
    number | null;

L30 @Field(() => Int) equipmentQuantity!: number;

L31 @Field(() => [String], { nullable: true }) equipmentImages?: string[] | null;

L32 @Field(() => String, { nullable: true }) equipmentDesc?: string | null;

L33 @Field(() => Int) equipmentViews!: number;

L34 @Field(() => Int) equipmentLikes!: number;

L35 @Field(() => Int) equipmentComments!: number;

L36 @Field(() => Date) createdAt!: Date;

L37 @Field(() => Date) updatedAt!: Date;

L38 @Field(() => Date, { nullable: true }) deletedAt?: Date | null;

L39 @Field(() => [MeLiked]) meLiked: MeLiked[] = [];

L41 @ObjectType() class Equipments

L43 @Field(() => [Equipment]) list!: Equipment[];

L44 @Field(() => [TotalCounter]) metaCounter!: TotalCounter[];
```

### `apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts`

```typescript
L29 @InputType() class EquipmentUpdate

L31 @IsMongoId() @Field(() => String) _id!: string | Types.ObjectId;

L33 @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  resortId?: string | null;

L38 @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EquipmentStatus)
  @Field(() => EquipmentStatus, { nullable: true })
  equipmentStatus?: EquipmentStatus;

L43 @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EquipmentCategory)
  @Field(() => EquipmentCategory, { nullable: true })
  equipmentCategory?: EquipmentCategory;

L48 @ValidateIf((_object, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  equipmentName?: string;

L55 @IsOptional()
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  equipmentBrand?: string | null;

L62 @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  equipmentSize?: string | null;

L68 @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EquipmentAudience)
  @Field(() => EquipmentAudience, { nullable: true })
  equipmentAudience?: EquipmentAudience;

L73 @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => EquipmentRentalRateInput)
  @ValidateNested({ each: true })
  @Field(() => [EquipmentRentalRateInput], { nullable: true })
  equipmentRentalRates?: EquipmentRentalRateInput[];

L81 @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  equipmentPurchasable?: boolean;

L86 @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  equipmentPurchasePrice?: number | null;

L92 @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  @Field(() => Int, { nullable: true })
  equipmentQuantity?: number;

L99 @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  equipmentImages?: string[] | null;

L105 @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  equipmentDesc?: string | null;
```

### `apps/skiresort-api/src/libs/dto/event/event.input.ts`

```typescript
L28 @InputType() class EventInput

L30 @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  eventTitle!: string;

L35 @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  eventDesc!: string;

L40 @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsString({ each: true })
  @Field(() => [String])
  eventImages!: string[];

L47 @IsDate() @Field(() => Date) eventStartDate!: Date;

L48 @IsDate() @Field(() => Date) eventEndDate!: Date;

L49 @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EventStatus)
  @Field(() => EventStatus, { nullable: true, defaultValue: EventStatus.DRAFT })
  eventStatus?: EventStatus;

L53 @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  eventLocation?: string | null;

L59 @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  resortId?: string | null;

L65 @InputType() class EventUpdate extends PartialType(EventInput, {
  skipNullProperties: false,
})

L69 @IsMongoId() @Field(() => String) _id!: string;

L71 @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(EventStatus)
  @Field(() => EventStatus, { nullable: true })
  eventStatus?: EventStatus;

L77 @InputType() class EventSearch

L79 @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  text?: string;

L83 @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  resortId?: string;

L89 @InputType() class AllEventSearch extends EventSearch

L91 @IsOptional()
  @IsEnum(EventStatus)
  @Field(() => EventStatus, { nullable: true })
  eventStatus?: EventStatus;

L97 @InputType({ isAbstract: true }) class EventPagination

L99 @IsInt() @Min(1) @Field(() => Int) page!: number;

L100 @IsInt() @Min(1) @Max(100) @Field(() => Int) limit!: number;

L101 @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'eventStartDate'])
  @Field(() => String, { nullable: true })
  sort?: string;

L105 @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

L111 @InputType() class EventsInquiry extends EventPagination

L113 @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => EventSearch)
  @ValidateNested()
  @Field(() => EventSearch, { nullable: true })
  search?: EventSearch;

L121 @InputType() class AllEventsInquiry extends EventPagination

L123 @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => AllEventSearch)
  @ValidateNested()
  @Field(() => AllEventSearch, { nullable: true })
  search?: AllEventSearch;
```

### `apps/skiresort-api/src/libs/dto/event/event.ts`

```typescript
L6 @ObjectType() class Event

L8 @Field(() => String) _id!: Types.ObjectId;

L9 @Field(() => String) eventTitle!: string;

L10 @Field(() => String) eventDesc!: string;

L11 @Field(() => [String]) eventImages!: string[];

L12 @Field(() => Date) eventStartDate!: Date;

L13 @Field(() => Date) eventEndDate!: Date;

L14 @Field(() => EventStatus) eventStatus!: EventStatus;

L15 @Field(() => String, { nullable: true }) eventLocation!: string | null;

L16 @Field(() => String, { nullable: true }) resortId!: Types.ObjectId | null;

L17 @Field(() => String) memberId!: Types.ObjectId;

L18 @Field(() => Date) createdAt!: Date;

L19 @Field(() => Date) updatedAt!: Date;

L22 @ObjectType() class Events

L24 @Field(() => [Event]) list!: Event[];

L25 @Field(() => [TotalCounter]) metaCounter!: TotalCounter[];
```

### `apps/skiresort-api/src/libs/dto/faq/faq.input.ts`

```typescript
L23 @InputType() class FaqInput

L25 @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  faqQuestion!: string;

L30 @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  faqAnswer!: string;

L35 @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(FaqStatus)
  @Field(() => FaqStatus, { nullable: true, defaultValue: FaqStatus.DRAFT })
  faqStatus?: FaqStatus;

L41 @InputType() class FaqUpdate extends PartialType(FaqInput, {
  skipNullProperties: false,
})

L45 @IsMongoId() @Field(() => String) _id!: string;

L47 @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(FaqStatus)
  @Field(() => FaqStatus, { nullable: true })
  faqStatus?: FaqStatus;

L53 @InputType() class FaqSearch

L55 @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  text?: string;

L61 @InputType() class AllFaqSearch extends FaqSearch

L63 @IsOptional()
  @IsEnum(FaqStatus)
  @Field(() => FaqStatus, { nullable: true })
  faqStatus?: FaqStatus;

L69 @InputType({ isAbstract: true }) class FaqPagination

L71 @IsInt() @Min(1) @Field(() => Int) page!: number;

L72 @IsInt() @Min(1) @Max(100) @Field(() => Int) limit!: number;

L73 @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  @Field(() => String, { nullable: true })
  sort?: string;

L77 @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

L83 @InputType() class FaqsInquiry extends FaqPagination

L85 @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => FaqSearch)
  @ValidateNested()
  @Field(() => FaqSearch, { nullable: true })
  search?: FaqSearch;

L93 @InputType() class AllFaqsInquiry extends FaqPagination

L95 @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => AllFaqSearch)
  @ValidateNested()
  @Field(() => AllFaqSearch, { nullable: true })
  search?: AllFaqSearch;
```

### `apps/skiresort-api/src/libs/dto/faq/faq.ts`

```typescript
L6 @ObjectType() class Faq

L8 @Field(() => String) _id!: Types.ObjectId;

L9 @Field(() => String) faqQuestion!: string;

L10 @Field(() => String) faqAnswer!: string;

L11 @Field(() => FaqStatus) faqStatus!: FaqStatus;

L12 @Field(() => String) memberId!: Types.ObjectId;

L13 @Field(() => Date) createdAt!: Date;

L14 @Field(() => Date) updatedAt!: Date;

L17 @ObjectType() class Faqs

L19 @Field(() => [Faq]) list!: Faq[];

L20 @Field(() => [TotalCounter]) metaCounter!: TotalCounter[];
```

### `apps/skiresort-api/src/libs/dto/follow/follow.input.ts`

```typescript
L5 @InputType() class FollowSearch

L7 @IsOptional()
	@Field(() => String, { nullable: true })
	followingId?: ObjectId;

L11 @IsOptional()
	@Field(() => String, { nullable: true })
	followerId?: ObjectId;

L16 @InputType() class FollowInquiry

L18 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

L23 @IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;

L28 @IsNotEmpty()
	@Field(() => FollowSearch)
	search!: FollowSearch;
```

### `apps/skiresort-api/src/libs/dto/follow/follow.ts`

```typescript
L6 @ObjectType() class MeFollowed

L8 @Field(() => String)
	followingId!: ObjectId;

L11 @Field(() => String)
	followerId!: ObjectId;

L14 @Field(() => Boolean)
	myFollowing!: boolean;

L18 @ObjectType() class Follower

L20 @Field(() => String)
	_id!: ObjectId;

L23 @Field(() => String)
	followingId!: ObjectId;

L26 @Field(() => String)
	followerId!: ObjectId;

L29 @Field(() => Date)
	createdAt!: Date;

L32 @Field(() => Date)
	updatedAt!: Date;

L37 @Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

L40 @Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];

L43 @Field(() => Member, { nullable: true })
	followerData?: Member;

L47 @ObjectType() class Following

L49 @Field(() => String)
	_id!: ObjectId;

L52 @Field(() => String)
	followingId!: ObjectId;

L55 @Field(() => String)
	followerId!: ObjectId;

L58 @Field(() => Date)
	createdAt!: Date;

L61 @Field(() => Date)
	updatedAt!: Date;

L66 @Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

L69 @Field(() => [MeFollowed], { nullable: true })
	meFollowed?: MeFollowed[];

L72 @Field(() => Member, { nullable: true })
	followingData?: Member;

L76 @ObjectType() class Followings

L78 @Field(() => [Following])
	list!: Following[];

L81 @Field(() => [TotalCounter], { nullable: true })
	metaCounter!: TotalCounter[];

L85 @ObjectType() class Followers

L87 @Field(() => [Follower])
	list!: Follower[];

L90 @Field(() => [TotalCounter], { nullable: true })
	metaCounter!: TotalCounter[];
```

### `apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts`

```typescript
L30 @InputType() class InstructorApplicationInput

L32 @IsInt()
  @Min(0)
  @Field(() => Int)
  instructorExperienceYears!: number;

L37 @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((language: unknown) =>
          typeof language === 'string' ? language.trim() : language,
        )
      : value,
  )
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Matches(/\S/, { each: true })
  @Field(() => [String])
  instructorLanguages!: string[];

L51 @IsEnum(InstructorLevel)
  @Field(() => InstructorLevel)
  instructorLevel!: InstructorLevel;

L55 @IsEnum(InstructorAudience)
  @Field(() => InstructorAudience)
  instructorAudience!: InstructorAudience;

L59 @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  instructorResortId?: string | null;

L64 @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  memberDesc?: string | null;

L70 @InputType() class InstructorApplicationSearch

L72 @IsOptional()
  @IsEnum(InstructorApplicationStatus)
  @Field(() => InstructorApplicationStatus, { nullable: true })
  applicationStatus?: InstructorApplicationStatus;

L77 @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  memberId?: string;

L83 @InputType() class InstructorApplicationsInquiry

L85 @IsInt()
  @Min(1)
  @Field(() => Int)
  page!: number;

L90 @IsInt()
  @Min(1)
  @Max(100)
  @Field(() => Int)
  limit!: number;

L96 @IsOptional()
  @IsIn(availableInstructorApplicationSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

L101 @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

L106 @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => InstructorApplicationSearch)
  @ValidateNested()
  @Field(() => InstructorApplicationSearch, { nullable: true })
  search: InstructorApplicationSearch = new InstructorApplicationSearch();

L114 @InputType() class InstructorApplicationReject

L116 @IsMongoId()
  @Field(() => String)
  _id!: string;

L120 @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  rejectionReason!: string;
```

### `apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts`

```typescript
L7 @ObjectType() class InstructorApplication

L9 @Field(() => String)
  _id!: Types.ObjectId;

L12 @Field(() => String)
  memberId!: Types.ObjectId;

L15 @Field(() => InstructorApplicationStatus)
  applicationStatus!: InstructorApplicationStatus;

L18 @Field(() => Int)
  instructorExperienceYears!: number;

L21 @Field(() => [String])
  instructorLanguages!: string[];

L24 @Field(() => InstructorLevel)
  instructorLevel!: InstructorLevel;

L27 @Field(() => InstructorAudience)
  instructorAudience!: InstructorAudience;

L30 @Field(() => String, { nullable: true })
  instructorResortId?: Types.ObjectId | null;

L33 @Field(() => String, { nullable: true })
  memberDesc?: string | null;

L36 @Field(() => String, { nullable: true })
  reviewedBy?: Types.ObjectId | null;

L39 @Field(() => Date, { nullable: true })
  reviewedAt?: Date | null;

L42 @Field(() => String, { nullable: true })
  rejectionReason?: string | null;

L45 @Field(() => Date)
  createdAt!: Date;

L48 @Field(() => Date)
  updatedAt!: Date;

L52 @ObjectType() class InstructorApplications

L54 @Field(() => [InstructorApplication])
  list!: InstructorApplication[];

L57 @Field(() => [TotalCounter], { nullable: true })
  metaCounter!: TotalCounter[];
```

### `apps/skiresort-api/src/libs/dto/like/like.input.ts`

```typescript
L6 @InputType() class LikeInput

L8 @IsNotEmpty()
	@Field(() => String)
	memberId!: ObjectId;

L12 @IsNotEmpty()
	@Field(() => String)
	likeRefId!: ObjectId;

L16 @IsNotEmpty()
	@Field(() => LikeGroup)
	likeGroup!: LikeGroup;
```

### `apps/skiresort-api/src/libs/dto/like/like.ts`

```typescript
L5 @ObjectType() class MeLiked

L7 @Field(() => String)
	memberId!: ObjectId;

L10 @Field(() => String)
	likeRefId!: ObjectId;

L13 @Field(() => Boolean)
	myFavorite!: boolean;

L17 @ObjectType() class Like

L19 @Field(() => String)
	_id!: ObjectId;

L22 @Field(() => LikeGroup)
	likeGroup!: LikeGroup;

L25 @Field(() => String)
	likeRefId!: ObjectId;

L28 @Field(() => String)
	memberId!: ObjectId;

L31 @Field(() => Date)
	createdAt!: Date;

L34 @Field(() => Date)
	updatedAt!: Date;
```

### `apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts`

```typescript
L16 @InputType() class InstructorProfileUpdate

L18 @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  instructorResortId?: string | null;

L23 @IsOptional()
  @IsInt()
  @Min(0)
  @Field(() => Int, { nullable: true })
  instructorExperienceYears?: number | null;

L29 @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((language: unknown) =>
          typeof language === 'string' ? language.trim() : language,
        )
      : value,
  )
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Matches(/\S/, { each: true })
  @Field(() => [String], { nullable: true })
  instructorLanguages?: string[] | null;

L43 @IsOptional()
  @IsEnum(InstructorLevel)
  @Field(() => InstructorLevel, { nullable: true })
  instructorLevel?: InstructorLevel | null;

L48 @IsOptional()
  @IsEnum(InstructorAudience)
  @Field(() => InstructorAudience, { nullable: true })
  instructorAudience?: InstructorAudience | null;

L53 @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  instructorPrice1Week?: number | null;

L59 @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  instructorPrice2Weeks?: number | null;

L65 @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  instructorPrice3Weeks?: number | null;

L71 @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  instructorPrice4Weeks?: number | null;
```

### `apps/skiresort-api/src/libs/dto/member/member.input.ts`

```typescript
L8 @InputType() class MemberInput

L10 @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberNick!: string

L15 @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberPassword!: string

L20 @IsNotEmpty()
    @Field(() => String)
    memberPhone!: string

L24 @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType

L28 @IsOptional()
    @Field(() => MemberAuthType, { nullable: true })
    memberAuthType?: MemberAuthType

L33 @InputType() class LoginInput

L35 @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberNick!: string

L40 @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberPassword!: string

L46 @InputType() class InstructorSearch

L48 @IsOptional()         /// ???????????????????
    @Field(() => String, { nullable: true })
    text?: string

L53 @InputType() class InstructorsInquiry

L55 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page!: number;

L60 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit!: number;

L65 @IsOptional()
  @IsIn(availableInstructorSorts)
    @Field(() => String, { nullable: true })
    sort?: string

L70 @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: string

L74 @IsNotEmpty()
  @Field(() => InstructorSearch)
  search!: InstructorSearch;

L79 @InputType() class MISearch

L81 @IsOptional()
    @Field(() => MemberStatus, { nullable: true })
    memberStatus?: MemberStatus

L85 @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType

L90 @IsOptional()         /// ???????????????????
    @Field(() => String, { nullable: true })
    text?: string

L95 @InputType() class MembersInquiry

L97 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page!: number;

L102 @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit!: number;

L107 @IsOptional()
    @IsIn(availableMemberSorts)
    @Field(() => String, { nullable: true })
    sort?: string

L112 @IsOptional()
    @Field(() => Direction, { nullable: true })
    direction?: string

L116 @IsNotEmpty()
    @Field(() => MISearch)
    search!: MISearch
```

### `apps/skiresort-api/src/libs/dto/member/member.ts`

```typescript
L14 @ObjectType() class Member

L17 @Field(() => String)
    _id!: ObjectId;

L21 @Field(() => MemberType)
    memberType!: MemberType;

L24 @Field(() => MemberStatus)
    memberStatus!: MemberStatus;

L27 @Field(() => MemberAuthType)
    memberAuthType!: MemberAuthType;

L30 @Field(() => String)
    memberPhone!: string;

L33 @Field(() => String)
    memberNick!: string;

L36 memberPassword?: string

L38 @Field(() => String, { nullable: true })
    memberFullName?: string;

L41 @Field(() => String)
    memberImage!: string;

L44 @Field(() => String, { nullable: true })
    memberAddress?: string;

L47 @Field(() => String, { nullable: true })
    memberDesc?: string;

L50 @Field(() => String, { nullable: true })
  instructorResortId?: ObjectId | null;

L53 @Field(() => Int, { nullable: true })
  instructorExperienceYears?: number | null;

L56 @Field(() => [String], { nullable: true })
  instructorLanguages?: string[] | null;

L59 @Field(() => InstructorLevel, { nullable: true })
  instructorLevel?: InstructorLevel | null;

L62 @Field(() => InstructorAudience, { nullable: true })
  instructorAudience?: InstructorAudience | null;

L65 @Field(() => Float, { nullable: true })
  instructorPrice1Week?: number | null;

L68 @Field(() => Float, { nullable: true })
  instructorPrice2Weeks?: number | null;

L71 @Field(() => Float, { nullable: true })
  instructorPrice3Weeks?: number | null;

L74 @Field(() => Float, { nullable: true })
  instructorPrice4Weeks?: number | null;

L77 @Field(() => Int)
    memberProperties!: number;

L80 @Field(() => Int)
    memberArticles!: number;

L83 @Field(() => Int)
    memberFollowers!: number;

L86 @Field(() => Int)
    memberFollowings!: number;

L89 @Field(() => Int)
    memberPoints!: number;

L92 @Field(() => Int)
    memberLikes!: number;

L95 @Field(() => Int)
    memberViews!: number;

L98 @Field(() => Int)
    memberComments!: number;

L101 @Field(() => Int)
    memberRank!: number;

L104 @Field(() => Int)
    memberWarnings!: number;

L107 @Field(() => Int)
    memberBlocks!: number;

L110 @Field(() => Date, { nullable: true })
    deletedAt?: Date;

L113 @Field(() => Date,)
    createdAt?: Date;

L116 @Field(() => Date,)
    updatedAt?: Date;

L118 @Field(() => String, { nullable: true })
    accessToken?: string;

L123 @Field(() => [MeLiked], { nullable: true })
    meLiked?: MeLiked[]

L126 @Field(() => [MeFollowed], { nullable: true })
    meFollowed?: MeFollowed[]

L132 @ObjectType() class TotalCounter

L134 @Field(() => Int, { nullable: true })
    total?: number

L138 @ObjectType() class Members

L140 @Field(() => [Member])
    list!: Member[]

L143 @Field(() => [TotalCounter], { nullable: true })
    metaCounter?: TotalCounter[]
```

### `apps/skiresort-api/src/libs/dto/member/member.update.ts`

```typescript
L5 @InputType() class MemberUpdate

L9 @IsNotEmpty()
    @Field(() => String)
    _id?: string

L14 @IsOptional()
    @Field(() => MemberType, { nullable: true })
    memberType?: MemberType

L18 @IsOptional()
    @Field(() => MemberStatus, { nullable: true })
    memberStatus?: MemberStatus

L22 @IsOptional()
    @Field(() => String, { nullable: true })
    memberPhone?: string

L26 @IsOptional()
    @Length(3, 12)
    @Field(() => String, { nullable: true })
    memberNick?: string

L31 @IsOptional()
    @Length(3, 12)
    @Field(() => String, { nullable: true })
    memberPassword?: string

L36 @IsOptional()
    @Length(3, 100)
    @Field(() => String, { nullable: true })
    memberFullName?: string

L41 @IsOptional()
    @Field(() => String, { nullable: true })
    memberImage?: string

L45 @IsOptional()
    @Field(() => String, { nullable: true })
    memberAddress?: string

L49 @IsOptional()
    @Field(() => String, { nullable: true })
    memberDesc?: string

L53 deleteAt?: Date
```

### `apps/skiresort-api/src/libs/dto/resort/resort.input.ts`

```typescript
L44 @InputType() class ResortInput

L46 @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  resortTitle!: string;

L52 @IsEnum(ResortLocation)
  @Field(() => ResortLocation)
  resortLocation!: ResortLocation;

L56 @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  resortAddress!: string;

L62 @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float)
  resortPricePerDay!: number;

L67 @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  resortMinDays = 1;

L73 @IsOptional()
  @IsEnum(ResortLevel)
  @Field(() => ResortLevel, { nullable: true })
  resortLevel?: ResortLevel | null;

L78 @IsArray()
  @IsString({ each: true })
  @Field(() => [String])
  resortImages!: string[];

L83 @IsOptional()
  @IsArray()
  @IsEnum(ResortFacilities, { each: true })
  @Field(() => [ResortFacilities], { nullable: true })
  resortFacilities?: ResortFacilities[] | null;

L89 @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  resortDesc?: string | null;

L95 @ValidatorConstraint({ name: 'orderedResortPricesRange', async: false }) class OrderedResortPricesRange implements ValidatorConstraintInterface

L97 validate(value: unknown, args: ValidationArguments): boolean

L102 defaultMessage(): string

L107 @InputType() class ResortPricesRange

L109 @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float)
  start!: number;

L114 @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Validate(OrderedResortPricesRange)
  @Field(() => Float)
  end!: number;

L121 @InputType() class ResortSearch

L123 @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  memberId?: string;

L128 @IsOptional()
  @IsArray()
  @IsEnum(ResortLocation, { each: true })
  @Field(() => [ResortLocation], { nullable: true })
  locationList?: ResortLocation[];

L134 @IsOptional()
  @IsArray()
  @IsEnum(ResortLevel, { each: true })
  @Field(() => [ResortLevel], { nullable: true })
  levelList?: ResortLevel[];

L140 @IsOptional()
  @IsArray()
  @IsEnum(ResortFacilities, { each: true })
  @Field(() => [ResortFacilities], { nullable: true })
  facilities?: ResortFacilities[];

L146 @IsOptional()
  @IsObject()
  @Type(() => ResortPricesRange)
  @ValidateNested()
  @Field(() => ResortPricesRange, { nullable: true })
  pricesRange?: ResortPricesRange;

L153 @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  text?: string;

L159 @InputType() class AllResortSearch extends ResortSearch

L161 @IsOptional()
  @IsEnum(ResortStatus)
  @Field(() => ResortStatus, { nullable: true })
  resortStatus?: ResortStatus;

L167 @InputType() class ResortHistoryInquiry

L169 @IsInt()
  @Min(1)
  @Field(() => Int)
  page!: number;

L174 @IsInt()
  @Min(1)
  @Max(100)
  @Field(() => Int)
  limit!: number;

L181 @InputType() class ResortsInquiry extends ResortHistoryInquiry

L183 @IsOptional()
  @IsIn(availableResortSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

L188 @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

L193 @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => ResortSearch)
  @ValidateNested()
  @Field(() => ResortSearch, { nullable: true })
  search: ResortSearch = new ResortSearch();

L201 @InputType() class AllResortsInquiry extends ResortHistoryInquiry

L203 @IsOptional()
  @IsIn(availableResortSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

L208 @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

L213 @ValidateIf((_object, value) => value !== undefined)
  @IsObject()
  @Type(() => AllResortSearch)
  @ValidateNested()
  @Field(() => AllResortSearch, { nullable: true })
  search: AllResortSearch = new AllResortSearch();
```

### `apps/skiresort-api/src/libs/dto/resort/resort.ts`

```typescript
L12 @ObjectType() class Resort

L14 @Field(() => String)
  _id!: Types.ObjectId;

L17 @Field(() => ResortStatus)
  resortStatus!: ResortStatus;

L20 @Field(() => String)
  resortTitle!: string;

L23 @Field(() => ResortLocation)
  resortLocation!: ResortLocation;

L26 @Field(() => String)
  resortAddress!: string;

L29 @Field(() => Float)
  resortPricePerDay!: number;

L32 @Field(() => Int)
  resortMinDays!: number;

L35 @Field(() => ResortLevel, { nullable: true })
  resortLevel?: ResortLevel | null;

L38 @Field(() => [String])
  resortImages!: string[];

L41 @Field(() => [ResortFacilities], { nullable: true })
  resortFacilities?: ResortFacilities[] | null;

L44 @Field(() => String, { nullable: true })
  resortDesc?: string | null;

L47 @Field(() => Int)
  resortViews!: number;

L50 @Field(() => Int)
  resortLikes!: number;

L53 @Field(() => Int)
  resortComments!: number;

L56 @Field(() => String)
  memberId!: Types.ObjectId;

L59 @Field(() => Date)
  createdAt!: Date;

L62 @Field(() => Date)
  updatedAt!: Date;

L65 @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;

L68 @Field(() => Member, { nullable: true })
  memberData?: Member | null;

L71 @Field(() => [MeLiked], { nullable: true })
  meLiked?: MeLiked[];

L75 @ObjectType() class Resorts

L77 @Field(() => [Resort])
  list!: Resort[];

L80 @Field(() => [TotalCounter], { nullable: true })
  metaCounter!: TotalCounter[];
```

### `apps/skiresort-api/src/libs/dto/resort/resort.update.ts`

```typescript
L26 @InputType() class ResortUpdate

L28 @IsMongoId()
  @Field(() => String)
  _id!: string | Types.ObjectId;

L32 @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(ResortStatus)
  @Field(() => ResortStatus, { nullable: true })
  resortStatus?: ResortStatus;

L37 @ValidateIf((_object, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  resortTitle?: string;

L44 @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(ResortLocation)
  @Field(() => ResortLocation, { nullable: true })
  resortLocation?: ResortLocation;

L49 @ValidateIf((_object, value) => value !== undefined)
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: true })
  resortAddress?: string;

L56 @ValidateIf((_object, value) => value !== undefined)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Field(() => Float, { nullable: true })
  resortPricePerDay?: number;

L62 @ValidateIf((_object, value) => value !== undefined)
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true })
  resortMinDays?: number;

L68 @IsOptional()
  @IsEnum(ResortLevel)
  @Field(() => ResortLevel, { nullable: true })
  resortLevel?: ResortLevel | null;

L73 @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @IsString({ each: true })
  @Field(() => [String], { nullable: true })
  resortImages?: string[];

L79 @IsOptional()
  @IsArray()
  @IsEnum(ResortFacilities, { each: true })
  @Field(() => [ResortFacilities], { nullable: true })
  resortFacilities?: ResortFacilities[] | null;

L85 @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  resortDesc?: string | null;
```

### `apps/skiresort-api/src/libs/dto/view/view.input.ts`

```typescript
L6 @InputType() class ViewInput

L9 @IsNotEmpty()
    @Field(() => String)
    memberId!: ObjectId

L13 @IsNotEmpty()
    @Field(() => String)
    viewRefId!: ObjectId

L18 @IsNotEmpty()
    @Field(() => ViewGroup)
    viewGroup!: ViewGroup
```

### `apps/skiresort-api/src/libs/dto/view/view.ts`

```typescript
L6 @ObjectType() class View

L9 @Field(() => String)
    _id!: ObjectId;

L12 @Field(() => String)
    viewGroup!: ViewGroup

L15 @Field(() => String)
    viewRefId!: ObjectId

L18 @Field(() => String)
    memberId!: ObjectId

L21 @Field(() => Date, { nullable: true })
    deletedAt?: Date;

L24 @Field(() => Date,)
    createdAt?: Date;

L27 @Field(() => Date,)
    updatedAt?: Date;
```

### `apps/skiresort-api/src/libs/enums/board-article.enum.ts`

```typescript
L3 export enum BoardArticleCategory {
	GENERAL = 'GENERAL',
	NEWS = 'NEWS',
	REVIEWS = 'REVIEWS',
	TIPS_GUIDES = 'TIPS_GUIDES',
	QUESTIONS = 'QUESTIONS',
}

L11 registerEnumType(BoardArticleCategory, {
	name: 'BoardArticleCategory',
});

L15 export enum BoardArticleStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

L20 registerEnumType(BoardArticleStatus, {
	name: 'BoardArticleStatus',
});
```

### `apps/skiresort-api/src/libs/enums/comment.enum.ts`

```typescript
L3 export enum CommentStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

L7 registerEnumType(CommentStatus, {
	name: 'CommentStatus',
});

L11 export enum CommentGroup {
	EQUIPMENT = 'EQUIPMENT',
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	RESORT = 'RESORT',
}

L17 registerEnumType(CommentGroup, {
	name: 'CommentGroup',
});
```

### `apps/skiresort-api/src/libs/enums/common.enum.ts`

```typescript
L3 export enum Message {
    SOMETHING_WENT_WRONG = 'Something went wrong!',
    NO_DATA_FOUND = 'No data found!',
    CREATE_FAILED = 'Create failed!',
    UPDATE_FAILED = 'Update failed!',
    REMOVE_FAILED = 'Remove failed!',
    UPLOAD_FAILED = 'Upload failed!',
    BAD_REQUEST = 'Bad Request',

    USED_MEMBER_NICK_OR_PHONE = "Already used member nick or phone",
    NO_MEMBER_NICK = 'No member with that member nick!',
    BLOCKED_USER = 'You have been blocked!',
    WRONG_PASSWORD = 'Wrong password, try again!',
    NOT_AUTHENTICATED = 'You are not authenticated, please login first!',
    TOKEN_NOT_EXIST = 'Bearer token is not provided!',
    ONLY_SPECIFIC_ROLES_ALLOWED = 'Allowed only for members with specific roles!',
    NOT_ALLOWED_REQUEST = 'Not Allowed Request!',
    PROVIDE_ALLOWED_FORMAT = 'Please provide jpg, jpeg or png images!',
    SELF_SUBSCRIPTION_DENIED = 'Self subscription is denied!',
}

L25 export enum Direction {
    ASC = 1,
    DESC = -1
}

L30 registerEnumType(Direction, {
    name: "Direction"
})
```

### `apps/skiresort-api/src/libs/enums/equipment.enum.ts`

```typescript
L3 export enum EquipmentCategory {
  SKI = 'SKI',
  SNOWBOARD = 'SNOWBOARD',
  BOOTS = 'BOOTS',
  HELMET = 'HELMET',
  POLES = 'POLES',
  CLOTHING = 'CLOTHING',
  OTHER = 'OTHER',
}

L12 export enum EquipmentAudience {
  KIDS = 'KIDS',
  ADULTS = 'ADULTS',
  ALL = 'ALL',
}

L17 export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
  DELETE = 'DELETE',
}

L22 registerEnumType(EquipmentCategory, { name: 'EquipmentCategory' });

L23 registerEnumType(EquipmentAudience, { name: 'EquipmentAudience' });

L24 registerEnumType(EquipmentStatus, { name: 'EquipmentStatus' });
```

### `apps/skiresort-api/src/libs/enums/event.enum.ts`

```typescript
L3 export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

L8 registerEnumType(EventStatus, { name: 'EventStatus' });
```

### `apps/skiresort-api/src/libs/enums/faq.enum.ts`

```typescript
L3 export enum FaqStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

L8 registerEnumType(FaqStatus, { name: 'FaqStatus' });
```

### `apps/skiresort-api/src/libs/enums/instructor-application.enum.ts`

```typescript
L3 export enum InstructorApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

L9 registerEnumType(InstructorApplicationStatus, {
  name: 'InstructorApplicationStatus',
});
```

### `apps/skiresort-api/src/libs/enums/like.enum.ts`

```typescript
L3 export enum LikeGroup {
  EQUIPMENT = 'EQUIPMENT',
	MEMBER = 'MEMBER',
	RESORT = 'RESORT',
	ARTICLE = 'ARTICLE',
}

L9 registerEnumType(LikeGroup, {
	name: 'LikeGroup',
});
```

### `apps/skiresort-api/src/libs/enums/member.enum.ts`

```typescript
L3 export enum MemberType {
    USER = "USER",
  INSTRUCTOR = 'INSTRUCTOR',
    ADMIN = "ADMIN"
}

L9 registerEnumType(MemberType, { name: "MemberType" })

L11 export enum InstructorLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  ALL = 'ALL',
}

L17 registerEnumType(InstructorLevel, { name: 'InstructorLevel' });

L19 export enum InstructorAudience {
  KIDS = 'KIDS',
  ADULTS = 'ADULTS',
  FAMILY = 'FAMILY',
  PRIVATE = 'PRIVATE',
}

L25 registerEnumType(InstructorAudience, { name: 'InstructorAudience' });

L27 export enum MemberStatus {
    ACTIVE = "ACTIVE",
    BLOCK = "BLOCK",
    DELETE = "DELETE"
}

L32 registerEnumType(MemberStatus, { name: "MemberStatus" })

L35 export enum MemberAuthType {
    PHONE = "PHONE",
    EMAIL = "EMAIL",
    TELEGRAPH = "TELEGRAPH"
}

L41 registerEnumType(MemberAuthType, { name: "MemberAuthType" })
```

### `apps/skiresort-api/src/libs/enums/notice.enum.ts`

```typescript
L3 export enum NoticeCategory {
	FAQ = 'FAQ',
	TERMS = 'TERMS',
	INQUIRY = 'INQUIRY',
}

L8 registerEnumType(NoticeCategory, {
	name: 'NoticeCategory',
});

L12 export enum NoticeStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}

L17 registerEnumType(NoticeStatus, {
	name: 'NoticeStatus',
});
```

### `apps/skiresort-api/src/libs/enums/notification.enum.ts`

```typescript
L3 export enum NotificationType {
	LIKE = 'LIKE',
	COMMENT = 'COMMENT',
}

L7 registerEnumType(NotificationType, {
	name: 'NotificationType',
});

L11 export enum NotificationStatus {
	WAIT = 'WAIT',
	READ = 'READ',
}

L15 registerEnumType(NotificationStatus, {
	name: 'NotificationStatus',
});

L19 export enum NotificationGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	PROPERTY = 'PROPERTY',
}

L24 registerEnumType(NotificationGroup, {
	name: 'NotificationGroup',
});
```

### `apps/skiresort-api/src/libs/enums/resort.enum.ts`

```typescript
L3 export enum ResortStatus {
  ACTIVE = 'ACTIVE',
  SOLD_OUT = 'SOLD_OUT',
  DELETE = 'DELETE',
}

L9 registerEnumType(ResortStatus, { name: 'ResortStatus' });

L11 export enum ResortLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  MIXED = 'MIXED',
}

L18 registerEnumType(ResortLevel, { name: 'ResortLevel' });

L20 export enum ResortLocation {
  PYEONGCHANG = 'PYEONGCHANG',
  JEONGSEON = 'JEONGSEON',
  HONGCHEON = 'HONGCHEON',
  CHUNCHEON = 'CHUNCHEON',
  WONJU = 'WONJU',
  HOENGSEONG = 'HOENGSEONG',
  YANGYANG = 'YANGYANG',

  // Gyeonggi
  GWANGJU_GYEONGGI = 'GWANGJU_GYEONGGI',
  ICHEON = 'ICHEON',
  POCHEON = 'POCHEON',

  // Jeonbuk
  MUJU = 'MUJU',
}

L38 registerEnumType(ResortLocation, { name: 'ResortLocation' });

L40 export enum ResortFacilities {
  SKI_LIFT = 'SKI_LIFT',
  EQUIPMENT_RENTAL = 'EQUIPMENT_RENTAL',
  SKI_SCHOOL = 'SKI_SCHOOL',
  RESTAURANT = 'RESTAURANT',
  CAFE = 'CAFE',
  ACCOMMODATION = 'ACCOMMODATION',
  PARKING = 'PARKING',
  SHUTTLE_BUS = 'SHUTTLE_BUS',
  LOCKER = 'LOCKER',
  FIRST_AID = 'FIRST_AID',
  SLED_PARK = 'SLED_PARK',
}

L54 registerEnumType(ResortFacilities, { name: 'ResortFacilities' });
```

### `apps/skiresort-api/src/libs/enums/view.enum.ts`

```typescript
L3 export enum ViewGroup {
  EQUIPMENT = 'EQUIPMENT',
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	RESORT = 'RESORT',
}

L9 registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
```

### `apps/skiresort-api/src/libs/image-upload.ts`

```typescript
L9 export interface ImageUpload {
  filename: string;
  mimetype: string;
  createReadStream: () => Readable;
}
```

### `apps/skiresort-api/src/libs/interceptor/Logging.interceptor.ts`

```typescript
L7 @Injectable() class LoggingInterceptor implements NestInterceptor

L11 private readonly logger: Logger = new Logger();

L15 intercept(context: ExecutionContext, next: CallHandler): Observable<any>

L50 private stringify(context: ExecutionContext): string
```

### `apps/skiresort-api/src/libs/types/common.ts`

```typescript
L3 export interface T {
    [key: string]: any
}

L8 export interface StatisticModifier {
    _id: ObjectId;
    targetKey: string;
    modifier: number
}
```

### `apps/skiresort-api/src/schemas/BoardArticle.model.ts`

```typescript
L4 const BoardArticleSchema = new Schema(
	{
		articleCategory: {
			type: String,
			enum: BoardArticleCategory,
			required: true,
		},

		articleStatus: {
			type: String,
			enum: BoardArticleStatus,
			default: BoardArticleStatus.ACTIVE,
		},

		articleTitle: {
			type: String,
			required: true,
		},

		articleContent: {
			type: String,
			required: true,
		},

		articleImage: {
			type: String,
		},

		articleLikes: {
			type: Number,
			default: 0,
		},

		articleViews: {
			type: Number,
			default: 0,
		},

		articleComments: {
			type: Number,
			default: 0,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'boardArticles' },
);
```

### `apps/skiresort-api/src/schemas/Comment.model.ts`

```typescript
L4 const CommentSchema = new Schema(
	{
		commentStatus: {
			type: String,
			enum: CommentStatus,
			default: CommentStatus.ACTIVE,
		},

		commentGroup: {
			type: String,
			enum: CommentGroup,
			required: true,
		},

		commentContent: {
			type: String,
			required: true,
		},

		commentRefId: {
			type: Schema.Types.ObjectId,
			required: true,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true, collection: 'comments' },
);
```

### `apps/skiresort-api/src/schemas/Equipment.model.ts`

```typescript
L16 const EquipmentRentalRateSchema = new Schema(
  {
    durationHours: { ...integer, min: 1 },
    price: { type: Number, required: true, min: 0, validate: Number.isFinite },
  },
  { _id: false },
);

L24 const EquipmentSchema = new Schema(
  {
    resortId: { type: Schema.Types.ObjectId, ref: 'Resort', default: null },
    equipmentStatus: {
      type: String,
      enum: EquipmentStatus,
      required: true,
      default: EquipmentStatus.AVAILABLE,
    },
    equipmentCategory: {
      type: String,
      enum: EquipmentCategory,
      required: true,
    },
    equipmentName: { type: String, required: true, trim: true },
    equipmentBrand: {
      type: String,
      trim: true,
      default: null,
      validate: (value: string | null) => value === null || value.length > 0,
    },
    equipmentSize: { type: String, default: null },
    equipmentAudience: {
      type: String,
      enum: EquipmentAudience,
      required: true,
      default: EquipmentAudience.ALL,
    },
    equipmentRentalRates: {
      type: [EquipmentRentalRateSchema],
      required: true,
      default: undefined,
      validate: (rates: { durationHours: number }[]) =>
        Array.isArray(rates) &&
        rates.length > 0 &&
        new Set(rates.map((rate) => rate.durationHours)).size === rates.length,
    },
    equipmentPurchasable: { type: Boolean, required: true, default: false },
    equipmentPurchasePrice: {
      type: Number,
      default: null,
      min: 0,
      validate: (value: number | null) =>
        value === null || Number.isFinite(value),
    },
    equipmentQuantity: integer,
    equipmentImages: { type: [String], default: null },
    equipmentDesc: { type: String, default: null },
    equipmentViews: { ...integer, default: 0 },
    equipmentLikes: { ...integer, default: 0 },
    equipmentComments: { ...integer, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'equipments', versionKey: false },
);

L81 EquipmentSchema.pre('validate', function () {
  try {
    this.equipmentSize = normalizeEquipmentSize(
      this.equipmentCategory,
      this.equipmentSize ?? null,
    );
  } catch {
    this.invalidate('equipmentSize', 'Invalid size for equipment category');
  }
  if (
    this.equipmentPurchasable
      ? this.equipmentPurchasePrice == null
      : this.equipmentPurchasePrice != null
  ) {
    this.invalidate(
      'equipmentPurchasePrice',
      'Purchase price must match purchasable capability',
    );
  }
  if (this.equipmentRentalRates)
    this.equipmentRentalRates.sort((a, b) => a.durationHours - b.durationHours);
});
```

### `apps/skiresort-api/src/schemas/Event.model.ts`

```typescript
L4 const EventSchema = new Schema(
  {
    eventTitle: { type: String, required: true, trim: true },
    eventDesc: { type: String, required: true, trim: true },
    eventImages: {
      type: [String],
      required: true,
      default: undefined,
      validate: (images: string[]) =>
        Array.isArray(images) &&
        images.length >= 1 &&
        images.length <= 5 &&
        new Set(images).size === images.length &&
        images.every((path) =>
          /^uploads\/events\/[a-zA-Z0-9_-]+\.(?:png|jpg|jpeg)$/i.test(path),
        ),
    },
    eventStartDate: { type: Date, required: true },
    eventEndDate: { type: Date, required: true },
    eventStatus: {
      type: String,
      enum: EventStatus,
      required: true,
      default: EventStatus.DRAFT,
    },
    eventLocation: {
      type: String,
      trim: true,
      default: null,
      validate: (value: string | null) => value === null || value.length > 0,
    },
    resortId: { type: Schema.Types.ObjectId, ref: 'Resort', default: null },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  },
  { collection: 'events', timestamps: true, versionKey: false },
);

L41 EventSchema.pre('validate', function () {
  if (
    this.eventStartDate &&
    this.eventEndDate &&
    this.eventEndDate <= this.eventStartDate
  )
    this.invalidate('eventEndDate', 'Event end must be after start');
});
```

### `apps/skiresort-api/src/schemas/Faq.model.ts`

```typescript
L4 const FaqSchema = new Schema(
  {
    faqQuestion: { type: String, required: true, trim: true },
    faqAnswer: { type: String, required: true, trim: true },
    faqStatus: {
      type: String,
      enum: FaqStatus,
      required: true,
      default: FaqStatus.DRAFT,
    },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  },
  { collection: 'faqs', timestamps: true, versionKey: false },
);
```

### `apps/skiresort-api/src/schemas/Follow.model.ts`

```typescript
L3 const FollowSchema = new Schema(
	{
		followingId: {
			type: Schema.Types.ObjectId,
			required: true,
		},

		followerId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true, collection: "follows" },
);

L18 FollowSchema.index({ followingId: 1, followerId: 1 }, { unique: true });
```

### `apps/skiresort-api/src/schemas/InstructorApplication.model.ts`

```typescript
L5 const InstructorApplicationSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    applicationStatus: {
      type: String,
      enum: InstructorApplicationStatus,
      required: true,
      default: InstructorApplicationStatus.PENDING,
    },
    instructorExperienceYears: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
    instructorLanguages: {
      type: [String],
      required: true,
      default: undefined,
      validate: (value: string[]) =>
        value.length > 0 &&
        value.every((language) => language.trim().length > 0),
    },
    instructorLevel: { type: String, enum: InstructorLevel, required: true },
    instructorAudience: {
      type: String,
      enum: InstructorAudience,
      required: true,
    },
    instructorResortId: {
      type: Schema.Types.ObjectId,
      ref: 'Resort',
      default: null,
    },
    memberDesc: { type: String, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'Member', default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true, collection: 'instructorApplications', versionKey: false },
);

L47 InstructorApplicationSchema.index(
  { memberId: 1 },
  {
    name: 'unique_pending_instructor_application',
    unique: true,
    partialFilterExpression: {
      applicationStatus: InstructorApplicationStatus.PENDING,
    },
  },
);
```

### `apps/skiresort-api/src/schemas/Like.model.ts`

```typescript
L4 const LikeSchema = new Schema(
	{
		likeGroup: {
			type: String,
			enum: LikeGroup,
			required: true,
		},

		likeRefId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'likes' },
);

L26 LikeSchema.index({ memberId: 1, likeRefId: 1 }, { unique: true });
```

### `apps/skiresort-api/src/schemas/Member.model.ts`

```typescript
L10 const MemberSchema = new Schema({
    memberType: {
        type: String,
        enum: MemberType,
        default: MemberType.USER
    },

    memberStatus: {
        type: String,
        enum: MemberStatus,
        default: MemberStatus.ACTIVE
    },

    memberAuthType: {
        type: String,
        enum: MemberAuthType,
        default: MemberAuthType.PHONE
    },


    memberPhone: {
        type: String,
        index: { unique: true, sparse: true },
        required: true
    },

    memberNick: {
        type: String,
        index: { unique: true, sparse: true },
        required: true
    },

    memberPassword: {
        type: String,
        select: false,
        required: true
    },

    memberFullName: {
        type: String,
    },

    memberImage: {
        type: String,
        default: ""
    },


    memberAddress: {
        type: String,
    },

    memberDesc: {
        type: String,
    },

    instructorResortId: {
      type: Schema.Types.ObjectId,
      ref: 'Resort',
      default: null,
    },
    instructorExperienceYears: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (value: number | null) =>
          value == null || Number.isInteger(value),
      },
    },
    instructorLanguages: {
      type: [String],
      default: null,
      validate: {
        validator: (value: string[] | null) =>
          value == null ||
          value.every((language) => language.trim().length > 0),
      },
    },
    instructorLevel: { type: String, enum: InstructorLevel, default: null },
    instructorAudience: {
      type: String,
      enum: InstructorAudience,
      default: null,
    },
    instructorPrice1Week: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (value: number | null) =>
          value == null || Number.isFinite(value),
      },
    },
    instructorPrice2Weeks: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (value: number | null) =>
          value == null || Number.isFinite(value),
      },
    },
    instructorPrice3Weeks: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (value: number | null) =>
          value == null || Number.isFinite(value),
      },
    },
    instructorPrice4Weeks: {
      type: Number,
      default: null,
      min: 0,
      validate: {
        validator: (value: number | null) =>
          value == null || Number.isFinite(value),
      },
    },

    memberProperties: {
        type: Number,
        default: 0
    },

    memberArticles: {
        type: Number,
        default: 0
    },

    memberFollowers: {
        type: Number,
        default: 0
    },

    memberFollowings: {
        type: Number,
        default: 0
    },

    memberPoints: {
        type: Number,
        default: 0
    },

    memberLikes: {
        type: Number,
        default: 0
    },

    memberViews: {
        type: Number,
        default: 0
    },

    memberComments: {
        type: Number,
        default: 0
    },

    memberRank: {
        type: Number,
        default: 0
    },

    memberWarnings: {
        type: Number,
        default: 0
    },

    memberBlocks: {
        type: Number,
        default: 0
    },

    deletedAt: {
        type: Date
    }
  },
    { timestamps: true, collection: "members" }

)
```

### `apps/skiresort-api/src/schemas/Notice.model.ts`

```typescript
L4 const NoticeSchema = new Schema(
	{
		noticeCategory: {
			type: String,
			enum: NoticeCategory,
			required: true,
		},

		noticeStatus: {
			type: String,
			enum: NoticeStatus,
			default: NoticeStatus.ACTIVE,
		},

		noticeTitle: {
			type: String,
			required: true,
		},

		noticeContent: {
			type: String,
			required: true,
		},
		
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'notices' },
);
```

### `apps/skiresort-api/src/schemas/Notification.model.ts`

```typescript
L4 const NotificationSchema = new Schema(
	{
		notificationType: {
			type: String,
			enum: NotificationType,
			required: true,
		},

		notificationStatus: {
			type: String,
			enum: NotificationStatus,
			default: NotificationStatus.WAIT,
		},

		notificationGroup: {
			type: String,
			enum: NotificationGroup,
			required: true,
		},

		notificationTitle: {
			type: String,
			required: true,
		},

		notificationDesc: {
			type: String,
		},

		authorId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		receiverId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		propertyId: {
			type: Schema.Types.ObjectId,
			ref: 'Property',
		},

		articleId: {
			type: Schema.Types.ObjectId,
			ref: 'BoardArticle',
		},
	},
	{ timestamps: true, collection: 'notifications' },
);
```

### `apps/skiresort-api/src/schemas/Resort.model.ts`

```typescript
L11 const ResortSchema = new Schema(
  {
    resortStatus: {
      type: String,
      enum: ResortStatus,
      required: true,
      default: ResortStatus.ACTIVE,
    },
    resortTitle: { type: String, required: true, trim: true },
    resortLocation: { type: String, enum: ResortLocation, required: true },
    resortAddress: { type: String, required: true, trim: true },
    resortPricePerDay: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isFinite,
    },
    resortMinDays: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      validate: Number.isInteger,
    },
    resortLevel: { type: String, enum: ResortLevel, default: null },
    resortImages: { type: [String], required: true, default: undefined },
    resortFacilities: {
      type: [{ type: String, enum: ResortFacilities }],
      default: null,
    },
    resortDesc: { type: String, default: null },
    resortViews: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: Number.isInteger,
    },
    resortLikes: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: Number.isInteger,
    },
    resortComments: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: Number.isInteger,
    },
    memberId: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'resorts', versionKey: false },
);

L69 ResortSchema.index(
  { resortLocation: 1, resortTitle: 1, resortAddress: 1, resortLevel: 1 },
  {
    unique: true,
    name: 'unique_resort_identity_with_level',
    collation: resortIdentityCollation,
  },
);
```

### `apps/skiresort-api/src/schemas/View.model.ts`

```typescript
L4 const ViewSchema = new Schema(
	{
		viewGroup: {
			type: String,
			enum: ViewGroup,
			required: true,
		},

		viewRefId: {
			type: Schema.Types.ObjectId,
			required: true,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'views' },
);

L26 ViewSchema.index({ memberId: 1, viewRefId: 1 }, { unique: true });
```

### `apps/skiresort-api/src/socket/socket.gateway.ts`

```typescript
L10 interface MessagePayload {
  event: string;
  text: string;
  memberData: Member | null
}

L16 interface InfoPayload {
  event: string;
  totalClients: number;
  memberData: Member | null;
  action: string
}

L24 @WebSocketGateway({ transports: ['websocket'], secure: false }) class SocketGateway

L26 private logger: Logger = new Logger("SocketEventGateway")

L27 private summaryClient: number = 0

L29 private clientsAuthMap = new Map<WebSocket, Member | null>()

L30 private messagesList: MessagePayload[] = []

L33 constructor(private authService: AuthService)

L35 @WebSocketServer()
  server!: Server;

L39 public afterInit(server: Server)

L44 private async retrieveAuth(req: any): Promise<Member | null>

L57 public async handleConnection(client: WebSocket, req: any[])

L85 public async handleDisconnect(client: WebSocket)

L109 @SubscribeMessage('message')
  public async handleMessage(client: any, payload: string): Promise<void>

L135 private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload)

L144 private emitMessage(message: InfoPayload | MessagePayload)
```

### `apps/skiresort-api/src/socket/socket.module.ts`

```typescript
L5 @Module({
  imports: [AuthModule],
  providers: [SocketGateway],
}) class SocketModule
```

### `apps/skiresort-batch/src/batch.controller.ts`

```typescript
L6 @Controller() class BatchController

L8 private logger: Logger = new Logger("BatchController")

L9 constructor(private readonly batchService: BatchService)

L11 @Timeout(1000)
  handleTimeout()

L16 @Cron("00 00 01 * * *", { name: BATCH_ROLLBACK })
  public async batchRollback()

L28 @Cron('40 00 01 * * *', { name: BATCH_TOP_INSTRUCTORS })
  public async batchTopInstructors()

L45 @Get()
  getHello(): string
```

### `apps/skiresort-batch/src/batch.module.ts`

```typescript
L10 @Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: "Member", schema: MemberSchema }]),
  ],
  controllers: [BatchController],
  providers: [BatchService],
}) class BatchModule
```

### `apps/skiresort-batch/src/batch.service.ts`

```typescript
L6 @Injectable() class BatchService

L8 constructor(
    @InjectModel("Member") private readonly memberModel: Model<Member>
  )

L12 public async batchRollback(): Promise<void>

L24 public async batchTopInstructors(): Promise<void>

L42 getHello(): string
```

### `apps/skiresort-batch/src/database/database.module.ts`

```typescript
L6 @Module({
    imports: [MongooseModule.forRootAsync({
        useFactory: () => ({
            uri: process.env.NODE_ENV === "production" ? process.env.MONGO_PROD : process.env.MONGO_DEV
        }),

    })],
    exports: [MongooseModule],
}) class DatabaseModule

L16 constructor(@InjectConnection() private readonly connection: Connection)
```
