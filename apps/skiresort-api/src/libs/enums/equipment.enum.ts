import { registerEnumType } from '@nestjs/graphql';

export enum EquipmentCategory {
  SKI = 'SKI',
  SNOWBOARD = 'SNOWBOARD',
  BOOTS = 'BOOTS',
  HELMET = 'HELMET',
  POLES = 'POLES',
  CLOTHING = 'CLOTHING',
  OTHER = 'OTHER',
}
export enum EquipmentAudience {
  KIDS = 'KIDS',
  ADULTS = 'ADULTS',
  ALL = 'ALL',
}
export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
  DELETE = 'DELETE',
}
registerEnumType(EquipmentCategory, { name: 'EquipmentCategory' });
registerEnumType(EquipmentAudience, { name: 'EquipmentAudience' });
registerEnumType(EquipmentStatus, { name: 'EquipmentStatus' });
