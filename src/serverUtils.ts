import { URL } from 'url';

import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { type ZodObject, z } from 'zod';

import { cookieNames } from '@/src/auth/cookie';
import { validateSessionToken } from '@/src/auth/session';

export interface BetterQuery<TBody = never, TQuery = never> {
  json: <T>() => Promise<T>
  parsedBody: TBody
  parsedQuery: TQuery
}
export type RequestFixedQuery<TBody = never, TQuery = never> = NextRequest & BetterQuery<TBody, TQuery>;
type RequestFn<TBody = never, TQuery = never> = (req: RequestFixedQuery<TBody, TQuery>) => void;

export const validateRequest = <TBody extends ZodObject = never, TQuery extends ZodObject = never>(
  fn: RequestFn<z.infer<TBody>, z.infer<TQuery>>,
  {
    bodySchema,
    querySchema,
  }: { bodySchema?: TBody, querySchema?: TQuery }) => {
  return async (req: RequestFixedQuery<z.infer<TBody>, z.infer<TQuery>>) => {
    // First authenticate the user
    if (!await checkAuth()) return;

    if (bodySchema) {
      const result = await bodySchema.safeParseAsync(await req.json());

      if (!result.success) {
        return Response.json({ errors: result.error.issues }, { status: 400 });
      }

      req.parsedBody = result.data;
    }

    if (querySchema) {
      const parsedUrl = new URL(req.url || '', 'http://a.b');
      const query = Object.fromEntries(parsedUrl.searchParams.entries());
      const result = await querySchema.safeParseAsync(query);

      if (!result.success) {
        return Response.json({ errors: result.error.issues }, { status: 400 });
      }

      req.parsedQuery = result.data;
    }

    return fn(req);
  };
};

export const checkAuth = async (): Promise<boolean | Response> => {
  const session = (await cookies()).get(cookieNames.session)?.value;

  try {
    await validateSessionToken(session);
  } catch {
    return new Response(null, { status: 403 });
  }

  return true;
};
