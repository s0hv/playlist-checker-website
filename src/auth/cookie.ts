export const cookieNames = {
  discordOauthState: 'discord_oauth_state',
  discordCodeVerifier: 'discord_code_verifier',
  session: 'pcw-s',
} as const;

export const oauthCookieOptions = {
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  maxAge: 60 * 10,
  sameSite: 'lax',
} as const;
