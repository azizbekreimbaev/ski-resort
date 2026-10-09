# Final source navigation

Generated from the final source on 2026-10-08. This index complements the practical explanations in [CODE_WALKTHROUGH.md](CODE_WALKTHROUGH.md). Every application source file is listed; declarations identify exact final lines. The pre-edit contract inventory retains the complete decorated fields and schema statements for comparison. Tests appear separately in SOURCE_INVENTORY.md.

A field entry shows its TypeScript declaration; follow its source link to the preceding validators/GraphQL decorators. Constructor entries identify each injected dependency; module/model wiring is explained in the walkthrough and preserved in the contract inventory.

## `apps/skiresort-api/src/app.controller.ts`

[Open source](../../apps/skiresort-api/src/app.controller.ts)

Imports: `import { Controller, Get } from '@nestjs/common';`; `import { AppService } from './app.service';`.

Class `AppController` [line 4](../../apps/skiresort-api/src/app.controller.ts#L4).

Constructor [line 6](../../apps/skiresort-api/src/app.controller.ts#L6): `private readonly appService: AppService`.

- Method `getHello(): string` [line 8](../../apps/skiresort-api/src/app.controller.ts#L8).

## `apps/skiresort-api/src/app.module.ts`

[Open source](../../apps/skiresort-api/src/app.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { ConfigModule } from '@nestjs/config';`; `import { GraphQLModule } from '@nestjs/graphql';`; `import { ApolloDriver } from '@nestjs/apollo';`; `import { AppController } from './app.controller';`; `import { AppService } from './app.service';`; `import { AppResolver } from './app.resolver';`; `import { ComponentsModule } from './components/components.module';`; `import { DatabaseModule } from './database/database.module';`; `import { T } from './libs/types/common';`; `import { SocketModule } from './socket/socket.module';`.

Class `AppModule` [line 13](../../apps/skiresort-api/src/app.module.ts#L13).

## `apps/skiresort-api/src/app.resolver.ts`

[Open source](../../apps/skiresort-api/src/app.resolver.ts)

Imports: `import { Query, Resolver } from '@nestjs/graphql';`.

Class `AppResolver` [line 3](../../apps/skiresort-api/src/app.resolver.ts#L3).

- Method `sayHello(): string` [line 5](../../apps/skiresort-api/src/app.resolver.ts#L5).

## `apps/skiresort-api/src/app.service.ts`

[Open source](../../apps/skiresort-api/src/app.service.ts)

Imports: `import { Injectable } from '@nestjs/common';`.

Class `AppService` [line 3](../../apps/skiresort-api/src/app.service.ts#L3).

- Method `getHello(): string` [line 5](../../apps/skiresort-api/src/app.service.ts#L5).

## `apps/skiresort-api/src/components/auth/auth.module.ts`

[Open source](../../apps/skiresort-api/src/components/auth/auth.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { HttpModule } from '@nestjs/axios';`; `import { JwtModule } from '@nestjs/jwt';`; `import { AuthService } from './auth.service';`.

Class `AuthModule` [line 6](../../apps/skiresort-api/src/components/auth/auth.module.ts#L6).

## `apps/skiresort-api/src/components/auth/auth.service.ts`

[Open source](../../apps/skiresort-api/src/components/auth/auth.service.ts)

Imports: `import { Injectable } from '@nestjs/common';`; `import { JwtService } from '@nestjs/jwt';`; `import * as bcrypt from 'bcryptjs';`; `import { Member } from '../../libs/dto/member/member';`; `import { T } from '../../libs/types/common';`; `import { shapeIntoMongoObjectId } from '../../libs/config';`.

Class `AuthService` [line 8](../../apps/skiresort-api/src/components/auth/auth.service.ts#L8).

Constructor [line 10](../../apps/skiresort-api/src/components/auth/auth.service.ts#L10): `private jwtService: JwtService`.

- Method `hashPassword(memberPassword: string): Promise<string>` [line 12](../../apps/skiresort-api/src/components/auth/auth.service.ts#L12).

- Method `comparePasswords( password: string, hashedPassword: string \| undefined, ): Promise<string>` [line 18](../../apps/skiresort-api/src/components/auth/auth.service.ts#L18).

- Method `createToken(member: Member): Promise<string>` [line 25](../../apps/skiresort-api/src/components/auth/auth.service.ts#L25).

- Method `verifyAuth(token: string): Promise<Member>` [line 36](../../apps/skiresort-api/src/components/auth/auth.service.ts#L36).

## `apps/skiresort-api/src/components/auth/decorators/authMember.decorator.ts`

[Open source](../../apps/skiresort-api/src/components/auth/decorators/authMember.decorator.ts)

Imports: `import { createParamDecorator, ExecutionContext } from '@nestjs/common';`.

Value/schema `AuthMember` [line 3](../../apps/skiresort-api/src/components/auth/decorators/authMember.decorator.ts#L3).

## `apps/skiresort-api/src/components/auth/decorators/roles.decorator.ts`

[Open source](../../apps/skiresort-api/src/components/auth/decorators/roles.decorator.ts)

Imports: `import { SetMetadata } from '@nestjs/common';`.

Value/schema `Roles` [line 3](../../apps/skiresort-api/src/components/auth/decorators/roles.decorator.ts#L3).

## `apps/skiresort-api/src/components/auth/guards/auth.guard.ts`

[Open source](../../apps/skiresort-api/src/components/auth/guards/auth.guard.ts)

Imports: `import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException, } from '@nestjs/common';`; `import { AuthService } from '../auth.service';`; `import { Message } from '../../../libs/enums/common.enum';`.

Class `AuthGuard` [line 11](../../apps/skiresort-api/src/components/auth/guards/auth.guard.ts#L11).

Constructor [line 13](../../apps/skiresort-api/src/components/auth/guards/auth.guard.ts#L13): `private authService: AuthService`.

- Method `canActivate(context: ExecutionContext \| any): Promise<boolean>` [line 15](../../apps/skiresort-api/src/components/auth/guards/auth.guard.ts#L15).

## `apps/skiresort-api/src/components/auth/guards/roles.guard.ts`

[Open source](../../apps/skiresort-api/src/components/auth/guards/roles.guard.ts)

Imports: `import { BadRequestException, CanActivate, ExecutionContext, Injectable, ForbiddenException, } from '@nestjs/common';`; `import { Reflector } from '@nestjs/core';`; `import { AuthService } from '../auth.service';`; `import { Message } from '../../../libs/enums/common.enum';`.

Class `RolesGuard` [line 12](../../apps/skiresort-api/src/components/auth/guards/roles.guard.ts#L12).

Constructor [line 14](../../apps/skiresort-api/src/components/auth/guards/roles.guard.ts#L14): `private reflector: Reflector`; `private authService: AuthService`.

- Method `canActivate(context: ExecutionContext \| any): Promise<boolean>` [line 19](../../apps/skiresort-api/src/components/auth/guards/roles.guard.ts#L19).

## `apps/skiresort-api/src/components/auth/guards/without.guard.ts`

[Open source](../../apps/skiresort-api/src/components/auth/guards/without.guard.ts)

Imports: `import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';`; `import { AuthService } from '../auth.service';`.

Class `WithoutGuard` [line 4](../../apps/skiresort-api/src/components/auth/guards/without.guard.ts#L4).

Constructor [line 6](../../apps/skiresort-api/src/components/auth/guards/without.guard.ts#L6): `private authService: AuthService`.

- Method `canActivate(context: ExecutionContext \| any): Promise<boolean>` [line 8](../../apps/skiresort-api/src/components/auth/guards/without.guard.ts#L8).

## `apps/skiresort-api/src/components/board-article/board-article.module.ts`

[Open source](../../apps/skiresort-api/src/components/board-article/board-article.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { MongooseModule } from '@nestjs/mongoose';`; `import { BoardArticleResolver } from './board-article.resolver';`; `import { BoardArticleService } from './board-article.service';`; `import BoardArticleSchema from '../../schemas/BoardArticle.model';`; `import { AuthModule } from '../auth/auth.module';`; `import { ViewModule } from '../view/view.module';`; `import { MemberModule } from '../member/member.module';`; `import { LikeModule } from '../like/like.module';`.

Class `BoardArticleModule` [line 11](../../apps/skiresort-api/src/components/board-article/board-article.module.ts#L11).

## `apps/skiresort-api/src/components/board-article/board-article.resolver.ts`

[Open source](../../apps/skiresort-api/src/components/board-article/board-article.resolver.ts)

Imports: `import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';`; `import { UseGuards } from '@nestjs/common';`; `import type { ObjectId } from 'mongoose';`; `import { BoardArticleService } from './board-article.service';`; `import { BoardArticle, BoardArticles, } from '../../libs/dto/board-article/board-article';`; `import { AllBoardArticlesInquiry, BoardArticleInput, BoardArticlesInquiry, } from '../../libs/dto/board-article/board-article.input';`; `import { AuthMember } from '../auth/decorators/authMember.decorator';`; `import { AuthGuard } from '../auth/guards/auth.guard';`; `import { shapeIntoMongoObjectId } from '../../libs/config';`; `import { WithoutGuard } from '../auth/guards/without.guard';`; `import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';`; `import { MemberType } from '../../libs/enums/member.enum';`; `import { Roles } from '../auth/decorators/roles.decorator';`; `import { RolesGuard } from '../auth/guards/roles.guard';`.

Class `BoardArticleResolver` [line 23](../../apps/skiresort-api/src/components/board-article/board-article.resolver.ts#L23).

Constructor [line 25](../../apps/skiresort-api/src/components/board-article/board-article.resolver.ts#L25): `private readonly boardArticleService: BoardArticleService`.

- Method `createBoardArticle( @Args('input') input: BoardArticleInput, @AuthMember('_id') memberId: ObjectId, ): Promise<BoardArticle>` [line 27](../../apps/skiresort-api/src/components/board-article/board-article.resolver.ts#L27).

- Method `getBoardArticle( @Args('articleId') input: string, @AuthMember('_id') memberId: ObjectId, ): Promise<BoardArticle>` [line 37](../../apps/skiresort-api/src/components/board-article/board-article.resolver.ts#L37).

- Method `updateBoardArticle( @Args('input') input: BoardArticleUpdate, @AuthMember('_id') memberId: ObjectId, ): Promise<BoardArticle>` [line 48](../../apps/skiresort-api/src/components/board-article/board-article.resolver.ts#L48).

- Method `getBoardArticles( @Args('input') input: BoardArticlesInquiry, @AuthMember('_id') memberId: ObjectId, ): Promise<BoardArticles>` [line 59](../../apps/skiresort-api/src/components/board-article/board-article.resolver.ts#L59).

- Method `likeTargetBoardArticle( @Args('articleId') input: string, @AuthMember('_id') memberId: ObjectId, ): Promise<BoardArticle>` [line 69](../../apps/skiresort-api/src/components/board-article/board-article.resolver.ts#L69).

- Method `getAllBoardArticlesByAdmin( @Args('input') input: AllBoardArticlesInquiry, @AuthMember('_id') memberId: ObjectId, ): Promise<BoardArticles>` [line 85](../../apps/skiresort-api/src/components/board-article/board-article.resolver.ts#L85).

- Method `updateBoardArticleByAdmin( @Args('input') input: BoardArticleUpdate, @AuthMember('_id') memberId: ObjectId, ): Promise<BoardArticle>` [line 96](../../apps/skiresort-api/src/components/board-article/board-article.resolver.ts#L96).

- Method `removeBoardArticleByAdmin( @Args('articleId') input: string, @AuthMember('_id') memberId: ObjectId, ): Promise<BoardArticle>` [line 108](../../apps/skiresort-api/src/components/board-article/board-article.resolver.ts#L108).

## `apps/skiresort-api/src/components/board-article/board-article.service.ts`

[Open source](../../apps/skiresort-api/src/components/board-article/board-article.service.ts)

Imports: `import { BadRequestException, Injectable, InternalServerErrorException, } from '@nestjs/common';`; `import { InjectModel } from '@nestjs/mongoose';`; `import { Model } from 'mongoose';`; `import type { ObjectId } from 'mongoose';`; `import { BoardArticle, BoardArticles, } from '../../libs/dto/board-article/board-article';`; `import { AllBoardArticlesInquiry, BoardArticleInput, BoardArticlesInquiry, } from '../../libs/dto/board-article/board-article.input';`; `import { Direction, Message } from '../../libs/enums/common.enum';`; `import { MemberService } from '../member/member.service';`; `import { ViewService } from '../view/view.service';`; `import { BoardArticleStatus } from '../../libs/enums/board-article.enum';`; `import { ViewGroup } from '../../libs/enums/view.enum';`; `import { StatisticModifier, T } from '../../libs/types/common';`; `import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';`; `import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId, } from '../../libs/config';`; `import { LikeService } from '../like/like.service';`; `import { LikeInput } from '../../libs/dto/like/like.input';`; `import { LikeGroup } from '../../libs/enums/like.enum';`.

Class `BoardArticleService` [line 34](../../apps/skiresort-api/src/components/board-article/board-article.service.ts#L34).

Constructor [line 36](../../apps/skiresort-api/src/components/board-article/board-article.service.ts#L36): `@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>`; `private memberService: MemberService`; `private viewService: ViewService`; `private likeService: LikeService`.

- Method `createBoardArticle( memberId: ObjectId, input: BoardArticleInput, ): Promise<BoardArticle>` [line 44](../../apps/skiresort-api/src/components/board-article/board-article.service.ts#L44).

- Method `getBoardArticle( memberId: ObjectId, articleId: ObjectId, ): Promise<BoardArticle>` [line 69](../../apps/skiresort-api/src/components/board-article/board-article.service.ts#L69).

- Method `boardArticleStatsEditor( input: StatisticModifier, ): Promise<BoardArticle>` [line 122](../../apps/skiresort-api/src/components/board-article/board-article.service.ts#L122).

- Method `updateBoardArticle( memberId: ObjectId, input: BoardArticleUpdate, ): Promise<BoardArticle>` [line 141](../../apps/skiresort-api/src/components/board-article/board-article.service.ts#L141).

- Method `getBoardArticles( memberId: ObjectId, input: BoardArticlesInquiry, ): Promise<BoardArticles>` [line 174](../../apps/skiresort-api/src/components/board-article/board-article.service.ts#L174).

- Method `likeTargetBoardArticle( memberId: ObjectId, likeRefId: ObjectId, ): Promise<BoardArticle>` [line 225](../../apps/skiresort-api/src/components/board-article/board-article.service.ts#L225).

- Method `getAllBoardArticlesByAdmin( input: AllBoardArticlesInquiry, ): Promise<BoardArticles>` [line 255](../../apps/skiresort-api/src/components/board-article/board-article.service.ts#L255).

- Method `updateBoardArticleByAdmin( input: BoardArticleUpdate, ): Promise<BoardArticle>` [line 292](../../apps/skiresort-api/src/components/board-article/board-article.service.ts#L292).

- Method `removeBoardArticleByAdmin( articleId: ObjectId, ): Promise<BoardArticle>` [line 320](../../apps/skiresort-api/src/components/board-article/board-article.service.ts#L320).

## `apps/skiresort-api/src/components/comment/comment.module.ts`

[Open source](../../apps/skiresort-api/src/components/comment/comment.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { MongooseModule } from '@nestjs/mongoose';`; `import { EquipmentModule } from '../equipment/equipment.module';`; `import { CommentResolver } from './comment.resolver';`; `import { CommentService } from './comment.service';`; `import { AuthModule } from '../auth/auth.module';`; `import { MemberModule } from '../member/member.module';`; `import CommentSchema from '../../schemas/Comment.model';`; `import { ResortModule } from '../resort/resort.module';`; `import { BoardArticleModule } from '../board-article/board-article.module';`.

Class `CommentModule` [line 12](../../apps/skiresort-api/src/components/comment/comment.module.ts#L12).

## `apps/skiresort-api/src/components/comment/comment.resolver.ts`

[Open source](../../apps/skiresort-api/src/components/comment/comment.resolver.ts)

Imports: `import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';`; `import { UseGuards } from '@nestjs/common';`; `import type { ObjectId } from 'mongoose';`; `import { CommentService } from './comment.service';`; `import { CommentInput, CommentsInquiry, } from '../../libs/dto/comment/comment.input';`; `import { CommentUpdate } from '../../libs/dto/comment/comment.update';`; `import { shapeIntoMongoObjectId, validateMongoObjectId, } from '../../libs/config';`; `import { Comment, Comments } from '../../libs/dto/comment/comment';`; `import { AuthMember } from '../auth/decorators/authMember.decorator';`; `import { AuthGuard } from '../auth/guards/auth.guard';`; `import { WithoutGuard } from '../auth/guards/without.guard';`; `import { MemberType } from '../../libs/enums/member.enum';`; `import { Roles } from '../auth/decorators/roles.decorator';`; `import { RolesGuard } from '../auth/guards/roles.guard';`.

Class `CommentResolver` [line 23](../../apps/skiresort-api/src/components/comment/comment.resolver.ts#L23).

Constructor [line 25](../../apps/skiresort-api/src/components/comment/comment.resolver.ts#L25): `private readonly commentService: CommentService`.

- Method `createComment( @Args('input') input: CommentInput, @AuthMember('_id') memberId: ObjectId, ): Promise<Comment>` [line 27](../../apps/skiresort-api/src/components/comment/comment.resolver.ts#L27).

- Method `updateComment( @Args('input') input: CommentUpdate, @AuthMember('_id') memberId: ObjectId, ): Promise<Comment>` [line 37](../../apps/skiresort-api/src/components/comment/comment.resolver.ts#L37).

- Method `getComments( @Args('input') input: CommentsInquiry, @AuthMember('_id') memberId: ObjectId, ): Promise<Comments>` [line 48](../../apps/skiresort-api/src/components/comment/comment.resolver.ts#L48).

- Method `removeCommentByAdmin( @Args('commentId') input: string, ): Promise<Comment>` [line 63](../../apps/skiresort-api/src/components/comment/comment.resolver.ts#L63).

## `apps/skiresort-api/src/components/comment/comment.service.ts`

[Open source](../../apps/skiresort-api/src/components/comment/comment.service.ts)

Imports: `import { BadRequestException, Injectable, InternalServerErrorException, Logger, } from '@nestjs/common';`; `import { InjectModel } from '@nestjs/mongoose';`; `import { Model, ObjectId } from 'mongoose';`; `import { EquipmentService } from '../equipment/equipment.service';`; `import { MemberService } from '../member/member.service';`; `import { ResortService } from '../resort/resort.service';`; `import { BoardArticleService } from '../board-article/board-article.service';`; `import { CommentInput, CommentsInquiry, } from '../../libs/dto/comment/comment.input';`; `import { Direction, Message } from '../../libs/enums/common.enum';`; `import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';`; `import { CommentUpdate } from '../../libs/dto/comment/comment.update';`; `import { Comment, Comments } from '../../libs/dto/comment/comment';`; `import { lookupMember, validateMongoObjectId } from '../../libs/config';`; `import { T } from '../../libs/types/common';`.

Class `CommentService` [line 25](../../apps/skiresort-api/src/components/comment/comment.service.ts#L25).

- Field `logger = new Logger(CommentService.name);` [line 27](../../apps/skiresort-api/src/components/comment/comment.service.ts#L27).

Constructor [line 29](../../apps/skiresort-api/src/components/comment/comment.service.ts#L29): `@InjectModel('Comment') private readonly commentModel: Model<Comment>`; `private readonly memberService: MemberService`; `private readonly resortService: ResortService`; `private readonly boardArticleService: BoardArticleService`; `private readonly equipmentService: EquipmentService`.

- Method `createComment( memberId: ObjectId, input: CommentInput, ): Promise<Comment>` [line 37](../../apps/skiresort-api/src/components/comment/comment.service.ts#L37).

- Method `updateComment( memberId: ObjectId, input: CommentUpdate, ): Promise<Comment>` [line 147](../../apps/skiresort-api/src/components/comment/comment.service.ts#L147).

- Method `getComments( memberId: ObjectId, input: CommentsInquiry, ): Promise<Comments>` [line 167](../../apps/skiresort-api/src/components/comment/comment.service.ts#L167).

- Method `removeCommentByAdmin(input: ObjectId): Promise<Comment>` [line 211](../../apps/skiresort-api/src/components/comment/comment.service.ts#L211).

## `apps/skiresort-api/src/components/components.module.ts`

[Open source](../../apps/skiresort-api/src/components/components.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { MemberModule } from './member/member.module';`; `import { ResortModule } from './resort/resort.module';`; `import { EquipmentModule } from './equipment/equipment.module';`; `import { EventModule } from './event/event.module';`; `import { FaqModule } from './faq/faq.module';`; `import { AuthModule } from './auth/auth.module';`; `import { CommentModule } from './comment/comment.module';`; `import { LikeModule } from './like/like.module';`; `import { ViewModule } from './view/view.module';`; `import { FollowModule } from './follow/follow.module';`; `import { BoardArticleModule } from './board-article/board-article.module';`; `import { InstructorApplicationModule } from './instructor-application/instructor-application.module';`.

Class `ComponentsModule` [line 15](../../apps/skiresort-api/src/components/components.module.ts#L15).

## `apps/skiresort-api/src/components/equipment/equipment-size.ts`

[Open source](../../apps/skiresort-api/src/components/equipment/equipment-size.ts)

Imports: `import { BadRequestException } from '@nestjs/common';`; `import { EquipmentCategory } from '../../libs/enums/equipment.enum';`.

Value/schema `labels` [line 4](../../apps/skiresort-api/src/components/equipment/equipment-size.ts#L4).

Value/schema `numeric` [line 22](../../apps/skiresort-api/src/components/equipment/equipment-size.ts#L22).

Declaration `normalizeEquipmentSize` [line 24](../../apps/skiresort-api/src/components/equipment/equipment-size.ts#L24).

## `apps/skiresort-api/src/components/equipment/equipment.module.ts`

[Open source](../../apps/skiresort-api/src/components/equipment/equipment.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { MongooseModule } from '@nestjs/mongoose';`; `import EquipmentSchema from '../../schemas/Equipment.model';`; `import MemberSchema from '../../schemas/Member.model';`; `import { AuthModule } from '../auth/auth.module';`; `import { ResortModule } from '../resort/resort.module';`; `import { LikeModule } from '../like/like.module';`; `import { ViewModule } from '../view/view.module';`; `import { EquipmentResolver } from './equipment.resolver';`; `import { EquipmentService } from './equipment.service';`.

Class `EquipmentModule` [line 11](../../apps/skiresort-api/src/components/equipment/equipment.module.ts#L11).

## `apps/skiresort-api/src/components/equipment/equipment.resolver.ts`

[Open source](../../apps/skiresort-api/src/components/equipment/equipment.resolver.ts)

Imports: `import { UseGuards } from '@nestjs/common';`; `import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';`; `import type { Types } from 'mongoose';`; `import { shapeIntoMongoObjectId, validateMongoObjectId, } from '../../libs/config';`; `import { Equipment, Equipments } from '../../libs/dto/equipment/equipment';`; `import { AllEquipmentsInquiry, EquipmentHistoryInquiry, EquipmentInput, EquipmentsInquiry, } from '../../libs/dto/equipment/equipment.input';`; `import { EquipmentUpdate } from '../../libs/dto/equipment/equipment.update';`; `import { MemberType } from '../../libs/enums/member.enum';`; `import { AuthMember } from '../auth/decorators/authMember.decorator';`; `import { Roles } from '../auth/decorators/roles.decorator';`; `import { AuthGuard } from '../auth/guards/auth.guard';`; `import { RolesGuard } from '../auth/guards/roles.guard';`; `import { WithoutGuard } from '../auth/guards/without.guard';`; `import { EquipmentService } from './equipment.service';`.

Class `EquipmentResolver` [line 24](../../apps/skiresort-api/src/components/equipment/equipment.resolver.ts#L24).

Constructor [line 26](../../apps/skiresort-api/src/components/equipment/equipment.resolver.ts#L26): `private readonly equipmentService: EquipmentService`.

- Method `createEquipment( @Args('input') input: EquipmentInput, @AuthMember('_id') memberId: Types.ObjectId, ): Promise<Equipment>` [line 28](../../apps/skiresort-api/src/components/equipment/equipment.resolver.ts#L28).

- Method `getEquipment( @Args('equipmentId') equipmentId: string, @AuthMember('_id') memberId: Types.ObjectId \| null, ): Promise<Equipment>` [line 38](../../apps/skiresort-api/src/components/equipment/equipment.resolver.ts#L38).

- Method `getEquipments( @Args('input') input: EquipmentsInquiry, @AuthMember('_id') memberId: Types.ObjectId \| null, ): Promise<Equipments>` [line 50](../../apps/skiresort-api/src/components/equipment/equipment.resolver.ts#L50).

- Method `getAllEquipmentsByAdmin( @Args('input') input: AllEquipmentsInquiry, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Equipments>` [line 59](../../apps/skiresort-api/src/components/equipment/equipment.resolver.ts#L59).

- Method `updateEquipmentByAdmin( @Args('input') input: EquipmentUpdate, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Equipment>` [line 69](../../apps/skiresort-api/src/components/equipment/equipment.resolver.ts#L69).

- Method `removeEquipmentByAdmin( @Args('equipmentId') equipmentId: string, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Equipment>` [line 80](../../apps/skiresort-api/src/components/equipment/equipment.resolver.ts#L80).

- Method `likeTargetEquipment( @Args('equipmentId') equipmentId: string, @AuthMember('_id') memberId: Types.ObjectId, ): Promise<Equipment>` [line 93](../../apps/skiresort-api/src/components/equipment/equipment.resolver.ts#L93).

- Method `getFavoriteEquipments( @Args('input') input: EquipmentHistoryInquiry, @AuthMember('_id') memberId: Types.ObjectId, ): Promise<Equipments>` [line 105](../../apps/skiresort-api/src/components/equipment/equipment.resolver.ts#L105).

- Method `getVisitedEquipments( @Args('input') input: EquipmentsInquiry, @AuthMember('_id') memberId: Types.ObjectId, ): Promise<Equipments>` [line 114](../../apps/skiresort-api/src/components/equipment/equipment.resolver.ts#L114).

## `apps/skiresort-api/src/components/equipment/equipment.service.ts`

[Open source](../../apps/skiresort-api/src/components/equipment/equipment.service.ts)

Imports: `import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException, } from '@nestjs/common';`; `import { InjectModel } from '@nestjs/mongoose';`; `import { plainToInstance } from 'class-transformer';`; `import { validateSync } from 'class-validator';`; `import { Model, Types } from 'mongoose';`; `import type { ObjectId } from 'mongoose';`; `import { AllEquipmentsInquiry, availableEquipmentSorts, EquipmentHistoryInquiry, EquipmentInput, EquipmentSearch, EquipmentsInquiry, } from '../../libs/dto/equipment/equipment.input';`; `import { Equipment, Equipments } from '../../libs/dto/equipment/equipment';`; `import { EquipmentUpdate } from '../../libs/dto/equipment/equipment.update';`; `import { EquipmentStatus } from '../../libs/enums/equipment.enum';`; `import { Direction } from '../../libs/enums/common.enum';`; `import { LikeGroup } from '../../libs/enums/like.enum';`; `import { ViewGroup } from '../../libs/enums/view.enum';`; `import { LikeInput } from '../../libs/dto/like/like.input';`; `import { ViewInput } from '../../libs/dto/view/view.input';`; `import { lookupAuthMemberLiked, validateMongoObjectId, } from '../../libs/config';`; `import { LikeService } from '../like/like.service';`; `import { ViewService } from '../view/view.service';`; `import { EquipmentAudience } from '../../libs/enums/equipment.enum';`; `import { MemberStatus, MemberType } from '../../libs/enums/member.enum';`; `import { Member } from '../../libs/dto/member/member';`; `import { ResortService } from '../resort/resort.service';`; `import { normalizeEquipmentSize } from './equipment-size';`.

Value/schema `visibleStatuses` [line 46](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L46).

Value/schema `contentFields` [line 47](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L47).

Class `EquipmentService` [line 63](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L63).

- Field `logger = new Logger(EquipmentService.name);` [line 65](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L65).

Constructor [line 67](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L67): `@InjectModel('Equipment') private readonly equipmentModel: Model<Equipment>`; `private readonly likeService: LikeService`; `private readonly viewService: ViewService`; `@InjectModel('Member') private readonly memberModel: Model<Member>`; `private readonly resortService: ResortService`.

- Method `createEquipment( adminId: MongoId, input: EquipmentInput, ): Promise<Equipment>` [line 75](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L75).

- Method `getEquipment( memberId: MongoId \| null, equipmentId: MongoId, ): Promise<Equipment>` [line 87](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L87).

- Method `equipmentStatsEditor(input: { _id: MongoId; targetKey: EquipmentCounter; modifier: number; }): Promise<Equipment>` [line 130](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L130).

- Method `getEquipments( memberId: MongoId \| null, input: EquipmentsInquiry, ): Promise<Equipments>` [line 162](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L162).

- Method `shapeMatchQuery( match: Record<string, unknown>, input: EquipmentsInquiry \| AllEquipmentsInquiry, ): void` [line 173](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L173).

- Method `getFavoriteEquipments( memberId: MongoId, input: EquipmentHistoryInquiry, ): Promise<Equipments>` [line 245](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L245).

- Method `getVisitedEquipments( memberId: MongoId, input: EquipmentHistoryInquiry, ): Promise<Equipments>` [line 253](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L253).

- Method `likeTargetEquipment( memberId: MongoId, equipmentId: MongoId, ): Promise<Equipment>` [line 261](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L261).

- Method `getAllEquipmentsByAdmin( adminId: MongoId, input: AllEquipmentsInquiry, ): Promise<Equipments>` [line 284](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L284).

- Method `updateEquipmentByAdmin( adminId: MongoId, input: EquipmentUpdate, ): Promise<Equipment>` [line 296](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L296).

- Method `removeEquipmentByAdmin( adminId: MongoId, equipmentId: MongoId, ): Promise<Equipment>` [line 358](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L358).

- Method `assertVisibleEquipment( equipmentId: MongoId, ): Promise<Equipment>` [line 371](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L371).

- Method `commentRemoved(equipmentId: MongoId): Promise<void>` [line 382](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L382).

- Method `assertAdmin(adminId: MongoId): Promise<void>` [line 400](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L400).

- Method `normalizeContent( input: EquipmentInput \| EquipmentUpdate \| Record<string, unknown>, ): Record<string, unknown>` [line 412](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L412).

- Method `output(equipment: Equipment): Equipment` [line 456](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L456).

- Method `validatePagination(input: EquipmentHistoryInquiry): void` [line 466](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L466).

- Method `listEquipments( memberId: MongoId \| null, input: EquipmentsInquiry \| AllEquipmentsInquiry, match: Record<string, unknown>, ): Promise<Equipments>` [line 477](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L477).

- Method `pickContent( input: EquipmentInput \| EquipmentUpdate, ): Record<string, unknown>` [line 522](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L522).

- Method `likeInput(memberId: MongoId, equipmentId: MongoId): LikeInput` [line 532](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L532).

- Method `compensate( undo: () => Promise<void>, interaction: string, ): Promise<void>` [line 540](../../apps/skiresort-api/src/components/equipment/equipment.service.ts#L540).

## `apps/skiresort-api/src/components/event/event.module.ts`

[Open source](../../apps/skiresort-api/src/components/event/event.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { MongooseModule } from '@nestjs/mongoose';`; `import EventSchema from '../../schemas/Event.model';`; `import MemberSchema from '../../schemas/Member.model';`; `import { AuthModule } from '../auth/auth.module';`; `import { ResortModule } from '../resort/resort.module';`; `import { EventResolver } from './event.resolver';`; `import { EventService } from './event.service';`.

Class `EventModule` [line 10](../../apps/skiresort-api/src/components/event/event.module.ts#L10).

## `apps/skiresort-api/src/components/event/event.resolver.ts`

[Open source](../../apps/skiresort-api/src/components/event/event.resolver.ts)

Imports: `import { UseGuards } from '@nestjs/common';`; `import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';`; `import type { Types } from 'mongoose';`; `import { GraphQLUpload } from 'graphql-upload';`; `import type { ImageUpload } from '../../libs/image-upload';`; `import { Event, Events } from '../../libs/dto/event/event';`; `import { AllEventsInquiry, EventInput, EventsInquiry, } from '../../libs/dto/event/event.input';`; `import { EventUpdate } from '../../libs/dto/event/event.update';`; `import { MemberType } from '../../libs/enums/member.enum';`; `import { AuthMember } from '../auth/decorators/authMember.decorator';`; `import { Roles } from '../auth/decorators/roles.decorator';`; `import { RolesGuard } from '../auth/guards/roles.guard';`; `import { EventService } from './event.service';`.

Class `EventResolver` [line 19](../../apps/skiresort-api/src/components/event/event.resolver.ts#L19).

Constructor [line 21](../../apps/skiresort-api/src/components/event/event.resolver.ts#L21): `private readonly eventService: EventService`.

- Method `getEvent(@Args('eventId') eventId: string): Promise<Event>` [line 23](../../apps/skiresort-api/src/components/event/event.resolver.ts#L23).

- Method `getEvents(@Args('input') input: EventsInquiry): Promise<Events>` [line 28](../../apps/skiresort-api/src/components/event/event.resolver.ts#L28).

- Method `createEvent( @Args('input') input: EventInput, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Event>` [line 33](../../apps/skiresort-api/src/components/event/event.resolver.ts#L33).

- Method `updateEventByAdmin( @Args('input') input: EventUpdate, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Event>` [line 43](../../apps/skiresort-api/src/components/event/event.resolver.ts#L43).

- Method `removeEventByAdmin( @Args('eventId') eventId: string, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Event>` [line 53](../../apps/skiresort-api/src/components/event/event.resolver.ts#L53).

- Method `getEventByAdmin( @Args('eventId') eventId: string, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Event>` [line 63](../../apps/skiresort-api/src/components/event/event.resolver.ts#L63).

- Method `getAllEventsByAdmin( @Args('input') input: AllEventsInquiry, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Events>` [line 73](../../apps/skiresort-api/src/components/event/event.resolver.ts#L73).

- Method `uploadEventImages( // graphql-upload v13 exposes its scalar without usable ESLint type metadata. // eslint-disable-next-line @typescript-eslint/no-unsafe-return @Args('files', { type: () => [GraphQLUpload] }) files: Promise<ImageUpload>[], @AuthMember('_id') adminId: Types.ObjectId, ): Promise<string[]>` [line 83](../../apps/skiresort-api/src/components/event/event.resolver.ts#L83).

## `apps/skiresort-api/src/components/event/event.service.ts`

[Open source](../../apps/skiresort-api/src/components/event/event.service.ts)

Imports: `import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';`; `import { InjectModel } from '@nestjs/mongoose';`; `import { plainToInstance } from 'class-transformer';`; `import { validateSync } from 'class-validator';`; `import { Model, Types } from 'mongoose';`; `import type { FilterQuery } from 'mongoose';`; `import { lstat, realpath, unlink } from 'fs/promises';`; `import { resolve, dirname, extname } from 'path';`; `import { Event, Events } from '../../libs/dto/event/event';`; `import { AllEventsInquiry, AllEventSearch, EventInput, EventsInquiry, } from '../../libs/dto/event/event.input';`; `import { EventUpdate } from '../../libs/dto/event/event.update';`; `import { Member } from '../../libs/dto/member/member';`; `import { MemberStatus, MemberType } from '../../libs/enums/member.enum';`; `import { EventStatus } from '../../libs/enums/event.enum';`; `import { Direction } from '../../libs/enums/common.enum';`; `import { validateMongoObjectId } from '../../libs/config';`; `import { saveImageUpload } from '../../libs/image-upload';`; `import type { ImageUpload } from '../../libs/image-upload';`; `import { ResortService } from '../resort/resort.service';`.

Value/schema `contentFields` [line 32](../../apps/skiresort-api/src/components/event/event.service.ts#L32).

Class `EventService` [line 43](../../apps/skiresort-api/src/components/event/event.service.ts#L43).

Constructor [line 45](../../apps/skiresort-api/src/components/event/event.service.ts#L45): `@InjectModel('Event') private readonly eventModel: Model<Event>`; `@InjectModel('Member') private readonly memberModel: Model<Member>`; `private readonly resortService: ResortService`.

- Method `createEvent( adminId: Types.ObjectId, input: EventInput, ): Promise<Event>` [line 51](../../apps/skiresort-api/src/components/event/event.service.ts#L51).

- Method `getEvent(eventId: string): Promise<Event>` [line 65](../../apps/skiresort-api/src/components/event/event.service.ts#L65).

- Method `getEvents(input: EventsInquiry): Promise<Events>` [line 69](../../apps/skiresort-api/src/components/event/event.service.ts#L69).

- Method `getAllEventsByAdmin( adminId: Types.ObjectId, input: AllEventsInquiry, ): Promise<Events>` [line 73](../../apps/skiresort-api/src/components/event/event.service.ts#L73).

- Method `getEventByAdmin( adminId: Types.ObjectId, eventId: string, ): Promise<Event>` [line 81](../../apps/skiresort-api/src/components/event/event.service.ts#L81).

- Method `updateEventByAdmin( adminId: Types.ObjectId, input: EventUpdate, ): Promise<Event>` [line 89](../../apps/skiresort-api/src/components/event/event.service.ts#L89).

- Method `removeEventByAdmin( adminId: Types.ObjectId, eventId: string, ): Promise<Event>` [line 130](../../apps/skiresort-api/src/components/event/event.service.ts#L130).

- Method `uploadEventImages( adminId: Types.ObjectId, files: Promise<ImageUpload>[], ): Promise<string[]>` [line 143](../../apps/skiresort-api/src/components/event/event.service.ts#L143).

- Method `assertAdmin(adminId: Types.ObjectId): Promise<void>` [line 173](../../apps/skiresort-api/src/components/event/event.service.ts#L173).

- Method `content( input: EventInput \| EventUpdate, update = false, ): Promise<Partial<Event>>` [line 185](../../apps/skiresort-api/src/components/event/event.service.ts#L185).

- Method `validateDates(start: unknown, end: unknown): void` [line 225](../../apps/skiresort-api/src/components/event/event.service.ts#L225).

- Method `detail(eventId: string, admin: boolean): Promise<Event>` [line 236](../../apps/skiresort-api/src/components/event/event.service.ts#L236).

- Method `list( input: EventsInquiry \| AllEventsInquiry, admin: boolean, ): Promise<Events>` [line 246](../../apps/skiresort-api/src/components/event/event.service.ts#L246).

## `apps/skiresort-api/src/components/faq/faq.module.ts`

[Open source](../../apps/skiresort-api/src/components/faq/faq.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { MongooseModule } from '@nestjs/mongoose';`; `import FaqSchema from '../../schemas/Faq.model';`; `import MemberSchema from '../../schemas/Member.model';`; `import { AuthModule } from '../auth/auth.module';`; `import { FaqResolver } from './faq.resolver';`; `import { FaqService } from './faq.service';`.

Class `FaqModule` [line 9](../../apps/skiresort-api/src/components/faq/faq.module.ts#L9).

## `apps/skiresort-api/src/components/faq/faq.resolver.ts`

[Open source](../../apps/skiresort-api/src/components/faq/faq.resolver.ts)

Imports: `import { UseGuards } from '@nestjs/common';`; `import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';`; `import type { Types } from 'mongoose';`; `import { Faq, Faqs } from '../../libs/dto/faq/faq';`; `import { AllFaqsInquiry, FaqInput, FaqsInquiry, } from '../../libs/dto/faq/faq.input';`; `import { FaqUpdate } from '../../libs/dto/faq/faq.update';`; `import { MemberType } from '../../libs/enums/member.enum';`; `import { AuthMember } from '../auth/decorators/authMember.decorator';`; `import { Roles } from '../auth/decorators/roles.decorator';`; `import { RolesGuard } from '../auth/guards/roles.guard';`; `import { FaqService } from './faq.service';`.

Class `FaqResolver` [line 17](../../apps/skiresort-api/src/components/faq/faq.resolver.ts#L17).

Constructor [line 19](../../apps/skiresort-api/src/components/faq/faq.resolver.ts#L19): `private readonly faqService: FaqService`.

- Method `getFaq(@Args('faqId') faqId: string): Promise<Faq>` [line 21](../../apps/skiresort-api/src/components/faq/faq.resolver.ts#L21).

- Method `getFaqs(@Args('input') input: FaqsInquiry): Promise<Faqs>` [line 26](../../apps/skiresort-api/src/components/faq/faq.resolver.ts#L26).

- Method `createFaq( @Args('input') input: FaqInput, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Faq>` [line 31](../../apps/skiresort-api/src/components/faq/faq.resolver.ts#L31).

- Method `updateFaqByAdmin( @Args('input') input: FaqUpdate, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Faq>` [line 41](../../apps/skiresort-api/src/components/faq/faq.resolver.ts#L41).

- Method `removeFaqByAdmin( @Args('faqId') faqId: string, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Faq>` [line 51](../../apps/skiresort-api/src/components/faq/faq.resolver.ts#L51).

- Method `getFaqByAdmin( @Args('faqId') faqId: string, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Faq>` [line 61](../../apps/skiresort-api/src/components/faq/faq.resolver.ts#L61).

- Method `getAllFaqsByAdmin( @Args('input') input: AllFaqsInquiry, @AuthMember('_id') adminId: Types.ObjectId, ): Promise<Faqs>` [line 71](../../apps/skiresort-api/src/components/faq/faq.resolver.ts#L71).

## `apps/skiresort-api/src/components/faq/faq.service.ts`

[Open source](../../apps/skiresort-api/src/components/faq/faq.service.ts)

Imports: `import { BadRequestException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';`; `import { InjectModel } from '@nestjs/mongoose';`; `import { plainToInstance } from 'class-transformer';`; `import { validateSync } from 'class-validator';`; `import { Model, Types } from 'mongoose';`; `import type { FilterQuery } from 'mongoose';`; `import { Faq, Faqs } from '../../libs/dto/faq/faq';`; `import { AllFaqsInquiry, AllFaqSearch, FaqInput, FaqsInquiry, } from '../../libs/dto/faq/faq.input';`; `import { FaqUpdate } from '../../libs/dto/faq/faq.update';`; `import { Member } from '../../libs/dto/member/member';`; `import { MemberStatus, MemberType } from '../../libs/enums/member.enum';`; `import { FaqStatus } from '../../libs/enums/faq.enum';`; `import { Direction } from '../../libs/enums/common.enum';`; `import { validateMongoObjectId } from '../../libs/config';`.

Value/schema `contentFields` [line 26](../../apps/skiresort-api/src/components/faq/faq.service.ts#L26).

Class `FaqService` [line 28](../../apps/skiresort-api/src/components/faq/faq.service.ts#L28).

Constructor [line 30](../../apps/skiresort-api/src/components/faq/faq.service.ts#L30): `@InjectModel('Faq') private readonly faqModel: Model<Faq>`; `@InjectModel('Member') private readonly memberModel: Model<Member>`.

- Method `createFaq( adminId: Types.ObjectId, input: FaqInput, ): Promise<Faq>` [line 35](../../apps/skiresort-api/src/components/faq/faq.service.ts#L35).

- Method `getFaq(faqId: string): Promise<Faq>` [line 45](../../apps/skiresort-api/src/components/faq/faq.service.ts#L45).

- Method `getFaqs(input: FaqsInquiry): Promise<Faqs>` [line 49](../../apps/skiresort-api/src/components/faq/faq.service.ts#L49).

- Method `getAllFaqsByAdmin( adminId: Types.ObjectId, input: AllFaqsInquiry, ): Promise<Faqs>` [line 53](../../apps/skiresort-api/src/components/faq/faq.service.ts#L53).

- Method `getFaqByAdmin( adminId: Types.ObjectId, faqId: string, ): Promise<Faq>` [line 61](../../apps/skiresort-api/src/components/faq/faq.service.ts#L61).

- Method `updateFaqByAdmin( adminId: Types.ObjectId, input: FaqUpdate, ): Promise<Faq>` [line 69](../../apps/skiresort-api/src/components/faq/faq.service.ts#L69).

- Method `removeFaqByAdmin( adminId: Types.ObjectId, faqId: string, ): Promise<Faq>` [line 93](../../apps/skiresort-api/src/components/faq/faq.service.ts#L93).

- Method `assertAdmin(adminId: Types.ObjectId): Promise<void>` [line 106](../../apps/skiresort-api/src/components/faq/faq.service.ts#L106).

- Method `content(input: FaqInput \| FaqUpdate, update = false): Partial<Faq>` [line 118](../../apps/skiresort-api/src/components/faq/faq.service.ts#L118).

- Method `detail(faqId: string, admin: boolean): Promise<Faq>` [line 132](../../apps/skiresort-api/src/components/faq/faq.service.ts#L132).

- Method `list( input: FaqsInquiry \| AllFaqsInquiry, admin: boolean, ): Promise<Faqs>` [line 142](../../apps/skiresort-api/src/components/faq/faq.service.ts#L142).

## `apps/skiresort-api/src/components/follow/follow.module.ts`

[Open source](../../apps/skiresort-api/src/components/follow/follow.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { MongooseModule } from '@nestjs/mongoose';`; `import FollowSchema from '../../schemas/Follow.model';`; `import { AuthModule } from '../auth/auth.module';`; `import { FollowResolver } from './follow.resolver';`; `import { MemberModule } from '../member/member.module';`; `import { FollowService } from './follow.service';`.

Class `FollowModule` [line 9](../../apps/skiresort-api/src/components/follow/follow.module.ts#L9).

## `apps/skiresort-api/src/components/follow/follow.resolver.ts`

[Open source](../../apps/skiresort-api/src/components/follow/follow.resolver.ts)

Imports: `import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';`; `import { UseGuards } from '@nestjs/common';`; `import type { ObjectId } from 'mongoose';`; `import { FollowService } from './follow.service';`; `import { shapeIntoMongoObjectId } from '../../libs/config';`; `import { Follower, Followers, Followings } from '../../libs/dto/follow/follow';`; `import { AuthMember } from '../auth/decorators/authMember.decorator';`; `import { AuthGuard } from '../auth/guards/auth.guard';`; `import { FollowInquiry } from '../../libs/dto/follow/follow.input';`; `import { WithoutGuard } from '../auth/guards/without.guard';`.

Class `FollowResolver` [line 12](../../apps/skiresort-api/src/components/follow/follow.resolver.ts#L12).

Constructor [line 14](../../apps/skiresort-api/src/components/follow/follow.resolver.ts#L14): `private readonly followService: FollowService`.

- Method `subscribe( @Args('input') input: string, @AuthMember('_id') memberId: ObjectId, ): Promise<Follower>` [line 16](../../apps/skiresort-api/src/components/follow/follow.resolver.ts#L16).

- Method `unsubscribe( @Args('input') input: string, @AuthMember('_id') memberId: ObjectId, ): Promise<Follower>` [line 27](../../apps/skiresort-api/src/components/follow/follow.resolver.ts#L27).

- Method `getMemberFollowings( @Args('input') input: FollowInquiry, @AuthMember('_id') memberId: ObjectId, ): Promise<Followings>` [line 38](../../apps/skiresort-api/src/components/follow/follow.resolver.ts#L38).

- Method `getMemberFollowers( @Args('input') input: FollowInquiry, @AuthMember('_id') memberId: ObjectId, ): Promise<Followers>` [line 50](../../apps/skiresort-api/src/components/follow/follow.resolver.ts#L50).

## `apps/skiresort-api/src/components/follow/follow.service.ts`

[Open source](../../apps/skiresort-api/src/components/follow/follow.service.ts)

Imports: `import { BadRequestException, Injectable, InternalServerErrorException, } from '@nestjs/common';`; `import { InjectModel } from '@nestjs/mongoose';`; `import { Model } from 'mongoose';`; `import { ObjectId } from 'mongoose';`; `import { Follower, Followers, Following, Followings, } from '../../libs/dto/follow/follow';`; `import { MemberService } from '../member/member.service';`; `import { Direction, Message } from '../../libs/enums/common.enum';`; `import { lookupAuthMemberFollowed, lookupAuthMemberLiked, lookupFollowerData, lookupFollowingData, } from '../../libs/config';`; `import { FollowInquiry } from '../../libs/dto/follow/follow.input';`; `import { T } from '../../libs/types/common';`.

Class `FollowService` [line 26](../../apps/skiresort-api/src/components/follow/follow.service.ts#L26).

Constructor [line 28](../../apps/skiresort-api/src/components/follow/follow.service.ts#L28): `@InjectModel('Follow') private readonly followModel: Model<Follower \| Following>`; `private memberService: MemberService`.

- Method `subscribe( followerId: ObjectId, followingId: ObjectId, ): Promise<Follower>` [line 34](../../apps/skiresort-api/src/components/follow/follow.service.ts#L34).

- Method `registerSubscription( followerId: ObjectId, followingId: ObjectId, ): Promise<{ result: Follower; created: boolean }>` [line 68](../../apps/skiresort-api/src/components/follow/follow.service.ts#L68).

- Method `unsubscribe( followerId: ObjectId, followingId: ObjectId, ): Promise<Follower>` [line 94](../../apps/skiresort-api/src/components/follow/follow.service.ts#L94).

- Method `getMemberFollowings( memberId: ObjectId, input: FollowInquiry, ): Promise<Followings>` [line 124](../../apps/skiresort-api/src/components/follow/follow.service.ts#L124).

- Method `getMemberFollowers( memberId: ObjectId, input: FollowInquiry, ): Promise<Followers>` [line 164](../../apps/skiresort-api/src/components/follow/follow.service.ts#L164).

## `apps/skiresort-api/src/components/instructor-application/instructor-application.module.ts`

[Open source](../../apps/skiresort-api/src/components/instructor-application/instructor-application.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { MongooseModule } from '@nestjs/mongoose';`; `import InstructorApplicationSchema from '../../schemas/InstructorApplication.model';`; `import MemberSchema from '../../schemas/Member.model';`; `import { AuthModule } from '../auth/auth.module';`; `import { MemberModule } from '../member/member.module';`; `import { ResortModule } from '../resort/resort.module';`; `import { InstructorApplicationResolver } from './instructor-application.resolver';`; `import { InstructorApplicationService } from './instructor-application.service';`.

Class `InstructorApplicationModule` [line 11](../../apps/skiresort-api/src/components/instructor-application/instructor-application.module.ts#L11).

## `apps/skiresort-api/src/components/instructor-application/instructor-application.resolver.ts`

[Open source](../../apps/skiresort-api/src/components/instructor-application/instructor-application.resolver.ts)

Imports: `import { UseGuards } from '@nestjs/common';`; `import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';`; `import type { ObjectId } from 'mongoose';`; `import { validateMongoObjectId } from '../../libs/config';`; `import { InstructorApplication, InstructorApplications, } from '../../libs/dto/instructor-application/instructor-application';`; `import { InstructorApplicationInput, InstructorApplicationReject, InstructorApplicationsInquiry, } from '../../libs/dto/instructor-application/instructor-application.input';`; `import { MemberType } from '../../libs/enums/member.enum';`; `import { AuthMember } from '../auth/decorators/authMember.decorator';`; `import { Roles } from '../auth/decorators/roles.decorator';`; `import { AuthGuard } from '../auth/guards/auth.guard';`; `import { RolesGuard } from '../auth/guards/roles.guard';`; `import { InstructorApplicationService } from './instructor-application.service';`.

Class `InstructorApplicationResolver` [line 21](../../apps/skiresort-api/src/components/instructor-application/instructor-application.resolver.ts#L21).

Constructor [line 23](../../apps/skiresort-api/src/components/instructor-application/instructor-application.resolver.ts#L23): `private readonly applicationService: InstructorApplicationService`.

- Method `createInstructorApplication( @Args('input') input: InstructorApplicationInput, @AuthMember('_id') memberId: ObjectId, ): Promise<InstructorApplication>` [line 27](../../apps/skiresort-api/src/components/instructor-application/instructor-application.resolver.ts#L27).

- Method `getMyInstructorApplication( @AuthMember('_id') memberId: ObjectId, ): Promise<InstructorApplication \| null>` [line 37](../../apps/skiresort-api/src/components/instructor-application/instructor-application.resolver.ts#L37).

- Method `getAllInstructorApplicationsByAdmin( @Args('input') input: InstructorApplicationsInquiry, @AuthMember('_id') adminId: ObjectId, ): Promise<InstructorApplications>` [line 45](../../apps/skiresort-api/src/components/instructor-application/instructor-application.resolver.ts#L45).

- Method `getInstructorApplicationByAdmin( @Args('applicationId') applicationId: string, @AuthMember('_id') adminId: ObjectId, ): Promise<InstructorApplication>` [line 58](../../apps/skiresort-api/src/components/instructor-application/instructor-application.resolver.ts#L58).

- Method `approveInstructorApplicationByAdmin( @Args('applicationId') applicationId: string, @AuthMember('_id') adminId: ObjectId, ): Promise<InstructorApplication>` [line 71](../../apps/skiresort-api/src/components/instructor-application/instructor-application.resolver.ts#L71).

- Method `rejectInstructorApplicationByAdmin( @Args('input') input: InstructorApplicationReject, @AuthMember('_id') adminId: ObjectId, ): Promise<InstructorApplication>` [line 84](../../apps/skiresort-api/src/components/instructor-application/instructor-application.resolver.ts#L84).

## `apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts`

[Open source](../../apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts)

Imports: `import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, } from '@nestjs/common';`; `import { InjectConnection, InjectModel } from '@nestjs/mongoose';`; `import { ClientSession, Connection, Model, Types } from 'mongoose';`; `import type { ObjectId } from 'mongoose';`; `import { validateMongoObjectId } from '../../libs/config';`; `import { InstructorApplication, InstructorApplications, } from '../../libs/dto/instructor-application/instructor-application';`; `import { availableInstructorApplicationSorts, InstructorApplicationInput, InstructorApplicationReject, InstructorApplicationsInquiry, } from '../../libs/dto/instructor-application/instructor-application.input';`; `import { Member } from '../../libs/dto/member/member';`; `import { Direction, Message } from '../../libs/enums/common.enum';`; `import { InstructorApplicationStatus } from '../../libs/enums/instructor-application.enum';`; `import { MemberStatus, MemberType } from '../../libs/enums/member.enum';`; `import { MemberService } from '../member/member.service';`; `import { ResortService } from '../resort/resort.service';`.

Class `InstructorApplicationService` [line 31](../../apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts#L31).

Constructor [line 33](../../apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts#L33): `@InjectModel('InstructorApplication') private readonly applicationModel: Model<InstructorApplication>`; `@InjectModel('Member') private readonly memberModel: Model<Member>`; `@InjectConnection() private readonly connection: Connection`; `private readonly memberService: MemberService`; `private readonly resortService: ResortService`.

- Method `createInstructorApplication( memberId: MongoId, input: InstructorApplicationInput, ): Promise<InstructorApplication>` [line 42](../../apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts#L42).

- Method `getMyInstructorApplication( memberId: MongoId, ): Promise<InstructorApplication \| null>` [line 121](../../apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts#L121).

- Method `getAllInstructorApplicationsByAdmin( adminId: MongoId, input: InstructorApplicationsInquiry, ): Promise<InstructorApplications>` [line 132](../../apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts#L132).

- Method `getInstructorApplicationByAdmin( adminId: MongoId, applicationId: MongoId, ): Promise<InstructorApplication>` [line 183](../../apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts#L183).

- Method `approveInstructorApplicationByAdmin( adminId: MongoId, applicationId: MongoId, ): Promise<InstructorApplication>` [line 197](../../apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts#L197).

- Method `rejectInstructorApplicationByAdmin( adminId: MongoId, input: InstructorApplicationReject, ): Promise<InstructorApplication>` [line 237](../../apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts#L237).

- Method `assertActiveRole( memberId: MongoId, role?: MemberType, session?: ClientSession, ): Promise<Member>` [line 274](../../apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts#L274).

- Method `pendingApplication( applicationId: MongoId, session: ClientSession, ): Promise<InstructorApplication>` [line 293](../../apps/skiresort-api/src/components/instructor-application/instructor-application.service.ts#L293).

## `apps/skiresort-api/src/components/like/like.module.ts`

[Open source](../../apps/skiresort-api/src/components/like/like.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { LikeService } from './like.service';`; `import { MongooseModule } from '@nestjs/mongoose';`; `import LikeSchema from '../../schemas/Like.model';`.

Class `LikeModule` [line 6](../../apps/skiresort-api/src/components/like/like.module.ts#L6).

## `apps/skiresort-api/src/components/like/like.service.ts`

[Open source](../../apps/skiresort-api/src/components/like/like.service.ts)

Imports: `import { BadRequestException, Injectable } from '@nestjs/common';`; `import { InjectModel } from '@nestjs/mongoose';`; `import { Model, Types } from 'mongoose';`; `import type { ObjectId } from 'mongoose';`; `import { Equipment, Equipments } from '../../libs/dto/equipment/equipment';`; `import { EquipmentHistoryInquiry } from '../../libs/dto/equipment/equipment.input';`; `import { EquipmentStatus } from '../../libs/enums/equipment.enum';`; `import { Like, MeLiked } from '../../libs/dto/like/like';`; `import { LikeInput } from '../../libs/dto/like/like.input';`; `import { ResortHistoryInquiry } from '../../libs/dto/resort/resort.input';`; `import { Resort, Resorts } from '../../libs/dto/resort/resort';`; `import { TotalCounter } from '../../libs/dto/member/member';`; `import { Message } from '../../libs/enums/common.enum';`; `import { LikeGroup } from '../../libs/enums/like.enum';`; `import { ResortStatus } from '../../libs/enums/resort.enum';`; `import { lookupAuthMemberLiked, lookupFavorite } from '../../libs/config';`.

Declaration `LikeChange` [line 18](../../apps/skiresort-api/src/components/like/like.service.ts#L18).

Class `LikeService` [line 23](../../apps/skiresort-api/src/components/like/like.service.ts#L23).

Constructor [line 25](../../apps/skiresort-api/src/components/like/like.service.ts#L25): `@InjectModel('Like') private readonly likeModel: Model<Like>`.

- Method `toggleLike(input: LikeInput): Promise<number>` [line 27](../../apps/skiresort-api/src/components/like/like.service.ts#L27).

- Method `toggleLikeWithChange(input: LikeInput): Promise<LikeChange>` [line 31](../../apps/skiresort-api/src/components/like/like.service.ts#L31).

- Method `checkLikeExistence(input: LikeInput): Promise<MeLiked[]>` [line 72](../../apps/skiresort-api/src/components/like/like.service.ts#L72).

- Method `getFavoriteResorts( memberId: ObjectId \| Types.ObjectId, input: ResortHistoryInquiry, ): Promise<Resorts>` [line 80](../../apps/skiresort-api/src/components/like/like.service.ts#L80).

- Method `getFavoriteEquipments( memberId: ObjectId \| Types.ObjectId, input: EquipmentHistoryInquiry, ): Promise<Equipments>` [line 139](../../apps/skiresort-api/src/components/like/like.service.ts#L139).

## `apps/skiresort-api/src/components/member/member.module.ts`

[Open source](../../apps/skiresort-api/src/components/member/member.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { MongooseModule } from '@nestjs/mongoose';`; `import { MemberResolver } from './member.resolver';`; `import { MemberService } from './member.service';`; `import MemberSchema from '../../schemas/Member.model';`; `import { AuthModule } from '../auth/auth.module';`; `import { ViewModule } from '../view/view.module';`; `import { LikeModule } from '../like/like.module';`; `import FollowSchema from '../../schemas/Follow.model';`; `import { ResortModule } from '../resort/resort.module';`.

Class `MemberModule` [line 12](../../apps/skiresort-api/src/components/member/member.module.ts#L12).

## `apps/skiresort-api/src/components/member/member.resolver.ts`

[Open source](../../apps/skiresort-api/src/components/member/member.resolver.ts)

Imports: `import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';`; `import { UseGuards } from '@nestjs/common';`; `import type { ObjectId } from 'mongoose';`; `import { GraphQLUpload, FileUpload } from 'graphql-upload';`; `import { MemberService } from './member.service';`; `import { InstructorsInquiry, LoginInput, MemberInput, MembersInquiry, } from '../../libs/dto/member/member.input';`; `import { Member, Members } from '../../libs/dto/member/member';`; `import { AuthGuard } from '../auth/guards/auth.guard';`; `import { AuthMember } from '../auth/decorators/authMember.decorator';`; `import { Roles } from '../auth/decorators/roles.decorator';`; `import { MemberType } from '../../libs/enums/member.enum';`; `import { RolesGuard } from '../auth/guards/roles.guard';`; `import { MemberUpdate } from '../../libs/dto/member/member.update';`; `import { shapeIntoMongoObjectId } from '../../libs/config';`; `import { WithoutGuard } from '../auth/guards/without.guard';`; `import { assertGenericUploadTarget, saveImageUpload, } from '../../libs/image-upload';`; `import { InstructorProfileUpdate } from '../../libs/dto/member/instructor-profile.update';`.

Class `MemberResolver` [line 27](../../apps/skiresort-api/src/components/member/member.resolver.ts#L27).

Constructor [line 29](../../apps/skiresort-api/src/components/member/member.resolver.ts#L29): `private readonly memberService: MemberService`.

- Method `signup(@Args('input') input: MemberInput): Promise<Member>` [line 31](../../apps/skiresort-api/src/components/member/member.resolver.ts#L31).

- Method `login(@Args('input') input: LoginInput): Promise<Member>` [line 37](../../apps/skiresort-api/src/components/member/member.resolver.ts#L37).

- Method `chechAuth( @AuthMember('memberNick') memberNick: string, ): Promise<String>` [line 43](../../apps/skiresort-api/src/components/member/member.resolver.ts#L43).

- Method `chechAuthRoles( @AuthMember() authMember: Member, ): Promise<String>` [line 52](../../apps/skiresort-api/src/components/member/member.resolver.ts#L52).

- Method `updateMember( @Args('input') input: MemberUpdate, @AuthMember('_id') memberId: ObjectId, ): Promise<Member>` [line 62](../../apps/skiresort-api/src/components/member/member.resolver.ts#L62).

- Method `getMember( @Args('memberId') input: string, @AuthMember('_id') memberId: ObjectId, ): Promise<Member>` [line 73](../../apps/skiresort-api/src/components/member/member.resolver.ts#L73).

- Method `getInstructors( @Args('input') input: InstructorsInquiry, @AuthMember('_id') memberId: ObjectId, ): Promise<Members>` [line 85](../../apps/skiresort-api/src/components/member/member.resolver.ts#L85).

- Method `likeTargetMember( @Args('memberId') input: string, @AuthMember('_id') memberId: ObjectId, ): Promise<Member>` [line 95](../../apps/skiresort-api/src/components/member/member.resolver.ts#L95).

- Method `updateInstructorProfile( @Args('input') input: InstructorProfileUpdate, @AuthMember('_id') memberId: ObjectId, ): Promise<Member>` [line 106](../../apps/skiresort-api/src/components/member/member.resolver.ts#L106).

- Method `getAllMembersByAdmin( @Args('input') input: MembersInquiry, ): Promise<Members>` [line 119](../../apps/skiresort-api/src/components/member/member.resolver.ts#L119).

- Method `updateMemberByAdmin( @Args('input') input: MemberUpdate, ): Promise<Member>` [line 130](../../apps/skiresort-api/src/components/member/member.resolver.ts#L130).

- Method `imageUploader( @Args({ name: 'file', type: () => GraphQLUpload }) { createReadStream, filename, mimetype }: FileUpload, @Args('target') target: string, ): Promise<string>` [line 142](../../apps/skiresort-api/src/components/member/member.resolver.ts#L142).

- Method `imagesUploader( @Args('files', { type: () => [GraphQLUpload] }) files: Promise<FileUpload>[], @Args('target') target: string, ): Promise<string[]>` [line 156](../../apps/skiresort-api/src/components/member/member.resolver.ts#L156).

## `apps/skiresort-api/src/components/member/member.service.ts`

[Open source](../../apps/skiresort-api/src/components/member/member.service.ts)

Imports: `import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, } from '@nestjs/common';`; `import { InjectModel } from '@nestjs/mongoose';`; `import { ClientSession, Model, Types } from 'mongoose';`; `import { ObjectId } from 'mongoose';`; `import { Member, Members } from '../../libs/dto/member/member';`; `import { InstructorsInquiry, LoginInput, MemberInput, MembersInquiry, } from '../../libs/dto/member/member.input';`; `import { MemberStatus, MemberType } from '../../libs/enums/member.enum';`; `import { Direction, Message } from '../../libs/enums/common.enum';`; `import { AuthService } from '../auth/auth.service';`; `import { MemberUpdate } from '../../libs/dto/member/member.update';`; `import { StatisticModifier, T } from '../../libs/types/common';`; `import { ViewService } from '../view/view.service';`; `import { ViewInput } from '../../libs/dto/view/view.input';`; `import { ViewGroup } from '../../libs/enums/view.enum';`; `import { LikeInput } from '../../libs/dto/like/like.input';`; `import { LikeGroup } from '../../libs/enums/like.enum';`; `import { LikeService } from '../like/like.service';`; `import { Follower, Following, MeFollowed } from '../../libs/dto/follow/follow';`; `import { lookupAuthMemberFollowed, lookupAuthMemberLiked, } from '../../libs/config';`; `import { validateMongoObjectId } from '../../libs/config';`; `import { InstructorProfileUpdate } from '../../libs/dto/member/instructor-profile.update';`; `import { InstructorApplication } from '../../libs/dto/instructor-application/instructor-application';`; `import { InstructorApplicationStatus } from '../../libs/enums/instructor-application.enum';`; `import { ResortService } from '../resort/resort.service';`.

Class `MemberService` [line 40](../../apps/skiresort-api/src/components/member/member.service.ts#L40).

Constructor [line 42](../../apps/skiresort-api/src/components/member/member.service.ts#L42): `@InjectModel('Member') private readonly memberModel: Model<Member>`; `@InjectModel('Follow') private readonly followModel: Model<Follower \| Following>`; `private authService: AuthService`; `private viewService: ViewService`; `private likeService: LikeService`; `private resortService: ResortService`.

- Method `signup(input: MemberInput): Promise<Member>` [line 52](../../apps/skiresort-api/src/components/member/member.service.ts#L52).

- Method `login(input: LoginInput): Promise<Member>` [line 79](../../apps/skiresort-api/src/components/member/member.service.ts#L79).

- Method `updateMember( memberId: ObjectId, input: MemberUpdate, ): Promise<Member>` [line 112](../../apps/skiresort-api/src/components/member/member.service.ts#L112).

- Method `getMember( memberId: ObjectId \| null, targetId: ObjectId, ): Promise<Member>` [line 137](../../apps/skiresort-api/src/components/member/member.service.ts#L137).

- Method `checkSubscription( followerId: ObjectId, followingId: ObjectId, ): Promise<MeFollowed[]>` [line 190](../../apps/skiresort-api/src/components/member/member.service.ts#L190).

- Method `getInstructors( memberId: ObjectId, input: InstructorsInquiry, ): Promise<Members>` [line 212](../../apps/skiresort-api/src/components/member/member.service.ts#L212).

- Method `likeTargetMember( memberId: ObjectId, likeRefId: ObjectId, ): Promise<Member>` [line 253](../../apps/skiresort-api/src/components/member/member.service.ts#L253).

- Method `getAllMembersByAdmin(input: MembersInquiry): Promise<Members>` [line 283](../../apps/skiresort-api/src/components/member/member.service.ts#L283).

- Method `updateMemberByAdmin(input: MemberUpdate): Promise<Member>` [line 317](../../apps/skiresort-api/src/components/member/member.service.ts#L317).

- Method `promoteMemberToInstructor( memberId: ObjectId \| Types.ObjectId, application: InstructorApplication, session: ClientSession, ): Promise<Member>` [line 347](../../apps/skiresort-api/src/components/member/member.service.ts#L347).

- Method `updateInstructorProfile( memberId: ObjectId, input: InstructorProfileUpdate, ): Promise<Member>` [line 384](../../apps/skiresort-api/src/components/member/member.service.ts#L384).

- Method `generalProfileFields(input: MemberUpdate): Record<string, unknown>` [line 429](../../apps/skiresort-api/src/components/member/member.service.ts#L429).

- Method `memberStatsEditor(input: StatisticModifier): Promise<Member>` [line 446](../../apps/skiresort-api/src/components/member/member.service.ts#L446).

## `apps/skiresort-api/src/components/resort/resort.module.ts`

[Open source](../../apps/skiresort-api/src/components/resort/resort.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { MongooseModule } from '@nestjs/mongoose';`; `import ResortSchema from '../../schemas/Resort.model';`; `import { AuthModule } from '../auth/auth.module';`; `import { LikeModule } from '../like/like.module';`; `import { ViewModule } from '../view/view.module';`; `import { ResortResolver } from './resort.resolver';`; `import { ResortService } from './resort.service';`.

Class `ResortModule` [line 10](../../apps/skiresort-api/src/components/resort/resort.module.ts#L10).

## `apps/skiresort-api/src/components/resort/resort.resolver.ts`

[Open source](../../apps/skiresort-api/src/components/resort/resort.resolver.ts)

Imports: `import { UseGuards } from '@nestjs/common';`; `import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';`; `import type { Types } from 'mongoose';`; `import { shapeIntoMongoObjectId, validateMongoObjectId, } from '../../libs/config';`; `import { Resort, Resorts } from '../../libs/dto/resort/resort';`; `import { AllResortsInquiry, ResortInput, ResortsInquiry, } from '../../libs/dto/resort/resort.input';`; `import { ResortUpdate } from '../../libs/dto/resort/resort.update';`; `import { MemberType } from '../../libs/enums/member.enum';`; `import { AuthMember } from '../auth/decorators/authMember.decorator';`; `import { Roles } from '../auth/decorators/roles.decorator';`; `import { AuthGuard } from '../auth/guards/auth.guard';`; `import { RolesGuard } from '../auth/guards/roles.guard';`; `import { WithoutGuard } from '../auth/guards/without.guard';`; `import { ResortService } from './resort.service';`.

Class `ResortResolver` [line 23](../../apps/skiresort-api/src/components/resort/resort.resolver.ts#L23).

Constructor [line 25](../../apps/skiresort-api/src/components/resort/resort.resolver.ts#L25): `private readonly resortService: ResortService`.

- Method `createResort( @Args('input') input: ResortInput, @AuthMember('_id') memberId: Types.ObjectId, ): Promise<Resort>` [line 27](../../apps/skiresort-api/src/components/resort/resort.resolver.ts#L27).

- Method `getResort( @Args('resortId') resortId: string, @AuthMember('_id') memberId: Types.ObjectId \| null, ): Promise<Resort>` [line 37](../../apps/skiresort-api/src/components/resort/resort.resolver.ts#L37).

- Method `getResorts( @Args('input') input: ResortsInquiry, @AuthMember('_id') memberId: Types.ObjectId \| null, ): Promise<Resorts>` [line 49](../../apps/skiresort-api/src/components/resort/resort.resolver.ts#L49).

- Method `getAllResortsByAdmin( @Args('input') input: AllResortsInquiry, ): Promise<Resorts>` [line 58](../../apps/skiresort-api/src/components/resort/resort.resolver.ts#L58).

- Method `updateResortByAdmin( @Args('input') input: ResortUpdate, ): Promise<Resort>` [line 67](../../apps/skiresort-api/src/components/resort/resort.resolver.ts#L67).

- Method `removeResortByAdmin( @Args('resortId') resortId: string, ): Promise<Resort>` [line 77](../../apps/skiresort-api/src/components/resort/resort.resolver.ts#L77).

- Method `likeTargetResort( @Args('resortId') resortId: string, @AuthMember('_id') memberId: Types.ObjectId, ): Promise<Resort>` [line 88](../../apps/skiresort-api/src/components/resort/resort.resolver.ts#L88).

- Method `getFavoriteResorts( @Args('input') input: ResortsInquiry, @AuthMember('_id') memberId: Types.ObjectId, ): Promise<Resorts>` [line 100](../../apps/skiresort-api/src/components/resort/resort.resolver.ts#L100).

- Method `getVisitedResorts( @Args('input') input: ResortsInquiry, @AuthMember('_id') memberId: Types.ObjectId, ): Promise<Resorts>` [line 109](../../apps/skiresort-api/src/components/resort/resort.resolver.ts#L109).

## `apps/skiresort-api/src/components/resort/resort.service.ts`

[Open source](../../apps/skiresort-api/src/components/resort/resort.service.ts)

Imports: `import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, } from '@nestjs/common';`; `import { InjectModel } from '@nestjs/mongoose';`; `import { Model, PipelineStage, Types } from 'mongoose';`; `import type { ObjectId } from 'mongoose';`; `import { AllResortsInquiry, availableResortSorts, ResortHistoryInquiry, ResortInput, ResortsInquiry, } from '../../libs/dto/resort/resort.input';`; `import { Resort, Resorts } from '../../libs/dto/resort/resort';`; `import { ResortUpdate } from '../../libs/dto/resort/resort.update';`; `import { ResortStatus } from '../../libs/enums/resort.enum';`; `import { Direction } from '../../libs/enums/common.enum';`; `import { LikeGroup } from '../../libs/enums/like.enum';`; `import { ViewGroup } from '../../libs/enums/view.enum';`; `import { LikeInput } from '../../libs/dto/like/like.input';`; `import { ViewInput } from '../../libs/dto/view/view.input';`; `import { lookupAuthMemberLiked, validateMongoObjectId, } from '../../libs/config';`; `import { LikeService } from '../like/like.service';`; `import { ViewService } from '../view/view.service';`; `import { resortIdentityCollation } from '../../schemas/Resort.model';`.

Value/schema `visibleStatuses` [line 37](../../apps/skiresort-api/src/components/resort/resort.service.ts#L37).

Value/schema `contentFields` [line 38](../../apps/skiresort-api/src/components/resort/resort.service.ts#L38).

Value/schema `ownerStages` [line 51](../../apps/skiresort-api/src/components/resort/resort.service.ts#L51).

Class `ResortService` [line 66](../../apps/skiresort-api/src/components/resort/resort.service.ts#L66).

- Field `logger = new Logger(ResortService.name);` [line 68](../../apps/skiresort-api/src/components/resort/resort.service.ts#L68).

Constructor [line 70](../../apps/skiresort-api/src/components/resort/resort.service.ts#L70): `@InjectModel('Resort') private readonly resortModel: Model<Resort>`; `private readonly likeService: LikeService`; `private readonly viewService: ViewService`.

- Method `createResort( memberId: MongoId, input: ResortInput, ): Promise<Resort>` [line 76](../../apps/skiresort-api/src/components/resort/resort.service.ts#L76).

- Method `getResort( memberId: MongoId \| null, resortId: MongoId, ): Promise<Resort>` [line 111](../../apps/skiresort-api/src/components/resort/resort.service.ts#L111).

- Method `resortStatsEditor(input: { _id: MongoId; targetKey: ResortCounter; modifier: number; }): Promise<Resort>` [line 150](../../apps/skiresort-api/src/components/resort/resort.service.ts#L150).

- Method `getResorts( memberId: MongoId \| null, input: ResortsInquiry, ): Promise<Resorts>` [line 180](../../apps/skiresort-api/src/components/resort/resort.service.ts#L180).

- Method `shapeMatchQuery( match: Record<string, unknown>, input: ResortsInquiry \| AllResortsInquiry, ): void` [line 191](../../apps/skiresort-api/src/components/resort/resort.service.ts#L191).

- Method `getFavoriteResorts( memberId: MongoId, input: ResortHistoryInquiry, ): Promise<Resorts>` [line 216](../../apps/skiresort-api/src/components/resort/resort.service.ts#L216).

- Method `getVisitedResorts( memberId: MongoId, input: ResortHistoryInquiry, ): Promise<Resorts>` [line 223](../../apps/skiresort-api/src/components/resort/resort.service.ts#L223).

- Method `likeTargetResort( memberId: MongoId, resortId: MongoId, ): Promise<Resort>` [line 230](../../apps/skiresort-api/src/components/resort/resort.service.ts#L230).

- Method `getAllResortsByAdmin(input: AllResortsInquiry): Promise<Resorts>` [line 253](../../apps/skiresort-api/src/components/resort/resort.service.ts#L253).

- Method `updateResortByAdmin(input: ResortUpdate): Promise<Resort>` [line 261](../../apps/skiresort-api/src/components/resort/resort.service.ts#L261).

- Method `removeResortByAdmin(resortId: MongoId): Promise<Resort>` [line 282](../../apps/skiresort-api/src/components/resort/resort.service.ts#L282).

- Method `assertVisibleResort(resortId: MongoId): Promise<Resort>` [line 291](../../apps/skiresort-api/src/components/resort/resort.service.ts#L291).

- Method `listResorts( memberId: MongoId \| null, input: ResortsInquiry \| AllResortsInquiry, match: Record<string, unknown>, ): Promise<Resorts>` [line 300](../../apps/skiresort-api/src/components/resort/resort.service.ts#L300).

- Method `pickContent( input: ResortInput \| ResortUpdate, ): Record<string, unknown>` [line 343](../../apps/skiresort-api/src/components/resort/resort.service.ts#L343).

- Method `isDuplicateKeyError(error: unknown): boolean` [line 353](../../apps/skiresort-api/src/components/resort/resort.service.ts#L353).

- Method `duplicateResortError(): ConflictException` [line 362](../../apps/skiresort-api/src/components/resort/resort.service.ts#L362).

- Method `likeInput(memberId: MongoId, resortId: MongoId): LikeInput` [line 368](../../apps/skiresort-api/src/components/resort/resort.service.ts#L368).

- Method `compensate( undo: () => Promise<void>, interaction: string, ): Promise<void>` [line 376](../../apps/skiresort-api/src/components/resort/resort.service.ts#L376).

## `apps/skiresort-api/src/components/view/view.module.ts`

[Open source](../../apps/skiresort-api/src/components/view/view.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { ViewService } from './view.service';`; `import { MongooseModule } from '@nestjs/mongoose';`; `import ViewSchema from '../../schemas/View.model';`.

Class `ViewModule` [line 6](../../apps/skiresort-api/src/components/view/view.module.ts#L6).

## `apps/skiresort-api/src/components/view/view.service.ts`

[Open source](../../apps/skiresort-api/src/components/view/view.service.ts)

Imports: `import { BadRequestException, Injectable } from '@nestjs/common';`; `import { InjectModel } from '@nestjs/mongoose';`; `import { Model, Types } from 'mongoose';`; `import type { ObjectId } from 'mongoose';`; `import { Equipment, Equipments } from '../../libs/dto/equipment/equipment';`; `import { EquipmentHistoryInquiry } from '../../libs/dto/equipment/equipment.input';`; `import { EquipmentStatus } from '../../libs/enums/equipment.enum';`; `import { View } from '../../libs/dto/view/view';`; `import { ViewInput } from '../../libs/dto/view/view.input';`; `import { ResortHistoryInquiry } from '../../libs/dto/resort/resort.input';`; `import { Resort, Resorts } from '../../libs/dto/resort/resort';`; `import { TotalCounter } from '../../libs/dto/member/member';`; `import { lookupAuthMemberLiked, lookupVisit } from '../../libs/config';`; `import { LikeGroup } from '../../libs/enums/like.enum';`; `import { ViewGroup } from '../../libs/enums/view.enum';`; `import { ResortStatus } from '../../libs/enums/resort.enum';`; `import { Message } from '../../libs/enums/common.enum';`.

Declaration `ViewChange` [line 19](../../apps/skiresort-api/src/components/view/view.service.ts#L19).

Class `ViewService` [line 24](../../apps/skiresort-api/src/components/view/view.service.ts#L24).

Constructor [line 26](../../apps/skiresort-api/src/components/view/view.service.ts#L26): `@InjectModel('View') private readonly viewModel: Model<View>`.

- Method `recordView(input: ViewInput): Promise<View \| null>` [line 28](../../apps/skiresort-api/src/components/view/view.service.ts#L28).

- Method `recordViewWithChange(input: ViewInput): Promise<ViewChange>` [line 32](../../apps/skiresort-api/src/components/view/view.service.ts#L32).

- Method `getVisitedResorts( memberId: ObjectId \| Types.ObjectId, input: ResortHistoryInquiry, ): Promise<Resorts>` [line 63](../../apps/skiresort-api/src/components/view/view.service.ts#L63).

- Method `getVisitedEquipments( memberId: ObjectId \| Types.ObjectId, input: EquipmentHistoryInquiry, ): Promise<Equipments>` [line 122](../../apps/skiresort-api/src/components/view/view.service.ts#L122).

## `apps/skiresort-api/src/database/database.module.ts`

[Open source](../../apps/skiresort-api/src/database/database.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { InjectConnection, MongooseModule } from '@nestjs/mongoose';`; `import { Connection } from 'mongoose';`.

Class `DatabaseModule` [line 5](../../apps/skiresort-api/src/database/database.module.ts#L5).

Constructor [line 19](../../apps/skiresort-api/src/database/database.module.ts#L19): `@InjectConnection() private readonly connection: Connection`.

## `apps/skiresort-api/src/libs/config.ts`

[Open source](../../apps/skiresort-api/src/libs/config.ts)

Imports: `import { BadRequestException } from '@nestjs/common';`; `import { ObjectId } from 'bson';`; `import { Types } from 'mongoose';`; `import { v4 as uuidv4 } from 'uuid';`; `import * as path from 'path';`; `import { from } from 'rxjs';`; `import { pipeline } from 'stream';`; `import { LikeGroup } from './enums/like.enum';`; `import { T } from './types/common';`.

Value/schema `availableInstructorSorts` [line 12](../../apps/skiresort-api/src/libs/config.ts#L12).

Value/schema `availableMemberSorts` [line 19](../../apps/skiresort-api/src/libs/config.ts#L19).

Value/schema `validMimeTypes` [line 26](../../apps/skiresort-api/src/libs/config.ts#L26).

Value/schema `getSerialForImage` [line 27](../../apps/skiresort-api/src/libs/config.ts#L27).

Value/schema `shapeIntoMongoObjectId` [line 32](../../apps/skiresort-api/src/libs/config.ts#L32).

Value/schema `validateMongoObjectId` [line 36](../../apps/skiresort-api/src/libs/config.ts#L36).

Value/schema `availableBoardArticleSorts` [line 44](../../apps/skiresort-api/src/libs/config.ts#L44).

Value/schema `availableCommentSorts` [line 51](../../apps/skiresort-api/src/libs/config.ts#L51).

Value/schema `lookupMember` [line 53](../../apps/skiresort-api/src/libs/config.ts#L53).

Value/schema `lookupAuthMemberLiked` [line 64](../../apps/skiresort-api/src/libs/config.ts#L64).

Declaration `LookupAuthMemberFollowed` [line 104](../../apps/skiresort-api/src/libs/config.ts#L104).

Value/schema `lookupAuthMemberFollowed` [line 109](../../apps/skiresort-api/src/libs/config.ts#L109).

Value/schema `lookupFollowingData` [line 146](../../apps/skiresort-api/src/libs/config.ts#L146).

Value/schema `lookupFollowerData` [line 155](../../apps/skiresort-api/src/libs/config.ts#L155).

Value/schema `lookupFavorite` [line 164](../../apps/skiresort-api/src/libs/config.ts#L164).

Value/schema `lookupVisit` [line 176](../../apps/skiresort-api/src/libs/config.ts#L176).

## `apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts)

Imports: `import { Field, InputType, Int } from '@nestjs/graphql';`; `import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';`; `import type { ObjectId } from 'mongoose';`; `import { BoardArticleCategory, BoardArticleStatus, } from '../../enums/board-article.enum';`; `import { Direction } from '../../enums/common.enum';`; `import { availableBoardArticleSorts } from '../../config';`.

Class `BoardArticleInput` [line 11](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L11).

- Field `articleCategory!: BoardArticleCategory;` [line 13](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L13).

- Field `articleTitle!: string;` [line 17](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L17).

- Field `articleContent!: string;` [line 22](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L22).

- Field `articleImage?: string;` [line 27](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L27).

- Field `memberId?: ObjectId;` [line 31](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L31).

Class `BAISearch` [line 34](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L34).

- Field `articleCategory?: BoardArticleCategory;` [line 36](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L36).

- Field `text?: string;` [line 40](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L40).

- Field `memberId?: ObjectId;` [line 44](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L44).

Class `BoardArticlesInquiry` [line 49](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L49).

- Field `page!: number;` [line 51](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L51).

- Field `limit!: number;` [line 56](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L56).

- Field `sort?: string;` [line 61](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L61).

- Field `direction?: Direction;` [line 66](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L66).

- Field `search!: BAISearch;` [line 70](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L70).

Class `ABAISearch` [line 75](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L75).

- Field `articleStatus?: BoardArticleStatus;` [line 77](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L77).

- Field `articleCategory?: BoardArticleCategory;` [line 81](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L81).

Class `AllBoardArticlesInquiry` [line 86](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L86).

- Field `page!: number;` [line 88](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L88).

- Field `limit!: number;` [line 93](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L93).

- Field `sort?: string;` [line 98](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L98).

- Field `direction?: Direction;` [line 103](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L103).

- Field `search!: ABAISearch;` [line 107](../../apps/skiresort-api/src/libs/dto/board-article/board-article.input.ts#L107).

## `apps/skiresort-api/src/libs/dto/board-article/board-article.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts)

Imports: `import { Field, Int, ObjectType } from '@nestjs/graphql';`; `import type { ObjectId } from 'mongoose';`; `import { BoardArticleCategory, BoardArticleStatus, } from '../../enums/board-article.enum';`; `import { Member, TotalCounter } from '../member/member';`; `import { MeLiked } from '../like/like';`.

Class `BoardArticle` [line 10](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L10).

- Field `_id!: ObjectId;` [line 12](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L12).

- Field `articleCategory!: BoardArticleCategory;` [line 15](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L15).

- Field `articleStatus!: BoardArticleStatus;` [line 18](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L18).

- Field `articleTitle!: string;` [line 21](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L21).

- Field `articleContent!: string;` [line 24](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L24).

- Field `articleImage?: string;` [line 27](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L27).

- Field `articleViews!: number;` [line 30](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L30).

- Field `articleLikes!: number;` [line 33](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L33).

- Field `articleComments!: number;` [line 36](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L36).

- Field `memberId!: ObjectId;` [line 39](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L39).

- Field `createdAt!: Date;` [line 42](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L42).

- Field `updatedAt!: Date;` [line 45](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L45).

- Field `memberData?: Member;` [line 50](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L50).

- Field `meLiked?: MeLiked[];` [line 53](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L53).

Class `BoardArticles` [line 57](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L57).

- Field `list!: BoardArticle[];` [line 59](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L59).

- Field `metaCounter!: TotalCounter[];` [line 62](../../apps/skiresort-api/src/libs/dto/board-article/board-article.ts#L62).

## `apps/skiresort-api/src/libs/dto/board-article/board-article.update.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/board-article/board-article.update.ts)

Imports: `import { Field, InputType } from '@nestjs/graphql';`; `import { IsNotEmpty, IsOptional, Length } from 'class-validator';`; `import type { ObjectId } from 'mongoose';`; `import { BoardArticleStatus } from '../../enums/board-article.enum';`.

Class `BoardArticleUpdate` [line 6](../../apps/skiresort-api/src/libs/dto/board-article/board-article.update.ts#L6).

- Field `_id!: ObjectId;` [line 8](../../apps/skiresort-api/src/libs/dto/board-article/board-article.update.ts#L8).

- Field `articleStatus?: BoardArticleStatus;` [line 12](../../apps/skiresort-api/src/libs/dto/board-article/board-article.update.ts#L12).

- Field `articleTitle?: string;` [line 16](../../apps/skiresort-api/src/libs/dto/board-article/board-article.update.ts#L16).

- Field `articleContent?: string;` [line 21](../../apps/skiresort-api/src/libs/dto/board-article/board-article.update.ts#L21).

- Field `articleImage?: string;` [line 26](../../apps/skiresort-api/src/libs/dto/board-article/board-article.update.ts#L26).

## `apps/skiresort-api/src/libs/dto/comment/comment.input.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts)

Imports: `import { Field, InputType, Int } from '@nestjs/graphql';`; `import { Type } from 'class-transformer';`; `import { IsEnum, IsIn, IsInt, IsMongoId, IsNotEmpty, IsOptional, Length, Min, ValidateNested, } from 'class-validator';`; `import type { ObjectId } from 'mongoose';`; `import { CommentGroup } from '../../enums/comment.enum';`; `import { Direction } from '../../enums/common.enum';`; `import { availableCommentSorts } from '../../config';`.

Class `CommentInput` [line 19](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L19).

- Field `commentGroup!: CommentGroup;` [line 21](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L21).

- Field `commentContent!: string;` [line 26](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L26).

- Field `commentRefId!: ObjectId;` [line 31](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L31).

- Field `memberId?: ObjectId;` [line 36](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L36).

Class `CISearch` [line 39](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L39).

- Field `commentRefId!: ObjectId;` [line 41](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L41).

- Field `commentGroup?: CommentGroup;` [line 46](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L46).

Class `CommentsInquiry` [line 52](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L52).

- Field `page!: number;` [line 54](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L54).

- Field `limit!: number;` [line 60](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L60).

- Field `sort?: string;` [line 66](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L66).

- Field `direction?: Direction;` [line 71](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L71).

- Field `search!: CISearch;` [line 76](../../apps/skiresort-api/src/libs/dto/comment/comment.input.ts#L76).

## `apps/skiresort-api/src/libs/dto/comment/comment.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/comment/comment.ts)

Imports: `import { Field, Int, ObjectType } from '@nestjs/graphql';`; `import type { ObjectId } from 'mongoose';`; `import { CommentGroup, CommentStatus } from '../../enums/comment.enum';`; `import { Member, TotalCounter } from '../member/member';`.

Class `Comment` [line 6](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L6).

- Field `_id!: ObjectId;` [line 8](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L8).

- Field `commentStatus!: CommentStatus;` [line 11](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L11).

- Field `commentGroup!: CommentGroup;` [line 14](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L14).

- Field `commentContent!: string;` [line 17](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L17).

- Field `commentRefId!: ObjectId;` [line 20](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L20).

- Field `memberId!: ObjectId;` [line 23](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L23).

- Field `createdAt!: Date;` [line 26](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L26).

- Field `updatedAt!: Date;` [line 29](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L29).

- Field `memberData?: Member;` [line 34](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L34).

Class `Comments` [line 38](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L38).

- Field `list!: Comment[];` [line 40](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L40).

- Field `metaCounter!: TotalCounter[];` [line 43](../../apps/skiresort-api/src/libs/dto/comment/comment.ts#L43).

## `apps/skiresort-api/src/libs/dto/comment/comment.update.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/comment/comment.update.ts)

Imports: `import { Field, InputType } from '@nestjs/graphql';`; `import { IsNotEmpty, IsOptional, Length } from 'class-validator';`; `import type { ObjectId } from 'mongoose';`; `import { CommentStatus } from '../../enums/comment.enum';`.

Class `CommentUpdate` [line 6](../../apps/skiresort-api/src/libs/dto/comment/comment.update.ts#L6).

- Field `_id!: ObjectId;` [line 8](../../apps/skiresort-api/src/libs/dto/comment/comment.update.ts#L8).

- Field `commentStatus?: CommentStatus;` [line 12](../../apps/skiresort-api/src/libs/dto/comment/comment.update.ts#L12).

- Field `commentContent?: string;` [line 16](../../apps/skiresort-api/src/libs/dto/comment/comment.update.ts#L16).

## `apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts)

Imports: `import { Field, Float, InputType, Int } from '@nestjs/graphql';`; `import { Transform, Type } from 'class-transformer';`; `import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsIn, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Max, Min, ValidateIf, ValidateNested, } from 'class-validator';`; `import { EquipmentAudience, EquipmentCategory, EquipmentStatus, } from '../../enums/equipment.enum';`; `import { Direction } from '../../enums/common.enum';`.

Value/schema `trimString` [line 27](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L27).

Value/schema `availableEquipmentSorts` [line 30](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L30).

Class `EquipmentRentalRateInput` [line 38](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L38).

- Field `durationHours!: number;` [line 40](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L40).

- Field `price!: number;` [line 45](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L45).

Class `EquipmentInput` [line 50](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L50).

- Field `resortId?: string \| null;` [line 52](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L52).

- Field `equipmentStatus?: EquipmentStatus = EquipmentStatus.AVAILABLE;` [line 57](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L57).

- Field `equipmentCategory!: EquipmentCategory;` [line 65](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L65).

- Field `equipmentName!: string;` [line 69](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L69).

- Field `equipmentBrand?: string \| null;` [line 75](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L75).

- Field `equipmentSize?: string \| null;` [line 82](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L82).

- Field `equipmentAudience?: EquipmentAudience = EquipmentAudience.ALL;` [line 88](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L88).

- Field `equipmentRentalRates!: EquipmentRentalRateInput[];` [line 96](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L96).

- Field `equipmentPurchasable?: boolean = false;` [line 103](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L103).

- Field `equipmentPurchasePrice?: number \| null;` [line 108](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L108).

- Field `equipmentQuantity!: number;` [line 114](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L114).

- Field `equipmentImages?: string[] \| null;` [line 120](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L120).

- Field `equipmentDesc?: string \| null;` [line 126](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L126).

Class `EquipmentPricesRange` [line 131](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L131).

- Field `start!: number;` [line 133](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L133).

- Field `end!: number;` [line 137](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L137).

Class `EquipmentSearch` [line 142](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L142).

- Field `resortId?: string;` [line 144](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L144).

- Field `categoryList?: EquipmentCategory[];` [line 148](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L148).

- Field `audienceList?: EquipmentAudience[];` [line 153](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L153).

- Field `sizeList?: string[];` [line 158](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L158).

- Field `equipmentBrand?: string;` [line 163](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L163).

- Field `text?: string;` [line 169](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L169).

- Field `equipmentPurchasable?: boolean;` [line 173](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L173).

- Field `rentalDurationHours?: number;` [line 177](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L177).

- Field `rentalPricesRange?: EquipmentPricesRange;` [line 183](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L183).

- Field `purchasePricesRange?: EquipmentPricesRange;` [line 189](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L189).

Class `AllEquipmentSearch` [line 196](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L196).

- Field `equipmentStatus?: EquipmentStatus;` [line 198](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L198).

Class `EquipmentHistoryInquiry` [line 203](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L203).

- Field `page!: number;` [line 205](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L205).

- Field `limit!: number;` [line 209](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L209).

Class `EquipmentsInquiry` [line 216](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L216).

- Field `sort?: string;` [line 218](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L218).

- Field `direction?: Direction;` [line 222](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L222).

- Field `search: EquipmentSearch = new EquipmentSearch();` [line 226](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L226).

Class `AllEquipmentsInquiry` [line 234](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L234).

- Field `sort?: string;` [line 236](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L236).

- Field `direction?: Direction;` [line 240](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L240).

- Field `search: AllEquipmentSearch = new AllEquipmentSearch();` [line 244](../../apps/skiresort-api/src/libs/dto/equipment/equipment.input.ts#L244).

## `apps/skiresort-api/src/libs/dto/equipment/equipment.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts)

Imports: `import { Field, Float, Int, ObjectType } from '@nestjs/graphql';`; `import type { Types } from 'mongoose';`; `import { EquipmentAudience, EquipmentCategory, EquipmentStatus, } from '../../enums/equipment.enum';`; `import { MeLiked } from '../like/like';`; `import { TotalCounter } from '../member/member';`.

Class `EquipmentRentalRate` [line 10](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L10).

- Field `durationHours!: number;` [line 12](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L12).

- Field `price!: number;` [line 14](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L14).

Class `Equipment` [line 17](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L17).

- Field `_id!: Types.ObjectId;` [line 19](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L19).

- Field `resortId?: Types.ObjectId \| null;` [line 21](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L21).

- Field `equipmentStatus!: EquipmentStatus;` [line 23](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L23).

- Field `equipmentCategory!: EquipmentCategory;` [line 25](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L25).

- Field `equipmentName!: string;` [line 27](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L27).

- Field `equipmentBrand?: string \| null;` [line 29](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L29).

- Field `equipmentSize?: string \| null;` [line 31](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L31).

- Field `equipmentAudience!: EquipmentAudience;` [line 33](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L33).

- Field `equipmentRentalRates!: EquipmentRentalRate[];` [line 35](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L35).

- Field `equipmentPurchasable!: boolean;` [line 37](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L37).

- Field `equipmentPurchasePrice?: number \| null;` [line 39](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L39).

- Field `equipmentQuantity!: number;` [line 41](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L41).

- Field `equipmentImages?: string[] \| null;` [line 43](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L43).

- Field `equipmentDesc?: string \| null;` [line 45](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L45).

- Field `equipmentViews!: number;` [line 47](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L47).

- Field `equipmentLikes!: number;` [line 49](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L49).

- Field `equipmentComments!: number;` [line 51](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L51).

- Field `createdAt!: Date;` [line 53](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L53).

- Field `updatedAt!: Date;` [line 55](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L55).

- Field `deletedAt?: Date \| null;` [line 57](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L57).

- Field `meLiked: MeLiked[] = [];` [line 59](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L59).

Class `Equipments` [line 62](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L62).

- Field `list!: Equipment[];` [line 64](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L64).

- Field `metaCounter!: TotalCounter[];` [line 66](../../apps/skiresort-api/src/libs/dto/equipment/equipment.ts#L66).

## `apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts)

Imports: `import { Field, Float, InputType, Int } from '@nestjs/graphql';`; `import { Transform, Type } from 'class-transformer';`; `import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateIf, ValidateNested, } from 'class-validator';`; `import { EquipmentAudience, EquipmentCategory, EquipmentStatus, } from '../../enums/equipment.enum';`; `import type { Types } from 'mongoose';`; `import { EquipmentRentalRateInput } from './equipment.input';`.

Value/schema `trimString` [line 26](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L26).

Class `EquipmentUpdate` [line 29](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L29).

- Field `_id!: string \| Types.ObjectId;` [line 31](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L31).

- Field `resortId?: string \| null;` [line 35](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L35).

- Field `equipmentStatus?: EquipmentStatus;` [line 40](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L40).

- Field `equipmentCategory?: EquipmentCategory;` [line 45](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L45).

- Field `equipmentName?: string;` [line 50](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L50).

- Field `equipmentBrand?: string \| null;` [line 57](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L57).

- Field `equipmentSize?: string \| null;` [line 64](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L64).

- Field `equipmentAudience?: EquipmentAudience;` [line 70](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L70).

- Field `equipmentRentalRates?: EquipmentRentalRateInput[];` [line 75](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L75).

- Field `equipmentPurchasable?: boolean;` [line 83](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L83).

- Field `equipmentPurchasePrice?: number \| null;` [line 88](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L88).

- Field `equipmentQuantity?: number;` [line 94](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L94).

- Field `equipmentImages?: string[] \| null;` [line 101](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L101).

- Field `equipmentDesc?: string \| null;` [line 107](../../apps/skiresort-api/src/libs/dto/equipment/equipment.update.ts#L107).

## `apps/skiresort-api/src/libs/dto/event/event.input.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/event/event.input.ts)

Imports: `import { Field, InputType, Int } from '@nestjs/graphql';`; `import { Transform, Type } from 'class-transformer';`; `import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsDate, IsEnum, IsIn, IsInt, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, Max, Min, ValidateIf, ValidateNested, } from 'class-validator';`; `import { Direction } from '../../enums/common.enum';`; `import { EventStatus } from '../../enums/event.enum';`.

Value/schema `trim` [line 25](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L25).

Class `EventInput` [line 28](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L28).

- Field `eventTitle!: string;` [line 30](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L30).

- Field `eventDesc!: string;` [line 35](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L35).

- Field `eventImages!: string[];` [line 40](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L40).

- Field `eventStartDate!: Date;` [line 47](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L47).

- Field `eventEndDate!: Date;` [line 50](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L50).

- Field `eventStatus?: EventStatus;` [line 53](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L53).

- Field `eventLocation?: string \| null;` [line 57](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L57).

- Field `resortId?: string \| null;` [line 63](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L63).

Class `EventSearch` [line 69](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L69).

- Field `text?: string;` [line 71](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L71).

- Field `resortId?: string;` [line 75](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L75).

Class `AllEventSearch` [line 81](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L81).

- Field `eventStatus?: EventStatus;` [line 83](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L83).

Class `EventPagination` [line 89](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L89).

- Field `page!: number;` [line 91](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L91).

- Field `limit!: number;` [line 95](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L95).

- Field `sort?: string;` [line 100](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L100).

- Field `direction?: Direction;` [line 104](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L104).

Class `EventsInquiry` [line 110](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L110).

- Field `search?: EventSearch;` [line 112](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L112).

Class `AllEventsInquiry` [line 120](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L120).

- Field `search?: AllEventSearch;` [line 122](../../apps/skiresort-api/src/libs/dto/event/event.input.ts#L122).

## `apps/skiresort-api/src/libs/dto/event/event.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/event/event.ts)

Imports: `import { Field, ObjectType } from '@nestjs/graphql';`; `import { Types } from 'mongoose';`; `import { EventStatus } from '../../enums/event.enum';`; `import { TotalCounter } from '../member/member';`.

Class `Event` [line 6](../../apps/skiresort-api/src/libs/dto/event/event.ts#L6).

- Field `_id!: Types.ObjectId;` [line 8](../../apps/skiresort-api/src/libs/dto/event/event.ts#L8).

- Field `eventTitle!: string;` [line 10](../../apps/skiresort-api/src/libs/dto/event/event.ts#L10).

- Field `eventDesc!: string;` [line 12](../../apps/skiresort-api/src/libs/dto/event/event.ts#L12).

- Field `eventImages!: string[];` [line 14](../../apps/skiresort-api/src/libs/dto/event/event.ts#L14).

- Field `eventStartDate!: Date;` [line 16](../../apps/skiresort-api/src/libs/dto/event/event.ts#L16).

- Field `eventEndDate!: Date;` [line 18](../../apps/skiresort-api/src/libs/dto/event/event.ts#L18).

- Field `eventStatus!: EventStatus;` [line 20](../../apps/skiresort-api/src/libs/dto/event/event.ts#L20).

- Field `eventLocation!: string \| null;` [line 22](../../apps/skiresort-api/src/libs/dto/event/event.ts#L22).

- Field `resortId!: Types.ObjectId \| null;` [line 24](../../apps/skiresort-api/src/libs/dto/event/event.ts#L24).

- Field `memberId!: Types.ObjectId;` [line 26](../../apps/skiresort-api/src/libs/dto/event/event.ts#L26).

- Field `createdAt!: Date;` [line 28](../../apps/skiresort-api/src/libs/dto/event/event.ts#L28).

- Field `updatedAt!: Date;` [line 30](../../apps/skiresort-api/src/libs/dto/event/event.ts#L30).

Class `Events` [line 34](../../apps/skiresort-api/src/libs/dto/event/event.ts#L34).

- Field `list!: Event[];` [line 36](../../apps/skiresort-api/src/libs/dto/event/event.ts#L36).

- Field `metaCounter!: TotalCounter[];` [line 38](../../apps/skiresort-api/src/libs/dto/event/event.ts#L38).

## `apps/skiresort-api/src/libs/dto/event/event.update.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/event/event.update.ts)

Imports: `import { Field, InputType } from '@nestjs/graphql';`; `import { Transform } from 'class-transformer';`; `import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsDate, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateIf, } from 'class-validator';`; `import { EventStatus } from '../../enums/event.enum';`.

Value/schema `trim` [line 18](../../apps/skiresort-api/src/libs/dto/event/event.update.ts#L18).

Class `EventUpdate` [line 21](../../apps/skiresort-api/src/libs/dto/event/event.update.ts#L21).

- Field `_id!: string;` [line 23](../../apps/skiresort-api/src/libs/dto/event/event.update.ts#L23).

- Field `eventTitle?: string;` [line 27](../../apps/skiresort-api/src/libs/dto/event/event.update.ts#L27).

- Field `eventDesc?: string;` [line 34](../../apps/skiresort-api/src/libs/dto/event/event.update.ts#L34).

- Field `eventImages?: string[];` [line 41](../../apps/skiresort-api/src/libs/dto/event/event.update.ts#L41).

- Field `eventStartDate?: Date;` [line 50](../../apps/skiresort-api/src/libs/dto/event/event.update.ts#L50).

- Field `eventEndDate?: Date;` [line 55](../../apps/skiresort-api/src/libs/dto/event/event.update.ts#L55).

- Field `eventStatus?: EventStatus;` [line 60](../../apps/skiresort-api/src/libs/dto/event/event.update.ts#L60).

- Field `eventLocation?: string \| null;` [line 65](../../apps/skiresort-api/src/libs/dto/event/event.update.ts#L65).

- Field `resortId?: string \| null;` [line 72](../../apps/skiresort-api/src/libs/dto/event/event.update.ts#L72).

## `apps/skiresort-api/src/libs/dto/faq/faq.input.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts)

Imports: `import { Field, InputType, Int } from '@nestjs/graphql';`; `import { Transform, Type } from 'class-transformer';`; `import { IsEnum, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Max, Min, ValidateIf, ValidateNested, } from 'class-validator';`; `import { Direction } from '../../enums/common.enum';`; `import { FaqStatus } from '../../enums/faq.enum';`.

Value/schema `trim` [line 19](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L19).

Class `FaqInput` [line 22](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L22).

- Field `faqQuestion!: string;` [line 24](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L24).

- Field `faqAnswer!: string;` [line 29](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L29).

- Field `faqStatus?: FaqStatus;` [line 34](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L34).

Class `FaqSearch` [line 40](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L40).

- Field `text?: string;` [line 42](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L42).

Class `AllFaqSearch` [line 48](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L48).

- Field `faqStatus?: FaqStatus;` [line 50](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L50).

Class `FaqPagination` [line 56](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L56).

- Field `page!: number;` [line 58](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L58).

- Field `limit!: number;` [line 62](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L62).

- Field `sort?: string;` [line 67](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L67).

- Field `direction?: Direction;` [line 71](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L71).

Class `FaqsInquiry` [line 77](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L77).

- Field `search?: FaqSearch;` [line 79](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L79).

Class `AllFaqsInquiry` [line 87](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L87).

- Field `search?: AllFaqSearch;` [line 89](../../apps/skiresort-api/src/libs/dto/faq/faq.input.ts#L89).

## `apps/skiresort-api/src/libs/dto/faq/faq.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/faq/faq.ts)

Imports: `import { Field, ObjectType } from '@nestjs/graphql';`; `import { Types } from 'mongoose';`; `import { FaqStatus } from '../../enums/faq.enum';`; `import { TotalCounter } from '../member/member';`.

Class `Faq` [line 6](../../apps/skiresort-api/src/libs/dto/faq/faq.ts#L6).

- Field `_id!: Types.ObjectId;` [line 8](../../apps/skiresort-api/src/libs/dto/faq/faq.ts#L8).

- Field `faqQuestion!: string;` [line 10](../../apps/skiresort-api/src/libs/dto/faq/faq.ts#L10).

- Field `faqAnswer!: string;` [line 12](../../apps/skiresort-api/src/libs/dto/faq/faq.ts#L12).

- Field `faqStatus!: FaqStatus;` [line 14](../../apps/skiresort-api/src/libs/dto/faq/faq.ts#L14).

- Field `memberId!: Types.ObjectId;` [line 16](../../apps/skiresort-api/src/libs/dto/faq/faq.ts#L16).

- Field `createdAt!: Date;` [line 18](../../apps/skiresort-api/src/libs/dto/faq/faq.ts#L18).

- Field `updatedAt!: Date;` [line 20](../../apps/skiresort-api/src/libs/dto/faq/faq.ts#L20).

Class `Faqs` [line 24](../../apps/skiresort-api/src/libs/dto/faq/faq.ts#L24).

- Field `list!: Faq[];` [line 26](../../apps/skiresort-api/src/libs/dto/faq/faq.ts#L26).

- Field `metaCounter!: TotalCounter[];` [line 28](../../apps/skiresort-api/src/libs/dto/faq/faq.ts#L28).

## `apps/skiresort-api/src/libs/dto/faq/faq.update.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/faq/faq.update.ts)

Imports: `import { Field, InputType } from '@nestjs/graphql';`; `import { Transform } from 'class-transformer';`; `import { IsEnum, IsMongoId, IsNotEmpty, IsString, ValidateIf, } from 'class-validator';`; `import { FaqStatus } from '../../enums/faq.enum';`.

Value/schema `trim` [line 12](../../apps/skiresort-api/src/libs/dto/faq/faq.update.ts#L12).

Class `FaqUpdate` [line 15](../../apps/skiresort-api/src/libs/dto/faq/faq.update.ts#L15).

- Field `_id!: string;` [line 17](../../apps/skiresort-api/src/libs/dto/faq/faq.update.ts#L17).

- Field `faqQuestion?: string;` [line 21](../../apps/skiresort-api/src/libs/dto/faq/faq.update.ts#L21).

- Field `faqAnswer?: string;` [line 28](../../apps/skiresort-api/src/libs/dto/faq/faq.update.ts#L28).

- Field `faqStatus?: FaqStatus;` [line 35](../../apps/skiresort-api/src/libs/dto/faq/faq.update.ts#L35).

## `apps/skiresort-api/src/libs/dto/follow/follow.input.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/follow/follow.input.ts)

Imports: `import { Field, InputType, Int } from '@nestjs/graphql';`; `import { IsNotEmpty, IsOptional, Min } from 'class-validator';`; `import type { ObjectId } from 'mongoose';`.

Class `FollowSearch` [line 5](../../apps/skiresort-api/src/libs/dto/follow/follow.input.ts#L5).

- Field `followingId?: ObjectId;` [line 7](../../apps/skiresort-api/src/libs/dto/follow/follow.input.ts#L7).

- Field `followerId?: ObjectId;` [line 11](../../apps/skiresort-api/src/libs/dto/follow/follow.input.ts#L11).

Class `FollowInquiry` [line 16](../../apps/skiresort-api/src/libs/dto/follow/follow.input.ts#L16).

- Field `page!: number;` [line 18](../../apps/skiresort-api/src/libs/dto/follow/follow.input.ts#L18).

- Field `limit!: number;` [line 23](../../apps/skiresort-api/src/libs/dto/follow/follow.input.ts#L23).

- Field `search!: FollowSearch;` [line 28](../../apps/skiresort-api/src/libs/dto/follow/follow.input.ts#L28).

## `apps/skiresort-api/src/libs/dto/follow/follow.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/follow/follow.ts)

Imports: `import { Field, ObjectType } from '@nestjs/graphql';`; `import type { ObjectId } from 'mongoose';`; `import { Member, TotalCounter } from '../member/member';`; `import { MeLiked } from '../like/like';`.

Class `MeFollowed` [line 6](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L6).

- Field `followingId!: ObjectId;` [line 8](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L8).

- Field `followerId!: ObjectId;` [line 11](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L11).

- Field `myFollowing!: boolean;` [line 14](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L14).

Class `Follower` [line 18](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L18).

- Field `_id!: ObjectId;` [line 20](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L20).

- Field `followingId!: ObjectId;` [line 23](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L23).

- Field `followerId!: ObjectId;` [line 26](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L26).

- Field `createdAt!: Date;` [line 29](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L29).

- Field `updatedAt!: Date;` [line 32](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L32).

- Field `meLiked?: MeLiked[];` [line 37](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L37).

- Field `meFollowed?: MeFollowed[];` [line 40](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L40).

- Field `followerData?: Member;` [line 43](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L43).

Class `Following` [line 47](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L47).

- Field `_id!: ObjectId;` [line 49](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L49).

- Field `followingId!: ObjectId;` [line 52](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L52).

- Field `followerId!: ObjectId;` [line 55](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L55).

- Field `createdAt!: Date;` [line 58](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L58).

- Field `updatedAt!: Date;` [line 61](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L61).

- Field `meLiked?: MeLiked[];` [line 66](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L66).

- Field `meFollowed?: MeFollowed[];` [line 69](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L69).

- Field `followingData?: Member;` [line 72](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L72).

Class `Followings` [line 76](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L76).

- Field `list!: Following[];` [line 78](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L78).

- Field `metaCounter!: TotalCounter[];` [line 81](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L81).

Class `Followers` [line 85](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L85).

- Field `list!: Follower[];` [line 87](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L87).

- Field `metaCounter!: TotalCounter[];` [line 90](../../apps/skiresort-api/src/libs/dto/follow/follow.ts#L90).

## `apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts)

Imports: `import { Field, InputType, Int } from '@nestjs/graphql';`; `import { Transform, Type } from 'class-transformer';`; `import { ArrayMinSize, IsArray, IsEnum, IsIn, IsInt, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, Matches, Max, Min, ValidateIf, ValidateNested, } from 'class-validator';`; `import { Direction } from '../../enums/common.enum';`; `import { InstructorApplicationStatus } from '../../enums/instructor-application.enum';`; `import { InstructorAudience, InstructorLevel } from '../../enums/member.enum';`.

Value/schema `availableInstructorApplicationSorts` [line 24](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L24).

Class `InstructorApplicationInput` [line 30](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L30).

- Field `instructorExperienceYears!: number;` [line 32](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L32).

- Field `instructorLanguages!: string[];` [line 37](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L37).

- Field `instructorLevel!: InstructorLevel;` [line 51](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L51).

- Field `instructorAudience!: InstructorAudience;` [line 55](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L55).

- Field `instructorResortId?: string \| null;` [line 59](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L59).

- Field `memberDesc?: string \| null;` [line 64](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L64).

Class `InstructorApplicationSearch` [line 70](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L70).

- Field `applicationStatus?: InstructorApplicationStatus;` [line 72](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L72).

- Field `memberId?: string;` [line 77](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L77).

Class `InstructorApplicationsInquiry` [line 83](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L83).

- Field `page!: number;` [line 85](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L85).

- Field `limit!: number;` [line 90](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L90).

- Field `sort?: string;` [line 96](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L96).

- Field `direction?: Direction;` [line 101](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L101).

- Field `search: InstructorApplicationSearch = new InstructorApplicationSearch();` [line 106](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L106).

Class `InstructorApplicationReject` [line 114](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L114).

- Field `_id!: string;` [line 116](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L116).

- Field `rejectionReason!: string;` [line 120](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.input.ts#L120).

## `apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts)

Imports: `import { Field, Int, ObjectType } from '@nestjs/graphql';`; `import type { Types } from 'mongoose';`; `import { InstructorApplicationStatus } from '../../enums/instructor-application.enum';`; `import { InstructorAudience, InstructorLevel } from '../../enums/member.enum';`; `import { TotalCounter } from '../member/member';`.

Class `InstructorApplication` [line 7](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L7).

- Field `_id!: Types.ObjectId;` [line 9](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L9).

- Field `memberId!: Types.ObjectId;` [line 12](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L12).

- Field `applicationStatus!: InstructorApplicationStatus;` [line 15](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L15).

- Field `instructorExperienceYears!: number;` [line 18](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L18).

- Field `instructorLanguages!: string[];` [line 21](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L21).

- Field `instructorLevel!: InstructorLevel;` [line 24](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L24).

- Field `instructorAudience!: InstructorAudience;` [line 27](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L27).

- Field `instructorResortId?: Types.ObjectId \| null;` [line 30](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L30).

- Field `memberDesc?: string \| null;` [line 33](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L33).

- Field `reviewedBy?: Types.ObjectId \| null;` [line 36](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L36).

- Field `reviewedAt?: Date \| null;` [line 39](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L39).

- Field `rejectionReason?: string \| null;` [line 42](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L42).

- Field `createdAt!: Date;` [line 45](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L45).

- Field `updatedAt!: Date;` [line 48](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L48).

Class `InstructorApplications` [line 52](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L52).

- Field `list!: InstructorApplication[];` [line 54](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L54).

- Field `metaCounter!: TotalCounter[];` [line 57](../../apps/skiresort-api/src/libs/dto/instructor-application/instructor-application.ts#L57).

## `apps/skiresort-api/src/libs/dto/like/like.input.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/like/like.input.ts)

Imports: `import { Field, InputType } from '@nestjs/graphql';`; `import { IsNotEmpty } from 'class-validator';`; `import type { ObjectId } from 'mongoose';`; `import { LikeGroup } from '../../enums/like.enum';`.

Class `LikeInput` [line 6](../../apps/skiresort-api/src/libs/dto/like/like.input.ts#L6).

- Field `memberId!: ObjectId;` [line 8](../../apps/skiresort-api/src/libs/dto/like/like.input.ts#L8).

- Field `likeRefId!: ObjectId;` [line 12](../../apps/skiresort-api/src/libs/dto/like/like.input.ts#L12).

- Field `likeGroup!: LikeGroup;` [line 16](../../apps/skiresort-api/src/libs/dto/like/like.input.ts#L16).

## `apps/skiresort-api/src/libs/dto/like/like.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/like/like.ts)

Imports: `import { Field, ObjectType } from '@nestjs/graphql';`; `import { LikeGroup } from '../../enums/like.enum';`; `import type { ObjectId } from 'mongoose';`.

Class `MeLiked` [line 5](../../apps/skiresort-api/src/libs/dto/like/like.ts#L5).

- Field `memberId!: ObjectId;` [line 7](../../apps/skiresort-api/src/libs/dto/like/like.ts#L7).

- Field `likeRefId!: ObjectId;` [line 10](../../apps/skiresort-api/src/libs/dto/like/like.ts#L10).

- Field `myFavorite!: boolean;` [line 13](../../apps/skiresort-api/src/libs/dto/like/like.ts#L13).

Class `Like` [line 17](../../apps/skiresort-api/src/libs/dto/like/like.ts#L17).

- Field `_id!: ObjectId;` [line 19](../../apps/skiresort-api/src/libs/dto/like/like.ts#L19).

- Field `likeGroup!: LikeGroup;` [line 22](../../apps/skiresort-api/src/libs/dto/like/like.ts#L22).

- Field `likeRefId!: ObjectId;` [line 25](../../apps/skiresort-api/src/libs/dto/like/like.ts#L25).

- Field `memberId!: ObjectId;` [line 28](../../apps/skiresort-api/src/libs/dto/like/like.ts#L28).

- Field `createdAt!: Date;` [line 31](../../apps/skiresort-api/src/libs/dto/like/like.ts#L31).

- Field `updatedAt!: Date;` [line 34](../../apps/skiresort-api/src/libs/dto/like/like.ts#L34).

## `apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts)

Imports: `import { Field, Float, InputType, Int } from '@nestjs/graphql';`; `import { Transform } from 'class-transformer';`; `import { IsArray, IsEnum, IsInt, IsMongoId, IsNumber, IsOptional, IsString, Matches, Min, } from 'class-validator';`; `import { InstructorAudience, InstructorLevel } from '../../enums/member.enum';`.

Class `InstructorProfileUpdate` [line 16](../../apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts#L16).

- Field `instructorResortId?: string \| null;` [line 18](../../apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts#L18).

- Field `instructorExperienceYears?: number \| null;` [line 23](../../apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts#L23).

- Field `instructorLanguages?: string[] \| null;` [line 29](../../apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts#L29).

- Field `instructorLevel?: InstructorLevel \| null;` [line 43](../../apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts#L43).

- Field `instructorAudience?: InstructorAudience \| null;` [line 48](../../apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts#L48).

- Field `instructorPrice1Week?: number \| null;` [line 53](../../apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts#L53).

- Field `instructorPrice2Weeks?: number \| null;` [line 59](../../apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts#L59).

- Field `instructorPrice3Weeks?: number \| null;` [line 65](../../apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts#L65).

- Field `instructorPrice4Weeks?: number \| null;` [line 71](../../apps/skiresort-api/src/libs/dto/member/instructor-profile.update.ts#L71).

## `apps/skiresort-api/src/libs/dto/member/member.input.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/member/member.input.ts)

Imports: `import { Field, InputType, Int } from '@nestjs/graphql';`; `import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';`; `import { MemberAuthType, MemberStatus, MemberType, } from '../../enums/member.enum';`; `import { availableInstructorSorts, availableMemberSorts } from '../../config';`; `import { Direction } from '../../enums/common.enum';`.

Class `MemberInput` [line 11](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L11).

- Field `memberNick!: string;` [line 13](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L13).

- Field `memberPassword!: string;` [line 18](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L18).

- Field `memberPhone!: string;` [line 23](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L23).

- Field `memberType?: MemberType;` [line 27](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L27).

- Field `memberAuthType?: MemberAuthType;` [line 31](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L31).

Class `LoginInput` [line 36](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L36).

- Field `memberNick!: string;` [line 38](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L38).

- Field `memberPassword!: string;` [line 43](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L43).

Class `InstructorSearch` [line 49](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L49).

- Field `text?: string;` [line 51](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L51).

Class `InstructorsInquiry` [line 56](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L56).

- Field `page!: number;` [line 58](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L58).

- Field `limit!: number;` [line 63](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L63).

- Field `sort?: string;` [line 68](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L68).

- Field `direction?: string;` [line 73](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L73).

- Field `search!: InstructorSearch;` [line 77](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L77).

Class `MISearch` [line 82](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L82).

- Field `memberStatus?: MemberStatus;` [line 84](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L84).

- Field `memberType?: MemberType;` [line 88](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L88).

- Field `text?: string;` [line 92](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L92).

Class `MembersInquiry` [line 97](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L97).

- Field `page!: number;` [line 99](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L99).

- Field `limit!: number;` [line 104](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L104).

- Field `sort?: string;` [line 109](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L109).

- Field `direction?: string;` [line 114](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L114).

- Field `search!: MISearch;` [line 118](../../apps/skiresort-api/src/libs/dto/member/member.input.ts#L118).

## `apps/skiresort-api/src/libs/dto/member/member.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/member/member.ts)

Imports: `import { Field, Float, Int, ObjectType } from '@nestjs/graphql';`; `import type { ObjectId } from 'mongoose';`; `import { InstructorAudience, InstructorLevel, MemberAuthType, MemberStatus, MemberType, } from '../../enums/member.enum';`; `import { MeLiked } from '../like/like';`; `import { MeFollowed } from '../follow/follow';`.

Class `Member` [line 13](../../apps/skiresort-api/src/libs/dto/member/member.ts#L13).

- Field `_id!: ObjectId;` [line 15](../../apps/skiresort-api/src/libs/dto/member/member.ts#L15).

- Field `memberType!: MemberType;` [line 18](../../apps/skiresort-api/src/libs/dto/member/member.ts#L18).

- Field `memberStatus!: MemberStatus;` [line 21](../../apps/skiresort-api/src/libs/dto/member/member.ts#L21).

- Field `memberAuthType!: MemberAuthType;` [line 24](../../apps/skiresort-api/src/libs/dto/member/member.ts#L24).

- Field `memberPhone!: string;` [line 27](../../apps/skiresort-api/src/libs/dto/member/member.ts#L27).

- Field `memberNick!: string;` [line 30](../../apps/skiresort-api/src/libs/dto/member/member.ts#L30).

- Field `memberPassword?: string;` [line 33](../../apps/skiresort-api/src/libs/dto/member/member.ts#L33).

- Field `memberFullName?: string;` [line 35](../../apps/skiresort-api/src/libs/dto/member/member.ts#L35).

- Field `memberImage!: string;` [line 38](../../apps/skiresort-api/src/libs/dto/member/member.ts#L38).

- Field `memberAddress?: string;` [line 41](../../apps/skiresort-api/src/libs/dto/member/member.ts#L41).

- Field `memberDesc?: string;` [line 44](../../apps/skiresort-api/src/libs/dto/member/member.ts#L44).

- Field `instructorResortId?: ObjectId \| null;` [line 47](../../apps/skiresort-api/src/libs/dto/member/member.ts#L47).

- Field `instructorExperienceYears?: number \| null;` [line 50](../../apps/skiresort-api/src/libs/dto/member/member.ts#L50).

- Field `instructorLanguages?: string[] \| null;` [line 53](../../apps/skiresort-api/src/libs/dto/member/member.ts#L53).

- Field `instructorLevel?: InstructorLevel \| null;` [line 56](../../apps/skiresort-api/src/libs/dto/member/member.ts#L56).

- Field `instructorAudience?: InstructorAudience \| null;` [line 59](../../apps/skiresort-api/src/libs/dto/member/member.ts#L59).

- Field `instructorPrice1Week?: number \| null;` [line 62](../../apps/skiresort-api/src/libs/dto/member/member.ts#L62).

- Field `instructorPrice2Weeks?: number \| null;` [line 65](../../apps/skiresort-api/src/libs/dto/member/member.ts#L65).

- Field `instructorPrice3Weeks?: number \| null;` [line 68](../../apps/skiresort-api/src/libs/dto/member/member.ts#L68).

- Field `instructorPrice4Weeks?: number \| null;` [line 71](../../apps/skiresort-api/src/libs/dto/member/member.ts#L71).

- Field `memberProperties!: number;` [line 74](../../apps/skiresort-api/src/libs/dto/member/member.ts#L74).

- Field `memberArticles!: number;` [line 77](../../apps/skiresort-api/src/libs/dto/member/member.ts#L77).

- Field `memberFollowers!: number;` [line 80](../../apps/skiresort-api/src/libs/dto/member/member.ts#L80).

- Field `memberFollowings!: number;` [line 83](../../apps/skiresort-api/src/libs/dto/member/member.ts#L83).

- Field `memberPoints!: number;` [line 86](../../apps/skiresort-api/src/libs/dto/member/member.ts#L86).

- Field `memberLikes!: number;` [line 89](../../apps/skiresort-api/src/libs/dto/member/member.ts#L89).

- Field `memberViews!: number;` [line 92](../../apps/skiresort-api/src/libs/dto/member/member.ts#L92).

- Field `memberComments!: number;` [line 95](../../apps/skiresort-api/src/libs/dto/member/member.ts#L95).

- Field `memberRank!: number;` [line 98](../../apps/skiresort-api/src/libs/dto/member/member.ts#L98).

- Field `memberWarnings!: number;` [line 101](../../apps/skiresort-api/src/libs/dto/member/member.ts#L101).

- Field `memberBlocks!: number;` [line 104](../../apps/skiresort-api/src/libs/dto/member/member.ts#L104).

- Field `deletedAt?: Date;` [line 107](../../apps/skiresort-api/src/libs/dto/member/member.ts#L107).

- Field `createdAt?: Date;` [line 110](../../apps/skiresort-api/src/libs/dto/member/member.ts#L110).

- Field `updatedAt?: Date;` [line 113](../../apps/skiresort-api/src/libs/dto/member/member.ts#L113).

- Field `accessToken?: string;` [line 115](../../apps/skiresort-api/src/libs/dto/member/member.ts#L115).

- Field `meLiked?: MeLiked[];` [line 120](../../apps/skiresort-api/src/libs/dto/member/member.ts#L120).

- Field `meFollowed?: MeFollowed[];` [line 123](../../apps/skiresort-api/src/libs/dto/member/member.ts#L123).

Class `TotalCounter` [line 127](../../apps/skiresort-api/src/libs/dto/member/member.ts#L127).

- Field `total?: number;` [line 129](../../apps/skiresort-api/src/libs/dto/member/member.ts#L129).

Class `Members` [line 133](../../apps/skiresort-api/src/libs/dto/member/member.ts#L133).

- Field `list!: Member[];` [line 135](../../apps/skiresort-api/src/libs/dto/member/member.ts#L135).

- Field `metaCounter?: TotalCounter[];` [line 138](../../apps/skiresort-api/src/libs/dto/member/member.ts#L138).

## `apps/skiresort-api/src/libs/dto/member/member.update.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/member/member.update.ts)

Imports: `import { Field, InputType } from '@nestjs/graphql';`; `import { IsNotEmpty, IsOptional, Length } from 'class-validator';`; `import { MemberStatus, MemberType } from '../../enums/member.enum';`.

Class `MemberUpdate` [line 5](../../apps/skiresort-api/src/libs/dto/member/member.update.ts#L5).

- Field `_id?: string;` [line 7](../../apps/skiresort-api/src/libs/dto/member/member.update.ts#L7).

- Field `memberType?: MemberType;` [line 11](../../apps/skiresort-api/src/libs/dto/member/member.update.ts#L11).

- Field `memberStatus?: MemberStatus;` [line 15](../../apps/skiresort-api/src/libs/dto/member/member.update.ts#L15).

- Field `memberPhone?: string;` [line 19](../../apps/skiresort-api/src/libs/dto/member/member.update.ts#L19).

- Field `memberNick?: string;` [line 23](../../apps/skiresort-api/src/libs/dto/member/member.update.ts#L23).

- Field `memberPassword?: string;` [line 28](../../apps/skiresort-api/src/libs/dto/member/member.update.ts#L28).

- Field `memberFullName?: string;` [line 33](../../apps/skiresort-api/src/libs/dto/member/member.update.ts#L33).

- Field `memberImage?: string;` [line 38](../../apps/skiresort-api/src/libs/dto/member/member.update.ts#L38).

- Field `memberAddress?: string;` [line 42](../../apps/skiresort-api/src/libs/dto/member/member.update.ts#L42).

- Field `memberDesc?: string;` [line 46](../../apps/skiresort-api/src/libs/dto/member/member.update.ts#L46).

- Field `deleteAt?: Date;` [line 50](../../apps/skiresort-api/src/libs/dto/member/member.update.ts#L50).

## `apps/skiresort-api/src/libs/dto/resort/resort.input.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts)

Imports: `import { Field, Float, InputType, Int } from '@nestjs/graphql';`; `import { Transform, Type } from 'class-transformer';`; `import { IsArray, IsEnum, IsIn, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Max, Min, Validate, ValidateIf, ValidateNested, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';`; `import type { ValidationArguments } from 'class-validator';`; `import { Direction } from '../../enums/common.enum';`; `import { ResortFacilities, ResortLevel, ResortLocation, ResortStatus, } from '../../enums/resort.enum';`.

Value/schema `availableResortSorts` [line 31](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L31).

Value/schema `trimString` [line 41](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L41).

Class `ResortInput` [line 44](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L44).

- Field `resortTitle!: string;` [line 46](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L46).

- Field `resortLocation!: ResortLocation;` [line 52](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L52).

- Field `resortAddress!: string;` [line 56](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L56).

- Field `resortPricePerDay!: number;` [line 62](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L62).

- Field `resortMinDays = 1;` [line 67](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L67).

- Field `resortLevel?: ResortLevel \| null;` [line 73](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L73).

- Field `resortImages!: string[];` [line 78](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L78).

- Field `resortFacilities?: ResortFacilities[] \| null;` [line 83](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L83).

- Field `resortDesc?: string \| null;` [line 89](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L89).

Class `OrderedResortPricesRange` [line 95](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L95).

- Method `validate(value: unknown, args: ValidationArguments): boolean` [line 97](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L97).

- Method `defaultMessage(): string` [line 102](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L102).

Class `ResortPricesRange` [line 107](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L107).

- Field `start!: number;` [line 109](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L109).

- Field `end!: number;` [line 114](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L114).

Class `ResortSearch` [line 121](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L121).

- Field `memberId?: string;` [line 123](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L123).

- Field `locationList?: ResortLocation[];` [line 128](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L128).

- Field `levelList?: ResortLevel[];` [line 134](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L134).

- Field `facilities?: ResortFacilities[];` [line 140](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L140).

- Field `pricesRange?: ResortPricesRange;` [line 146](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L146).

- Field `text?: string;` [line 153](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L153).

Class `AllResortSearch` [line 159](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L159).

- Field `resortStatus?: ResortStatus;` [line 161](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L161).

Class `ResortHistoryInquiry` [line 167](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L167).

- Field `page!: number;` [line 169](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L169).

- Field `limit!: number;` [line 174](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L174).

Class `ResortsInquiry` [line 181](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L181).

- Field `sort?: string;` [line 183](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L183).

- Field `direction?: Direction;` [line 188](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L188).

- Field `search: ResortSearch = new ResortSearch();` [line 193](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L193).

Class `AllResortsInquiry` [line 201](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L201).

- Field `sort?: string;` [line 203](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L203).

- Field `direction?: Direction;` [line 208](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L208).

- Field `search: AllResortSearch = new AllResortSearch();` [line 213](../../apps/skiresort-api/src/libs/dto/resort/resort.input.ts#L213).

## `apps/skiresort-api/src/libs/dto/resort/resort.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/resort/resort.ts)

Imports: `import { Field, Float, Int, ObjectType } from '@nestjs/graphql';`; `import type { Types } from 'mongoose';`; `import { ResortFacilities, ResortLevel, ResortLocation, ResortStatus, } from '../../enums/resort.enum';`; `import { MeLiked } from '../like/like';`; `import { Member, TotalCounter } from '../member/member';`.

Class `Resort` [line 12](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L12).

- Field `_id!: Types.ObjectId;` [line 14](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L14).

- Field `resortStatus!: ResortStatus;` [line 17](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L17).

- Field `resortTitle!: string;` [line 20](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L20).

- Field `resortLocation!: ResortLocation;` [line 23](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L23).

- Field `resortAddress!: string;` [line 26](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L26).

- Field `resortPricePerDay!: number;` [line 29](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L29).

- Field `resortMinDays!: number;` [line 32](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L32).

- Field `resortLevel?: ResortLevel \| null;` [line 35](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L35).

- Field `resortImages!: string[];` [line 38](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L38).

- Field `resortFacilities?: ResortFacilities[] \| null;` [line 41](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L41).

- Field `resortDesc?: string \| null;` [line 44](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L44).

- Field `resortViews!: number;` [line 47](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L47).

- Field `resortLikes!: number;` [line 50](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L50).

- Field `resortComments!: number;` [line 53](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L53).

- Field `memberId!: Types.ObjectId;` [line 56](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L56).

- Field `createdAt!: Date;` [line 59](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L59).

- Field `updatedAt!: Date;` [line 62](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L62).

- Field `deletedAt?: Date \| null;` [line 65](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L65).

- Field `memberData?: Member \| null;` [line 68](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L68).

- Field `meLiked?: MeLiked[];` [line 71](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L71).

Class `Resorts` [line 75](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L75).

- Field `list!: Resort[];` [line 77](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L77).

- Field `metaCounter!: TotalCounter[];` [line 80](../../apps/skiresort-api/src/libs/dto/resort/resort.ts#L80).

## `apps/skiresort-api/src/libs/dto/resort/resort.update.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts)

Imports: `import { Field, Float, InputType, Int } from '@nestjs/graphql';`; `import { Transform } from 'class-transformer';`; `import type { Types } from 'mongoose';`; `import { IsArray, IsEnum, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateIf, } from 'class-validator';`; `import { ResortFacilities, ResortLevel, ResortLocation, ResortStatus, } from '../../enums/resort.enum';`.

Value/schema `trimString` [line 23](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L23).

Class `ResortUpdate` [line 26](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L26).

- Field `_id!: string \| Types.ObjectId;` [line 28](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L28).

- Field `resortStatus?: ResortStatus;` [line 32](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L32).

- Field `resortTitle?: string;` [line 37](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L37).

- Field `resortLocation?: ResortLocation;` [line 44](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L44).

- Field `resortAddress?: string;` [line 49](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L49).

- Field `resortPricePerDay?: number;` [line 56](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L56).

- Field `resortMinDays?: number;` [line 62](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L62).

- Field `resortLevel?: ResortLevel \| null;` [line 68](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L68).

- Field `resortImages?: string[];` [line 73](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L73).

- Field `resortFacilities?: ResortFacilities[] \| null;` [line 79](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L79).

- Field `resortDesc?: string \| null;` [line 85](../../apps/skiresort-api/src/libs/dto/resort/resort.update.ts#L85).

## `apps/skiresort-api/src/libs/dto/view/view.input.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/view/view.input.ts)

Imports: `import { Field, InputType } from '@nestjs/graphql';`; `import { IsNotEmpty } from 'class-validator';`; `import { ViewGroup } from '../../enums/view.enum';`; `import type { ObjectId } from 'mongoose';`.

Class `ViewInput` [line 6](../../apps/skiresort-api/src/libs/dto/view/view.input.ts#L6).

- Field `memberId!: ObjectId;` [line 8](../../apps/skiresort-api/src/libs/dto/view/view.input.ts#L8).

- Field `viewRefId!: ObjectId;` [line 12](../../apps/skiresort-api/src/libs/dto/view/view.input.ts#L12).

- Field `viewGroup!: ViewGroup;` [line 16](../../apps/skiresort-api/src/libs/dto/view/view.input.ts#L16).

## `apps/skiresort-api/src/libs/dto/view/view.ts`

[Open source](../../apps/skiresort-api/src/libs/dto/view/view.ts)

Imports: `import { Field, ObjectType } from '@nestjs/graphql';`; `import type { ObjectId } from 'mongoose';`; `import { ViewGroup } from '../../enums/view.enum';`.

Class `View` [line 5](../../apps/skiresort-api/src/libs/dto/view/view.ts#L5).

- Field `_id!: ObjectId;` [line 7](../../apps/skiresort-api/src/libs/dto/view/view.ts#L7).

- Field `viewGroup!: ViewGroup;` [line 10](../../apps/skiresort-api/src/libs/dto/view/view.ts#L10).

- Field `viewRefId!: ObjectId;` [line 13](../../apps/skiresort-api/src/libs/dto/view/view.ts#L13).

- Field `memberId!: ObjectId;` [line 16](../../apps/skiresort-api/src/libs/dto/view/view.ts#L16).

- Field `deletedAt?: Date;` [line 19](../../apps/skiresort-api/src/libs/dto/view/view.ts#L19).

- Field `createdAt?: Date;` [line 22](../../apps/skiresort-api/src/libs/dto/view/view.ts#L22).

- Field `updatedAt?: Date;` [line 25](../../apps/skiresort-api/src/libs/dto/view/view.ts#L25).

## `apps/skiresort-api/src/libs/enums/board-article.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/board-article.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `BoardArticleCategory` [line 3](../../apps/skiresort-api/src/libs/enums/board-article.enum.ts#L3).

Declaration `BoardArticleStatus` [line 15](../../apps/skiresort-api/src/libs/enums/board-article.enum.ts#L15).

## `apps/skiresort-api/src/libs/enums/comment.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/comment.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `CommentStatus` [line 3](../../apps/skiresort-api/src/libs/enums/comment.enum.ts#L3).

Declaration `CommentGroup` [line 11](../../apps/skiresort-api/src/libs/enums/comment.enum.ts#L11).

## `apps/skiresort-api/src/libs/enums/common.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/common.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `Message` [line 3](../../apps/skiresort-api/src/libs/enums/common.enum.ts#L3).

Declaration `Direction` [line 24](../../apps/skiresort-api/src/libs/enums/common.enum.ts#L24).

## `apps/skiresort-api/src/libs/enums/equipment.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/equipment.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `EquipmentCategory` [line 3](../../apps/skiresort-api/src/libs/enums/equipment.enum.ts#L3).

Declaration `EquipmentAudience` [line 12](../../apps/skiresort-api/src/libs/enums/equipment.enum.ts#L12).

Declaration `EquipmentStatus` [line 17](../../apps/skiresort-api/src/libs/enums/equipment.enum.ts#L17).

## `apps/skiresort-api/src/libs/enums/event.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/event.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `EventStatus` [line 3](../../apps/skiresort-api/src/libs/enums/event.enum.ts#L3).

## `apps/skiresort-api/src/libs/enums/faq.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/faq.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `FaqStatus` [line 3](../../apps/skiresort-api/src/libs/enums/faq.enum.ts#L3).

## `apps/skiresort-api/src/libs/enums/instructor-application.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/instructor-application.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `InstructorApplicationStatus` [line 3](../../apps/skiresort-api/src/libs/enums/instructor-application.enum.ts#L3).

## `apps/skiresort-api/src/libs/enums/like.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/like.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `LikeGroup` [line 3](../../apps/skiresort-api/src/libs/enums/like.enum.ts#L3).

## `apps/skiresort-api/src/libs/enums/member.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/member.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `MemberType` [line 3](../../apps/skiresort-api/src/libs/enums/member.enum.ts#L3).

Declaration `InstructorLevel` [line 11](../../apps/skiresort-api/src/libs/enums/member.enum.ts#L11).

Declaration `InstructorAudience` [line 19](../../apps/skiresort-api/src/libs/enums/member.enum.ts#L19).

Declaration `MemberStatus` [line 27](../../apps/skiresort-api/src/libs/enums/member.enum.ts#L27).

Declaration `MemberAuthType` [line 34](../../apps/skiresort-api/src/libs/enums/member.enum.ts#L34).

## `apps/skiresort-api/src/libs/enums/notice.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/notice.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `NoticeCategory` [line 3](../../apps/skiresort-api/src/libs/enums/notice.enum.ts#L3).

Declaration `NoticeStatus` [line 12](../../apps/skiresort-api/src/libs/enums/notice.enum.ts#L12).

## `apps/skiresort-api/src/libs/enums/notification.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/notification.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `NotificationType` [line 3](../../apps/skiresort-api/src/libs/enums/notification.enum.ts#L3).

Declaration `NotificationStatus` [line 11](../../apps/skiresort-api/src/libs/enums/notification.enum.ts#L11).

Declaration `NotificationGroup` [line 19](../../apps/skiresort-api/src/libs/enums/notification.enum.ts#L19).

## `apps/skiresort-api/src/libs/enums/resort.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/resort.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `ResortStatus` [line 3](../../apps/skiresort-api/src/libs/enums/resort.enum.ts#L3).

Declaration `ResortLevel` [line 11](../../apps/skiresort-api/src/libs/enums/resort.enum.ts#L11).

Declaration `ResortLocation` [line 20](../../apps/skiresort-api/src/libs/enums/resort.enum.ts#L20).

Declaration `ResortFacilities` [line 40](../../apps/skiresort-api/src/libs/enums/resort.enum.ts#L40).

## `apps/skiresort-api/src/libs/enums/view.enum.ts`

[Open source](../../apps/skiresort-api/src/libs/enums/view.enum.ts)

Imports: `import { registerEnumType } from '@nestjs/graphql';`.

Declaration `ViewGroup` [line 3](../../apps/skiresort-api/src/libs/enums/view.enum.ts#L3).

## `apps/skiresort-api/src/libs/image-upload.ts`

[Open source](../../apps/skiresort-api/src/libs/image-upload.ts)

Imports: `import { BadRequestException } from '@nestjs/common';`; `import { mkdir, open, unlink } from 'fs/promises';`; `import { resolve } from 'path';`; `import type { Readable } from 'stream';`; `import { pipeline } from 'stream/promises';`; `import { getSerialForImage, validMimeTypes } from './config';`; `import { Message } from './enums/common.enum';`.

Declaration `ImageUpload` [line 9](../../apps/skiresort-api/src/libs/image-upload.ts#L9).

Declaration `assertGenericUploadTarget` [line 15](../../apps/skiresort-api/src/libs/image-upload.ts#L15).

Declaration `saveImageUpload` [line 21](../../apps/skiresort-api/src/libs/image-upload.ts#L21).

## `apps/skiresort-api/src/libs/interceptor/Logging.interceptor.ts`

[Open source](../../apps/skiresort-api/src/libs/interceptor/Logging.interceptor.ts)

Imports: `import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger, } from '@nestjs/common';`; `import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';`; `import { Observable } from 'rxjs';`; `import { tap } from 'rxjs/operators';`.

Class `LoggingInterceptor` [line 12](../../apps/skiresort-api/src/libs/interceptor/Logging.interceptor.ts#L12).

- Field `logger: Logger = new Logger();` [line 14](../../apps/skiresort-api/src/libs/interceptor/Logging.interceptor.ts#L14).

- Method `intercept(context: ExecutionContext, next: CallHandler): Observable<any>` [line 16](../../apps/skiresort-api/src/libs/interceptor/Logging.interceptor.ts#L16).

- Method `stringify(context: ExecutionContext): string` [line 51](../../apps/skiresort-api/src/libs/interceptor/Logging.interceptor.ts#L51).

## `apps/skiresort-api/src/libs/types/common.ts`

[Open source](../../apps/skiresort-api/src/libs/types/common.ts)

Imports: `import type { ObjectId } from 'mongoose';`.

Declaration `T` [line 3](../../apps/skiresort-api/src/libs/types/common.ts#L3).

Declaration `StatisticModifier` [line 7](../../apps/skiresort-api/src/libs/types/common.ts#L7).

## `apps/skiresort-api/src/main.ts`

[Open source](../../apps/skiresort-api/src/main.ts)

Imports: `import { NestFactory } from '@nestjs/core';`; `import { ValidationPipe } from '@nestjs/common';`; `import { WsAdapter } from '@nestjs/platform-ws';`; `import { graphqlUploadExpress } from 'graphql-upload';`; `import * as express from 'express';`; `import path from 'path';`; `import { AppModule } from './app.module';`; `import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';`.

Declaration `bootstrap` [line 10](../../apps/skiresort-api/src/main.ts#L10).

## `apps/skiresort-api/src/schemas/BoardArticle.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/BoardArticle.model.ts)

Imports: `import { Schema } from 'mongoose';`; `import { BoardArticleCategory, BoardArticleStatus, } from '../libs/enums/board-article.enum';`.

Value/schema `BoardArticleSchema` [line 7](../../apps/skiresort-api/src/schemas/BoardArticle.model.ts#L7).

## `apps/skiresort-api/src/schemas/Comment.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/Comment.model.ts)

Imports: `import { Schema } from 'mongoose';`; `import { CommentGroup, CommentStatus } from '../libs/enums/comment.enum';`.

Value/schema `CommentSchema` [line 4](../../apps/skiresort-api/src/schemas/Comment.model.ts#L4).

## `apps/skiresort-api/src/schemas/Equipment.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/Equipment.model.ts)

Imports: `import { Schema } from 'mongoose';`; `import { EquipmentAudience, EquipmentCategory, EquipmentStatus, } from '../libs/enums/equipment.enum';`; `import { normalizeEquipmentSize } from '../components/equipment/equipment-size';`.

Value/schema `integer` [line 9](../../apps/skiresort-api/src/schemas/Equipment.model.ts#L9).

Value/schema `EquipmentRentalRateSchema` [line 16](../../apps/skiresort-api/src/schemas/Equipment.model.ts#L16).

Value/schema `EquipmentSchema` [line 24](../../apps/skiresort-api/src/schemas/Equipment.model.ts#L24).

## `apps/skiresort-api/src/schemas/Event.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/Event.model.ts)

Imports: `import { Schema } from 'mongoose';`; `import { EventStatus } from '../libs/enums/event.enum';`.

Value/schema `EventSchema` [line 4](../../apps/skiresort-api/src/schemas/Event.model.ts#L4).

## `apps/skiresort-api/src/schemas/Faq.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/Faq.model.ts)

Imports: `import { Schema } from 'mongoose';`; `import { FaqStatus } from '../libs/enums/faq.enum';`.

Value/schema `FaqSchema` [line 4](../../apps/skiresort-api/src/schemas/Faq.model.ts#L4).

## `apps/skiresort-api/src/schemas/Follow.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/Follow.model.ts)

Imports: `import { Schema } from 'mongoose';`.

Value/schema `FollowSchema` [line 3](../../apps/skiresort-api/src/schemas/Follow.model.ts#L3).

## `apps/skiresort-api/src/schemas/InstructorApplication.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/InstructorApplication.model.ts)

Imports: `import { Schema } from 'mongoose';`; `import { InstructorApplicationStatus } from '../libs/enums/instructor-application.enum';`; `import { InstructorAudience, InstructorLevel } from '../libs/enums/member.enum';`.

Value/schema `InstructorApplicationSchema` [line 5](../../apps/skiresort-api/src/schemas/InstructorApplication.model.ts#L5).

## `apps/skiresort-api/src/schemas/Like.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/Like.model.ts)

Imports: `import { Schema } from 'mongoose';`; `import { LikeGroup } from '../libs/enums/like.enum';`.

Value/schema `LikeSchema` [line 4](../../apps/skiresort-api/src/schemas/Like.model.ts#L4).

## `apps/skiresort-api/src/schemas/Member.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/Member.model.ts)

Imports: `import { Schema } from 'mongoose';`; `import { InstructorAudience, InstructorLevel, MemberAuthType, MemberStatus, MemberType, } from '../libs/enums/member.enum';`.

Value/schema `MemberSchema` [line 10](../../apps/skiresort-api/src/schemas/Member.model.ts#L10).

## `apps/skiresort-api/src/schemas/Notice.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/Notice.model.ts)

Imports: `import mongoose, { Schema } from 'mongoose';`; `import { NoticeCategory, NoticeStatus } from '../libs/enums/notice.enum';`.

Value/schema `NoticeSchema` [line 4](../../apps/skiresort-api/src/schemas/Notice.model.ts#L4).

## `apps/skiresort-api/src/schemas/Notification.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/Notification.model.ts)

Imports: `import { Schema } from 'mongoose';`; `import { NotificationGroup, NotificationStatus, NotificationType, } from '../libs/enums/notification.enum';`.

Value/schema `NotificationSchema` [line 8](../../apps/skiresort-api/src/schemas/Notification.model.ts#L8).

## `apps/skiresort-api/src/schemas/Resort.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/Resort.model.ts)

Imports: `import { Schema } from 'mongoose';`; `import { ResortFacilities, ResortLevel, ResortLocation, ResortStatus, } from '../libs/enums/resort.enum';`.

Value/schema `resortIdentityCollation` [line 9](../../apps/skiresort-api/src/schemas/Resort.model.ts#L9).

Value/schema `ResortSchema` [line 11](../../apps/skiresort-api/src/schemas/Resort.model.ts#L11).

## `apps/skiresort-api/src/schemas/View.model.ts`

[Open source](../../apps/skiresort-api/src/schemas/View.model.ts)

Imports: `import { Schema } from 'mongoose';`; `import { ViewGroup } from '../libs/enums/view.enum';`.

Value/schema `ViewSchema` [line 4](../../apps/skiresort-api/src/schemas/View.model.ts#L4).

## `apps/skiresort-api/src/socket/socket.gateway.ts`

[Open source](../../apps/skiresort-api/src/socket/socket.gateway.ts)

Imports: `import { Logger } from '@nestjs/common';`; `import { SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';`; `import { Server } from 'ws';`; `import * as WebSocket from 'ws';`; `import * as url from 'url';`; `import { link } from 'fs';`; `import { AuthService } from '../components/auth/auth.service';`; `import { Member } from '../libs/dto/member/member';`.

Declaration `MessagePayload` [line 14](../../apps/skiresort-api/src/socket/socket.gateway.ts#L14).

Declaration `InfoPayload` [line 20](../../apps/skiresort-api/src/socket/socket.gateway.ts#L20).

Class `SocketGateway` [line 27](../../apps/skiresort-api/src/socket/socket.gateway.ts#L27).

- Field `logger: Logger = new Logger('SocketEventGateway');` [line 29](../../apps/skiresort-api/src/socket/socket.gateway.ts#L29).

- Field `summaryClient: number = 0;` [line 30](../../apps/skiresort-api/src/socket/socket.gateway.ts#L30).

- Field `clientsAuthMap = new Map<WebSocket, Member \| null>();` [line 32](../../apps/skiresort-api/src/socket/socket.gateway.ts#L32).

- Field `messagesList: MessagePayload[] = [];` [line 33](../../apps/skiresort-api/src/socket/socket.gateway.ts#L33).

Constructor [line 35](../../apps/skiresort-api/src/socket/socket.gateway.ts#L35): `private authService: AuthService`.

- Field `server!: Server;` [line 37](../../apps/skiresort-api/src/socket/socket.gateway.ts#L37).

- Method `afterInit(server: Server)` [line 40](../../apps/skiresort-api/src/socket/socket.gateway.ts#L40).

- Method `retrieveAuth(req: any): Promise<Member \| null>` [line 46](../../apps/skiresort-api/src/socket/socket.gateway.ts#L46).

- Method `handleConnection(client: WebSocket, req: any[])` [line 58](../../apps/skiresort-api/src/socket/socket.gateway.ts#L58).

- Method `handleDisconnect(client: WebSocket)` [line 88](../../apps/skiresort-api/src/socket/socket.gateway.ts#L88).

- Method `handleMessage(client: any, payload: string): Promise<void>` [line 112](../../apps/skiresort-api/src/socket/socket.gateway.ts#L112).

- Method `broadcastMessage( sender: WebSocket, message: InfoPayload \| MessagePayload, )` [line 134](../../apps/skiresort-api/src/socket/socket.gateway.ts#L134).

- Method `emitMessage(message: InfoPayload \| MessagePayload)` [line 145](../../apps/skiresort-api/src/socket/socket.gateway.ts#L145).

## `apps/skiresort-api/src/socket/socket.module.ts`

[Open source](../../apps/skiresort-api/src/socket/socket.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { SocketGateway } from './socket.gateway';`; `import { AuthModule } from '../components/auth/auth.module';`.

Class `SocketModule` [line 5](../../apps/skiresort-api/src/socket/socket.module.ts#L5).

## `apps/skiresort-batch/src/batch.controller.ts`

[Open source](../../apps/skiresort-batch/src/batch.controller.ts)

Imports: `import { Controller, Get, Logger } from '@nestjs/common';`; `import { Cron, Timeout } from '@nestjs/schedule';`; `import { BatchService } from './batch.service';`; `import { BATCH_ROLLBACK, BATCH_TOP_INSTRUCTORS } from './lib/config';`.

Class `BatchController` [line 6](../../apps/skiresort-batch/src/batch.controller.ts#L6).

- Field `logger: Logger = new Logger('BatchController');` [line 8](../../apps/skiresort-batch/src/batch.controller.ts#L8).

Constructor [line 9](../../apps/skiresort-batch/src/batch.controller.ts#L9): `private readonly batchService: BatchService`.

- Method `handleTimeout()` [line 11](../../apps/skiresort-batch/src/batch.controller.ts#L11).

- Method `batchRollback()` [line 16](../../apps/skiresort-batch/src/batch.controller.ts#L16).

- Method `batchTopInstructors()` [line 27](../../apps/skiresort-batch/src/batch.controller.ts#L27).

- Method `getHello(): string` [line 43](../../apps/skiresort-batch/src/batch.controller.ts#L43).

## `apps/skiresort-batch/src/batch.module.ts`

[Open source](../../apps/skiresort-batch/src/batch.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { ConfigModule } from '@nestjs/config';`; `import { ScheduleModule } from '@nestjs/schedule';`; `import { MongooseModule } from '@nestjs/mongoose';`; `import { BatchController } from './batch.controller';`; `import { BatchService } from './batch.service';`; `import { DatabaseModule } from './database/database.module';`; `import MemberSchema from '../../skiresort-api/src/schemas/Member.model';`.

Class `BatchModule` [line 10](../../apps/skiresort-batch/src/batch.module.ts#L10).

## `apps/skiresort-batch/src/batch.service.ts`

[Open source](../../apps/skiresort-batch/src/batch.service.ts)

Imports: `import { Injectable } from '@nestjs/common';`; `import { InjectModel } from '@nestjs/mongoose';`; `import { Model } from 'mongoose';`; `import { Member } from '../../skiresort-api/src/libs/dto/member/member';`; `import { MemberStatus, MemberType, } from '../../skiresort-api/src/libs/enums/member.enum';`.

Class `BatchService` [line 9](../../apps/skiresort-batch/src/batch.service.ts#L9).

Constructor [line 11](../../apps/skiresort-batch/src/batch.service.ts#L11): `@InjectModel('Member') private readonly memberModel: Model<Member>`.

- Method `batchRollback(): Promise<void>` [line 15](../../apps/skiresort-batch/src/batch.service.ts#L15).

- Method `batchTopInstructors(): Promise<void>` [line 27](../../apps/skiresort-batch/src/batch.service.ts#L27).

- Method `getHello(): string` [line 46](../../apps/skiresort-batch/src/batch.service.ts#L46).

## `apps/skiresort-batch/src/database/database.module.ts`

[Open source](../../apps/skiresort-batch/src/database/database.module.ts)

Imports: `import { Module } from '@nestjs/common';`; `import { InjectConnection, MongooseModule } from '@nestjs/mongoose';`; `import { Connection } from 'mongoose';`.

Class `DatabaseModule` [line 5](../../apps/skiresort-batch/src/database/database.module.ts#L5).

Constructor [line 19](../../apps/skiresort-batch/src/database/database.module.ts#L19): `@InjectConnection() private readonly connection: Connection`.

## `apps/skiresort-batch/src/lib/config.ts`

[Open source](../../apps/skiresort-batch/src/lib/config.ts)

Value/schema `BATCH_ROLLBACK` [line 5](../../apps/skiresort-batch/src/lib/config.ts#L5).

Value/schema `BATCH_TOP_INSTRUCTORS` [line 6](../../apps/skiresort-batch/src/lib/config.ts#L6).

## `apps/skiresort-batch/src/main.ts`

[Open source](../../apps/skiresort-batch/src/main.ts)

Imports: `import { NestFactory } from '@nestjs/core';`; `import { BatchModule } from './batch.module';`.

Declaration `bootstrap` [line 4](../../apps/skiresort-batch/src/main.ts#L4).
