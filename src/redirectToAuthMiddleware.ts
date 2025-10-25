import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';

import { cookieNames } from '@/src/auth/cookie';
import { prerenderHeader } from '@/src/constants';

export const redirectToAuthMiddleware = createMiddleware()
  .server(({ next, pathname, request }) => {
    if (pathname.startsWith('/auth') || request.headers.get(prerenderHeader) === 'true') {
      return next();
    }

    const sessionExists = getCookie(cookieNames.session) !== undefined;

    // Redirect to /login if the user is not authenticated
    if (!sessionExists) {
      throw redirect({
        to: '/auth/discord',
      });
    }

    return next();
  });
