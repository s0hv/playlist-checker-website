import type { FC } from 'react';
import { TableCell } from '@mui/material';
import type { Header } from '@tanstack/react-table';

import type { VideoRow } from '@/types/types';

import { BooleanFilter } from '../boolean';
import { BytesFilter } from '../bytes';
import type { ColumnName } from '../columnInfos';
import { DateFilter } from '../dates';
import type { VideoTableFeatures } from '../features';
import {
  type ColumnFilterState,
  type FilterKind,
  defaultFilterMode,
} from '../filters/modes';
import { TextFilter } from '../filters/TextFilter';
import { PlaylistFilter } from '../PlaylistAutocomplete';
import type { FiltersState } from '../query';
import type { FilterComponent } from '../types';

import { useDragAlongStyle } from './HeaderCell';

const filterComponents: Record<FilterKind, FilterComponent> = {
  text: TextFilter,
  id: TextFilter,
  number: TextFilter,
  array: TextFilter,
  date: DateFilter,
  boolean: BooleanFilter,
  bytes: BytesFilter,
  playlist: PlaylistFilter,
};

type FilterCellProps = {
  header: Header<VideoTableFeatures, VideoRow, unknown>
  filters: FiltersState
  setColumnFilter: (column: ColumnName, filter: ColumnFilterState | undefined) => void
};

export const FilterCell: FC<FilterCellProps> = ({ header, filters, setColumnFilter }) => {
  const { setNodeRef, style } = useDragAlongStyle(header.column.id, header.getSize());
  const column = header.column.id as ColumnName;
  const kind = header.column.columnDef.meta!.filterKind;
  const Filter = filterComponents[kind];
  const filter = filters[column] ?? { mode: defaultFilterMode(kind) };

  return (
    <TableCell ref={setNodeRef} style={style} sx={{ verticalAlign: 'top' }}>
      <Filter
        kind={kind}
        mode={filter.mode}
        value={filter.value}
        onChange={newFilter => setColumnFilter(column, newFilter)}
      />
    </TableCell>
  );
};
