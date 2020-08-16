const cors = require("cors");
const express = require('express');
const exjwt = require('express-jwt');
const config = require('./server_config.json');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const privateKey = fs.readFileSync('sslcert/server.key');
const certificate = fs.readFileSync('sslcert/server.crt');

const credentials = {key: privateKey, cert: certificate};

const SECRET = config.secret;
if (!SECRET) throw new Error('No secret provided');
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/api/*', exjwt({
  secret: SECRET,
  getToken: function fromHeaderOrQuerystring (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }}).unless({path: ['/discord/callback']})
);

// Error handling authorization error
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send(err);
    }
    else {
        next(err);
    }
});

app.use('/', express.static(path.join(__dirname, '..', 'build')))

const port = config.server_port;

const videoRouter = express.Router();
require('./routes')(videoRouter);
app.use('/api/videos', videoRouter);

const discord = require('./routes/discord');
discord(app);

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, '0.0.0.0', () => {
  console.log('We are live on ' + port);
});
