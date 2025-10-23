import { createFileRoute } from '@tanstack/react-router';
import { setCookie } from '@tanstack/react-start/server';
import * as arctic from 'arctic';

import { cookieNames, oauthCookieOptions } from '@/src/auth/cookie';
import { discord } from '@/src/auth/oauthDiscord';
import { methodNotAllowedHandlers } from '@/src/serverUtils';

export const Route = createFileRoute('/auth/discord')({
  server: {
    handlers: {
      ...methodNotAllowedHandlers,
      GET,
    },
  },
});

function GET(): Response {
  const state = arctic.generateState();
  const codeVerifier = arctic.generateCodeVerifier();
  const scopes = ['email'];
  const url = discord.createAuthorizationURL(state, codeVerifier, scopes);

  setCookie(cookieNames.discordOauthState, state, oauthCookieOptions);
  setCookie(cookieNames.discordCodeVerifier, codeVerifier, oauthCookieOptions);

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}
