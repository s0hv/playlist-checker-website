const { getVideos, videoCount, editRow } = require('../helpers/db');


function parseWhere(whereArgs) {
    const whereList = [];

    if (whereArgs instanceof Object) {
        Object.keys(whereArgs).forEach(function (column) {
            if (typeof whereArgs[column] !== 'string') return;

            const data = whereArgs[column].split(' ');
            let comp = data[0].toUpperCase();
            if (comp === 'NOT') {
                comp = `${comp} ${data.shift()}`;
            }

            whereList.push({
                comparator: comp,
                value: data.slice(1).join(' '),
                column: column
            })
        });
    }

    return whereList
}

module.exports = function (app) {
    /*
    Whereclause needs to have the comparison operator and value separated by space
    eg `= b` or `LIKE abc`
     */
    app.get('/', (req, res) => {
        let limit = req.query.limit || 500;
        let offset = parseInt(req.query.offset) || 0;
        let sort = (req.query.sort || 'id ASC').split(' ');

        let sortCol = sort[0];
        const whereList = parseWhere(req.query.where);
        const selectedColumns = req.query.select;

        if (!Array.isArray(selectedColumns)) return res.status(400).json({error: 'Invalid request. Selection missing'});

        getVideos(sortCol, sort[1], limit, offset, whereList, selectedColumns)
            .then(rows => res.json(rows))
            .catch(err => {
                console.log(err);
                res.status(500).json({error: 'Internal server error'})
            });
    });

    app.get('/count', (req, res) => {
        videoCount(parseWhere(req.query.where))
            .then(rows => res.json(rows.rows[0]))
            .catch(err => {
                console.log(err);
                res.status(500).json({error: 'Internal server error'});
            })
    });

    app.patch('/', (req, res) => {
        const body = req.body;
        const videoId = body.id;
        if (videoId === undefined) return res.json({error: 'No video id given'});

        const columns = body.columns;
        if (columns.length === 0) return res.json({warning: 'No editable columns given'});

        editRow(videoId, columns)
            .then(rows => res.json({rowCount: rows.rowCount}))
            .catch(err => {
                console.log(err);
                res.status(500).json({error: 'Internal server error'})
            });
    })
};
