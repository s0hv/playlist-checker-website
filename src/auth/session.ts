import { setCookie } from '@tanstack/react-start/server';

import { getSession, insertSession } from '@/db/session';
import { cookieNames, oauthCookieOptions } from '@/src/auth/cookie';
import type { Session, SessionWithToken } from '@/types/session';
import { throwAuthorizationError } from 'src/errors';

// Implementation based on lucia auth v3
// https://lucia-auth.com/sessions/basic


const generateSecureRandomString = (): string => {
  // Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';

  // Generate 24 bytes = 192 bits of entropy.
  // We're only going to use 5 bits per byte so the total entropy will be 192 * 5 / 8 = 120 bits
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);

  let id = '';
  for (let i = 0; i < bytes.length; i++) {
    // >> 3 "removes" the right-most 3 bits of the byte
    id += alphabet[bytes[i] >> 3];
  }
  return id;
};

async function hashSecret(secret: string): Promise<Buffer> {
  const secretBytes = new TextEncoder().encode(secret);
  const secretHashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
  return Buffer.from(secretHashBuffer);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let c = 0;
  for (let i = 0; i < a.byteLength; i++) {
    c |= a[i] ^ b[i];
  }
  return c === 0;
}


export async function createSession(): Promise<SessionWithToken> {
  const now = new Date();

  const id = generateSecureRandomString();
  const secret = generateSecureRandomString();
  const secretHash = await hashSecret(secret);

  const token = id + '.' + secret;

  const session: SessionWithToken = {
    id,
    secretHash: secretHash.toString('base64'),
    createdAt: now,
    token,
  };

  await insertSession({
    id: session.id,
    secretHash: session.secretHash,
    createdAt: Math.floor(session.createdAt.getTime() / 1000),
  });

  return session;
}

export async function validateSessionToken(token: string | undefined): Promise<Session> {
  if (!token) {
    return throwAuthorizationError();
  }

  const tokenParts = token.split('.');
  if (tokenParts.length !== 2) {
    return throwAuthorizationError();
  }
  const sessionId = tokenParts[0];
  const sessionSecret = tokenParts[1];

  const session = await getSession(sessionId);
  if (!session) {
    return throwAuthorizationError();
  }

  const tokenSecretHash = await hashSecret(sessionSecret);
  const validSecret = constantTimeEqual(tokenSecretHash, Buffer.from(session.secretHash, 'base64'));
  if (!validSecret) {
    return throwAuthorizationError();
  }

  return session;
}

export function setSessionTokenCookie(token: string, expiresAt: Date): void {
  setCookie(cookieNames.session, token, {
    ...oauthCookieOptions,
    maxAge: undefined,
    expires: expiresAt,
  });
}
