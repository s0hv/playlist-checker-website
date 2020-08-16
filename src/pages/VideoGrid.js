import React from 'react';
import Paper from '@material-ui/core/Paper'
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import withRoot from './../withRoot';
import {getToken, withToken} from './../authenticate';
import {Redirect} from "react-router-dom";
import {
    dateColumnFilters,
    DateEditor,
    dateFilterIcons,
    dateFilterMessages
} from '../components/date'
import {
    boolFilterIcons,
    boolFilterMessages,
    boolFilters,
    BoolTypeProvider
} from '../components/boolean'
import {ThumbnailTypeProvider} from '../components/thumbnail'

import {
    CustomPaging,
    DataTypeProvider,
    EditingState,
    FilteringState,
    IntegratedFiltering,
    PagingState,
    RowDetailState,
    SortingState,
} from '@devexpress/dx-react-grid';
import {
    ColumnChooser,
    DragDropProvider,
    Grid,
    PagingPanel,
    TableColumnReordering,
    TableColumnResizing,
    TableColumnVisibility,
    TableEditColumn,
    TableEditRow,
    TableFilterRow,
    TableHeaderRow,
    TableRowDetail,
    Toolbar,
    VirtualTable,
} from '@devexpress/dx-react-grid-material-ui';
import {Loading} from '../styles/loading';
import {IconButton, Link} from "@material-ui/core";
import Cookies from "universal-cookie/cjs";

const cookies = new Cookies();
// Define constants that will be used in this file

// We define the function that returns null here instead of in render
const nullFunc = () => null;

// Combine all custom filter messages and icons into single dicts
const filterMessages = {...dateFilterMessages, ...boolFilterMessages};
const filterIcons = {...boolFilterIcons, ...dateFilterIcons};

// Base api url
const URL = `/api/videos`;

// Filters used for integer columns
const IntegerFilters = ['equal', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual', 'notEqual'];

// Filters used for array columns
const ArrayFilters = ['equal', 'notEqual'];

// filters for video id
const VideoIDFilters = ['equal', 'notEqual'];
const VideoID = ['video_id'];

// Returns function for the specified filter type.
// The functions take the filterable value as their parameter and return
//a string that can be used in the where query argument
const FILTERS = {
    contains: (value) => { return `ILIKE %${value}%` },
    notContains: (value) => { return `NOT ILIKE %${value}%` },
    startsWith: (value) => { return `ILIKE ${value}%` },
    endsWith: (value) => { return `ILIKE %${value}` },
    equal: (value) => { return `= ${value}`},
    notEqual: (value) => { return `!= ${value}` },
    greaterThan: (value) => { return `> ${value}` },
    greaterThanOrEqual: (value) => { return `>= ${value}` },
    lessThan: (value) => { return `< ${value}` },
    lessThanOrEqual: (value) => { return `<= ${value}` },
    true: () => { return `= True`},
    false: () => { return `= False` },
    at: (value) => { return `= ${value}`},
    before: (value) => { return `< ${value}`},
    after: (value) => { return `> ${value}`},
};

// Used for returning custom filter icons
const FilterIcon = ({ type, ...restProps }) => {
    const Icon = filterIcons[type];
    if (Icon !== undefined) return <Icon {...restProps}/>;
    return <TableFilterRow.Icon type={type} {...restProps}/>
};

// Used to hide filter line edit when it's disabled
const FilterCellRender = ({ filteringEnabled, column, ...restProps }) => {
    // We don't want to render disabled filters
    if (!filteringEnabled) return <th/>;
    return <TableFilterRow.Cell filteringEnabled={filteringEnabled} {...restProps}/>
};

// Element that
const RowDetail = ({ row }) => (
  <pre style={{ fontSize: 14 }}>
      <Link href={`https://www.youtube.com/results?search_query=${row.title}`}
            color='secondary' rel="noreferrer" target='_blank'>
          Search title from youtube
      </Link>
      <br/>
      {row.description}
  </pre>
);

const EditButton = ({ onExecute }) => (
    <IconButton onClick={onExecute} title="Edit row">
        <EditIcon/>
    </IconButton>
);

const CommitButton = ({ onExecute }) => (
  <IconButton onClick={onExecute} title="Save changes">
    <SaveIcon />
  </IconButton>
);

const CancelButton = ({ onExecute }) => (
  <IconButton color="secondary" onClick={onExecute} title="Cancel changes">
    <CancelIcon />
  </IconButton>
);

const commandComponents = {
  edit: EditButton,
  commit: CommitButton,
  cancel: CancelButton,
};

const Command = ({ id, onExecute }) => {
  const CommandButton = commandComponents[id];
  return (
    <CommandButton
      onExecute={onExecute}
    />
  );
};

const EditCell = (props) => {
  return <TableEditRow.Cell {...props} />;
};

const getRowId = row => row.id;

class VideoGrid extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            columns: [
                {name: 'id', title: 'ID'},
                {name: 'video_id', title: 'Video id'},
                {name: 'title', title: 'Title'},
                {name: 'published_at', title: 'Publish date'},
                {name: 'tag', title: 'Tags'},
                {name: 'thumbnail', title: 'Thumbnail'},
                {name: 'deleted', title: 'Is deleted'},
                {name: 'download_type', title: 'Download format'},
                {name: 'alternative', title: 'Alternative'},
                {name: 'name', title: 'Playlist'},
                {name: 'playlist_id', title: 'Playlist id'},
                {name: 'deleted_at', title: 'Deletion date'},
                {name: 'downloaded_format', title: 'Format used'}
            ],
            thumbnailColumns: ['thumbnail'],
            integerColumns: ['id'],
            arrayColumns: ['tag', 'playlist_id', 'name'],  // Columns represented as array in backend
            boolColumns: ['deleted'],
            dateColumns: ['published_at', 'deleted_at'],
            dateColumnFilters: dateColumnFilters,
            columnExtensions: [
                {columnName: 'title', wordWrapEnabled: true},
                {columnName: 'alternative', wordWrapEnabled: true},
                {columnName: 'tag', wordWrapEnabled: true},
                {columnName: 'name', wordWrapEnabled: true},
                {columnName: 'playlist_id', wordWrapEnabled: true},
            ],

            filterableColumns: [
                {columnName: 'id', filteringEnabled: true},
                {columnName: 'video_id', filteringEnabled: true},
                {columnName: 'title', filteringEnabled: true},
                {columnName: 'published_at', filteringEnabled: true},
                {columnName: 'deleted_at', filteringEnabled: true},
                {columnName: 'deleted', filteringEnabled: true},
                {columnName: 'tag', filteringEnabled: true},
                {columnName: 'alternative', filteringEnabled: true},
                {columnName: 'name', filteringEnabled: true},
                {columnName: 'playlist_id', filteringEnabled: true},
            ],

            // These are needed for non integrated filtering to succeed on custom components
            filteringColumnExtensions: [
                {
                    columnName: 'deleted',
                    predicate: () => true  // Needed for placeholder filter
                },
                {
                    columnName: 'tag',
                    predicate: () => true  // Needed for placeholder filter
                },
                {
                    columnName: 'deleted_at',
                    predicate: () => true  // Needed for placeholder filter
                },
                {
                    columnName: 'published_at',
                    predicate: () => true  // Needed for placeholder filter
                },
                {
                    columnName: 'name',
                    predicate: () => true  // Needed for placeholder filter
                },
                {
                    columnName: 'playlist_id',
                    predicate: () => true  // Needed for placeholder filter
                },
              ],

            columnWidths: [
                {columnName: 'id', align: 'right', width: 100},
                {columnName: 'video_id', width: 150},
                {columnName: 'title', width: 500},
                {columnName: 'published_at', width: 250},
                {columnName: 'deleted', width: 100},
                {columnName: 'deleted_at', width: 250},
                {columnName: 'tag', width: 250},
                {columnName: 'thumbnail', width: 300},
                {columnName: 'alternative', width: 300},
                {columnName: 'name', width: 300},
                {columnName: 'playlist_id', width: 300},
                {columnName: 'download_type', width: 300},
                {columnName: 'downloaded_format', width: 300},
            ],

            columnOrder: [
                'id',
                'video_id',
                'title',
                'published_at',
                'tag',
                'thumbnail',
                'deleted',
                'download_type',
                'alternative',
                'name',
                'playlist_id',
                'deleted_at',
                'downloaded_format'
            ],

            editableColumnExtensions: [
                {columnName: 'alternative', editingEnabled: true},
                {columnName: 'download_type', editingEnabled: true},
            ],

            sortingStateColumnExtensions: [
                { columnName: 'thumbnail', sortingEnabled: false },
                { columnName: 'tag', sortingEnabled: false },
                { columnName: 'name', sortingEnabled: false },
                { columnName: 'playlist_id', sortingEnabled: false },
            ],

            hiddenColumnNames: ['id', 'video_id', 'tag'],

            rows: [],
            filters: [{columnName: 'deleted', value:'e'}],
            editingRowIds: [],
            rowChanges: {},
            sorting: [{ columnName: 'id', direction: 'asc'}],
            totalCount: 0,
            pageSize: 10,
            pageSizes: [10, 25, 50, 100],
            currentPage: 0,
            loading: true,
            redirectToLogin: false,
            tableHeight: window.innerHeight,
        };

        this.changeSorting = this.changeSorting.bind(this);
        this.changeCurrentPage = this.changeCurrentPage.bind(this);
        this.changePageSize = this.changePageSize.bind(this);
        this.commitChanges = this.commitChanges.bind(this);
        this.changeFilters = this.changeFilters.bind(this);

        this.changeEditingRowIds = editingRowIds => this.setState({ editingRowIds });
        this.changeRowChanges = rowChanges => this.setState({ rowChanges });
        this.setColumnOrder = columnOrder => {
            this.setState({ columnOrder });
            cookies.set('columnOrder', columnOrder, {maxAge: 2592000})
        };

        this.changeColumnWidths = (columnWidths) => {
            this.setState({ columnWidths });
        };

        this.changeHiddenColumnNames = (columnNames) => {
            this.setState({hiddenColumnNames: columnNames});
            // maxAge == 30 days
            cookies.set('hiddenColumns', columnNames, {maxAge: 2592000});
        };

        this.setHeight = () => { this.setState({ tableHeight: window.innerHeight - 136 })}

    }

    componentDidMount() {
        window.addEventListener('resize', this.setHeight);

        const hiddenCols = cookies.get('hiddenColumns');
        if (hiddenCols && Array.isArray(hiddenCols)) {
            this.setState({ hiddenColumnNames: hiddenCols });
        }

        const columnOrder = cookies.get('columnOrder');
        if (columnOrder &&  Array.isArray(columnOrder)) {
            this.setState({ columnOrder })
        }

        this.loadData();
    }

    componentDidUpdate() {
        this.loadData();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setHeight);
        clearTimeout(this.filterTimeout);
        this.filterTimeout = undefined
    }

    changeFilters(filters) {
        this.setState({
            loading: true,
        });

        // Clear old timeout and create new timeout to do api filter request
        // What this accomplishes is delays the api request until the search query
        // hasn't changed for the specified time
        this.setState({filters});
        clearTimeout(this.filterTimeout);
        this.filterTimeout =
            setTimeout(function () {
                this.filterTimeout = undefined;
                this.loadData();
            }.bind(this), 500);
    }

    changeSorting(sorting) {
        if (sorting.find(sort => sort.columnName === 'id') === undefined) {
            sorting.push({columnName: 'id', direction: 'asc'})
        }
        this.setState({
            loading: true,
            sorting,
        });
    }

    changeCurrentPage(currentPage) {
        this.setState({
            loading: true,
            currentPage,
        });
    }

    commitChanges({ changed }) {
        let { rows } = this.state;
        console.log(changed);

        for (let key in changed) {
            if (!changed.hasOwnProperty(key)) continue;

            if (changed[key] === undefined) return;

            delete changed[key]['published_at'];
            delete changed[key]['deleted_at'];
            const val = [];

            for (let column in changed[key]) {
                if (!changed[key].hasOwnProperty(column)) continue;

                val.push({column: column, value: changed[key][column]})
            }
            withToken(URL, getToken(), {id: key, columns: val}, {'Content-Type': 'application/json'}, 'PATCH')
                .then(json => console.log(json));

        }

        if (changed) {
            rows = rows.map(row => (changed[row.id] ? { ...row, ...changed[row.id] } : row));
        }

        this.setState({ rows });
    }

    changePageSize(pageSize) {
        const { totalCount, currentPage: stateCurrentPage } = this.state;
        const totalPages = Math.ceil(totalCount/pageSize);
        const currentPage = Math.min(stateCurrentPage, totalPages - 1);

        this.setState({
          loading: true,
          pageSize,
          currentPage,
        });
    }

    whereString() {
        const { filters } = this.state;
        let whereString = '';

        filters.forEach(function ({ columnName, value, operation }) {
            // Ignore if operation not found
            console.log(columnName, value, operation);
            if (!FILTERS[operation]) return;

            let val = encodeURIComponent(FILTERS[operation](value));
            if (whereString !== '') {
                whereString += `&where[${columnName}]=${val}`;
            } else {
                whereString = `where[${columnName}]=${val}`;
            }
        });

        console.log(whereString);

        return whereString;
    }

    selectedColumns() {
        const { hiddenColumnNames, columns, filters } = this.state;
        const cols = new Set();
        console.log(columns, hiddenColumnNames, filters);
        columns.forEach(({ name }) => {
            cols.add(name)
        });

        hiddenColumnNames.forEach( (filter) => {
            cols.delete(filter);
        });

        filters.forEach( ({ columnName }) => {
            cols.add(columnName);
        });

        cols.add('id');
        cols.add('video_id');
        cols.add('title');

        return cols;
    }

    queryString(whereString) {
        const { sorting, pageSize, currentPage } = this.state;
        let queryString = `${URL}?limit=${pageSize}&offset=${currentPage*pageSize}`;

        sorting.forEach(columnSorting => {
            const sortingDirection = columnSorting.direction === 'desc' ? 'desc' : 'asc';
            queryString = `${queryString}&sort[${columnSorting.columnName}]=${sortingDirection}`;
        });

        if (!whereString) whereString = this.whereString();
        if (whereString !== '') queryString = `${queryString}&${whereString}`;

        this.selectedColumns().forEach(col => {
            queryString = `${queryString}&select=${col}`;
        });

        return queryString;
    }

    loadData() {
        // If filter change has been done recently don't update data
        if (this.filterTimeout !== undefined) {
            return;
        }
        const whereString = this.whereString();
        const queryString = this.queryString(whereString);
        if (queryString === this.lastQuery) {
            if (this.filterTimeout === undefined) {
                this.setState({loading: false});
            }
            return;
        }

        let totalCount = this.state.totalCount;
        const token = getToken();
        if (totalCount <= 0 || this.lastWhere !== whereString) {

            this.lastWhere = whereString;

            const api = `${URL}/count${whereString ? '?' + whereString : ''}`;
            withToken(api, token)
                .then(json => {
                    if (json.error === 'Unauthorized') {
                        this.setState({redirectToLogin: true})
                    } else {
                        this.setState({totalCount: parseInt(json.count)})
                    }
                });
        }

        if (this.state.redirectToLogin) return;

        withToken(queryString, token)
            .then(data => {
                if (data.error) {
                    let state = {loading: false};
                    if (data.error === 'Unauthorized') state.redirectToLogin = true;

                    this.setState(state);
                } else {
                    this.setState({
                        rows: data.rows,
                        loading: false
                    });
                }
            })

            .catch(() => this.setState({ loading: false }));


        this.lastQuery = queryString;
    }

    render() {
    const {
        rows,
        columns,
        thumbnailColumns,
        arrayColumns,
        integerColumns,
        boolColumns,
        dateColumns,
        rowChanges,
        editingRowIds,
        columnExtensions,
        editableColumnExtensions,
        sortingStateColumnExtensions,
        filteringColumnExtensions,
        filterableColumns,
        filters,
        hiddenColumnNames,
        columnWidths,
        sorting,
        pageSize,
        pageSizes,
        currentPage,
        totalCount,
        loading,
        redirectToLogin,
        columnOrder,
    } = this.state;

    if (redirectToLogin) return <Redirect to='/login'/>;

    return (
        <Paper style={{ position: 'relative' }}>
            <Grid
              rows={rows}
              columns={columns}
              getRowId={getRowId}
            >
                <BoolTypeProvider
                    for={boolColumns}
                    editorComponent={nullFunc}
                    availableFilterOperations={boolFilters}
                />
                <ThumbnailTypeProvider
                    for={thumbnailColumns}
                />
                <DataTypeProvider
                    for={dateColumns}
                    editorComponent={DateEditor}
                    availableFilterOperations={dateColumnFilters}
                />
                <DataTypeProvider
                    for={integerColumns}
                    availableFilterOperations={IntegerFilters}
                />
                <DataTypeProvider
                    for={arrayColumns}
                    availableFilterOperations={ArrayFilters}
                />

                <DataTypeProvider
                    for={VideoID}
                    availableFilterOperations={VideoIDFilters}
                />

                <SortingState
                sorting={sorting}
                onSortingChange={this.changeSorting}
                columnExtensions={sortingStateColumnExtensions}
                />
                <PagingState
                    currentPage={currentPage}
                    onCurrentPageChange={this.changeCurrentPage}
                    pageSize={pageSize}
                    onPageSizeChange={this.changePageSize}
                />
                <EditingState
                    columnEditingEnabled={false}
                    columnExtensions={editableColumnExtensions}
                    editingRowIds={editingRowIds}
                    onEditingRowIdsChange={this.changeEditingRowIds}
                    rowChanges={rowChanges}
                    onRowChangesChange={this.changeRowChanges}
                    onCommitChanges={this.commitChanges}
                />
                <CustomPaging
                    totalCount={totalCount}
                />
                <FilteringState
                    filters={filters}
                    onFiltersChange={this.changeFilters}
                    columnFilteringEnabled={false}
                    columnExtensions={filterableColumns}
                />
                <IntegratedFiltering columnExtensions={filteringColumnExtensions}/>
                <DragDropProvider />
                <VirtualTable
                    columnExtensions={columnExtensions}
                    height={window.innerHeight - 136}  // 136 calculated with trial and error
                />

                <TableColumnResizing
                    columnWidths={columnWidths}
                    minColumnWidth={100}
                    onColumnWidthsChange={this.changeColumnWidths}
                />
                <TableHeaderRow showSortingControls />
                <TableColumnVisibility
                    hiddenColumnNames={hiddenColumnNames}
                    onHiddenColumnNamesChange={this.changeHiddenColumnNames}
                />
                <Toolbar />
                <ColumnChooser/>
                <TableFilterRow
                    showFilterSelector
                    iconComponent={FilterIcon}
                    messages={filterMessages}
                    cellComponent={FilterCellRender}
                />
                <TableEditRow
                    cellComponent={EditCell}
                />
                <TableEditColumn
                    width={100}
                    showEditCommand
                    commandComponent={Command}
                />
                <TableColumnReordering
                    order={columnOrder}
                    onOrderChange={this.setColumnOrder}
                />
                <RowDetailState />
                <TableRowDetail
                    contentComponent={RowDetail}
                />
                <PagingPanel
                    pageSizes={pageSizes}
                />
            </Grid>
            {loading && <Loading />}
        </Paper>
    );
  }

}

export default withRoot(VideoGrid);
