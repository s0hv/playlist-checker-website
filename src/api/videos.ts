import { ColumnFilter, ColumnSort, VideoRow } from '../../types/types';
import qs from 'qs';

export interface GetVideoQuery {
  select: { [key: string]: string[] }
  sort?: ColumnSort[]
  where?: ColumnFilter[]
  limit?: number
  offset?: number
}

export interface VideoRows {
  rows: VideoRow[]
}

export class HttpForbidden extends Error {
  status: number = 403;
}

export const getVideos = (query: GetVideoQuery): Promise<VideoRows> => {
  const queryString = qs.stringify(query, { encodeValuesOnly: true });

  return fetch(`/api/videos?${queryString}`, { method: 'GET' })
    .then(res => res.json());
};

export const getVideoCount = (where?: ColumnFilter[]): Promise<number> => {
  const queryString = qs.stringify({ where }, { encodeValuesOnly: true, addQueryPrefix: true });

  return fetch(`/api/videos/count${queryString}`, { method: 'GET' })
    .then(res => {
      if (!res.ok) {
        throw new HttpForbidden('');
      }

      return res.json();
    })
    .then(json => json.count);
};
