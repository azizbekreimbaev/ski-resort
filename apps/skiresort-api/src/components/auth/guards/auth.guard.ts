import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Message } from '../../../libs/enums/common.enum';
import { authError } from '../session.config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext | any): Promise<boolean> {
    console.info('--- @guard() Authentication [AuthGuard] ---');

    if (context.contextType === 'graphql') {
      const request = context.getArgByIndex(2).req;

      const bearerToken: unknown = request.headers.authorization;
      if (!bearerToken) throw authError('ACCESS_TOKEN_MISSING');
      if (
        typeof bearerToken !== 'string' ||
        !/^Bearer [^\s]+$/i.test(bearerToken)
      )
        throw authError('ACCESS_TOKEN_INVALID');

      const token = bearerToken.split(' ')[1],
        authMember = await this.authService.verifyAuth(token);
      if (!authMember)
        throw new UnauthorizedException(Message.NOT_AUTHENTICATED);

      console.log('memberNick[auth] =>', authMember.memberNick);
      request.body.authMember = authMember;

      return true;
    }
    return false;
    // description => http, rpc, gprs and etc are ignored
  }
}
