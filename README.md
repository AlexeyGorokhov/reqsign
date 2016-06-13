# reqsign

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

HTTP request signing

This is a simplified and opinionated HTTP request signing scheme for use in communication between HTTP APIs.

The module provides both the server middleware and client functionality.

## Installation

```bash
$ npm install reqsign --save
```

## Usage

### Server-side

```js
const app = require('express')();
const bodyParser = require('body-parser-of-your-choice');
const reqsign = require('reqsign');

const reqsignOptions = {
  clockSkew: 300,
  keyRetriever (login) {...},
  replayAttackDefender (login, signature) {...}
};

// Mount the middleware
app.use(bodyParser());
app.use(reqsign.server(reqsignOptions));

// Use it
app.get('/some_path', (req, res) => {
  const isRequestAuthenticated = req.user.isAuthenticated;
  const userLogin = req.user.login;
  // etc
});
```

### Client-side

```js
const reqsign = require('reqsign');

const reqsignOptions = {
  login: 'my_service_login',
  key: 'secret'
};

const req = reqsign.client(reqsignOptions);

const data = {
  prop1: 'value1',
  prop2: 'value2'
};

req.post('url', data)
.then((resStatus, resBody) => {
  // Make use of resStatus and resBody
})
.catch(err => {
  // Process the err gracefully
});
```

## Scheme Description

### Build String To Sign

The client has to build the `StringToSign` following the following pattern:

`StringToSign = <TimeStamp> + "\n" + <ContentString>`

`<TimeStamp>` is the current system time UNIX timestamp of the client machine including milliseconds (e.g., 1465564560647).

`<ContentString>` is a string formed depending of the request type.

If the request contains any payload (Content-Length HTTP header is present and its value is greater than 0), `ContentString = MD5(<PayloadRawString>)`.

If the request contains no payload (Content-Length HTTP header is not present or its value is 0), the `ContentString` is formed using the following algorithm:

* All URL query parameters are sorted in alphabetical order ascending.

```
ContentString =
  URI-ENCODE(<QueryParameter1>) + "=" + URI-ENCODE(<value>) + "&" +
  URI-ENCODE(<QueryParameter2>) + "=" + URI-ENCODE(<value>) + "&" +
  ...
  URI-ENCODE(<QueryParameterN>) + "=" + URI-ENCODE(<value>)
```

### Sign the StringToSign

`Signature = HMAC-SHA256(<StringToSign>, <key>)`

`<key>` is a secret key shared between the client and the server.

### Send Authorization header

The client sends the `Authorization` HTTP header with the request:

`Authorization: Signature login={String} signature={String}`

## Server-side middleware

### Options

The options object:

```json
{
  "clockSkew": "{Integer}",
  "keyRetriever": "{Function}",
  "replayAttackDefender": "{Function}"
}
```

#### `{Integer} clockSkew`

A clock skew value in seconds that compensate possible differences between the server and client machines system time. The clock skew is applied in both directions (e.g., clockSkew = 300s means 300s in the past AND 300s to the future).

It is not feasible to set this parameter to 0 or a very small value as in this case all requests will be treated as expired. Hence, the default value is `300`, and the minimum value is `60`.

#### `{Function} keyRetriever (login)`

A function that retrieves the secret key for the given `login` value that the client uses to sign requests. Mechanism of storing the login-key pairs is out of scope for `reqsign`.

Parameters:
* `{String} login` - The login value sent by the client in `Authorization` HTTP header.

Returns `{Promise} resolve(key), reject(err)`:
* `{String | null} key` - The key associated with the `login` to be used to verify the signature;
* `{Error} err` - An error object. Note that absence of a `key` for given `login` is not an error condition - in this situation the promise has to resolve with the `null` value.

#### `{Function} replayAttackDefender (login, signature)`

OPTIONAL. A function that might be used to protect the server against the Replay Attack. The implementation of protection (what the function does) is out of scope for `reqsign`.

Parameters:
* `{String} login` - Login value derived from the Authorization header;
* `{String} signature` - Signature value derived from the Authorization header.

Returns: `{Promise} resolve(isOk) reject(err)`:
* `{Boolean} isOk` - `true` if the request is not replayed; otherwise - `false`;
* `{Error} err` - An error object.

### API

`reqsign` middleware extends the `req` object with `user` property and passes the request down the middleware pipe.

* `{Boolean} req.user.isAuthenticated`

* `{String} req.user.login`

* `{String | null} req.user.errorCode` - Error code as follows:
  * `WRONG_REQUEST` - The request received does not comply with the scheme (e.g., wrong format of the Authorization header, or its absence etc).
  * `NO_KEY` - A key to verify the signature.
  * `WRONG_SIGNATURE` - Signature verification failed.
  * `REPLAYED` - The request is replayed.
