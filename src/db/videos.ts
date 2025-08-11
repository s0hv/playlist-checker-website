import {
  type FragmentSqlToken,
  type IdentifierSqlToken,
  type QueryResult,
} from 'slonik';

import { type Table, AscSort, DescSort, tableCols } from '@/db/constants';
import {
  comparatorMapping,
  preProcessColumn,
  preProcessValue,
} from '@/db/operators';
import { type WhereItem, SelectStatement } from '@/types/api';
import { ColumnSort, PlaylistName, VideoRow } from '@/types/types';

import { pool, sql } from './index';

const doArrayComparison = (
  value: string | number | FragmentSqlToken | IdentifierSqlToken,
  table: Table,
  col: string,
  comp: FragmentSqlToken
): FragmentSqlToken => {
  let select: FragmentSqlToken;

  switch (table) {
    case 'tag':
      select = sql.fragment`SELECT videotags.video_id FROM videotags INNER JOIN tags t ON t.id = videotags.tag_id WHERE ${sql.identifier(['t', col])} ${comp} ${value}`;
      break;

    case 'playlist':
      select = sql.fragment`SELECT playlistvideos.video_id FROM playlistvideos INNER JOIN playlists p ON p.id = playlistvideos.playlist_id WHERE ${sql.identifier(['p', col])} ${comp} ${value}`;
      break;

    default:
      throw new Error('Unsupported table');
  }

  return sql.fragment`video.id=ANY(${select})`;
};

const arrayAggregated = {
  playlist: new Set(tableCols.playlist),
  tag: new Set(tableCols.tag),
} as const;
type ArrayAggregatedKey = keyof typeof arrayAggregated;

const generateJoins = (tables: Set<Table>): FragmentSqlToken => {
  const joins: FragmentSqlToken[] = [];
  for (const table of tables) {
    switch (table) {
      case 'files':
        joins.push(sql.fragment`LEFT JOIN extra_video_files files ON video.id = files.video_id`);
        break;

      // This is actually way faster compared to a normal join with group by and array_agg outside the join
      case 'playlist':
        joins.push(sql.fragment`
          LEFT JOIN (
            SELECT array_agg(playlist.name) as name, array_agg(playlist.playlist_id) as playlist_id, pv.video_id 
            FROM playlistvideos pv
            INNER JOIN playlists playlist ON playlist.id = pv.playlist_id 
            GROUP BY pv.video_id
            ) as playlist ON playlist.video_id=video.id
        `);
        break;

      case 'tag':
        joins.push(sql.fragment`
          LEFT JOIN (
            SELECT array_agg(tag.tag) as tag, vt.video_id 
            FROM videotags vt
            INNER JOIN tags tag ON tag.id = vt.tag_id 
            GROUP BY vt.video_id
            ) as tag ON tag.video_id=video.id
        `);
        break;

      case 'channel':
        // Channel information might sometimes be missing
        joins.push(sql.fragment`
          LEFT JOIN channelvideos cv ON video.id = cv.video_id
          LEFT JOIN channels channel ON cv.channel_id = channel.id
        `);
        break;
    }
  }

  return sql.fragment`${joins.length > 0 ? sql.join(joins, sql.fragment`\n`) : sql.fragment``}`;
};

const generateWhere = (where: WhereItem[]): [FragmentSqlToken, Set<Table>] => {
  const whereClause: FragmentSqlToken[] = [];
  const tables = new Set<Table>();

  for (const filter of where) {
    const compString = filter.comp;

    const comp = comparatorMapping[compString];
    const col = preProcessColumn[compString](sql.identifier([filter.table, filter.col]));

    // Arrays have their own special processing
    const isArrayComp = compString.startsWith('array');
    if (isArrayComp && arrayAggregated[filter.table as ArrayAggregatedKey]?.has(filter.col as never)) {
      whereClause.push(
        doArrayComparison(preProcessValue[compString](filter.value), filter.table, filter.col, comp)
      );
    } else {
      // Normal `col = value` type statement
      whereClause.push(sql.fragment`${col} ${comp} ${preProcessValue[compString](filter.value)}`);
    }

    tables.add(<Table>filter.table);
  }

  return [
    sql.fragment`${whereClause.length > 0
      ? sql.fragment`WHERE ${sql.join(whereClause, sql.fragment` AND `)}`
      : sql.fragment``}`,
    tables,
  ];
};


type OptionalParams = {
  where?: WhereItem[]
  sort?: ColumnSort[]
  limit?: number
  offset?: number
};
export const getFullVideos = (select: SelectStatement, { where, sort, limit, offset }: OptionalParams = {}): Promise<QueryResult<VideoRow>> => {
  limit = limit || 10;
  const selectedCols: Array<FragmentSqlToken | IdentifierSqlToken> = [];
  const orderBy: FragmentSqlToken[] = [];
  const tables: Set<Table> = new Set();

  // ID should be always selected for default sorting
  let idSelected = false;

  // Add all selected columns and tables to their corresponding lists
  Object.entries(select).forEach(([table, cols]) => {
    if (!cols) return;

    for (const col of cols) {
      // Add select
      if (table !== 'video') {
        const combined = `${table}_${col}`;
        const sqlCol = sql.identifier([table, col]);
        const colName = sql.identifier([combined]);
        selectedCols.push(sql.fragment`${sqlCol} as ${colName}`);
      } else {
        selectedCols.push(sql.identifier([table, col]));

        // Video id contained in the select list
        if (col === 'id') idSelected = true;
      }
    }
    tables.add(<Table>table);
  });

  const [whereClause] = generateWhere(where ?? []);

  if (sort) {
    for (const col of sort) {
      orderBy.push(
        sql.fragment`${sql.identifier([col.table, col.col])} ${col.asc !== false ? AscSort : DescSort} NULLS LAST`
      );
    }
  }

  if (orderBy.length === 0) {
    if (!idSelected) {
      selectedCols.push(sql.identifier(['video', 'id']));
    }

    orderBy.push(sql.fragment`${sql.identifier(['video', 'id'])}`);
  }

  if (selectedCols.length === 0) {
    throw new Error('No selected columns given');
  }

  const joins = generateJoins(tables);

  return pool.query(sql.type(VideoRow)`
    SELECT ${sql.join(selectedCols, sql.fragment`, `)}
    FROM videos video
    ${joins}
    ${whereClause}
    ORDER BY ${sql.join(orderBy, sql.fragment`, `)}
    LIMIT ${limit} ${offset ? sql.fragment`OFFSET ${offset}` : sql.fragment``}
  `);
};


export const getVideoCount = (where?: WhereItem[]): Promise<number> => {
  const [whereClause, tables] = generateWhere(where ?? []);
  const joins = generateJoins(tables);

  return pool.oneFirst(sql.typeAlias('count')`SELECT COUNT(*) as count FROM videos video ${joins} ${whereClause}`);
};

export const getPlaylists = (): Promise<readonly PlaylistName[]> => {
  return pool.many(sql.type(PlaylistName)`SELECT "name", id FROM playlists`);
};
