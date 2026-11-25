import { useMemo, useState } from 'react';
import {
  type ColumnOrderState,
  type ColumnSizingState,
  type ColumnVisibilityState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  functionalUpdate,
} from '@tanstack/react-table';

import type { GetVideoQuery } from '@/api/videos';

import {
  type ColumnName,
  defaultColumnSizing,
  defaultSorting,
} from './columnInfos';
import type { ColumnFilterState } from './filters/modes';
import {
  clearColumnLayout,
  loadColumnOrder,
  loadColumnVisibility,
  saveColumnOrder,
  saveColumnVisibility,
} from './persistence';
import {
  type FiltersState,
  buildSelect,
  buildSort,
  buildWhere,
} from './query';

export type Density = 'compact' | 'comfortable' | 'spacious';

const firstPage = (pagination: PaginationState): PaginationState => ({ ...pagination, pageIndex: 0 });

/**
 * Must only be called on the client, because the initial column layout is read from localStorage.
 */
export const useVideosTableState = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [filters, setFilters] = useState<FiltersState>({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(loadColumnVisibility);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(loadColumnOrder);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(defaultColumnSizing);
  const [density, setDensity] = useState<Density>('comfortable');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const onSortingChange: OnChangeFn<SortingState> = updater => {
    setSorting(updater);
    setPagination(firstPage);
  };

  const setColumnFilter = (column: ColumnName, filter: ColumnFilterState | undefined) => {
    setFilters(previous => ({ ...previous, [column]: filter }));
    setPagination(firstPage);
  };

  const onColumnVisibilityChange: OnChangeFn<ColumnVisibilityState> = updater => {
    const next = functionalUpdate(updater, columnVisibility);
    setColumnVisibility(next);
    saveColumnVisibility(next);
  };

  const onColumnOrderChange: OnChangeFn<ColumnOrderState> = updater => {
    const next = functionalUpdate(updater, columnOrder);
    setColumnOrder(next);
    saveColumnOrder(next);
  };

  const resetColumnLayout = () => {
    clearColumnLayout();
    setColumnVisibility(loadColumnVisibility());
    setColumnOrder(loadColumnOrder());
    setColumnSizing(defaultColumnSizing);
  };

  const query = useMemo<GetVideoQuery>(() => ({
    select: buildSelect(columnVisibility),
    where: buildWhere(filters),
    sort: buildSort(sorting),
  }), [columnVisibility, filters, sorting]);

  return {
    query,
    filters,
    setColumnFilter,
    tableState: {
      pagination,
      sorting,
      columnVisibility,
      columnOrder,
      columnSizing,
    },
    tableHandlers: {
      onPaginationChange: setPagination,
      onSortingChange,
      onColumnVisibilityChange,
      onColumnOrderChange,
      onColumnSizingChange: setColumnSizing,
    },
    resetColumnLayout,
    density,
    setDensity,
    isFullScreen,
    setIsFullScreen,
  };
};
