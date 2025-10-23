import { queryOptions } from '@tanstack/react-query';

import { baseKy } from '@/src/utils';
import { PlaylistName } from '@/types/types';


export const getPlaylists = (): Promise<PlaylistName[]> => {
  return baseKy.get('/api/playlists')
    .json<{ rows: PlaylistName[] }>()
    .then(json => json.rows);
};

export const getPlaylistsQueryOptions = queryOptions({
  queryKey: ['/api/playlists'] as const,
  queryFn: getPlaylists,
  refetchOnMount: false,
});
