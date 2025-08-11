import type { OAuth2Tokens } from 'arctic';
import { cookies } from 'next/headers';

import { cookieNames } from '@/src/auth/cookie';
import { discord, DiscordUser } from '@/src/auth/oauthDiscord';
import { createSession, setSessionTokenCookie } from '@/src/auth/session';
import { sessionExpiresInSeconds } from '@/src/constants';


export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get(cookieNames.discordOauthState)?.value ?? null;
  const codeVerifier = cookieStore.get(cookieNames.discordCodeVerifier)?.value ?? null;

  if (code === null || state === null || storedState === null || codeVerifier === null) {
    return new Response(null, {
      status: 400,
    });
  }

  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await discord.validateAuthorizationCode(code, codeVerifier);
  } catch {
    // Invalid code or client credentials
    return new Response(null, {
      status: 400,
    });
  }

  const discordUserResponse = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });

  const discordUserParsed = await discordUserResponse.json().then(DiscordUser.safeParseAsync);

  if (!discordUserParsed.success) {
    return new Response(null, {
      status: 400,
    });
  }

  const discordUser = discordUserParsed.data;

  if (discordUser.id.toString() !== process.env.ALLOWED_ID) {
    return new Response(null, {
      status: 400,
    });
  }


  const session = await createSession();
  await setSessionTokenCookie(session.token, new Date(session.createdAt.getTime() + sessionExpiresInSeconds * 1000));

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
    },
  });
}
