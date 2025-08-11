import {
  MRT_Column,
  MRT_ColumnDef,
  MRT_FilterOption,
  MRT_Header,
  MRT_TableInstance,
} from 'material-react-table';

import type { VideoRow } from '@/types/types';

import { ColumnName } from './columnInfos';

export type FilterFns<TKeys extends string> = Record<TKeys, () => boolean>;

export type VideoTableColumnDef = MRT_ColumnDef<VideoRow>;
export type RenderFilterModeMenuItems = VideoTableColumnDef['renderColumnFilterModeMenuItems'];
export type CellComponent<TValue> = MRT_ColumnDef<VideoRow, TValue>['Cell'];
export type FilterProps = {
  column: MRT_Column<VideoRow>
  header: MRT_Header<VideoRow>
  rangeFilterIndex?: number
  table: MRT_TableInstance<VideoRow>
};

export type DateFilterOption = 'after' | 'before' | 'at';
export type ArrayFilterOption = 'arrayEqual' | 'arrayContains' | 'arrayStartswith';
export type BooleanFilterOption = 'noFilter' | 'true' | 'false';

export type FilterType = MRT_FilterOption
  | DateFilterOption
  | ArrayFilterOption
  | BooleanFilterOption
  | 'arrayAny';

export type PaginationState = {
  pageIndex: number
  pageSize: number
};
export type ColumnsMap = Partial<Record<ColumnName, VideoTableColumnDef>>;
