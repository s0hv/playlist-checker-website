const fetch = require('node-fetch');
const queryString = require('query-string');
const jwt = require('jsonwebtoken');

const SECRET = require('../server_config').secret;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SCOPE = 'identify email';
const REDIRECT_URI = encodeURIComponent(require('../../src/config/config').REDIRECT_URI);
const identifyUser = 'https://discordapp.com/api/v6/users/@me';


function identify(token) {
    return fetch(identifyUser,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
}


module.exports = function (app) {
    app.get('/discord/callback', (req, res) => {
        if (!req.query.code) {
            res.status(401).json({status: 'ERROR', error: 'code not provided'});
            return;
        }

        const code = req.query.code;
        const data = {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            scope: SCOPE,
        };
        const params = queryString.stringify(data);
        fetch(`https://discordapp.com/api/oauth2/token`,
            {
                method: 'POST',
                body: `${params}&redirect_uri=${REDIRECT_URI}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })
            .then(resp => resp.json())
            .then(json => {
                identify(json.access_token)
                    .then(resp => resp.json())

                    .then(user => {
                        if (user.id !== '123050803752730624') {
                            res.status(403).json({
                                success: false,
                                token: null,
                                expires_in: null,
                                error: 'Unauthorized user',
                            })
                        } else {
                            let token = jwt.sign({discord_token: json.access_token}, SECRET, { expiresIn: json.expires_in * 100});
                            res.json({
                                success: true,
                                token: token,
                                error: null,
                                expires_in: json.expires_in,
                            })
                        }
                    })

                    .catch(e =>{
                        res.status(400).json({
                            status: 'ERROR',
                            success: false,
                            error: e.message,
                        })
                    })
            })

            .catch(err => {
                switch (err.message) {

                    case 'NoCodeProvided':
                        return res.status(400).json({
                            status: 'ERROR',
                            success: false,
                            error: err.message,
                        });

                    default:
                        return res.status(500).json({
                            status: 'ERROR',
                            success: false,
                            error: err.message,
                        });
                }
            });
    });
};