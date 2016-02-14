'use strict';
// module: password-keycloak

const oauth2 = require('passport-oauth2');

const Strategy = require('./strategy');

// Directly export the Keycloak Strategy.
module.exports = Strategy;

// And also export as `Strategy`.
module.exports.Strategy = Strategy;

// Pass through OAuth2 error types.
module.exports.AuthorizationError = oauth2.AuthorizationError;
module.exports.TokenError = oauth2.TokenError;
module.exports.InternalOAuthError = oauth2.InternalOAuthError;
