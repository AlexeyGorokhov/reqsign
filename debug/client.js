'use strict';

const reqsign = require('../');

const options = {
  login: 'my_login',
  key: 'my_password'
};

const req = reqsign.client(options);

const data = {
  param1: 'value 1',
  param2: 123,
  aprop: true
};

req.post('http://localhost:7000', data)
.then(resData => console.dir(resData))
.catch(err => console.error(err));
