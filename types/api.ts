import { mapValues } from 'es-toolkit';
import { z } from 'zod';

import { Comparator, tableCols } from '@/db/constants';

export const TableAndColumn = z.discriminatedUnion(
  'table',
  [
    z.object({
      table: z.literal('video'),
      col: z.literal(tableCols.video),
    }),

    z.object({
      table: z.literal('tag'),
      col: z.literal(tableCols.tag),
    }),

    z.object({
      table: z.literal('channel'),
      col: z.literal(tableCols.channel),
    }),

    z.object({
      table: z.literal('playlist'),
      col: z.literal(tableCols.playlist),
    }),

    z.object({
      table: z.literal('files'),
      col: z.literal(tableCols.files),
    }),
  ]
);
export type TableAndColumn = z.infer<typeof TableAndColumn>;

export const WhereItem = z.intersection(
  z.discriminatedUnion(
    'comp',
    [
      z.object({
        comp: z.literal(['=', 'ILIKE', 'NOT ILIKE', '<>', '<', '<=', '>', '>=', 'true', 'false', 'at', 'before', 'after'] as const satisfies Comparator[]),
        value: z.union([z.string(), z.number()]),
      }),

      z.object({
        comp: z.literal(['arrayAny', 'array=', 'arrayLike'] as const satisfies Comparator[]),
        value: z.union([z.array(z.string()), z.array(z.number())]),
      }),
    ]
  ),
  TableAndColumn
);
export type WhereItem = z.infer<typeof WhereItem>;

const BaseSortItem = z.object({
  asc: z.boolean().optional().default(true),
});

export const SortItem = z.intersection(BaseSortItem, TableAndColumn);
export type SortItem = z.infer<typeof SortItem>;

export const SelectStatement = z.object(
  mapValues(tableCols, cols => z.array(z.literal(cols)).optional())
);
export type SelectStatement = z.infer<typeof SelectStatement>;
