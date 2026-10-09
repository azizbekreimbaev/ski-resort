import { registerEnumType } from '@nestjs/graphql';

export enum MemberType {
  USER = 'USER',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

registerEnumType(MemberType, { name: 'MemberType' });

export enum InstructorLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  ALL = 'ALL',
}
registerEnumType(InstructorLevel, { name: 'InstructorLevel' });

export enum InstructorAudience {
  KIDS = 'KIDS',
  ADULTS = 'ADULTS',
  FAMILY = 'FAMILY',
  PRIVATE = 'PRIVATE',
}
registerEnumType(InstructorAudience, { name: 'InstructorAudience' });

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  BLOCK = 'BLOCK',
  DELETE = 'DELETE',
}
registerEnumType(MemberStatus, { name: 'MemberStatus' });

export enum MemberAuthType {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  TELEGRAPH = 'TELEGRAPH',
}

registerEnumType(MemberAuthType, { name: 'MemberAuthType' });
