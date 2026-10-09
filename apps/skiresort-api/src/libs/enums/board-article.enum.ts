import { registerEnumType } from '@nestjs/graphql';

export enum BoardArticleCategory {
  GENERAL = 'GENERAL',
  NEWS = 'NEWS',
  REVIEWS = 'REVIEWS',
  TIPS_GUIDES = 'TIPS_GUIDES',
  QUESTIONS = 'QUESTIONS',
}

registerEnumType(BoardArticleCategory, {
  name: 'BoardArticleCategory',
});

export enum BoardArticleStatus {
  ACTIVE = 'ACTIVE',
  DELETE = 'DELETE',
}

registerEnumType(BoardArticleStatus, {
  name: 'BoardArticleStatus',
});
