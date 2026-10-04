import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import EquipmentSchema from '../../schemas/Equipment.model';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { ResortModule } from '../resort/resort.module';
import { LikeModule } from '../like/like.module';
import { ViewModule } from '../view/view.module';
import { EquipmentResolver } from './equipment.resolver';
import { EquipmentService } from './equipment.service';
@Module({
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
})
export class EquipmentModule {}
