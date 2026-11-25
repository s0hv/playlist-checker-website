import { type ReactNode, useState } from 'react';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import Search from '@mui/icons-material/Search';
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';

import type { CellComponent, FilterComponent } from './types';

type BooleanFilterOption = 'noFilter' | 'true' | 'false';

const boolFilterOptions: BooleanFilterOption[] = ['noFilter', 'true', 'false'];

const boolFilterMessages: Record<BooleanFilterOption, string> = {
  noFilter: 'No filter',
  true: 'True',
  false: 'False',
};
const boolFilterIcons: Record<BooleanFilterOption, ReactNode> = {
  true: <Check />,
  false: <Close />,
  noFilter: <Search />,
};

export const BooleanCell: CellComponent<boolean | null | undefined> = ({ value }) => (
  <Checkbox
    checked={Boolean(value)}
    disabled={true}
  />
);

export const BooleanFilter: FilterComponent = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const selected: BooleanFilterOption = typeof value === 'boolean' ? `${value}` : 'noFilter';

  const select = (option: BooleanFilterOption) => {
    setAnchorEl(null);
    onChange(option === 'noFilter' ? undefined : { mode: 'is', value: option === 'true' });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton aria-label='Change boolean filter' onClick={event => setAnchorEl(event.currentTarget)}>
        {boolFilterIcons[selected]}
      </IconButton>
      <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
        {boolFilterMessages[selected]}
      </Typography>
      <Menu
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={() => setAnchorEl(null)}
      >
        {boolFilterOptions.map(option => (
          <MenuItem
            key={option}
            selected={option === selected}
            onClick={() => select(option)}
            sx={{
              gap: 1,
              '& svg': {
                // Color of icons inside an icon button
                color: 'rgba(0, 0, 0, 0.54)',
              },
            }}
          >
            {boolFilterIcons[option]}
            {boolFilterMessages[option]}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
