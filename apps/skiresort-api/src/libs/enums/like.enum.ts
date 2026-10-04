import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
  EQUIPMENT = 'EQUIPMENT',
	MEMBER = 'MEMBER',
	RESORT = 'RESORT',
	ARTICLE = 'ARTICLE',
}
registerEnumType(LikeGroup, {
	name: 'LikeGroup',
});
