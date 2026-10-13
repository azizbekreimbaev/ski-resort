import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Member } from '../../libs/dto/member/member';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { authError } from './session.config';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  public async hashPassword(memberPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt();

    return await bcrypt.hash(memberPassword, salt);
  }

  public async comparePasswords(
    password: string,
    hashedPassword: string | undefined,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async createToken(member: Member): Promise<string> {
    const payload: T = {};
    Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
      payload[`${ele}`] = member[`${ele}`];
    });
    delete payload.memberPassword;
    delete payload.firebaseUid;
    delete payload.accessToken;
    delete payload.iat;
    delete payload.exp;

    return await this.jwtService.signAsync(payload);
  }

  public async verifyAuth(token: string): Promise<Member> {
    try {
      const member = await this.jwtService.verifyAsync<Member>(token);
      member._id = shapeIntoMongoObjectId(member._id);
      return member;
    } catch (error) {
      throw authError(
        error instanceof Error && error.name === 'TokenExpiredError'
          ? 'ACCESS_TOKEN_EXPIRED'
          : 'ACCESS_TOKEN_INVALID',
      );
    }
  }
}
