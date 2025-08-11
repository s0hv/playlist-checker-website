import { sql } from 'slonik';
import { z } from 'zod';

/**
 * channel = channels
 * files = extra_video_files
 * playlist = playlists
 * tag = tags
 * video = videos
 */
export const validTables = ['channel', 'files', 'playlist', 'tag', 'video'] as const;
export type Table = typeof validTables[number];

export type TableCols = Record<Table, string[]>;

export const tableCols = {
  channel: ['channel_id', 'name', 'thumbnail'],
  files: ['thumbnail', 'audio_file', 'subtitles', 'total_filesize'],
  playlist: ['name', 'playlist_id', 'id'],
  tag: ['tag'],
  video: [
    'id', 'site', 'video_id', 'title', 'description', 'published_at', 'deleted',
    'deleted_at', 'alternative', 'thumbnail', 'download_format',
    'downloaded_filename', 'downloaded_format', 'download', 'force_redownload',
    'filesize',
  ],
} as const satisfies TableCols;

export const comparators = [
  '=', 'ILIKE', 'NOT ILIKE', '<>', '<', '<=', '>', '>=',
  'true', 'false', 'at', 'before', 'after', 'array=', 'arrayLike', 'arrayAny'] as const;
export const Comparator = z.literal(comparators);

export type Comparator = z.infer<typeof Comparator>;

export const AscSort = sql.fragment`ASC`;
export const DescSort = sql.fragment`DESC`;

