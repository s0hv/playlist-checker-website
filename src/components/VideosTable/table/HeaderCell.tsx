import type { CSSProperties, FC } from 'react';
import DragIndicator from '@mui/icons-material/DragIndicator';
import { Box, IconButton, TableCell, TableSortLabel } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Header, FlexRender } from '@tanstack/react-table';

import type { VideoRow } from '@/types/types';

import type { VideoTableFeatures } from '../features';

type HeaderCellProps = {
  header: Header<VideoTableFeatures, VideoRow, unknown>
};

/**
 * Style for cells that move along with their column while it is dragged.
 */
export const useDragAlongStyle = (columnId: string, width: number) => {
  const sortable = useSortable({ id: columnId });

  const style: CSSProperties = {
    width,
    opacity: sortable.isDragging ? 0.8 : 1,
    position: 'relative',
    // Translate instead of transform to avoid squishing the cell
    transform: CSS.Translate.toString(sortable.transform),
    transition: 'width transform 0.2s ease-in-out',
    zIndex: sortable.isDragging ? 1 : 0,
  };

  return { ...sortable, style };
};

export const HeaderCell: FC<HeaderCellProps> = ({ header }) => {
  const { column } = header;
  const { attributes, listeners, setNodeRef, style } = useDragAlongStyle(column.id, header.getSize());
  const sorted = column.getIsSorted();

  return (
    <TableCell ref={setNodeRef} style={style} sx={{ whiteSpace: 'nowrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <IconButton
          aria-label='Reorder column'
          size='small'
          sx={{ cursor: 'grab' }}
          {...attributes}
          {...listeners}
        >
          <DragIndicator fontSize='small' />
        </IconButton>
        {column.getCanSort()
          ? (
            <TableSortLabel
              active={sorted !== false}
              direction={sorted || 'asc'}
              onClick={column.getToggleSortingHandler()}
            >
              <FlexRender header={header} />
            </TableSortLabel>
          )
          : <FlexRender header={header} />}
      </Box>
      {column.getCanResize() && (
        <Box
          aria-hidden
          onDoubleClick={() => column.resetSize()}
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 6,
            height: '100%',
            cursor: 'col-resize',
            touchAction: 'none',
            bgcolor: column.getIsResizing() ? 'primary.main' : 'transparent',
            '&:hover': { bgcolor: 'primary.main' },
          }}
        />
      )}
    </TableCell>
  );
};
