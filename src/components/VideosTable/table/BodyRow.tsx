import type { FC } from 'react';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { IconButton, TableCell, TableRow } from '@mui/material';
import { type Cell, type Row, FlexRender } from '@tanstack/react-table';

import type { VideoRow } from '@/types/types';

import type { VideoTableFeatures } from '../features';
import { RowDetail } from '../RowDetail';

import { useDragAlongStyle } from './HeaderCell';

const BodyCell: FC<{ cell: Cell<VideoTableFeatures, VideoRow, unknown> }> = ({ cell }) => {
  const { setNodeRef, style } = useDragAlongStyle(cell.column.id, cell.column.getSize());

  return (
    <TableCell ref={setNodeRef} style={style} sx={{ overflow: 'hidden' }}>
      <FlexRender cell={cell} />
    </TableCell>
  );
};

type BodyRowProps = {
  row: Row<VideoTableFeatures, VideoRow>
};

export const BodyRow: FC<BodyRowProps> = ({ row }) => {
  const isExpanded = row.getIsExpanded();
  const cells = row.getVisibleCells();

  return (
    <>
      <TableRow hover>
        <TableCell padding='checkbox'>
          <IconButton
            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
            size='small'
            onClick={row.getToggleExpandedHandler()}
          >
            {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          </IconButton>
        </TableCell>
        {cells.map(cell => <BodyCell key={cell.id} cell={cell} />)}
      </TableRow>
      {isExpanded && (
        <TableRow>
          {/* The expand button cell is not part of the column model, so it is added to the span separately */}
          <TableCell colSpan={cells.length + 1}>
            <RowDetail row={row.original} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
