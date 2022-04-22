import qs  from 'qs';
import { URL } from 'url';
import { NextApiRequest, NextApiResponse } from 'next';
import { query, ValidationChain, validationResult } from 'express-validator';
import { validateColumnFilters } from './db/videos';
import { getSession } from 'next-auth/react';
import { Session } from 'next-auth';

export interface BetterQuery<T> {
  query: T
}
export type RequestFixedQuery<T> = NextApiRequest & BetterQuery<T>;
type RequestFn<T> = (req: RequestFixedQuery<T>, res: NextApiResponse) => void;

export const withBetterQuery = <T>(fn: (req: RequestFixedQuery<T>, res: NextApiResponse) => void) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const reqCast = <RequestFixedQuery<T>>req;

    const parsedUrl = new URL(reqCast.url || '', 'http://a.b');
    // Query needs to be correctly parsed so express-validator works properly
    // @ts-ignore
    reqCast.query = qs.parse(parsedUrl.search, { ignoreQueryPrefix: true }) as unknown as T;

    return fn(reqCast, res);
  };
};

export const validateRequest = <T>(fn: RequestFn<T>, validations: ValidationChain[]) => {
  return async (req: RequestFixedQuery<T>, res: NextApiResponse) => {
    await Promise.all(validations.map(v => v.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return fn(req, res);
    }

    res.status(400).json({ errors: errors.array() });
  };
};

export const whereValidation = (basePath: string = '') => [
  query(`${basePath}where`)
    .optional()
    .isArray()
    .custom((value ) => validateColumnFilters(value)),
  query(`${basePath}where.*.col`)
    .if(query(`${basePath}where`).exists())
    .isString()
    .exists({ checkNull: true, checkFalsy: true }),
  query(`${basePath}where.*.table`)
    .if(query(`${basePath}where`).exists())
    .isString()
    .exists({ checkNull: true, checkFalsy: true }),
  query(`${basePath}where.*.table`)
    .if(query(`${basePath}where`).exists())
    .isString()
    .exists({ checkNull: true, checkFalsy: true }),
  query(`${basePath}where.*.value`)
    .if(query(`${basePath}where`).exists())
    .custom((value) => typeof value === 'string' || (Array.isArray(value) && value.every(v => typeof v === 'string')))
    .exists({ checkNull: true, checkFalsy: true }),
  query(`${basePath}where.*.comp`)
    .if(query(`${basePath}where`).exists())
    .isString()
    .exists({ checkNull: true, checkFalsy: true })
];

export const checkAuth = async (req: NextApiRequest, res: NextApiResponse): Promise<boolean> => {
  const session = await getSession({ req }) as (Session | null) & { user: { id?: string }};

  if (!process.env.ALLOWED_ID || !session || session.user?.id !== process.env.ALLOWED_ID) {
    res.status(403).end();
    return false;
  }

  return true;
};
