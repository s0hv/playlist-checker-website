import React from 'react';
import Paper from '@material-ui/core/Paper'
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import Checkbox from '@material-ui/core/Checkbox';
import withRoot from './../withRoot';
import {getToken, withToken} from './../authenticate';
import {Redirect} from "react-router-dom";
import {API} from './../config/config';


import {
    CustomPaging,
    DataTypeProvider,
    EditingState,
    PagingState,
    RowDetailState,
    SortingState,
} from '@devexpress/dx-react-grid';
import {
    Grid,
    PagingPanel,
    Table,
    TableEditColumn,
    TableEditRow,
    TableHeaderRow,
    TableRowDetail,
} from '@devexpress/dx-react-grid-material-ui';
import CircularProgress from '@material-ui/core/CircularProgress';
import {IconButton} from "@material-ui/core";


const URL = `${API}/videos`;

const RowDetail = ({ row }) => (
  <pre style={{ fontSize: 14 }}>
    {row.description}
  </pre>
);

function dateFormatter({ value }){
    if (value) {
        return value.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).+/, '$3.$2.$1 $4:$5:$6');
    } else {
        return '';
    }
}

const DateTypeProvider = props => (
  <DataTypeProvider
      formatterComponent={dateFormatter}
      {...props}
  />
);

const BoolFormatter = ({ value }) => (
     <Checkbox
        checked={Boolean(value)}
        disabled={true}
    />
);

const BoolTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={BoolFormatter}
        {...props}
    />
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
                {name: 'deleted', title: 'Is deleted'},
                {name: 'deleted_at', title: 'Deletion date'},
                {name: 'thumbnail', title: 'Thumbnail'},
                {name: 'alternative', title: 'Alternative'},
            ],
            dateColumns: [
                'published_at',
                'deleted_at',
            ],
            boolColumns: ['deleted'],
            tableColumnExtensions: [
                {columnName: 'id', align: 'right', width: 100},
                {columnName: 'video_id', width: 150},
                {columnName: 'title', width: 700},
                {columnName: 'deleted', width: 100},
            ],

            editableColumnExtensions: [
                {columnName: 'alternative', editingEnabled: true},
            ],
            rows: [],
            editingRowIds: [],
            rowChanges: {},
            sorting: [{ columnName: 'id', direction: 'asc'}],
            totalCount: 0,
            pageSize: 10,
            pageSizes: [10, 25, 50, 100, 250, 500],
            currentPage: 0,
            loading: true,
            redirectToLogin: false,
        };



        this.changeSorting = this.changeSorting.bind(this);
        this.changeCurrentPage = this.changeCurrentPage.bind(this);
        this.changePageSize = this.changePageSize.bind(this);
        this.commitChanges = this.commitChanges.bind(this);
        this.changeEditingRowIds = editingRowIds => this.setState({ editingRowIds });
        this.changeRowChanges = rowChanges => this.setState({ rowChanges });

    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate() {
        this.loadData();
    }

    changeSorting(sorting) {
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

    queryString() {
        const { sorting, pageSize, currentPage } = this.state;
        let queryString = `${URL}?limit=${pageSize}&offset=${currentPage*pageSize}`;

        const columnSorting = sorting[0];
        if (columnSorting) {
            const sortingDirection = columnSorting.direction === 'desc' ? ' desc' : ' asc';
            queryString = `${queryString}&sort=${columnSorting.columnName}${sortingDirection}`;
        }

        return queryString;
    }



    loadData() {
        const queryString = this.queryString();
        if (queryString === this.lastQuery) {
            this.setState({loading: false});
            return;
        }

        let totalCount = this.state.totalCount;
        const token = getToken();
        if (totalCount <= 0) {
            withToken(`${URL}/count`, token)
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
        dateColumns,
        boolColumns,
        rowChanges,
        editingRowIds,
        editableColumnExtensions,
        tableColumnExtensions,
        sorting,
        pageSize,
        pageSizes,
        currentPage,
        totalCount,
        loading,
        redirectToLogin,
    } = this.state;

    if (redirectToLogin) return <Redirect to='/login'/>;

    return (
        <Paper style={{ position: 'relative' }}>
            <Grid
              rows={rows}
              columns={columns}
              getRowId={getRowId}
            >
                <DateTypeProvider
                    for={dateColumns}
                />
                <BoolTypeProvider
                    for={boolColumns}
                />
                <SortingState
                sorting={sorting}
                onSortingChange={this.changeSorting}
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
                <Table
                    columnExtensions={tableColumnExtensions}
                />
                <TableHeaderRow showSortingControls />
                <TableEditRow
                    cellComponent={EditCell}
                />
                <TableEditColumn
                    width={100}
                    showEditCommand
                    commandComponent={Command}
                />
                <PagingPanel
                    pageSizes={pageSizes}
                />
                <RowDetailState
                />
                <TableRowDetail
                    contentComponent={RowDetail}
                />
            </Grid>
            {loading && <CircularProgress/>}
        </Paper>
    );
  }

}

export default withRoot(VideoGrid);
