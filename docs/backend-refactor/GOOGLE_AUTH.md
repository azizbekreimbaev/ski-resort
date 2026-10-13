# Firebase Google login

Firebase proves Google identity; MongoDB holds SkiResort members and AuthService issues the existing SkiResort JWT. Existing signup/login and guards remain in use. This is a feature addition, not a whole-backend Nestar refactor.

## Configuration

Enable Google in Firebase Authentication and authorize the frontend domain. Set GOOGLE_APPLICATION_CREDENTIALS in the backend environment to an external service-account JSON path. Never commit that JSON. AuthModule exports FirebaseService; MemberModule already imports AuthModule. FirebaseService initializes the Admin app lazily, so existing password login does not require Firebase connectivity.

## Frontend integration

Install `firebase` in the frontend repository and initialize it with the web configuration from the Firebase console, supplied through the frontend environment configuration. Keep local configuration out of this repository. On a button click:

```ts
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const result = await signInWithPopup(getAuth(app), new GoogleAuthProvider());
const idToken = await result.user.getIdToken();
```

Send that Firebase ID token to the existing GraphQL endpoint:

```graphql
mutation GoogleLogin($input: GoogleLoginInput!) {
  googleLogin(input: $input) {
    _id
    memberNick
    memberType
    accessToken
  }
}
```

First try `{ "input": { "idToken": "<firebase-id-token>" } }`. On GOOGLE_PROFILE_REQUIRED, collect nickname (3–12 characters) and phone, then repeat with memberNick and memberPhone. Returning members need only idToken. Store/use the returned accessToken exactly as with existing login. Canceling the popup should leave the user signed out; if backend login fails, do not treat the Firebase session alone as a SkiResort login.

The phone is user-supplied profile data, not a verified phone identity. This flow does not add SMS verification or grant access to an existing account with the same phone.

## Request flow and behavior

MemberResolver.googleLogin delegates to MemberService.googleLogin. FirebaseService verifies the token, checks revocation/disabled Firebase users, and requires google.com as the sign-in provider. MemberService finds the member by private firebaseUid, or creates an ACTIVE USER after profile completion. Names and pictures come from verified claims; roles never come from client input. BLOCK/DELETE accounts receive no JWT.

MemberSchema keeps unique nickname/phone constraints and adds a sparse unique Firebase UID index. Password is required for local members but not Google members. Existing members receive no UID automatically; no account linking occurs on nickname/phone collisions. Google-only members attempting password login receive GOOGLE_LOGIN_REQUIRED unless they later set a password through an existing permitted profile flow. Firebase UID is not a GraphQL field and is excluded from JWT payloads.

Errors: INVALID_GOOGLE_TOKEN, GOOGLE_PROFILE_REQUIRED, INVALID_MEMBER_NICK, existing blocked/deleted-member messages, and existing nickname/phone conflict message. Simultaneous signup for the same Firebase UID resolves to the persisted member after a duplicate-key error. Google operations log outcomes rather than request tokens or response JWTs.

## Deployment and verification

No backfill is needed. Before enabling login, confirm the database has built the sparse unique firebaseUid index through the existing index management policy; changing production index-management settings is outside this feature. Existing records remain local members. Keep the login button disabled until backend credentials and this index are ready.

Unit tests mock Firebase/Mongoose and exercise returning/new members, missing profile, blocked/deleted accounts, collisions, concurrent signup, schema password rules and provider verification. Live acceptance: use a Google account, complete the profile, call an existing guarded query with the returned SkiResort JWT, then sign out and sign in again without creating another member. Live acceptance requires the frontend and a development database.

Implementation checks: API and batch builds passed. The complete existing test suite passed 621 tests, with 7 database integration tests skipped. An additional GraphQL contract/validation suite passed; all 14 focused Firebase/Google tests passed. Scoped lint reports existing findings in legacy auth/member/resolver/interceptor code; new Firebase services/tests and schema changes are clean. Live OAuth, application bootstrap and database index creation were not run.
