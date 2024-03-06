import { IdentifierSqlToken, QueryResult, QuerySqlToken, sql as rootSql } from 'slonik';
import { z } from 'zod';
import { ColumnFilter, ColumnSort, PlaylistName, VideoRow } from '../../types/types';
import { pool } from './index';

const sql = rootSql.unsafe;

const comparators = [
  '=', 'ILIKE', 'NOT ILIKE', '<>', '<', '<=', '>', '>=',
  'true', 'false', 'at', 'before', 'after', 'array=', 'arrayLike', 'arrayAny'] as const;
type Comparator = typeof comparators[number];

type PreProcessor = (value: string | IdentifierSqlToken) => string | QuerySqlToken | IdentifierSqlToken;

const noPreprocess: PreProcessor = (value) => value;
const dateValueTransform: PreProcessor = (value => sql`${value}::date`);
const dateColumnTransform: PreProcessor = (col => sql`date_trunc('day', ${col})`);
const lowerCase: PreProcessor = (value => (<string>value).toLowerCase());

const doArrayComparison = (
  value: string | QuerySqlToken | IdentifierSqlToken,
  table: string,
  col: string,
  comp: QuerySqlToken
): QuerySqlToken => {
  let select: QuerySqlToken;

  switch (table) {
    case 'tag':
      select = sql`SELECT videotags.video_id FROM videotags INNER JOIN tags t ON t.id = videotags.tag_id WHERE ${rootSql.identifier(['t', col])} ${comp} ${value}`;
      break;

    case 'playlist':
      select = sql`SELECT playlistvideos.video_id FROM playlistvideos INNER JOIN playlists p ON p.id = playlistvideos.playlist_id WHERE ${rootSql.identifier(['p', col])} ${comp} ${value}`;
      break;

    default:
      throw new Error('Unsupported table');
  }

  return sql`video.id=ANY(${select})`;
};

const preProcessValue: {[key in Comparator]: PreProcessor} = {
  '<': noPreprocess,
  '<=': noPreprocess,
  '<>': noPreprocess,
  '>': noPreprocess,
  '>=': noPreprocess,
  'NOT ILIKE': noPreprocess,
  ILIKE: noPreprocess,
  '=': noPreprocess,
  'true': (_) => sql`TRUE`,
  'false': (_) => sql`FALSE`,
  'at': dateValueTransform,
  'before': dateValueTransform,
  'after': dateValueTransform,
  'array=': lowerCase,
  'arrayLike': noPreprocess,
  'arrayAny': (value) => sql`ANY(${rootSql.array(value.toString().split(','), 'int8')})`
};

const preProcessColumn: {[key in Comparator]: PreProcessor} = {
  '<': noPreprocess,
  '<=': noPreprocess,
  '<>': noPreprocess,
  '>': noPreprocess,
  '>=': noPreprocess,
  'NOT ILIKE': noPreprocess,
  ILIKE: noPreprocess,
  '=': noPreprocess,
  'true': noPreprocess,
  'false': noPreprocess,
  'at': dateColumnTransform,
  'before': dateColumnTransform,
  'after': dateColumnTransform,
  'array=': noPreprocess,
  'arrayLike': noPreprocess,
  'arrayAny': noPreprocess
};

const comparatorMapping: {[key in Comparator]: QuerySqlToken} = {
  '<': sql`<`,
  '<=': sql`<=`,
  '<>': sql`<>`,
  '>': sql`>`,
  '>=': sql`>=`,
  'NOT ILIKE': sql`NOT ILIKE`,
  'ILIKE': sql`ILIKE`,
  '=': sql`=`,
  'true': sql`=`,
  'false': sql`=`,
  'at': sql`=`,
  'before': sql`<`,
  'after': sql`>`,
  'array=': sql`=`,
  'arrayLike': sql`ILIKE`,
  'arrayAny': sql`=`
};

/**
 * channel = channels
 * files = extra_video_files
 * playlist = playlists
 * tag = tags
 * video = videos
 */
export const validTables = ['channel', 'files', 'playlist', 'tag', 'video'] as const;
type Table = typeof validTables[number];

export type TableCols = {
  [table in Table]: string[]
}

const tableCols: TableCols = {
  channel: ['channel_id', 'name', 'thumbnail'],
  files: ['thumbnail', 'audio_file', 'subtitles', 'total_filesize'],
  playlist: ['name', 'playlist_id', 'id'],
  tag: ['tag'],
  video: [
    'id', 'site', 'video_id', 'title', 'description', 'published_at', 'deleted',
    'deleted_at', 'alternative', 'thumbnail', 'download_format',
    'downloaded_filename', 'downloaded_format', 'download', 'force_redownload',
    'filesize'
  ]
};

const arrayAggregated: { [key: string]: Set<string> } = {
  playlist: new Set(tableCols.playlist),
  tag: new Set(tableCols.tag)
};

export const validateObjectColumns = (table: string, values: Array<string|ColumnSort>): boolean => {
  // Table names can be given as dot notation in case of nested objects.
  // This returns the last key of the dot notation.
  table = table.replace(/.+\./, '');
  const allowedCols = new Set(tableCols[<Table>table]);

  if (allowedCols.size === 0) {
    throw new Error(`Table ${table} not found`);
  }

  for (let maybeCol of values) {
    const col = typeof maybeCol === 'object' ? maybeCol.col : maybeCol;
    if (!allowedCols.has(col)) {
      throw new Error(`Invalid column ${col} given.`);
    }
  }

  return true;
};

export const validateSort = (o: ColumnSort[]): boolean => {
  for (let sort of o) {
    if (!sort.table || !sort.col) return false;

    const found = tableCols[<Table>sort.table]?.indexOf(sort.col);
    if (found === undefined || found < 0) {
      throw new Error(`Invalid table column ${sort.table}.${sort.col}`);
    }
  }

  return true;
};

export const validateColumnFilters = (filters: ColumnFilter[]): boolean => {
  const validComparators = new Set(comparators);

  for (let filter of filters) {
    if (!filter.table || !filter.col) return false;

    const found = tableCols[<Table>filter.table]?.indexOf(filter.col);
    if (found === undefined || found < 0) {
      throw new Error(`Invalid table column ${filter.table}.${filter.col}`);
    }

    if (!validComparators.has(<Comparator>filter.comp)) {
      throw new Error(`${filter.comp} is an invalid comparison method`);
    }
  }

  return true;
};

const generateJoins = (tables: Set<Table>): QuerySqlToken => {
  const joins: QuerySqlToken[] = [];
  for (let table of tables) {
    switch (table) {
      case 'files':
        joins.push(sql`LEFT JOIN extra_video_files files ON video.id = files.video_id`);
        break;

      // This is actually way faster compared to a normal join with group by and array_agg outside the join
      case 'playlist':
        joins.push(sql`
          LEFT JOIN (
            SELECT array_agg(playlist.name) as name, array_agg(playlist.playlist_id) as playlist_id, pv.video_id 
            FROM playlistvideos pv
            INNER JOIN playlists playlist ON playlist.id = pv.playlist_id 
            GROUP BY pv.video_id
            ) as playlist ON playlist.video_id=video.id
        `);
        break;

      case 'tag':
        joins.push(sql`
          LEFT JOIN (
            SELECT array_agg(tag.tag) as tag, vt.video_id 
            FROM videotags vt
            INNER JOIN tags tag ON tag.id = vt.tag_id 
            GROUP BY vt.video_id
            ) as tag ON tag.video_id=video.id
        `);
        break;

      case 'channel':
        joins.push(sql`
          INNER JOIN channelvideos cv ON video.id = cv.video_id
          INNER JOIN channels channel ON cv.channel_id = channel.id
        `);
        break;
    }
  }

  return sql`${joins.length > 0 ? rootSql.join(joins, sql`\n`) : sql``}`;
};

const generateWhere = (where?: ColumnFilter[]): [QuerySqlToken, Set<Table>] => {
  const whereClause: QuerySqlToken[] = [];
  const tables = new Set<Table>();

  if (where) {
    for (let filter of where) {
      const compString = <Comparator>filter.comp;

      const comp = comparatorMapping[compString];
      const col = preProcessColumn[compString](rootSql.identifier([filter.table, filter.col]));

      // Arrays have their own special processing
      if (compString.startsWith('array') && arrayAggregated[filter.table]?.has(filter.col)) {
        whereClause.push(
          doArrayComparison(preProcessValue[compString](filter.value), filter.table, filter.col, comp)
        );
      } else {
        whereClause.push(sql`${col} ${comp} ${preProcessValue[compString](filter.value)}`);
      }

      tables.add(<Table>filter.table);
    }
  }

  return [sql`${whereClause.length > 0 ? sql`WHERE ${rootSql.join(whereClause, sql` AND `)}` : sql``}`, tables];
};


type OptionalParams = {
  where?: ColumnFilter[]
  sort?: ColumnSort[]
  limit?: number
  offset?: number
}
export const getFullVideos = (select: TableCols, { where, sort, limit, offset } : OptionalParams = {}): Promise<QueryResult<VideoRow>> => {
  limit = limit || 10;
  const selectedCols: Array<QuerySqlToken | IdentifierSqlToken> = [];
  const orderBy: QuerySqlToken[] = [];
  const tables: Set<Table> = new Set();

  // ID should be always selected for default sorting
  let idSelected = false;

  // Add all selected columns and tables to their corresponding lists
  Object.entries(select).forEach(([table, cols]) => {
    if (!cols) return;

    for (let col of cols) {
      // Add select
      if (table !== 'video') {
        const combined = `${table}_${col}`;
        const sqlCol = rootSql.identifier([table, col]);
        const colName = rootSql.identifier([combined]);
        selectedCols.push(sql`${sqlCol} as ${colName}`);
      } else {
        selectedCols.push(rootSql.identifier([table, col]));

        // Video id contained in select list
        if (col === 'id') idSelected = true;
      }
    }
    tables.add(<Table>table);
  });

  const [whereClause] = generateWhere(where);

  if (sort) {
    for (let col of sort) {
      orderBy.push(
        sql`${rootSql.identifier([col.table, col.col])} ${col.asc !== false ? sql`` : sql`DESC`} NULLS LAST`
      );
    }
  }

  if (orderBy.length === 0) {
    if (!idSelected) {
      selectedCols.push(rootSql.identifier(['video', 'id']));
    }

    orderBy.push(sql`${rootSql.identifier(['video', 'id'])}`);
  }

  if (selectedCols.length === 0) {
    throw new Error('No selected columns given');
  }

  const joins = generateJoins(tables);

  return pool.query(rootSql.type(VideoRow)`
    SELECT ${rootSql.join(selectedCols, sql`, `)}
    FROM videos video
    ${joins}
    ${whereClause}
    ORDER BY ${rootSql.join(orderBy, sql`, `)}
    LIMIT ${limit} ${offset ? sql`OFFSET ${offset}` : sql``}
  `);
};

const countType = z.object({
  count: z.bigint().transform(Number)
});

export const getVideoCount = (where?: ColumnFilter[]): Promise<number> => {
  const [whereClause, tables] = generateWhere(where);
  const joins = generateJoins(tables);

  return pool.oneFirst(rootSql.type(countType)`SELECT COUNT(*) as count FROM videos video ${joins} ${whereClause}`);
};

export const getPlaylists = (): Promise<readonly PlaylistName[]> => {
  return pool.many(rootSql.type(PlaylistName)`SELECT "name", id FROM playlists`);
};
