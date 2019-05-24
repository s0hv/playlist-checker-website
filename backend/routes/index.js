const videoRoutes = require('./video_routes');
const discord = require('./discord');

module.exports = function(app, pool) {
  videoRoutes(app, pool);
  discord(app);
};