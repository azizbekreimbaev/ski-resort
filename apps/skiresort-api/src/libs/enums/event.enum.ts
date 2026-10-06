import { registerEnumType } from '@nestjs/graphql';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

registerEnumType(EventStatus, { name: 'EventStatus' });
