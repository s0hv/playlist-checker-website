import { NextApiResponse } from 'next';
import {
  checkAuth,
  RequestFixedQuery,
  validateRequest, whereValidation,
  withBetterQuery
} from '../../../src/serverUtils';
import {
  getFullVideos,
  TableCols,
  validateObjectColumns, validateSort,
} from '../../../src/db/videos';
import { query, ValidationChain } from 'express-validator';
import { ColumnFilter, ColumnSort } from '../../../types/types';

interface Query {
  select: TableCols,
  sort?: ColumnSort[]
  where?: ColumnFilter[]
  limit?: number
  offset?: number
}

const validation: ValidationChain[] = [
  query('select')
    .isObject()
    .exists({ checkNull: true, checkFalsy: true }),
  query('select.*')
    .isArray()
    .exists({ checkNull: true, checkFalsy: true })
    .bail()
    .custom((value, { path }) => validateObjectColumns(path, value)),

  query('sort')
    .optional()
    .isArray()
    .custom(value => validateSort(value)),
  query('sort.*.col')
    .if(query('sort').exists())
    .isString()
    .exists({ checkNull: true, checkFalsy: true }),
  query('sort.*.table')
    .if(query('sort').exists())
    .isString()
    .exists({ checkNull: true, checkFalsy: true }),
  query('sort.*.asc')
    .if(query('sort').exists())
    .isBoolean()
    .optional({ nullable: false })
    .default(true)
    .toBoolean(),

  query('limit')
    .optional()
    .isInt({
      min: 1,
      max: 300
    })
    .toInt(10),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .toInt(10),
  ...whereValidation()
];

const handler = async (req: RequestFixedQuery<Query>, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end();
    return;
  }

  if (!await checkAuth(req, res)) return;

  return getFullVideos(req.query.select, {
    sort: req.query.sort,
    limit: req.query.limit,
    offset: req.query.offset,
    where: req.query.where
  })
    .then(videos => res.json({ rows: videos.rows }))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
};

export default withBetterQuery(
  validateRequest(handler, validation)
);
