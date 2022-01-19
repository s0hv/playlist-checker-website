import { NextApiResponse } from 'next';
import {
  checkAuth,
  RequestFixedQuery,
  validateRequest, whereValidation,
  withBetterQuery
} from '../../../src/serverUtils';
import {
  getVideoCount,
} from '../../../src/db/videos';
import { ValidationChain } from 'express-validator';
import { ColumnFilter } from '../../../types/types';

interface Query {
  where?: ColumnFilter[]
}

const validation: ValidationChain[] = [
  ...whereValidation()
];

const handler = async (req: RequestFixedQuery<Query>, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end();
    return;
  }

  if (!await checkAuth(req, res)) return;

  return getVideoCount(req.query.where)
    .then(count => res.json({ count }))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
};

export default withBetterQuery(
  validateRequest(handler, validation)
);
