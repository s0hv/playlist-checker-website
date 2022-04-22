import {
  Column,
  Filter,
  TableColumnWidthInfo
} from '@devexpress/dx-react-grid';

export const columns: Column[] = [
  { name: 'id', title: 'ID' },
  { name: 'videoId', title: 'Video id' },
  { name: 'title', title: 'Title' },
  { name: 'publishedAt', title: 'Published at' },
  { name: 'deleted', title: 'Deleted' },
  { name: 'deletedAt', title: 'Deleted at' },
  { name: 'download', title: 'Download' },
  { name: 'downloadFormat', title: 'Download format' },
  { name: 'downloadedFilename', title: 'Filename' },
  { name: 'downloadedFormat', title: 'Downloaded format' },
  { name: 'forceRedownload', title: 'Force redownload' },

  { name: 'channelChannelId', title: 'Channel id' },
  { name: 'channelName', title: 'Channel name' },

  { name: 'playlistName', title: 'Playlists' },
  { name: 'playlistPlaylistId', title: 'Playlist ids' },

  { name: 'tagTag', title: 'Tags' }
];

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

  channelChannelId: ['channel', 'channel_id'],
  channelName: ['channel', 'name'],
  channelThumbnail: ['channel', 'thumbnail'],

  filesThumbnail: ['files', 'thumbnail'],
  filesAudioFile: ['files', 'audio_file'],
  filesSubtitles: ['files', 'subtitles'],

  playlistName: ['playlist', 'name'],
  playlistPlaylistId: ['playlist', 'playlist_id'],
  playlistId: ['playlist', 'id'],

  tagTag: ['tag', 'tag'],
};

export type ColumnName = keyof typeof columnToTableCol;

export const allCols = new Set(Object.keys(columnToTableCol));

export const integerColumns: ColumnName[] = ['id'];
export const arrayColumns: ColumnName[] = [
  'tagTag', 'playlistPlaylistId'
];
export const boolColumns: ColumnName[] = [
  'deleted',
  'forceRedownload',
  'download'
];
export const dateColumns: ColumnName[] = [
  'publishedAt',
  'deletedAt'
];
export const stringIdColumns: ColumnName[] = [
  'videoId',
  'channelChannelId'
];

type ColumnWidth = TableColumnWidthInfo & { columnName: ColumnName };
export const defaultColumnWidths: Readonly<ColumnWidth[]> = [
  {columnName: 'id', width: 100},
  {columnName: 'videoId', width: 150},
  {columnName: 'title', width: 500},
  {columnName: 'publishedAt', width: 270},
  {columnName: 'deleted', width: 100},
  {columnName: 'deletedAt', width: 270},
  {columnName: 'alternative', width: 300},
  {columnName: 'thumbnail', width: 300},
  {columnName: 'download', width: 100},
  {columnName: 'downloadFormat', width: 300},
  {columnName: 'downloadedFormat', width: 300},
  {columnName: 'downloadedFilename', width: 300},
  {columnName: 'forceRedownload', width: 100},

  {columnName: 'channelChannelId', width: 300},
  {columnName: 'channelName', width: 200},
  {columnName: 'channelThumbnail', width: 200},

  {columnName: 'playlistName', width: 300},
  {columnName: 'playlistPlaylistId', width: 300},

  {columnName: 'tagTag', width: 250},
] as const;

export const defaultFilters: Filter[] = [
  {
    columnName: 'deleted',
    value: ' ',
    operation: 'noFilter'
  }
];
