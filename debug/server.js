'use strict';

const http = require('http');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const reqsign = require('../index.js');

const options = {
  clockSkew: 500,
  keyRetriever () {},
  replayAttackDefender () {}
};
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(reqsign.server(options));
app.set('port', 7000);

app.get('/', (req, res, next) => {
  res.status(200).send('Hello');
});

const server = http.createServer(app);
server.listen(7000);
