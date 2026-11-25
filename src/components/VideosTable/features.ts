import {
  columnOrderingFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  metaHelper,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/react-table';

import type { VideoRow } from '@/types/types';

import type { FilterKind } from './filters/modes';

export interface VideoColumnMeta {
  filterKind: FilterKind
}

// Filtering is done by the API, so the table needs no filtering feature or filtered row model
export const videoTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  rowExpandingFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  columnSizingFeature,
  columnResizingFeature,
  columnMeta: metaHelper<VideoColumnMeta>(),
});
export type VideoTableFeatures = typeof videoTableFeatures;

export const columnHelper = createColumnHelper<VideoTableFeatures, VideoRow>();
