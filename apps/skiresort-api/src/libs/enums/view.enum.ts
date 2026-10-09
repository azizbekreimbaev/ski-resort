import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
  EQUIPMENT = 'EQUIPMENT',
  MEMBER = 'MEMBER',
  ARTICLE = 'ARTICLE',
  RESORT = 'RESORT',
}
registerEnumType(ViewGroup, {
  name: 'ViewGroup',
});
