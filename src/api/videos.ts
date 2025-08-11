import { queryOptions } from '@tanstack/react-query';
import ky from 'ky';

import { PaginationState } from '@/components/VideosTable/types';
import { ApiColumnFilter, ColumnSort, VideoRow } from '@/types/types';

export type VideoSelect = Record<string, string[]>;
export type VideoSort = ColumnSort[];
export type VideoWhere = ApiColumnFilter[];

export interface GetVideoQuery {
  select: VideoSelect
  sort?: VideoSort
  where?: VideoWhere
  limit?: number
  offset?: number
}


export interface VideoRows {
  rows: VideoRow[]
  count: number
}

export class HttpForbidden extends Error {
  status: number = 403;
}

export const getVideos = (query: GetVideoQuery): Promise<VideoRows> => {
  const {
    select,
    where,
    sort,
    ...searchParams
  } = query;

  return ky.post<VideoRows>('/api/videos', {
    json: {
      select,
      where,
      sort,
    },
    searchParams: searchParams,
  })
    .json();
};

export const videosQueryOptions = (
  query: GetVideoQuery,
  pagination: PaginationState
) => queryOptions({
  queryKey: ['/api/videos', query, pagination] as const,
  queryFn: ({ queryKey: [_, q, p] }) => getVideos({
    ...q,
    limit: p.pageSize,
    offset: p.pageIndex * p.pageSize,
  }),
});
