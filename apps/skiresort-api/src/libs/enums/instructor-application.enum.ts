import { registerEnumType } from '@nestjs/graphql';

export enum InstructorApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(InstructorApplicationStatus, {
  name: 'InstructorApplicationStatus',
});
