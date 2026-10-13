import { GraphQLError } from 'graphql';
import type { Request, Response, CookieOptions } from 'express';

export const REFRESH_COOKIE = 'skiresort_refresh';

export function authError(code: string): GraphQLError {
  return new GraphQLError(code, { extensions: { code } });
}

export function sessionConfig() {
  const production = process.env.NODE_ENV === 'production';
  const seconds = (name: string, fallback: number) => {
    const value = Number(process.env[name] ?? fallback);
    if (!Number.isSafeInteger(value) || value <= 0)
      throw new Error(`${name} must be a positive integer in seconds`);
    return value;
  };
  const origins = (
    process.env.AUTH_ALLOWED_ORIGINS ??
    (production ? '' : 'http://localhost:3000')
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (!origins.length) throw new Error('AUTH_ALLOWED_ORIGINS is required');
  for (const origin of origins) {
    const url = new URL(origin);
    if (
      url.origin !== origin ||
      !['http:', 'https:'].includes(url.protocol) ||
      (production && url.protocol !== 'https:')
    )
      throw new Error(
        'AUTH_ALLOWED_ORIGINS must contain exact browser origins',
      );
  }
  const domain = process.env.AUTH_COOKIE_DOMAIN || undefined;
  if (domain && !/^\.?[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*$/.test(domain))
    throw new Error('AUTH_COOKIE_DOMAIN must be a hostname');
  return {
    accessSeconds: seconds('ACCESS_TOKEN_TTL_SECONDS', 900),
    refreshSeconds: seconds('REFRESH_TOKEN_TTL_SECONDS', 2592000),
    origins,
    cookie: {
      httpOnly: true,
      secure: production,
      sameSite: 'lax',
      path: '/graphql',
      ...(domain ? { domain } : {}),
    } satisfies CookieOptions,
  };
}

export interface SessionContext {
  req: Request;
  res: Response;
}

export function assertSessionRequest(req: Request): void {
  const origin = req.headers.origin;
  if (
    req.method !== 'POST' ||
    req.headers['x-csrf-protection'] !== '1' ||
    (origin !== undefined && !sessionConfig().origins.includes(origin))
  )
    throw authError('CSRF_FAILED');
}

export function refreshCookie(req: Request): string | undefined {
  const values = (req.headers.cookie ?? '')
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.startsWith(`${REFRESH_COOKIE}=`));
  if (values.length !== 1) return undefined;
  const value = values[0].slice(REFRESH_COOKIE.length + 1);
  return /^[A-Za-z0-9_-]{43}$/.test(value) ? value : undefined;
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, sessionConfig().cookie);
}
