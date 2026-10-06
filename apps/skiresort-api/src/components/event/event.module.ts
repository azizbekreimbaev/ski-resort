import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import EventSchema from '../../schemas/Event.model';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { ResortModule } from '../resort/resort.module';
import { EventResolver } from './event.resolver';
import { EventService } from './event.service';

@Module({
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
})
export class EventModule {}
