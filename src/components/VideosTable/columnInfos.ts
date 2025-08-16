import { ColumnSort, SortingState } from '@tanstack/table-core';

import { VideoTableColumnDef } from './types';

export const columnToTableCol = {
  id: ['video', 'id'],
  site: ['video', 'site'],
  videoId: ['video', 'video_id'],
  title: ['video', 'title'],
  description: ['video', 'description'],
  publishedAt: ['video', 'published_at'],
  deleted: ['video', 'deleted'],
  deletedAt: ['video', 'deleted_at'],
  alternative: ['video', 'alternative'],
  thumbnail: ['video', 'thumbnail'],
  downloadFormat: ['video', 'download_format'],
  downloadedFilename: ['video', 'downloaded_filename'],
  downloadedFormat: ['video', 'downloaded_format'],
  download: ['video', 'download'],
  forceRedownload: ['video', 'force_redownload'],
  filesize: ['video', 'filesize'],

  channelChannelId: ['channel', 'channel_id'],
  channelName: ['channel', 'name'],
  channelThumbnail: ['channel', 'thumbnail'],

  filesThumbnail: ['files', 'thumbnail'],
  filesAudioFile: ['files', 'audio_file'],
  filesSubtitles: ['files', 'subtitles'],
  filesTotalFilesize: ['files', 'total_filesize'],

  playlistName: ['playlist', 'name'],
  playlistPlaylistId: ['playlist', 'playlist_id'],
  playlistId: ['playlist', 'id'],

  tagTag: ['tag', 'tag'],
};

export type ColumnName = keyof typeof columnToTableCol;

export const stringColumnDef: Partial<VideoTableColumnDef> = {
  filterFn: 'contains',
  enableResizing: true,
  columnFilterModeOptions: [
    'contains',
    'startsWith',
    'endsWith',
    'equals',
    'notEquals',
    'notEmpty',
    'empty',
  ],
};

export const stringIdColumnDef: Partial<VideoTableColumnDef> = {
  filterFn: 'equals',
  columnFilterModeOptions: ['equals', 'notEquals'],
};

export const allColumnNames = new Set<ColumnName>(Object.keys(columnToTableCol) as ColumnName[]);

export const defaultColumnSizing: Readonly<Partial<Record<ColumnName, number>>> = {
  id: 100,
  videoId: 150,
  title: 500,
  publishedAt: 270,
  deleted: 150,
  deletedAt: 270,
  alternative: 300,
  thumbnail: 300,
  download: 150,
  downloadFormat: 300,
  downloadedFormat: 300,
  downloadedFilename: 300,
  forceRedownload: 150,
  filesize: 150,
  channelChannelId: 300,
  channelName: 200,
  channelThumbnail: 200,
  filesTotalFilesize: 180,
  filesSubtitles: 300,
  filesAudioFile: 300,
  playlistName: 300,
  playlistPlaylistId: 300,
  tagTag: 250,
};

export type VideoColumnSort = ColumnSort & {
  id: ColumnName
};
export const defaultSorting: SortingState = [
  {
    id: 'id',
    desc: true,
  },
] satisfies VideoColumnSort[];

export const defaultVisibleCols: Set<ColumnName> = new Set([
  'id',
  'videoId',
  'title',
  'publishedAt',
  'deleted',
  'deletedAt',
  'downloadedFilename',
  'downloadedFormat',
  'download',
]);

export const selectExcludedCols: Set<ColumnName> = new Set([
  'playlistId',
]);

export const defaultHiddenCols: Set<ColumnName> = allColumnNames.difference(defaultVisibleCols);

export const rowDetailCols: Readonly<ColumnName[]> = [
  'id',
  'site',
  'title',
  'thumbnail',
  'description',
  'downloadedFilename',
  'videoId',
  'filesThumbnail',
  'alternative',
  'deleted',
  'filesSubtitles',
  'filesAudioFile',
] as const;

