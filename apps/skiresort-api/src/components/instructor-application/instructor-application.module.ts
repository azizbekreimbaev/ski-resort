import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import InstructorApplicationSchema from '../../schemas/InstructorApplication.model';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { ResortModule } from '../resort/resort.module';
import { InstructorApplicationResolver } from './instructor-application.resolver';
import { InstructorApplicationService } from './instructor-application.service';

@Module({
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
})
export class InstructorApplicationModule {}
