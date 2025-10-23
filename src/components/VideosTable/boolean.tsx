import {
  type FC,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import Search from '@mui/icons-material/Search';
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';

import {
  type BooleanFilterOption,
  type FilterProps,
  type VideoTableColumnDefTyped,
  CellComponent,
} from './types';

export const boolFilters = ['noFilter', 'true', 'false'] as const;

export const boolFilterMessages: Record<BooleanFilterOption, string> = {
  noFilter: 'No filter',
  true: 'True',
  false: 'False',
};
export const boolFilterIcons: Record<BooleanFilterOption, ReactNode> = {
  true: <Check />,
  false: <Close />,
  noFilter: <Search />,
};


export const BooleanCell: CellComponent<boolean | null | undefined> = ({ cell }) => {
  const value = cell.getValue<boolean | null | undefined>();

  return (
    <Checkbox
      checked={Boolean(value)}
      disabled={true}
    />
  );
};

export const BooleanFilter: FC<FilterProps<boolean | null | undefined>> = ({ column, table }) => {
  const [filterFn, setFilterFn] = useState<BooleanFilterOption>('noFilter');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openMenu = useCallback((event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget), []);
  const closeMenu = useCallback(() => setAnchorEl(null), []);

  const handleFilterFnChange = useCallback((filter: BooleanFilterOption) => {
    closeMenu();
    setFilterFn(filter);

    table.setColumnFilterFns(prev => ({
      ...prev,
      [column.id]: filter,
    }));
  }, [column, table, closeMenu]);

  // Set the filter value so it is included in the where statement.
  // This only needs to be done once
  useEffect(() => {
    column.setFilterValue('true');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton onClick={openMenu}>
        {boolFilterIcons[filterFn]}
      </IconButton>
      <Typography fontWeight={500} fontSize='0.875rem'>
        {boolFilterMessages[filterFn]}
      </Typography>
      <Menu
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={closeMenu}
      >
        {boolFilters.map(filt => (
          <MenuItem
            key={filt}
            onClick={() => handleFilterFnChange(filt)}
            sx={{
              gap: 1,
              '& svg': {
                // Color of icons inside an icon button
                color: 'rgba(0, 0, 0, 0.54)',
              },
            }}
          >
            {boolFilterIcons[filt]}
            {boolFilterMessages[filt]}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export const booleanColumnDef: Partial<VideoTableColumnDefTyped<boolean | null | undefined>> = {
  Cell: BooleanCell,
  filterFn: 'noFilter',
  columnFilterModeOptions: Array.from(boolFilters),
  enableColumnActions: false,
  Filter: props => <BooleanFilter {...props} />,
};
