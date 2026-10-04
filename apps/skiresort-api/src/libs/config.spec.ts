jest.mock('uuid', () => ({ v4: () => 'fixture-image-id' }));

import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { lookupAuthMemberLiked, validateMongoObjectId } from './config';
import { LikeGroup } from './enums/like.enum';

describe('Resort MongoDB boundary helpers', () => {
  it('accepts exactly 24 hexadecimal characters or an existing ObjectId', () => {
    const value = '0123456789aBcDeF01234567';
    expect(validateMongoObjectId(value).toHexString()).toBe(
      value.toLowerCase(),
    );
    const id = new Types.ObjectId();
    expect(validateMongoObjectId(id)).toBe(id);
  });

  it.each([
    '',
    '123456789012',
    'g'.repeat(24),
    'a'.repeat(25),
    'a'.repeat(23),
    null,
    undefined,
    123,
    {},
  ])('rejects malformed ids without coercion (%p)', (value) => {
    expect(() => validateMongoObjectId(value)).toThrow(BadRequestException);
  });

  it('preserves the member default and explicit reference path while matching the group discriminator', () => {
    const id = new Types.ObjectId();
    const memberLookup = lookupAuthMemberLiked(id, '$followingId').$lookup;
    expect(memberLookup.let.localLikeRefId).toBe('$followingId');
    expect(memberLookup.let.localLikeGroup).toBe(LikeGroup.MEMBER);
    expect(memberLookup.pipeline[0].$match?.$expr.$and).toContainEqual({
      $eq: ['$likeGroup', '$$localLikeGroup'],
    });
    expect(
      lookupAuthMemberLiked(id, '$_id', LikeGroup.ARTICLE).$lookup.let
        .localLikeGroup,
    ).toBe(LikeGroup.ARTICLE);
    expect(
      lookupAuthMemberLiked(null, '$_id', LikeGroup.RESORT).$lookup.let
        .localLikeGroup,
    ).toBe(LikeGroup.RESORT);
  });
});
