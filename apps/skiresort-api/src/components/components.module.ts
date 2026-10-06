import { EquipmentModule } from './equipment/equipment.module';
import { EventModule } from './event/event.module';
import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { ResortModule } from './resort/resort.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { InstructorApplicationModule } from './instructor-application/instructor-application.module';

@Module({
  imports: [
    MemberModule,
    InstructorApplicationModule,
    ResortModule,
    EquipmentModule,
    EventModule,
    AuthModule,
    CommentModule,
    LikeModule,
    ViewModule,
    FollowModule,
    BoardArticleModule,
  ],
})
export class ComponentsModule { }
