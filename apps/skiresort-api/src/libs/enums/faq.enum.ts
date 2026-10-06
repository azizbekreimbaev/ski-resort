import { registerEnumType } from '@nestjs/graphql';

export enum FaqStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

registerEnumType(FaqStatus, { name: 'FaqStatus' });
