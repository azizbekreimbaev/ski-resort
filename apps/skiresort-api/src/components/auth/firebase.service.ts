import { Injectable, UnauthorizedException } from '@nestjs/common';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService {
  public async verifyGoogleToken(idToken: string): Promise<DecodedIdToken> {
    try {
      const app =
        getApps().find(
          (application) => application.name === 'skiresort-auth',
        ) ??
        initializeApp({ credential: applicationDefault() }, 'skiresort-auth');
      const identity = await getAuth(app).verifyIdToken(idToken, true);
      if (identity.firebase.sign_in_provider !== 'google.com') {
        throw new UnauthorizedException();
      }
      return identity;
    } catch {
      throw new UnauthorizedException('INVALID_GOOGLE_TOKEN');
    }
  }
}
