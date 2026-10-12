import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { EquipmentModule } from '../equipment/equipment.module';
import { EventModule } from '../event/event.module';
import { FaqModule } from '../faq/faq.module';
import { ResortModule } from '../resort/resort.module';
import { AssistantResolver } from './assistant.resolver';
import { AssistantService } from './assistant.service';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    FaqModule,
    ResortModule,
    EquipmentModule,
    EventModule,
  ],
  providers: [AssistantResolver, AssistantService],
})
export class AssistantModule {}
