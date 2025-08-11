import * as arctic from 'arctic';
import { cookies } from 'next/headers';

import { cookieNames, oauthCookieOptions } from '@/src/auth/cookie';
import { discord } from '@/src/auth/oauthDiscord';

export async function GET(): Promise<Response> {
  const state = arctic.generateState();
  const codeVerifier = arctic.generateCodeVerifier();
  const scopes = ['email'];
  const url = discord.createAuthorizationURL(state, codeVerifier, scopes);


  const cookieStore = await cookies();
  cookieStore.set(cookieNames.discordOauthState, state, oauthCookieOptions);
  cookieStore.set(cookieNames.discordCodeVerifier, codeVerifier, oauthCookieOptions);

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}
