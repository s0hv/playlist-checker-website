import { useMemo } from 'react';

import { PlaylistFilter } from '@/components/VideosTable/PlaylistAutocomplete';

import { arrayColumnDef } from './array';
import { booleanColumnDef } from './boolean';
import { bytesColumnDef } from './bytes';
import { stringColumnDef, stringIdColumnDef } from './columnInfos';
import { dateColumnDef } from './dates';
import { numberColumnDef } from './number';
import { type VideoTableColumnDefTyped, VideoTableColumnDef } from './types';


export const useColumns = (): VideoTableColumnDef[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMemo<VideoTableColumnDefTyped<any>[]>(() => [
    {
      header: 'ID',
      accessorKey: 'id',
      ...numberColumnDef,
    },

    {
      header: 'Video ID',
      accessorKey: 'videoId',
      ...stringIdColumnDef,
    },

    {
      header: 'Title',
      accessorKey: 'title',
      ...stringColumnDef,
    },

    {
      header: 'Published at',
      accessorKey: 'publishedAt',
      ...dateColumnDef,
    },

    {
      header: 'Deleted',
      accessorKey: 'deleted',
      ...booleanColumnDef,
    },

    {
      header: 'Deleted at',
      accessorKey: 'deletedAt',
      ...dateColumnDef,
    },

    {
      header: 'Download',
      accessorKey: 'download',
      ...booleanColumnDef,
    },

    {
      header: 'Download Format',
      accessorKey: 'downloadFormat',
      ...stringColumnDef,
    },

    {
      header: 'Filename',
      accessorKey: 'downloadedFilename',
      ...stringColumnDef,
    },

    {
      header: 'Downloaded format',
      accessorKey: 'downloadedFormat',
      ...stringColumnDef,
    },

    {
      header: 'Force redownload',
      accessorKey: 'forceRedownload',
      ...booleanColumnDef,
    },

    {
      header: 'Filesize',
      accessorKey: 'filesize',
      ...bytesColumnDef,
    },

    {
      header: 'Channel ID',
      accessorKey: 'channelChannelId',
      ...stringIdColumnDef,
    },

    {
      header: 'Channel name',
      accessorKey: 'channelName',
      ...stringColumnDef,
    },

    {
      header: 'Filesize of extras',
      accessorKey: 'filesTotalFilesize',
      ...bytesColumnDef,
    },

    {
      header: 'Subtitle files',
      accessorKey: 'filesSubtitles',
      ...arrayColumnDef,
    },

    {
      header: 'Audio filename',
      accessorKey: 'filesAudioFile',
      ...stringColumnDef,
    },

    {
      header: 'Playlists',
      accessorKey: 'playlistName',
      ...arrayColumnDef,
      filterFn: 'arrayAny',
      enableColumnFilterModes: false,
      Filter: props => <PlaylistFilter {...props} />,
    },

    {
      header: 'Playlist IDs',
      accessorKey: 'playlistPlaylistId',
      ...arrayColumnDef,
    },

    {
      header: 'Tags',
      accessorKey: 'tagTag',
      ...arrayColumnDef,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] satisfies VideoTableColumnDefTyped<any>[], []);
};
