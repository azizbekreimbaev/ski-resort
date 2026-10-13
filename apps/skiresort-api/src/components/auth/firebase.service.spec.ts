import { getAuth } from 'firebase-admin/auth';
import { FirebaseService } from './firebase.service';

jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn(() => [{ name: 'skiresort-auth' }]),
  applicationDefault: jest.fn(),
  initializeApp: jest.fn(),
}));
jest.mock('firebase-admin/auth', () => ({ getAuth: jest.fn() }));

describe('Firebase Google verification', () => {
  const verifyIdToken = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (getAuth as jest.Mock).mockReturnValue({ verifyIdToken });
  });

  it('verifies token revocation and accepts Google identities', async () => {
    const identity = {
      uid: 'uid',
      firebase: { sign_in_provider: 'google.com' },
    };
    verifyIdToken.mockResolvedValue(identity);
    expect(await new FirebaseService().verifyGoogleToken('token')).toEqual(
      identity,
    );
    expect(verifyIdToken).toHaveBeenCalledWith('token', true);
  });

  it('rejects other Firebase providers', async () => {
    verifyIdToken.mockResolvedValue({
      firebase: { sign_in_provider: 'password' },
    });
    await expect(
      new FirebaseService().verifyGoogleToken('token'),
    ).rejects.toThrow('INVALID_GOOGLE_TOKEN');
  });

  it('rejects expired, revoked, malformed or wrong-project tokens', async () => {
    verifyIdToken.mockRejectedValue(new Error('Firebase verification failed'));
    await expect(
      new FirebaseService().verifyGoogleToken('token'),
    ).rejects.toThrow('INVALID_GOOGLE_TOKEN');
  });
});
