import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';

import { cookieNames } from '@/src/auth/cookie';

export const redirectToAuthMiddleware = createMiddleware()
  .server(({ next, pathname }) => {
    if (pathname.startsWith('/auth')) {
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
