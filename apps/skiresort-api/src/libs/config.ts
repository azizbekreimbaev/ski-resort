import { ObjectId } from 'bson'
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LikeGroup } from './enums/like.enum';


export const availableAgentSorts = ["createdAt", "updatedAt", "memberLikes", "memberViews", "memberRank"]
export const availableMemberSorts = ["createdAt", "updatedAt", "memberLikes", "memberViews"]

// IMAGE CONFIGURATION (config.js)
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { from } from 'rxjs';
import { T } from './types/common';
import { pipeline } from 'stream';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
    const ext = path.parse(filename).ext;
    return uuidv4() + ext;
};





export const shapeIntoMongoObjectId = (target: any) => {
    return typeof target === "string" ? new ObjectId(target) : target
}

export const validateMongoObjectId = (value: unknown): Types.ObjectId => {
  if (value instanceof Types.ObjectId) return value;
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) {
    throw new BadRequestException('Invalid MongoDB ObjectId');
  }
  return shapeIntoMongoObjectId(value) as Types.ObjectId;
};




export const availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews']

export const availableCommentSorts = ['createdAt', 'updatedAt']

export const lookupMember = {
    $lookup: {
        from: 'members',
        localField: 'memberId',
        foreignField: '_id',
        as: 'memberData',
    },
};


//**COMPLEX LOOKUP */

export const lookupAuthMemberLiked = (
  memberId: T | null,
  targetRefId: string = '$_id',
  group: LikeGroup = LikeGroup.MEMBER,
) => {
  return {
    $lookup: {
      from: 'likes',
      let: {
        localLikeRefId: targetRefId,
        localMemberId: memberId,
        localMyFavorite: true,
        localLikeGroup: group,
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$likeRefId', '$$localLikeRefId'] },
                { $eq: ['$memberId', '$$localMemberId'] },
                { $eq: ['$likeGroup', '$$localLikeGroup'] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            memberId: 1,
            likeRefId: 1,
            myFavorite: '$$localMyFavorite',
          },
        },
      ],
      as: 'meLiked',
    },
  };
};


interface LookupAuthMemberFollowed {
    followerId: T,
    followingId: string
}

export const lookupAuthMemberFollowed = (input: LookupAuthMemberFollowed) => {
    const { followerId, followingId } = input
    return {
        $lookup: {
            from: "follows",
            let: {
                localFollowerId: followerId,
                localFollowingId: followingId,
                localMyFavorite: true
            },

            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [{ $eq: ["$followerId", "$$localFollowerId"] }, { $eq: ["$followingId", "$$localFollowingId"] }]
                        },

                    }
                },
                {
                    $project: {
                        _id: 0,
                        followerId: 1,
                        followingId: 1,
                        myFollowing: "$$localMyFavorite",
                    }
                }
            ],

            as: "meFollowed"

        }
    }
}

export const lookupFollowingData = {
    $lookup: {
        from: "members",
        localField: "followingId",
        foreignField: "_id",
        as: "followingData"
    }
}

export const lookupFollowerData = {
    $lookup: {
        from: "members",
        localField: "followerId",
        foreignField: "_id",
        as: "followerData"
    }
}

export const lookupFavorite = {
  $lookup: {
    from: 'members',
    let: { ownerId: '$favoriteResort.memberId' },
    pipeline: [
      { $match: { $expr: { $eq: ['$_id', '$$ownerId'] } } },
      { $project: { memberPassword: 0, accessToken: 0, authorization: 0 } },
    ],
    as: 'favoriteResort.memberData',
  },
};

export const lookupVisit = {
  $lookup: {
    from: 'members',
    let: { ownerId: '$visitedResort.memberId' },
    pipeline: [
      { $match: { $expr: { $eq: ['$_id', '$$ownerId'] } } },
      { $project: { memberPassword: 0, accessToken: 0, authorization: 0 } },
    ],
    as: 'visitedResort.memberData',
  },
};
