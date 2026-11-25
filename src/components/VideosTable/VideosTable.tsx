import {
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import {
  type DragEndEvent,
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTable } from '@tanstack/react-table';

import { videosQueryOptions } from '@/api/videos';

import { videoColumns } from './columns';
import { noRows } from './constants';
import { videoTableFeatures } from './features';
import { BodyRow } from './table/BodyRow';
import { FilterCell } from './table/FilterCell';
import { HeaderCell } from './table/HeaderCell';
import { Toolbar } from './table/Toolbar';
import { type Density, useVideosTableState } from './useVideosTableState';

const rowsPerPageOptions = [10, 25, 50, 100];

// Width of the expand button cell, which sits outside the column model
const expandCellWidth = 56;

const densityCellPadding: Record<Density, number> = {
  compact: 0.5,
  comfortable: 1,
  spacious: 2,
};

export const VideosTable = () => {
  const {
    query,
    filters,
    setColumnFilter,
    tableState,
    tableHandlers,
    resetColumnLayout,
    density,
    setDensity,
    isFullScreen,
    setIsFullScreen,
  } = useVideosTableState();

  const { data, isFetching } = useQuery({
    ...videosQueryOptions(query, tableState.pagination),
    placeholderData: keepPreviousData,
  });

  const table = useTable(
    {
      features: videoTableFeatures,
      columns: videoColumns,
      data: data?.rows ?? noRows,
      rowCount: data?.count ?? 0,
      getRowId: row => String(row.id),
      getRowCanExpand: () => true,
      columnResizeMode: 'onChange',
      defaultColumn: { minSize: 80 },
      state: tableState,
      ...tableHandlers,
      // Paging and sorting are done by the API
      manualPagination: true,
      manualSorting: true,
    },
    state => state
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const order = table.getAllLeafColumns().map(column => column.id);
    table.setColumnOrder(arrayMove(order, order.indexOf(String(active.id)), order.indexOf(String(over.id))));
  };

  const headers = table.getHeaderGroups()[0].headers;
  const visibleColumnIds = headers.map(header => header.column.id);
  const rows = table.getRowModel().rows;

  return (
    <Paper
      sx={isFullScreen
        ? { position: 'fixed', inset: 0, zIndex: 'modal', overflow: 'auto', borderRadius: 0 }
        : undefined}
    >
      <Toolbar
        table={table}
        density={density}
        setDensity={setDensity}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
        resetColumnLayout={resetColumnLayout}
      />
      <LinearProgress sx={{ visibility: isFetching ? 'visible' : 'hidden' }} />
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <TableContainer>
          <Table
            size={density === 'compact' ? 'small' : 'medium'}
            sx={{
              tableLayout: 'fixed',
              width: table.getTotalSize() + expandCellWidth,
              '& .MuiTableCell-root': { py: densityCellPadding[density] },
            }}
          >
            <TableHead>
              <SortableContext items={visibleColumnIds} strategy={horizontalListSortingStrategy}>
                <TableRow>
                  <TableCell sx={{ width: expandCellWidth }} />
                  {headers.map(header => <HeaderCell key={header.id} header={header} />)}
                </TableRow>
                <TableRow>
                  <TableCell />
                  {headers.map(header => (
                    <FilterCell
                      key={header.id}
                      header={header}
                      filters={filters}
                      setColumnFilter={setColumnFilter}
                    />
                  ))}
                </TableRow>
              </SortableContext>
            </TableHead>
            <TableBody>
              <SortableContext items={visibleColumnIds} strategy={horizontalListSortingStrategy}>
                {rows.map(row => <BodyRow key={row.id} row={row} />)}
              </SortableContext>
              {rows.length === 0 && !isFetching && (
                <TableRow>
                  <TableCell colSpan={headers.length + 1}>
                    <Typography sx={{ color: 'text.secondary', textAlign: 'center' }}>
                      No videos found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DndContext>
      <TablePagination
        component='div'
        count={data?.count ?? 0}
        page={tableState.pagination.pageIndex}
        rowsPerPage={tableState.pagination.pageSize}
        rowsPerPageOptions={rowsPerPageOptions}
        showFirstButton
        showLastButton
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={event => {
          table.setPageSize(Number(event.target.value));
          table.setPageIndex(0);
        }}
      />
    </Paper>
  );
};
