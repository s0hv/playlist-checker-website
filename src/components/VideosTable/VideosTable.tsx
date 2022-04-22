import {
  FunctionComponent,
  useCallback, useEffect,
  useRef,
  useState
} from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { CircularProgress, Paper, IconButton } from '@mui/material';
import {
  Grid,
  Table,
  TableHeaderRow,
  PagingPanel,
  Toolbar,
  TableColumnVisibility,
  ColumnChooser,
  TableFilterRow,
  TableColumnResizing,
  TableRowDetail,
  DragDropProvider,
  TableColumnReordering
} from '@devexpress/dx-react-grid-material-ui';
import {
  CustomPaging,
  PagingState,
  Sorting,
  SortingState,
  FilteringState,
  Filter,
  DataTypeProvider,
  TableColumnWidthInfo,
  RowDetailState, TableFilterRow as TableFilterRowBase
} from '@devexpress/dx-react-grid';
import { useQuery } from 'react-query';
import throttle from 'lodash.throttle';
import {
  getVideoCount,
  GetVideoQuery,
  getVideos,
  HttpForbidden
} from '../../api/videos';
import { ColumnFilter, ColumnSort, PlaylistName } from '../../../types/types';
import {
  difference,
  FilterOperation,
  filterOperations,
  filterValueTransformations, integerFilters, stringIdFilters, union
} from '../../utils';
import {
  allCols,
  arrayColumns,
  boolColumns,
  ColumnName,
  columns,
  columnToTableCol,
  dateColumns,
  defaultColumnWidths,
  defaultFilters,
  integerColumns,
  stringIdColumns
} from './columnInfos';
import { RowDetail } from './RowDetail';
import {
  boolFilterIcons,
  boolFilterMessages,
  boolFilters,
  BoolTypeProvider
} from './boolean';
import {
  dateColumnFilters,
  dateFilterIcons,
  dateFilterMessages,
  DateTypeProvider
} from './dates';
import {
  arrayFilterIcons,
  arrayFilterMessages,
  ArrayTypeProvider
} from './array';
import transform from 'next/dist/build/babel/loader/transform';
import { signIn, signOut, useSession } from 'next-auth/react';
import { PlaylistNameProvider } from './PlaylistAutocomplete';

const noRows: never[] = [];
const localStorageKeys = {
  hiddenCols: 'hiddenCols',
  columnOrder: 'columnOrder'
} as const;

const defaultVisibleCols = new Set([
  'id',
  'videoId',
  'title',
  'publishedAt',
  'deleted',
  'deletedAt',
  'downloadedFilename',
  'downloadedFormat',
  'download'
]);
const defaultHiddenCols = new Set(['playlistId']);
const rowDetailCols: Readonly<ColumnName[]> = [
  'id',
  'site',
  'title',
  'thumbnail',
  'description',
  'downloadedFilename',
  'videoId',
  'filesThumbnail',
  'alternative',
  'deleted',
  'filesSubtitles',
  'filesAudioFile'
] as const;

type Select = { [key: string]: string[] };

const colsToSelectQuery = (cols: string[]|Set<string>): Select => {
  const select: Select = {};

  for (let col of union(cols, rowDetailCols)) {
    const [table, actualCol] = columnToTableCol[col as ColumnName];
    if (!select[table]) select[table] = [];

    select[table].push(actualCol);
  }

  return select;
};

type FilterFn = (filters: Filter[]) => any;
type FilterCaller = (fn: FilterFn, filters: Filter[]) => any;

const getRowId = (row: any): string | number => row.id;

const filterMessages = {...boolFilterMessages, ...dateFilterMessages, ...arrayFilterMessages};
const filterIcons: { [key: string]: any } = {...boolFilterIcons, ...dateFilterIcons, ...arrayFilterIcons};

// Used for returning custom filter icons
const FilterIcon = ({ type, ...restProps }: TableFilterRowBase.IconProps) => {
  const Icon = filterIcons[type];
  if (Icon !== undefined) return <Icon {...restProps}/>;
  return <TableFilterRow.Icon type={type} {...restProps}/>;
};

const FilterSelectorComponent: FunctionComponent<TableFilterRow.FilterSelectorProps> = ({ value, ...restProps }: TableFilterRow.FilterSelectorProps) => {
  const boolMessage = (boolFilterMessages as {[key: string]: string})[value];
  if (boolMessage) return (
    <div>
      <TableFilterRow.FilterSelector value={value} {...restProps}/>
      <span>{boolMessage}</span>
    </div>
  );
  return <TableFilterRow.FilterSelector value={value} {...restProps}/>;
};

const RowDetailIcon: FunctionComponent<TableRowDetail.ToggleCellProps> = (props: TableRowDetail.ToggleCellProps)=> {
  return (
    <TableRowDetail.Cell {...props}>
      <IconButton
        onClick={props.onToggle}
        sx={(theme) => ({
          transform: 'rotate(0deg)',
          transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
          }),
          '&.expanded': {
            transform: 'rotate(90deg)',
          }})}
        className={props.expanded ? 'expanded' : ''}
      >
        <ChevronRightIcon />
      </IconButton>
    </TableRowDetail.Cell>

  );
};


export const VideosTable = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      return signIn();
    },
  });

  const [sorting, setSorting] = useState<Sorting[]>([]);
  const [hiddenCols, setHiddenCols] = useState<string[]>(difference(allCols, defaultVisibleCols));
  const [columnWidths, setColumnWidths] = useState<TableColumnWidthInfo[]>((defaultColumnWidths as unknown) as TableColumnWidthInfo[]);
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map(o => o.name));

  useEffect(() => {
    const order = window.localStorage.getItem(localStorageKeys.columnOrder);
    if (order !== null) {
      updateColumnOrder(order.split(','));
    }

    const hidden = window.localStorage.getItem(localStorageKeys.hiddenCols);
    if (hidden !== null) {
      updateHiddenCols(hidden.split(','));
    }

    // We only want to run this on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runFilter = useRef(throttle<FilterCaller>((fn, filters) => fn(filters), 250));

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [pageSizes] = useState([5, 10, 15]);
  const [query, setQuery] = useState<GetVideoQuery>({
    select: colsToSelectQuery(defaultVisibleCols),
    limit: pageSize
  });
  const { isFetching, data } = useQuery([query], () => getVideos(query), {
    keepPreviousData: true,
    staleTime: Infinity,
    retry: false,
  });

  const { data: rowCount, error } = useQuery([query.where], () => getVideoCount(query.where), {
    keepPreviousData: true,
    staleTime: Infinity,
    retry: false,
  });
  if (status === 'loading' && error instanceof HttpForbidden) {
    signOut({ redirect: false });
  }

  const updateColumnOrder = useCallback((newOrder: string[]) => {
    window.localStorage.setItem(localStorageKeys.columnOrder, newOrder.join(','));
    setColumnOrder(newOrder);
  }, []);

  const updateCurrentPage = useCallback((page: number) => {
    setCurrentPage(page);
    setQuery({
      ...query,
      offset: page * pageSize
    });
  }, [pageSize, query]);

  const updatePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setQuery({
      ...query,
      limit: newPageSize
    });
  }, [query]);

  const updateSorting = useCallback((sorting: Sorting[]) => {
    setSorting(sorting);
    if (!sorting) {
      query.sort = undefined;
      setQuery({
        ...query,
        sort: undefined
      });
      return;
    }

    const sort: ColumnSort[] = [];
    for (let sortCol of sorting) {
      const [table, col] = columnToTableCol[sortCol.columnName as ColumnName];
      const obj: ColumnSort = {
        col,
        table
      };
      if (sortCol.direction === 'desc') {
        obj.asc = false;
      }

      sort.push(obj);
    }

    setQuery({
      ...query,
      sort
    });
  }, [query]);

  const updateHiddenCols = useCallback((newHiddenCols: string[]) => {
    setHiddenCols(newHiddenCols);
    window.localStorage.setItem(localStorageKeys.hiddenCols, newHiddenCols.join(','));

    const visibleCols = difference(allCols, union(new Set(newHiddenCols), defaultHiddenCols));
    setQuery({
      ...query,
      select: colsToSelectQuery(visibleCols)
    });
  }, [query]);

  const updateFilters = useCallback((filters: Filter[]) => {
    if (filters.length === 0) {
      setQuery({
        select: query.select,
        sort: query.sort,
        offset: query.offset,
        limit: query.limit,
        where: undefined
      });
      return;
    }

    const where: ColumnFilter[] = [];
    for (let filter of filters) {
      // The int database id
      if (filter.columnName === 'playlistId') continue;

      let filterOperation = filter.operation as FilterOperation || 'equal';
      if (filterOperation === 'noFilter') continue;

      let value: any = filter.value;
      let columnName: ColumnName = filter.columnName as ColumnName;
      if (columnName === 'playlistName') {
        if (!filter.value?.length) continue;

        value = (filter.value as unknown as PlaylistName[]).map(p => p.id.toString());

        columnName = 'playlistId';
      }
      const [table, col] = columnToTableCol[columnName];
      //if (table === 'playlist' && col === 'id') continue;

      const op = filterOperations[filter.operation as FilterOperation] || filterOperations.equal;
      where.push({
        col,
        table,
        value: filterValueTransformations[filterOperation](value || ''),
        comp: op
      });
    }

    setQuery({
      select: query.select,
      sort: query.sort,
      offset: query.offset,
      limit: query.limit,
      where
    });
    // Searching can happen often, so it's most important here that this function
    // does not cause itself to regenerate
  }, [query.select, query.sort, query.offset, query.limit]);

  // Not the best solution for a throttled function but definitely the easiest to implement
  const maybeUpdateFilters = useCallback((filters: Filter[]) => {
    runFilter.current(updateFilters, filters);
  }, [updateFilters]);

  return (
    <Paper>
      <Grid
        rows={data?.rows || noRows}
        columns={columns}
        getRowId={getRowId}
      >
        <BoolTypeProvider
          for={boolColumns}
          availableFilterOperations={boolFilters as unknown as string[]}
        />
        <DataTypeProvider
          for={integerColumns}
          availableFilterOperations={integerFilters}
        />
        <ArrayTypeProvider
          for={arrayColumns}
        />

        <DateTypeProvider
          for={dateColumns}
          availableFilterOperations={dateColumnFilters as unknown as string[]}
        />
        <DataTypeProvider
          for={stringIdColumns}
          availableFilterOperations={stringIdFilters}
        />
        <PlaylistNameProvider for={['playlistName']} />

        <SortingState
          sorting={sorting}
          onSortingChange={updateSorting}
        />
        <PagingState
          currentPage={currentPage}
          onCurrentPageChange={updateCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={updatePageSize}
        />
        <CustomPaging
          totalCount={rowCount}
        />
        <FilteringState
          onFiltersChange={maybeUpdateFilters}
          defaultFilters={defaultFilters}
        />
        <RowDetailState />
        <DragDropProvider />

        <Table />
        { /* Must be before TableColumnResizing or that component will expect
        to receive a list of all available columns */}
        <TableColumnVisibility
          hiddenColumnNames={hiddenCols}
          onHiddenColumnNamesChange={updateHiddenCols}
        />
        <TableColumnResizing
          columnWidths={columnWidths}
          onColumnWidthsChange={setColumnWidths}
          minColumnWidth={100}
        />
        <TableColumnReordering
          order={columnOrder}
          onOrderChange={updateColumnOrder}
        />
        <TableHeaderRow showSortingControls />
        <TableFilterRow
          showFilterSelector
          iconComponent={FilterIcon}
          messages={filterMessages}
          filterSelectorComponent={FilterSelectorComponent}
        />
        <TableRowDetail
          contentComponent={RowDetail}
          toggleCellComponent={RowDetailIcon}
        />
        <PagingPanel
          pageSizes={pageSizes}
        />
        <Toolbar />
        <ColumnChooser />
      </Grid>
      <div>
        {isFetching && <CircularProgress />}
      </div>
    </Paper>
  );
};
