import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHash, randomBytes } from 'crypto';
import { GraphQLError } from 'graphql';
import { Member } from '../../libs/dto/member/member';
import { MemberStatus } from '../../libs/enums/member.enum';
import { RefreshSession } from '../../schemas/RefreshSession.model';
import { AuthService } from './auth.service';
import {
  authError,
  assertSessionRequest,
  clearRefreshCookie,
  refreshCookie,
  REFRESH_COOKIE,
  sessionConfig,
  SessionContext,
} from './session.config';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel('RefreshSession')
    private readonly sessionModel: Model<RefreshSession>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private readonly authService: AuthService,
  ) {}

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  public async create(member: Member, context: SessionContext): Promise<void> {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(
      Date.now() + sessionConfig().refreshSeconds * 1000,
    );
    await this.sessionModel.create({
      memberId: member._id,
      tokenHash: this.hash(token),
      expiresAt,
    });
    context.res.cookie(REFRESH_COOKIE, token, {
      ...sessionConfig().cookie,
      expires: expiresAt,
    });
  }

  public async refresh(
    context: SessionContext,
  ): Promise<{ accessToken: string }> {
    assertSessionRequest(context.req);
    try {
      const token = refreshCookie(context.req);
      if (!token) throw authError('REFRESH_TOKEN_INVALID');
      const hash = this.hash(token);
      const session = await this.sessionModel
        .findOne({
          $or: [{ tokenHash: hash }, { consumedHashes: hash }],
        })
        .exec();
      if (!session) throw authError('REFRESH_TOKEN_INVALID');
      if (session.revokedAt) throw authError('REFRESH_TOKEN_REVOKED');
      if (session.tokenHash !== hash) {
        await this.revoke(session._id, 'reuse');
        throw authError('REFRESH_TOKEN_REUSED');
      }
      if (session.expiresAt.getTime() <= Date.now())
        throw authError('REFRESH_TOKEN_EXPIRED');
      const member = await this.memberModel.findById(session.memberId).exec();
      if (!member || member.memberStatus !== MemberStatus.ACTIVE) {
        await this.revokeMember(session.memberId, 'member_inactive');
        throw authError(
          member?.memberStatus === MemberStatus.BLOCK
            ? 'MEMBER_BLOCKED'
            : 'REFRESH_TOKEN_REVOKED',
        );
      }
      const accessToken = await this.authService.createToken(member);
      const replacement = randomBytes(32).toString('base64url');
      const rotated = await this.sessionModel
        .findOneAndUpdate(
          {
            _id: session._id,
            tokenHash: hash,
            revokedAt: null,
            expiresAt: { $gt: new Date() },
          },
          {
            $set: { tokenHash: this.hash(replacement), rotatedAt: new Date() },
            $push: { consumedHashes: hash },
          },
          { new: true },
        )
        .exec();
      if (!rotated) {
        const latest = await this.sessionModel.findById(session._id).exec();
        if (latest?.revokedAt) throw authError('REFRESH_TOKEN_REVOKED');
        if (latest?.consumedHashes.includes(hash)) {
          await this.revoke(session._id, 'reuse');
          throw authError('REFRESH_TOKEN_REUSED');
        }
        throw authError(
          latest && latest.expiresAt.getTime() <= Date.now()
            ? 'REFRESH_TOKEN_EXPIRED'
            : 'REFRESH_TOKEN_INVALID',
        );
      }
      context.res.cookie(REFRESH_COOKIE, replacement, {
        ...sessionConfig().cookie,
        expires: rotated.expiresAt,
      });
      return { accessToken };
    } catch (error) {
      if (error instanceof GraphQLError) clearRefreshCookie(context.res);
      throw error;
    }
  }

  public async logout(context: SessionContext): Promise<boolean> {
    assertSessionRequest(context.req);
    const token = refreshCookie(context.req);
    if (token) {
      const hash = this.hash(token);
      await this.sessionModel
        .updateOne(
          {
            $or: [{ tokenHash: hash }, { consumedHashes: hash }],
            revokedAt: null,
          },
          { $set: { revokedAt: new Date(), revocationReason: 'logout' } },
        )
        .exec();
    }
    clearRefreshCookie(context.res);
    return true;
  }

  private async revoke(
    id: RefreshSession['_id'],
    reason: string,
  ): Promise<void> {
    await this.sessionModel
      .updateOne(
        { _id: id, revokedAt: null },
        { $set: { revokedAt: new Date(), revocationReason: reason } },
      )
      .exec();
  }

  public async revokeMember(
    memberId: Member['_id'] | Types.ObjectId | string,
    reason: string,
  ): Promise<void> {
    await this.sessionModel
      .updateMany(
        { memberId, revokedAt: null },
        { $set: { revokedAt: new Date(), revocationReason: reason } },
      )
      .exec();
  }
}
