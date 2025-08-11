import { z } from 'zod';

import { getFullVideos, getVideoCount } from '@/db/videos';
import { RequestFixedQuery, validateRequest } from '@/src/serverUtils';
import { SelectStatement, SortItem, WhereItem } from '@/types/api';

const BodySchema = z.object({
  select: SelectStatement,
  sort: z.array(SortItem).optional(),
  where: z.array(WhereItem),
});
type BodySchema = z.infer<typeof BodySchema>;

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(0).max(300).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
type QuerySchema = z.infer<typeof QuerySchema>;


const handler = async (req: RequestFixedQuery<BodySchema, QuerySchema>) => {
  const {
    select,
    sort,
    where,
  } = req.parsedBody;
  const countPromise = getVideoCount(where);

  return getFullVideos(select, {
    sort,
    limit: req.parsedQuery.limit,
    offset: req.parsedQuery.offset,
    where,
  })
    .then(async videos => Response.json({
      rows: videos.rows,
      count: await countPromise,
    }))
    .catch(err => {
      console.error(err);
      return new Response(null, {
        status: 500,
      });
    });
};

export const POST = validateRequest(handler, { querySchema: QuerySchema, bodySchema: BodySchema });
