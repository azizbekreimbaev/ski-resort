import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import FaqSchema from '../../schemas/Faq.model';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { FaqResolver } from './faq.resolver';
import { FaqService } from './faq.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Faq', schema: FaqSchema },
      { name: 'Member', schema: MemberSchema },
    ]),
    AuthModule,
  ],
  providers: [FaqResolver, FaqService],
  exports: [FaqService],
})
export class FaqModule {}
