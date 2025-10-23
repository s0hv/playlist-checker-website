import { URL } from 'url';

import type { RouteMethod } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';
import { type ZodObject, z } from 'zod';

import { cookieNames } from 'src/auth/cookie';
import { validateSessionToken } from 'src/auth/session';
import { throwBadRequestError, throwForbiddenError } from 'src/errors';

export type ContextType<
  TBody extends ZodObject = never,
  TQuery extends ZodObject = never
> = {
  body: TBody extends ZodObject ? z.infer<TBody> : undefined
  query: TQuery extends ZodObject ? z.infer<TQuery> : undefined
};


export const validateRequest = <
  TBody extends ZodObject = never,
  TQuery extends ZodObject = never
>(
  {
    bodySchema,
    querySchema,
  }: { bodySchema?: TBody, querySchema?: TQuery }) => {
  return async (req: Request): Promise<ContextType<TBody, TQuery>> => {
    await checkAuth();

    const context: ContextType<TBody, TQuery> = {
      body: undefined,
      query: undefined,
    } as ContextType<TBody, TQuery>;

    if (bodySchema) {
      const json: unknown = await req.json().catch(() => null);
      const result = await bodySchema.safeParseAsync(json);

      if (!result.success) {
        return throwBadRequestError({ errors: result.error.issues });
      }

      (context as ContextType<ZodObject>).body = result.data;
    }

    if (querySchema) {
      const parsedUrl = new URL(req.url || '', 'http://a.b');
      const query = Object.fromEntries(parsedUrl.searchParams.entries());
      const result = await querySchema.safeParseAsync(query);

      if (!result.success) {
        return throwBadRequestError({ errors: result.error.issues });
      }

      (context as ContextType<never, ZodObject>).query = result.data;
    }

    return context;
  };
};

export const checkAuth = async (): Promise<void> => {
  const session = getCookie(cookieNames.session);

  try {
    await validateSessionToken(session);
  } catch (err: unknown) {
    if (err instanceof Response) {
      throw err;
    }

    throwForbiddenError();
  }
};

export const methodNotAllowedHandler = () => new Response(null, {
  status: 405,
});

/**
 * A mapping for each HTTP method handler to return a 405 Method Not Allowed response.
 *
 * This should be used in API routes as a default, so the default handler is not called.
 */
export const methodNotAllowedHandlers: Record<RouteMethod, () => Response> = {
  ALL: methodNotAllowedHandler,
  DELETE: methodNotAllowedHandler,
  GET: methodNotAllowedHandler,
  HEAD: methodNotAllowedHandler,
  OPTIONS: methodNotAllowedHandler,
  PATCH: methodNotAllowedHandler,
  POST: methodNotAllowedHandler,
  PUT: methodNotAllowedHandler,
};
