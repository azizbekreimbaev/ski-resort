import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	RESORT = 'RESORT',
}
registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
