import { type FC, useState } from 'react';
import FilterList from '@mui/icons-material/FilterList';
import { IconButton, Menu, MenuItem } from '@mui/material';

import {
  type FilterKind,
  type FilterMode,
  filterModeLabels,
  filterModesByKind,
} from './modes';

type FilterModeMenuProps = {
  kind: FilterKind
  mode: FilterMode
  onSelect: (mode: FilterMode) => void
};

export const FilterModeMenu: FC<FilterModeMenuProps> = ({ kind, mode, onSelect }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const modes = filterModesByKind[kind];

  if (modes.length < 2) return null;

  const select = (selected: FilterMode) => {
    setAnchorEl(null);
    onSelect(selected);
  };

  return (
    <>
      <IconButton
        aria-label='Change filter mode'
        onClick={event => setAnchorEl(event.currentTarget)}
        size='small'
        sx={{ height: '1.75rem', width: '1.75rem', mr: 1 }}
      >
        <FilterList />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={() => setAnchorEl(null)}
      >
        {modes.map(option => (
          <MenuItem
            key={option}
            selected={option === mode}
            onClick={() => select(option)}
          >
            {filterModeLabels[option]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export const filterModeHelperText = (mode: FilterMode) => `Filter mode: ${filterModeLabels[mode]}`;
