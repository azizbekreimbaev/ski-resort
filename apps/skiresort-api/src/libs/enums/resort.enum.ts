import { registerEnumType } from '@nestjs/graphql';

export enum ResortStatus {
  ACTIVE = 'ACTIVE',
  SOLD_OUT = 'SOLD_OUT',
  DELETE = 'DELETE',
}

registerEnumType(ResortStatus, { name: 'ResortStatus' });

export enum ResortLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  MIXED = 'MIXED',
}

registerEnumType(ResortLevel, { name: 'ResortLevel' });

export enum ResortLocation {
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

registerEnumType(ResortLocation, { name: 'ResortLocation' });

export enum ResortFacilities {
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

registerEnumType(ResortFacilities, { name: 'ResortFacilities' });
