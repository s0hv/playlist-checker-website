import { cookies } from 'next/headers';
import { MiddlewareConfig, NextRequest, NextResponse } from 'next/server';

import { cookieNames } from '@/src/auth/cookie';

export default async function middleware(req: NextRequest) {
  const sessionExists = (await cookies()).has(cookieNames.session);

  // Redirect to /login if the user is not authenticated
  if (!sessionExists) {
    return NextResponse.redirect(new URL('/auth/discord', req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config: MiddlewareConfig = {
  matcher: [
    {
      source: '/((?!api|auth|_next/static).*)',
      // For some reason this does not take the source parameter into account
      // missing: [{ type: 'cookie', key: cookieNames.session }],
    },
  ],
};
