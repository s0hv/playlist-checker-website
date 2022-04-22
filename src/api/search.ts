import { HttpForbidden } from './videos';
import { PlaylistName } from '../../types/types';

const handleResponse = (res: Response): Response => {
  if (!res.ok) {
    throw new HttpForbidden('');
  }

  return res;
};


export const getPlaylists = (): Promise<PlaylistName[]> => {
  return fetch('/api/playlists', { method: 'GET' })
    .then(handleResponse)
    .then(res => res.json())
    .then(json => json.rows);
};
