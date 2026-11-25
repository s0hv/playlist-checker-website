import type { ColumnOrderState, ColumnVisibilityState } from '@tanstack/react-table';

import { allColumnNames, defaultHiddenCols } from './columnInfos';
import { localStorageKeys } from './constants';

// An empty saved string is a valid saved state, e.g. no hidden columns, so only a missing key falls back to defaults
const readList = (key: string): string[] | undefined => {
  const saved = window.localStorage.getItem(key);

  return saved === null ? undefined : saved.split(',').filter(Boolean);
};

export const loadColumnVisibility = (): ColumnVisibilityState => {
  const hiddenColumns = new Set(readList(localStorageKeys.hiddenCols) ?? defaultHiddenCols);

  return Object.fromEntries([...allColumnNames].map(column => [column, !hiddenColumns.has(column)]));
};

export const saveColumnVisibility = (visibility: ColumnVisibilityState): void => {
  const hiddenColumns = Object.entries(visibility)
    .filter(([_, visible]) => !visible)
    .map(([column]) => column);

  window.localStorage.setItem(localStorageKeys.hiddenCols, hiddenColumns.join(','));
};

export const loadColumnOrder = (): ColumnOrderState => readList(localStorageKeys.columnOrder) ?? [];

export const saveColumnOrder = (order: ColumnOrderState): void => {
  window.localStorage.setItem(localStorageKeys.columnOrder, order.join(','));
};

export const clearColumnLayout = (): void => {
  window.localStorage.removeItem(localStorageKeys.hiddenCols);
  window.localStorage.removeItem(localStorageKeys.columnOrder);
};
