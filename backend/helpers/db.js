const { Pool } = require('pg');
const format = require('pg-format');
const config = require('../server_config.json');

const pool = new Pool({
    host: config.db_host,
    user: config.db_user,
    database: config.db_name,
    port: config.db_port,
    max: 5,
    password: config.db_pass,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Set consisting of all normal equality comparison operators
const EQUAL_OPS = new Set(['=', '>', '<', '<=', '>=', '!=']);
const STRING_OPS = new Set(['LIKE', 'ILIKE', '=']);
const EQUAL = new Set(['=']);

const COLUMN_COMPARATORS = {
    id: EQUAL_OPS,
    video_id: EQUAL,
    title: STRING_OPS,
    description: STRING_OPS,
    published_at: EQUAL_OPS,
    deleted: EQUAL,
    deleted_at: EQUAL_OPS,
    tag: EQUAL,
    name: EQUAL,
    playlist_id: EQUAL,
};


const TABLE_COLUMNS = {
    videos: [
        'id',
        'video_id',
        'title',
        'description',
        'published_at',
        'deleted',
        'deleted_at',
        'site',
        'alternative',
        'thumbnail',
        'download_type',
        'downloaded_filename',
        'downloaded_format',
    ],

    tags: ['tag'],

    playlists: ['name', 'playlist_id'],
};

// Columns that need to be in the having clause when filtered
const HAVING_COLUMNS = ['tag', 'name', 'playlist_id'];

// Flips TABLE_COLUMNS so you can search for table name based on column
const COLUMN_TABLES = {};
Object.keys(TABLE_COLUMNS).forEach(table => {
    TABLE_COLUMNS[table].forEach(column => COLUMN_TABLES[column] = table);
});

// Contains all columns that can be edited using this api
const EDITABLE_COLUMNS = ['alternative', 'download_type'];


// Comparison templates
const normal_comp = ( {comp, param} ) => `${comp} $${param} `;
const date_comp = ( {comp, param} ) => `${comp} $${param}::date `;
const arr_comp = ( {comp, table } ) => `%L${comp}ANY(ARRAY_AGG(${table}.%I))`;

// Templates for creating where clauses from columns
const COLUMN_TEMPLATES = {
    id: normal_comp,
    video_id: normal_comp,
    title: normal_comp,
    description: normal_comp,
    published_at: date_comp,
    deleted: normal_comp,
    deleted_at: date_comp,
    tag: normal_comp,
    playlist_id: normal_comp,
    name: normal_comp,
};

const prepare_date = ( col ) => `date_trunc('day', ${col})`;
const PREPARE_COLUMN = {
    published_at: prepare_date,
    deleted_at: prepare_date,
};

// Templates for creating having clauses from columns
const HAVING_TEMPLATES = {
    tag: arr_comp,
    playlist_id: arr_comp,
    name: arr_comp,
};

// Columns that can be selected
const SELECTABLE_COLUMNS = {
    id: 'videos.id',
    video_id: 'videos.video_id',
    title: 'videos.title',
    published_at: "to_char(videos.published_at, 'DD.MM.YYYY HH24:mm:SS') as published_at",
    thumbnail: 'videos.thumbnail',
    deleted: 'videos.deleted',
    deleted_at: "to_char(videos.deleted_at, 'DD.MM.YYYY HH24:mm:SS') as deleted_at",
    download_type: 'videos.download_type',
    downloaded_format: 'videos.downloaded_format',
    alternative: 'videos.alternative',
    tag: "string_agg(tags.tag, ', ') as tag",
    name: "string_agg(DISTINCT playlists.name, ', ') as name",
    playlist_id: "string_agg(DISTINCT playlists.playlist_id, ', ') as playlist_id"
};

function checkColumnName(column) {
    return COLUMN_TABLES[column] !== undefined;
}

function parseWhere(whereInfo, arglen=0, useHaving=true) {
    if (!whereInfo) return {where: [], args: []};
    let i = arglen+1;
    let where = [];
    let having = [];
    const whereCols = [];
    const havingCols = [];
    const args = [];

    whereInfo.forEach(function ({ column, comparator, value }) {
        if (!COLUMN_COMPARATORS[column]) return;
        if (!COLUMN_COMPARATORS[column].has(comparator)) return;

        // Check if column should be in having clause or where clause
        if (useHaving && HAVING_COLUMNS.indexOf(column) >= 0) {
            // Format string ready for comparison using an aggregator
            let s = HAVING_TEMPLATES[column]({comp: comparator, table: COLUMN_TABLES[column]});
            havingCols.push(value, column);
            having.push(s);
        } else {
            args.push(value);
            // Format string ready for comparison
            let s = COLUMN_TEMPLATES[column]({comp: comparator, param: i});

            const prepare = PREPARE_COLUMN[column];
            if (prepare) {
                const c = `${COLUMN_TABLES[column]}.%I`;
                s = `${prepare(c)} ${s}`;
            } else {
                s = `${COLUMN_TABLES[column]}.%I ${s}`;
            }

            whereCols.push(column);
            where.push(s);
            i++;
        }

    });

    // Construct whereclause
    let whereClause = '';
    if (whereCols.length > 0) {
        whereClause = 'WHERE ' + format(where.join('AND '), ...whereCols);
    }

    // Construct having clause
    let havingClause = '';
    if (havingCols.length > 0) {
        havingClause = 'HAVING ' + format(having.join(' AND '), ...havingCols)
    }

    return {where: whereClause, args: args, having: havingClause, cols: [...whereCols, ...havingCols]};
}

function parseSort(sortInfo) {
    const sortCols = [];
    const sort = [];

    sortInfo.forEach(({ column, direction }) => {
        if (TABLE_COLUMNS.videos.indexOf(column) < 0) return;

        direction = direction.toUpperCase();
        if (direction !== 'ASC' && direction !== 'DESC') return;

        sortCols.push(column);
        sort.push(`videos.%I ${direction}`)
    });

    return {sort: sort.join(','), sortCols: sortCols};
}

function getVideos(sortInfo, limit, offset, whereInfo, selectedColumns) {
    limit = Math.min(limit, 500);
    const args = [limit, offset];
    console.log(whereInfo);

    const res = parseWhere(whereInfo, args.length);
    console.log(res);
    const where = res.where;
    const having = res.having;
    const cols = res.cols;
    args.push(...res.args);

    // Only select the requested columns for decent speedups when it
    // reduces the amount of joins done
    const selection = [];

    // Add columns used in whereclause to the columns we need to select
    selectedColumns.push(...cols);
    selectedColumns = new Set(selectedColumns);
    selectedColumns.forEach(col => {
       if (!(col in SELECTABLE_COLUMNS)) return;

       selection.push(SELECTABLE_COLUMNS[col])
    });
    const select = selection.join(', ');

    // Check required joins and grouping based on selected columns
    const joins = [];
    const groupings = [];
    if (selectedColumns.has('playlist_id') || selectedColumns.has('name')) {
        joins.push('LEFT JOIN playlistvideos pv ON pv.video_id=videos.id LEFT JOIN playlists ON pv.playlist_id=playlists.id');
        groupings.push('pv.video_id');
    }
    if (selectedColumns.has('tag')) {
        joins.push('LEFT JOIN videotags vt ON vt.video_id=videos.id LEFT JOIN tags ON vt.tag_id=tags.id ');
        groupings.push('vt.video_id');
    }
    const join = joins.join(' ');
    groupings.push('videos.id');
    const groupBy = groupings.join(',');

    const { sort, sortCols } = parseSort(sortInfo);

    const sql = format(
        `SELECT videos.description, ${select}
              FROM videos 
              ${join}
              ${where} GROUP BY (${groupBy}) ${having} ${sort ? 'ORDER BY ' + sort : ''} LIMIT $1 OFFSET $2`, ...sortCols);


    console.log(sql, args);
    return pool.query(sql, args);
}

function videoCount(whereInfo) {
    const {where, args, cols} = parseWhere(whereInfo, 0, false);

    /*
     We need to treat count requests with tag as a wherearg differently
     because we need to join the table in order to check it. We want to
     omit the join if possible for performance so we do the check here
      */
    const joins = [];
    if (cols.indexOf('tag') >= 0) {
        joins.push('LEFT JOIN videotags vt ON vt.video_id = videos.id LEFT JOIN tags ON vt.tag_id = tags.id ')
    }

    if (cols.indexOf('name') >= 0|| cols.indexOf('playlist_id') >= 0) {
        joins.push('LEFT JOIN playlistvideos pv ON videos.id = pv.video_id LEFT JOIN playlists ON pv.playlist_id = playlists.id')
    }

    if (cols.indexOf('tag') >= 0 || cols.indexOf('name') >= 0 || cols.indexOf('playlist_id') >= 0) {
        return pool.query(`SELECT COUNT(DISTINCT (videos.id))
                           FROM videos ${joins.join(' ')} ${where}`, args);

    } else {
        return pool.query(`SELECT COUNT(*) FROM videos ${where}`, args);
    }
}

function editRow(videoId, keyValues) {
    const values = [];        // Values of the edited columns
    const columns = [];       // Names of all of the columns to be edited
    const columnClause = [];  // Column text to be formatted with columns
    let i = 1;

    keyValues.forEach(function ({ column, value }) {
        // Filter away all rows that aren't whitelisted
        if (EDITABLE_COLUMNS.indexOf(column) < 0) return;

        values.push(value);
        columns.push(column);
        columnClause.push(`%I=$${i}`);
        i++;
    });

    // Just return if no valid columns were given
    if (values.length === 0) return {error: 'No valid columns given'};

    // Formatted for a parameterized query
    let a = columnClause.join(', ');

    // Sanitize column names and add video id to the value list after that
    const sql = format(`UPDATE videos SET ${a} WHERE id=$${i}`, columns);
    values.push(videoId);
    console.log(sql, columns);

    return pool.query(sql, values);
}

module.exports = { getVideos, videoCount, editRow, TABLE_COLUMNS };