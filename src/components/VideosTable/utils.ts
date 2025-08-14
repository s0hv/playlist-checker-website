import { Dispatch, SetStateAction } from 'react';
import type {
  ColumnFilter,
  ColumnOrderState,
  OnChangeFn,
  SortingState,
  Updater,
  VisibilityState,
} from '@tanstack/table-core';
import { mapKeys, mapValues } from 'es-toolkit';
import { upperFirst } from 'es-toolkit/string';
import { getDefaultColumnFilterFn } from 'material-react-table';

import { VideoSelect, VideoWhere } from '@/api/videos';
import {
  FilterOperation,
  filterOperations,
  filterValueTransformations,
} from '@/src/utils';
import { ApiColumnFilter, ColumnSort } from '@/types/types';

import {
  allColumnNames,
  ColumnName,
  columnToTableCol,
  defaultHiddenCols,
  selectExcludedCols,
} from './columnInfos';
import { localStorageKeys } from './constants';
import type { ColumnsMap, FilterFns, FilterType } from './types';


export const getFilterLocalizations = <TKey extends FilterType>(
  filterMessages: Record<TKey, string>
) => mapKeys(
  filterMessages,
  (_, key) => `filter${upperFirst(key)}`
);

export const getFilterMethods = <TKey extends FilterType>(
  filters: Record<TKey, unknown>
): FilterFns<TKey> => mapValues(
  filters,
  () => () => true
);

export const buildWhereStatement = (
  columnMap: ColumnsMap,
  columnFilters: ColumnFilter[],
  columnFilterFns: Partial<Record<ColumnName, FilterType>>
): VideoWhere => {
  return columnFilters.flatMap<ApiColumnFilter | null>(columnFilter => {
    const columnName = columnFilter.id as ColumnName;
    const columnDef = columnMap[columnName]!;
    const value = columnFilter.value;
    const filterFn = columnFilterFns[columnName] ?? getDefaultColumnFilterFn(columnDef);

    if (!(filterFn in filterOperations)) {
      throw new Error(`Filter function ${filterFn} not found`);
    }

    const filterFnTyped = filterFn as FilterOperation;

    // Skip filters that do nothing
    const comp = filterOperations[filterFnTyped];
    if (comp === null) {
      return null;
    }

    const transformFn = filterValueTransformations[filterFnTyped];
    let valueTransformed: string | string[];

    if (Array.isArray(value)) {
      if (value.length === 0) return null;

      valueTransformed = value.map(transformFn);
    } else {
      valueTransformed = transformFn(value as string ?? '');
    }

    const columnNameFixed = columnName === 'playlistName'
      ? 'playlistId'
      : columnName;

    const [table, col] = columnToTableCol[columnNameFixed];

    // Between comparators can be implemented by combining greater and lessThan operators
    if (comp === 'between' || comp === 'betweenInclusive') {
      // If the slider has a scale method defined, scale the slider values according to that
      const sliderProps = columnDef.muiFilterSliderProps;
      let sliderValues: [number, number] = valueTransformed as unknown as [number, number];
      if (typeof sliderProps !== 'function' && sliderProps?.scale) {
        sliderValues = sliderValues.map(value => sliderProps.scale!(value)) as [number, number];
      }

      const compSuffix = comp === 'betweenInclusive' ? '=' : '';
      return [
        {
          col,
          table,
          value: sliderValues[0],
          comp: `>${compSuffix}`,
        },
        {
          col,
          table,
          value: sliderValues[1],
          comp: `<${compSuffix}`,
        },
      ] satisfies ApiColumnFilter[];
    }

    return {
      col,
      table,
      value: valueTransformed,
      comp,
    } satisfies ApiColumnFilter;
  })
    .filter(filter => filter !== null);
};

export const mapSortingState = (sorting: SortingState) => sorting.map<ColumnSort>(s => {
  const [table, col] = columnToTableCol[s.id as ColumnName];

  return {
    col,
    table,
    asc: !s.desc,
  };
});


export const changeHandler = <T>(updateValue: (val: T) => void, setter: Dispatch<SetStateAction<T>>): OnChangeFn<T> => {
  return (valueOrUpdater: Updater<T>): void => {
    if (typeof valueOrUpdater === 'function') {
      setter(value => {
        const newValue = (valueOrUpdater as (old: T) => T)(value);
        updateValue(newValue);
        return newValue;
      });
    } else {
      setter(valueOrUpdater);
      updateValue(valueOrUpdater);
    }
  };
};

export const getInitialColumnVisibility = (): VisibilityState => {
  const savedHiddenCols = window.localStorage.getItem(localStorageKeys.hiddenCols)?.split(',');
  const hiddenColumnNames = new Set(savedHiddenCols ?? defaultHiddenCols);

  return allColumnNames.keys().reduce<VisibilityState>((prev, col) => ({
    ...prev,
    [col]: !hiddenColumnNames.has(col),
  }), {});
};

export const saveColumnVisibility = (columnVisibility: VisibilityState): void => {
  const hiddenCols = Object.entries(columnVisibility)
    .filter(([_, visible]) => !visible)
    .map(([col]) => col)
    .join(',');

  window.localStorage.setItem(localStorageKeys.hiddenCols, hiddenCols);
};

export const getInitialColumnOrder = (): ColumnOrderState | undefined => {
  return window.localStorage.getItem(localStorageKeys.columnOrder)?.split(',');
};

export const saveColumnOrder = (columnOrder: ColumnOrderState): void => {
  window.localStorage.setItem(localStorageKeys.columnOrder, columnOrder.join(','));
};

export const colsToSelectQuery = (cols: ColumnName[] | Set<ColumnName>, excludeColumns: Set<ColumnName>): VideoSelect => {
  const select: VideoSelect = {};

  for (const col of cols) {
    // Some columns are always excluded from the select query
    if (selectExcludedCols.has(col) || excludeColumns.has(col)) continue;

    const [table, actualCol] = columnToTableCol[col as ColumnName];
    if (!select[table]) select[table] = [];

    select[table].push(actualCol);
  }

  return select;
};
