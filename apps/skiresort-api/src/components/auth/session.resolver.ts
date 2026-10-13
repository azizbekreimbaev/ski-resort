import {
  Context,
  Field,
  Mutation,
  ObjectType,
  Resolver,
} from '@nestjs/graphql';
import { SessionService } from './session.service';
import type { SessionContext } from './session.config';

@ObjectType()
export class RefreshTokenPayload {
  @Field(() => String)
  accessToken!: string;
}

@Resolver()
export class SessionResolver {
  constructor(private readonly sessionService: SessionService) {}

  @Mutation(() => RefreshTokenPayload)
  public async refreshToken(
    @Context() context: SessionContext,
  ): Promise<RefreshTokenPayload> {
    return this.sessionService.refresh(context);
  }

  @Mutation(() => Boolean)
  public async logout(@Context() context: SessionContext): Promise<boolean> {
    return this.sessionService.logout(context);
  }
}
