import { registerEnumType } from '@nestjs/graphql';

export enum CommentStatus {
  ACTIVE = 'ACTIVE',
  DELETE = 'DELETE',
}
registerEnumType(CommentStatus, {
  name: 'CommentStatus',
});

export enum CommentGroup {
  EQUIPMENT = 'EQUIPMENT',
  MEMBER = 'MEMBER',
  ARTICLE = 'ARTICLE',
  RESORT = 'RESORT',
}
registerEnumType(CommentGroup, {
  name: 'CommentGroup',
});
