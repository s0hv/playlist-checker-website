import { ArrayCell } from './array';
import { BooleanCell } from './boolean';
import { BytesCell } from './bytes';
import { DateCell } from './dates';
import { columnHelper } from './features';
import type { CellComponent } from './types';

const renderWith = <TValue,>(Cell: CellComponent<TValue>) =>
  ({ getValue }: { getValue: () => TValue }) => <Cell value={getValue()} />;

export const videoColumns = columnHelper.columns([
  columnHelper.accessor('id', { header: 'ID', meta: { filterKind: 'number' } }),
  columnHelper.accessor('videoId', { header: 'Video ID', meta: { filterKind: 'id' } }),
  columnHelper.accessor('title', { header: 'Title', meta: { filterKind: 'text' } }),
  columnHelper.accessor('publishedAt', { header: 'Published at', meta: { filterKind: 'date' }, cell: renderWith(DateCell) }),
  columnHelper.accessor('deleted', { header: 'Deleted', meta: { filterKind: 'boolean' }, cell: renderWith(BooleanCell) }),
  columnHelper.accessor('deletedAt', { header: 'Deleted at', meta: { filterKind: 'date' }, cell: renderWith(DateCell) }),
  columnHelper.accessor('download', { header: 'Download', meta: { filterKind: 'boolean' }, cell: renderWith(BooleanCell) }),
  columnHelper.accessor('downloadFormat', { header: 'Download Format', meta: { filterKind: 'text' } }),
  columnHelper.accessor('downloadedFilename', { header: 'Filename', meta: { filterKind: 'text' } }),
  columnHelper.accessor('downloadedFormat', { header: 'Downloaded format', meta: { filterKind: 'text' } }),
  columnHelper.accessor('forceRedownload', { header: 'Force redownload', meta: { filterKind: 'boolean' }, cell: renderWith(BooleanCell) }),
  columnHelper.accessor('filesize', { header: 'Filesize', meta: { filterKind: 'bytes' }, cell: renderWith(BytesCell) }),
  columnHelper.accessor('channelChannelId', { header: 'Channel ID', meta: { filterKind: 'id' } }),
  columnHelper.accessor('channelName', { header: 'Channel name', meta: { filterKind: 'text' } }),
  columnHelper.accessor('filesTotalFilesize', { header: 'Filesize of extras', meta: { filterKind: 'bytes' }, cell: renderWith(BytesCell) }),
  columnHelper.accessor('filesSubtitles', { header: 'Subtitle files', meta: { filterKind: 'array' }, cell: renderWith(ArrayCell) }),
  columnHelper.accessor('filesAudioFile', { header: 'Audio filename', meta: { filterKind: 'text' } }),
  columnHelper.accessor('playlistName', { header: 'Playlists', meta: { filterKind: 'playlist' }, cell: renderWith(ArrayCell) }),
  columnHelper.accessor('playlistPlaylistId', { header: 'Playlist IDs', meta: { filterKind: 'array' }, cell: renderWith(ArrayCell) }),
  columnHelper.accessor('tagTag', { header: 'Tags', meta: { filterKind: 'array' }, cell: renderWith(ArrayCell) }),
]);
