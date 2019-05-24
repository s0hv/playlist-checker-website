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

function getVideos(sortCol, sortDirection, limit, offset) {
    // We don't want to sort by description since it's not indexed
    sortCol = sortCol.toLowerCase() === 'description' ? 'id' : sortCol;
    limit = Math.min(limit, 500);
    let isAsc = (sortDirection || 'ASC').toUpperCase() === 'ASC';

    const sql = format(`SELECT * FROM videos ORDER BY %I ${isAsc ? 'ASC' : 'DESC'} LIMIT $1 OFFSET $2`, sortCol);
    console.log(sql);
    return pool.query(sql, [limit, offset])
}

function videoCount() {
    return pool.query('SELECT COUNT(id) FROM videos');
}

module.exports = { getVideos, videoCount };