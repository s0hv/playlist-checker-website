const videoRoutes = require('./video_routes');

module.exports = function(app) {
  videoRoutes(app);
};