import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { getFullVideos, getVideoCount } from '@/db/videos';
import { methodNotAllowedHandlers, validateRequest } from '@/src/serverUtils';
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


const handlePost = async (body: BodySchema, query: QuerySchema) => {
  const {
    select,
    sort,
    where,
  } = body;
  const countPromise = getVideoCount(where);

  return getFullVideos(select, {
    sort,
    limit: query.limit,
    offset: query.offset,
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

const validator = validateRequest({ querySchema: QuerySchema, bodySchema: BodySchema });
export const Route = createFileRoute('/api/videos')({
  server: {
    handlers: {
      ...methodNotAllowedHandlers,
      POST: async ({ request }) => {
        const context = await validator(request);
        return handlePost(context.body, context.query);
      },
    },
  },
});
