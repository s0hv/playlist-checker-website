import { type FC, type ReactNode, useState } from 'react';
import DensityLarge from '@mui/icons-material/DensityLarge';
import DensityMedium from '@mui/icons-material/DensityMedium';
import DensitySmall from '@mui/icons-material/DensitySmall';
import Fullscreen from '@mui/icons-material/Fullscreen';
import FullscreenExit from '@mui/icons-material/FullscreenExit';
import RestartAlt from '@mui/icons-material/RestartAlt';
import ViewColumn from '@mui/icons-material/ViewColumn';
import {
  Box,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Tooltip,
} from '@mui/material';
import type { ReactTable } from '@tanstack/react-table';

import type { VideoRow } from '@/types/types';

import type { VideoTableFeatures } from '../features';
import type { Density } from '../useVideosTableState';

type VideosReactTable = ReactTable<VideoTableFeatures, VideoRow>;

const ColumnVisibilityMenu: FC<{ table: VideosReactTable }> = ({ table }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <Tooltip title='Show/hide columns'>
        <IconButton aria-label='Show/hide columns' onClick={event => setAnchorEl(event.currentTarget)}>
          <ViewColumn />
        </IconButton>
      </Tooltip>
      <Popover
        open={anchorEl !== null}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <List dense>
          {table.getAllLeafColumns().map(column => (
            <ListItem key={column.id} disablePadding>
              <ListItemButton dense onClick={() => column.toggleVisibility(!column.getIsVisible())}>
                <ListItemIcon>
                  <Checkbox
                    edge='start'
                    size='small'
                    checked={column.getIsVisible()}
                    tabIndex={-1}
                  />
                </ListItemIcon>
                <ListItemText primary={column.columnDef.header as string} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
};

const nextDensity: Record<Density, Density> = {
  comfortable: 'compact',
  compact: 'spacious',
  spacious: 'comfortable',
};

const densityIcons: Record<Density, ReactNode> = {
  compact: <DensitySmall />,
  comfortable: <DensityMedium />,
  spacious: <DensityLarge />,
};

type ToolbarProps = {
  table: VideosReactTable
  density: Density
  setDensity: (density: Density) => void
  isFullScreen: boolean
  setIsFullScreen: (isFullScreen: boolean) => void
  resetColumnLayout: () => void
};

export const Toolbar: FC<ToolbarProps> = ({
  table,
  density,
  setDensity,
  isFullScreen,
  setIsFullScreen,
  resetColumnLayout,
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5 }}>
    <Tooltip title='Reset column layout'>
      <IconButton aria-label='Reset column layout' onClick={resetColumnLayout} sx={{ mr: '3rem' }}>
        <RestartAlt />
      </IconButton>
    </Tooltip>

    <ColumnVisibilityMenu table={table} />

    <Tooltip title='Toggle density'>
      <IconButton aria-label='Toggle density' onClick={() => setDensity(nextDensity[density])}>
        {densityIcons[density]}
      </IconButton>
    </Tooltip>

    <Tooltip title={isFullScreen ? 'Exit full screen' : 'Full screen'}>
      <IconButton
        aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
        onClick={() => setIsFullScreen(!isFullScreen)}
      >
        {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
      </IconButton>
    </Tooltip>
  </Box>
);
