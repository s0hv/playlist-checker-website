import { createFileRoute } from '@tanstack/react-router';
import { getCookie } from '@tanstack/react-start/server';
import type { OAuth2Tokens } from 'arctic';

import { cookieNames } from '@/src/auth/cookie';
import { discord, DiscordUser } from '@/src/auth/oauthDiscord';
import { createSession, setSessionTokenCookie } from '@/src/auth/session';
import { sessionExpiresInSeconds } from '@/src/constants';
import { methodNotAllowedHandlers } from '@/src/serverUtils';

export const Route = createFileRoute('/auth/discord/callback')({
  server: {
    handlers: {
      ...methodNotAllowedHandlers,
      GET: ({ request }) => GET(request),
    },
  },
});


async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const storedState = getCookie(cookieNames.discordOauthState) ?? null;
  const codeVerifier = getCookie(cookieNames.discordCodeVerifier) ?? null;

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
  setSessionTokenCookie(session.token, new Date(session.createdAt.getTime() + sessionExpiresInSeconds * 1000));

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
    },
  });
}
