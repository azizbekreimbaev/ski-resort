import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ResortSchema from '../../schemas/Resort.model';
import { AuthModule } from '../auth/auth.module';
import { LikeModule } from '../like/like.module';
import { ViewModule } from '../view/view.module';
import { ResortResolver } from './resort.resolver';
import { ResortService } from './resort.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Resort', schema: ResortSchema }]),
    AuthModule,
    LikeModule,
    ViewModule,
  ],
  providers: [ResortResolver, ResortService],
  exports: [ResortService],
})
export class ResortModule {}
