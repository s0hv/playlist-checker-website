import type { FC } from 'react';

import type {
  ColumnFilterState,
  FilterKind,
  FilterMode,
  FilterValue,
} from './filters/modes';

export type CellProps<TValue> = {
  value: TValue
};
export type CellComponent<TValue> = FC<CellProps<TValue>>;

/**
 * `onChange(undefined)` removes the filter of the column.
 */
export type FilterProps = {
  kind: FilterKind
  mode: FilterMode
  value: FilterValue | undefined
  onChange: (filter: ColumnFilterState | undefined) => void
};
export type FilterComponent = FC<FilterProps>;
