var cors = require("cors");
const express = require('express');
const exjwt = require('express-jwt');
const config = require('./server_config.json');

const SECRET = config.secret;
if (!SECRET) throw new Error('No secret provided');
const app = express();

app.use(cors());
app.use(exjwt({
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

const port = config.server_port;

require('./routes')(app);
app.listen(port, () => {
  console.log('We are live on ' + port);
});