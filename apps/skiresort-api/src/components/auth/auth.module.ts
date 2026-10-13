import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import RefreshSessionSchema from '../../schemas/RefreshSession.model';
import { SessionService } from './session.service';
import { SessionResolver } from './session.resolver';
import { sessionConfig } from './session.config';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: 'Member', schema: MemberSchema },
      { name: 'RefreshSession', schema: RefreshSessionSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('SECRET_TOKEN');
        if (!secret?.trim()) throw new Error('SECRET_TOKEN is required');
        return {
          secret,
          signOptions: { expiresIn: sessionConfig().accessSeconds },
        };
      },
    }),
  ],
  providers: [AuthService, FirebaseService, SessionService, SessionResolver],
  exports: [AuthService, FirebaseService, SessionService],
})
export class AuthModule {}
