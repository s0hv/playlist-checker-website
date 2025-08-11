import {
  type FC,
  type MouseEvent,
  type ReactElement,
  useCallback,
  useMemo,
  useState,
} from 'react';
import DateRange from '@mui/icons-material/DateRange';
import FilterList from '@mui/icons-material/FilterList';
import {
  FormControl,
  FormHelperText,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import { defaultDateDistanceToNow, defaultDateFormat } from '@/src/utils';

import type {
  CellComponent,
  DateFilterOption,
  FilterFns,
  FilterProps,
  VideoTableColumnDef,
} from './types';
import { getFilterLocalizations, getFilterMethods } from './utils';


export const dateFilterMessages: Record<DateFilterOption, string> = {
  at: 'On date',
  before: 'Before date',
  after: 'After date',
};

export const dateFilterLocalization = getFilterLocalizations(dateFilterMessages);

export const dateFilterMethods: FilterFns<DateFilterOption> = getFilterMethods(dateFilterMessages);

export const dateFilterIcons: Record<DateFilterOption, ReactElement> = {
  at: <DateRange />,
  before: <DateRange />,
  after: <DateRange />,
};

export const dateFilterOptions: DateFilterOption[] = [
  'at',
  'before',
  'after',
];

export const renderDateFilterModeMenuItems = (onSelectFilterMode: (filter: DateFilterOption) => void) => dateFilterOptions.map(filterOption => (
  <MenuItem
    key={filterOption}
    onClick={() => onSelectFilterMode(filterOption)}
    sx={{ display: 'flex', gap: 1 }}
  >
    {dateFilterIcons[filterOption]} {dateFilterMessages[filterOption]}
  </MenuItem>
));


/**
 * DateCell component for displaying date values in a table cell.
 */
export const DateCell: CellComponent<Date | unknown> = ({ cell }) => {
  const value = cell.getValue<Date>();

  return useMemo(() =>
    value
      ? `${defaultDateFormat(value, '')} (${defaultDateDistanceToNow(value, '')})`
      : '',
  [value]);
};

export const DateFilter: FC<FilterProps> = props => {
  const { column, table } = props;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('at');

  const openMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget), []);
  const closeMenu = useCallback(() => setAnchorEl(null), []);

  const handleFilterFnChange = useCallback((filter: DateFilterOption) => {
    closeMenu();
    setDateFilter(filter);

    table.setColumnFilterFns(prev => ({
      ...prev,
      [column.id]: filter,
    }));
  }, [column, table, closeMenu]);

  const handleValueChange = useCallback((value: Date | null) => {
    column.setFilterValue(value ?? undefined);
  }, [column]);

  const columnFilterModeMenuItems = useMemo(() => renderDateFilterModeMenuItems(handleFilterFnChange), [handleFilterFnChange]);

  const startAdornment = (
    <IconButton
      onClick={openMenu}
      size='small'
      sx={{
        height: '1.75rem',
        width: '1.75rem',
        mr: 1,
      }}
    >
      <FilterList />
    </IconButton>
  );

  return (
    <FormControl>
      <DatePicker
        onAccept={handleValueChange}
        slotProps={{
          field: { clearable: true },
          textField: {
            variant: 'standard',
            startAdornment,
          },
        }}
      />
      <FormHelperText>Filter mode: {dateFilterMessages[dateFilter]}</FormHelperText>
      <Menu
        anchorEl={anchorEl}
        onClose={closeMenu}
        open={!!anchorEl}
      >
        {columnFilterModeMenuItems}
      </Menu>
    </FormControl>
  );
};

export const dateColumnDef: Partial<VideoTableColumnDef> = {
  Cell: DateCell,
  filterFn: 'at',
  Filter: props => <DateFilter {...props} />,
};
