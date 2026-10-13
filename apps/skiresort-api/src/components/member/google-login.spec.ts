import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { MemberService } from './member.service';
import {
  MemberAuthType,
  MemberStatus,
  MemberType,
} from '../../libs/enums/member.enum';
import MemberSchema from '../../schemas/Member.model';
import { model } from 'mongoose';

jest.mock('uuid', () => ({ v4: () => 'test-image-id' }));

describe('Google login', () => {
  const identity = {
    uid: 'google-user',
    name: 'Test User',
    picture: 'https://example.com/avatar',
  };
  let member: { memberStatus: MemberStatus; accessToken?: string };
  let memberModel: Record<'findOne' | 'create', jest.Mock>;
  let auth: { createToken: jest.Mock };
  let firebase: { verifyGoogleToken: jest.Mock };
  let service: MemberService;

  beforeEach(() => {
    member = { memberStatus: MemberStatus.ACTIVE };
    memberModel = {
      findOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(member) }),
      create: jest.fn().mockResolvedValue(member),
    };
    auth = { createToken: jest.fn().mockResolvedValue('skiresort-token') };
    firebase = { verifyGoogleToken: jest.fn().mockResolvedValue(identity) };
    service = new MemberService(
      memberModel as unknown as ConstructorParameters<typeof MemberService>[0],
      {} as never,
      auth as unknown as ConstructorParameters<typeof MemberService>[2],
      {} as never,
      {} as never,
      {} as never,
      firebase,
      {} as never,
    );
  });

  it('logs in a returning member without profile fields', async () => {
    expect(
      await service.googleLogin({ idToken: 'firebase-token' }),
    ).toMatchObject({ accessToken: 'skiresort-token' });
    expect(firebase.verifyGoogleToken).toHaveBeenCalledWith('firebase-token');
    expect(memberModel.findOne).toHaveBeenCalledWith({
      firebaseUid: identity.uid,
    });
    expect(memberModel.create).not.toHaveBeenCalled();
  });

  it('creates a member with token only and no phone number', async () => {
    memberModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(
      service.googleLogin({ idToken: 'token' }),
    ).resolves.toMatchObject({
      accessToken: 'skiresort-token',
    });
    expect(memberModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firebaseUid: identity.uid,
        memberNick: expect.stringMatching(/^g_[a-f0-9]{10}$/),
        memberPhone: undefined,
      }),
    );
  });

  it('creates a USER with verified identity and no invented password', async () => {
    memberModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    await service.googleLogin({
      idToken: 'token',
      memberNick: 'nick',
      memberPhone: '01012345678',
    });
    expect(memberModel.create).toHaveBeenCalledWith({
      firebaseUid: identity.uid,
      memberAuthType: MemberAuthType.GOOGLE,
      memberType: MemberType.USER,
      memberNick: 'nick',
      memberPhone: '01012345678',
      memberFullName: identity.name,
      memberImage: identity.picture,
    });
  });

  it.each([MemberStatus.BLOCK, MemberStatus.DELETE])(
    'denies %s members',
    async (status) => {
      member.memberStatus = status;
      await expect(
        service.googleLogin({ idToken: 'token' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(auth.createToken).not.toHaveBeenCalled();
    },
  );

  it('rejects invalid tokens before accessing members', async () => {
    firebase.verifyGoogleToken.mockRejectedValue(
      new BadRequestException('invalid'),
    );
    await expect(service.googleLogin({ idToken: 'invalid' })).rejects.toThrow(
      'invalid',
    );
    expect(memberModel.findOne).not.toHaveBeenCalled();
  });

  it('does not link a colliding nickname or phone', async () => {
    memberModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    memberModel.create.mockRejectedValue({ code: 11000 });
    await expect(
      service.googleLogin({
        idToken: 'token',
        memberNick: 'nick',
        memberPhone: '01012345678',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(auth.createToken).not.toHaveBeenCalled();
  });

  it('recovers concurrent creation of the same Firebase identity', async () => {
    memberModel.findOne.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(null),
    });
    memberModel.create.mockRejectedValue({ code: 11000 });
    expect(
      await service.googleLogin({
        idToken: 'token',
        memberNick: 'nick',
        memberPhone: '01012345678',
      }),
    ).toMatchObject({ accessToken: 'skiresort-token' });
  });

  it('requires passwords for local members but not Firebase members', () => {
    const MemberModel = model('GoogleLoginSchemaTest', MemberSchema);
    const profile = { memberNick: 'nick', memberPhone: '01012345678' };
    expect(
      new MemberModel(profile).validateSync()?.errors.memberPassword,
    ).toBeDefined();
    expect(
      new MemberModel({ ...profile, firebaseUid: identity.uid }).validateSync(),
    ).toBeUndefined();
    expect(
      new MemberModel({
        memberNick: 'google',
        firebaseUid: identity.uid,
      }).validateSync(),
    ).toBeUndefined();
    expect(
      new MemberModel({
        memberNick: 'local',
        memberPassword: 'password',
      }).validateSync()?.errors.memberPhone,
    ).toBeDefined();
  });
});
