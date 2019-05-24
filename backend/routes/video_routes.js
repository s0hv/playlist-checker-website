const { getVideos, videoCount } = require('../helpers/db');

module.exports = function (app) {
    app.get('/videos', (req, res) => {
        let limit = req.query.limit || 500;
        let offset = parseInt(req.query.offset) || 0;
        let sort = (req.query.sort || 'id ASC').split(' ');

        let sortCol = sort[0];
        getVideos(sortCol, sort[1], limit, offset)
            .then(rows => res.json(rows))
            .catch(err => res.status(500).json({error: 'Internal server error'}));
    });

    app.get('/videos/count', (req, res) => {
        videoCount()
            .then(rows => res.json(rows.rows[0]))
            .catch(err => {
                console.log(err);
                res.status(500).send('Internal server error');
            })
    });
};
