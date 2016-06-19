'use strict';

const http = require('http');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const reqsign = require('../index.js');

const options = {
  clockSkew: 500,
  keyRetriever: keyRetriever,
  replayAttackDefender: replayAttackDefender
};
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(reqsign.server(options));
app.set('port', 7000);

app.get('/', (req, res, next) => {
  console.dir(req.user);
  res.status(200).json({ message: 'Hello!' });
});

app.post('/', (req, res, next) => {
  console.dir(req.user);
  res.status(200).json({ message: 'Hello!' });
});

const server = http.createServer(app);
server.listen(7000);

function keyRetriever (login) {
  return new Promise((resolve, reject) => {
    resolve('my_password');
  });
}

function replayAttackDefender (login, signature) {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}
