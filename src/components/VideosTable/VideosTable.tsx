import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Paper } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type {
  ColumnFilter,
  ColumnOrderState,
  OnChangeFn,
  SortingState,
  VisibilityState,
} from '@tanstack/table-core';
import { mapValues } from 'es-toolkit';
import {
  getDefaultColumnFilterFn,
  MaterialReactTable,
  MRT_TableState,
  useMaterialReactTable,
} from 'material-react-table';

import { VideoSort, videosQueryOptions, VideoWhere } from '@/api/videos';
import {
  buildWhereStatement,
  changeHandler,
  colsToSelectQuery,
  getInitialColumnOrder,
  getInitialColumnVisibility,
  mapSortingState,
  saveColumnOrder,
  saveColumnVisibility,
} from '@/components/VideosTable/utils';
import { VideoRow } from '@/types/types';

import { arrayFilterLocalization, arrayFilterMethods } from './array';
import {
  ColumnName,
  columnToTableCol,
  defaultColumnSizing,
  defaultSorting,
} from './columnInfos';
import { dateFilterLocalization, dateFilterMethods } from './dates';
import { renderDetailRow } from './RowDetail';
import { ColumnsMap, FilterType, PaginationState } from './types';
import { useColumns } from './useColumns';


const noRows: VideoRow[] = [];
const localization = {
  ...dateFilterLocalization,
  ...arrayFilterLocalization,
};

const filterFns = {
  ...dateFilterMethods,
  ...arrayFilterMethods,
};

const initialState: Partial<MRT_TableState<VideoRow>> = {
  showColumnFilters: true,
  density: 'comfortable',
  columnSizing: defaultColumnSizing,
};

export const VideosTable = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useColumns();

  const columnsMap = useMemo(() =>
    columns.reduce<ColumnsMap>((prev, col) => ({
      ...prev,
      [col.accessorKey!]: col,
    }), {}),
  [columns]);

  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [columnFilterFns, setColumnFilterFns] = useState<Partial<Record<ColumnName, FilterType>>>(() => mapValues(columnsMap, c => (c!.filterFn ?? getDefaultColumnFilterFn(c!)) as FilterType));
  const columnFiltersRef = useRef(columnFilters);
  const columnFilterFnsRef = useRef(columnFilterFns);
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const [localStorageLoaded, setLocalStorageLoaded] = useState({
    hiddenCols: false,
    columnOrder: false,
  });
  const localStorageFullyLoaded = localStorageLoaded.hiddenCols && localStorageLoaded.columnOrder;

  const [select, setSelect] = useState(() => colsToSelectQuery(Object.keys(columnToTableCol) as ColumnName[], new Set()));
  const [where, setWhere] = useState<VideoWhere>([]);
  const [sort, setSort] = useState<VideoSort>(() => mapSortingState(sorting));

  const {
    data,
    isLoading,
  } = useQuery({
    ...videosQueryOptions({ select, where, sort }, pagination),
    enabled: localStorageFullyLoaded,
  });

  const onColumnFilterFnsChange = useMemo<OnChangeFn<Partial<Record<ColumnName, FilterType>>>>(() => changeHandler(
    // This returns a callback function
    // eslint-disable-next-line react-hooks/refs
    (filterFns: Partial<Record<ColumnName, FilterType>>) => {
      columnFilterFnsRef.current = filterFns;
      setWhere(buildWhereStatement(columnsMap, columnFiltersRef.current, filterFns));
    },
    setColumnFilterFns
  ), [columnsMap]);

  const onColumnFiltersChange = useMemo<OnChangeFn<ColumnFilter[]>>(() => changeHandler(
    // This returns a callback function
    // eslint-disable-next-line react-hooks/refs
    (filters: ColumnFilter[]) => {
      columnFiltersRef.current = filters;
      setWhere(buildWhereStatement(columnsMap, filters, columnFilterFnsRef.current));
    },
    setColumnFilters
  ), [columnsMap]);

  // False positive
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const onColumnSortingChange = useMemo<OnChangeFn<SortingState>>(() => changeHandler(
    (sorting: SortingState) => setSort(mapSortingState(sorting)),
    setSorting
  ), []);

  // False positive
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const onColumnVisibilityChange = useMemo<OnChangeFn<VisibilityState>>(() => changeHandler(
    (visibility: VisibilityState) => {
      const hiddenCols = Object.entries(visibility)
        .filter(([_, visible]) => !visible)
        .map(([col]) => col) as ColumnName[];

      setSelect(colsToSelectQuery(Object.keys(columnToTableCol) as ColumnName[], new Set(hiddenCols)));
    },
    setColumnVisibility
  ), []);

  useLayoutEffect(() => {
    onColumnVisibilityChange(getInitialColumnVisibility());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalStorageLoaded(old => ({
      ...old,
      hiddenCols: true,
    }));
  }, [onColumnVisibilityChange]);

  useLayoutEffect(() => {
    const savedOrder = getInitialColumnOrder();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalStorageLoaded(old => ({
      ...old,
      columnOrder: true,
    }));
    if (!savedOrder) return;

    setColumnOrder(savedOrder);
  }, []);

  // Save state to local storage on change
  useEffect(() => {
    if (!localStorageFullyLoaded) return;

    saveColumnVisibility(columnVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnVisibility]);

  useEffect(() => {
    if (!localStorageFullyLoaded) return;

    saveColumnOrder(columnOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnOrder]);

  const table = useMaterialReactTable({
    columns: columns,
    data: data?.rows ?? noRows,
    rowCount: data?.count ?? 0,

    // Table options
    columnResizeMode: 'onChange',
    layoutMode: 'grid-no-grow',
    localization,
    filterFns,

    // Stage
    state: {
      isLoading,
      pagination,
      columnFilters,
      columnFilterFns,
      sorting,
      columnVisibility,
      columnOrder,
    },
    initialState,

    // Change handlers
    onPaginationChange: setPagination,
    onColumnFiltersChange: onColumnFiltersChange,
    onColumnFilterFnsChange: onColumnFilterFnsChange,
    onSortingChange: onColumnSortingChange,

    // Prevent table from resetting saved options during the first render
    ...(localStorageFullyLoaded
      ? {
        onColumnVisibilityChange: onColumnVisibilityChange,
        onColumnOrderChange: setColumnOrder,
      }
      : undefined),


    // Custom rendering
    renderDetailPanel: renderDetailRow,

    // Features
    enableColumnFilterModes: true,
    enableColumnDragging: true,
    enableColumnOrdering: true,
    enableColumnResizing: true,
    enableSorting: true,
    enableGlobalFilter: false,
    enableColumnActions: false,
    // Server side data is used, so we handle filtering, pagination, and sorting manually
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <Paper>
      <MaterialReactTable table={table} />
    </Paper>
  );
};
