import { format } from 'date-fns';

import type { VideoSelect, VideoSort, VideoWhere } from '@/api/videos';
import type { ApiColumnFilter } from '@/types/types';

import {
  type ColumnName,
  allColumnNames,
  columnToTableCol,
  rowDetailCols,
  selectExcludedCols,
} from './columnInfos';
import {
  type ColumnFilterState,
  type FilterValue,
  likePatterns,
  modeComparators,
  rangeModes,
  valuelessModes,
} from './filters/modes';

export type FiltersState = Partial<Record<ColumnName, ColumnFilterState>>;
export type ColumnVisibility = Readonly<Record<string, boolean>>;
export type Sorting = ReadonlyArray<{ id: string, desc: boolean }>;

// The playlist filter selects playlists by their database id, not by the displayed name
const filterColumnOverrides: Partial<Record<ColumnName, ColumnName>> = {
  playlistName: 'playlistId',
};

const isMissingValue = (value: FilterValue | undefined): boolean =>
  value === undefined
  || value === ''
  || (Array.isArray(value) && value.length === 0);

const toApiValue = (value: FilterValue): ApiColumnFilter['value'] => {
  // The server compares dates as calendar days, so send the local date instead of a UTC timestamp
  if (value instanceof Date) return format(value, 'yyyy-MM-dd');
  return value as Exclude<FilterValue, Date | boolean>;
};

const buildColumnWhere = (column: ColumnName, { mode, value }: ColumnFilterState): ApiColumnFilter[] => {
  const [table, col] = columnToTableCol[filterColumnOverrides[column] ?? column];

  if (valuelessModes.has(mode)) {
    return [{ table, col, comp: modeComparators[mode as 'empty' | 'notEmpty'], value: '' }];
  }

  if (isMissingValue(value)) return [];

  if (mode === 'is') {
    return [{ table, col, comp: value ? 'true' : 'false', value: '' }];
  }

  if (rangeModes.has(mode)) {
    const [min, max] = value as readonly [number, number];
    const suffix = mode === 'betweenInclusive' ? '=' : '';

    return [
      { table, col, comp: `>${suffix}`, value: min },
      { table, col, comp: `<${suffix}`, value: max },
    ];
  }

  const comparatorMode = mode as keyof typeof modeComparators;
  const likePattern = likePatterns[mode];

  return [{
    table,
    col,
    comp: modeComparators[comparatorMode],
    value: likePattern ? likePattern(String(value)) : toApiValue(value!),
  }];
};

export const buildWhere = (filters: FiltersState): VideoWhere =>
  (Object.entries(filters) as [ColumnName, ColumnFilterState | undefined][])
    .flatMap(([column, filter]) => filter ? buildColumnWhere(column, filter) : []);

export const buildSelect = (visibility: ColumnVisibility): VideoSelect => {
  const selected = new Set<ColumnName>();

  for (const column of allColumnNames) {
    if (visibility[column] === false || selectExcludedCols.has(column)) continue;
    selected.add(column);
  }
  // The detail panel is always available, so its data is fetched even for hidden columns
  for (const column of rowDetailCols) selected.add(column);

  const select: VideoSelect = {};
  for (const column of selected) {
    const [table, col] = columnToTableCol[column];
    (select[table] ??= []).push(col);
  }

  return select;
};

export const buildSort = (sorting: Sorting): VideoSort => sorting.map(({ id, desc }) => {
  const [table, col] = columnToTableCol[id as ColumnName];

  return { table, col, asc: !desc };
});
