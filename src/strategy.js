'use strict';
// module: strategy

const url = require('url'),
      util = require('util');

const OAuth2Strategy = require('passport-oauth2'),
      request = require('request');

const resolveURL = require('./utils').resolveURL;

// FIXME: Add documentation.
function Strategy(options, verify) {
    if (!options.serverURL) {
        throw new TypeError('KeycloakStrategy requires a serverURL option');
    }
    if (!options.realm) {
        throw new TypeError('KeycloakStrategy requires a realm option');
    }

    const realmURL = options.serverURL + '/auth/realms/' + options.realm;
    this.options = Object.assign({}, options, {
        realmURL,
        authorizationURL: realmURL + '/tokens/login',
        tokenURL: realmURL + '/tokens/access/codes',
        userInfoURL: realmURL + '/account',
    });

    this._base = Object.getPrototypeOf(Strategy.prototype);
    this._base.constructor.call(this, this.options, verify);

    this.name = 'keycloak';
}

// Keycloak is an OAuth2 provider.
util.inherits(Strategy, OAuth2Strategy);

// FIXME: Add documentation.
Strategy.prototype.userProfile = function (accessToken, done) {
    const options = {
        url: this.options.userInfoURL,
        headers: {
            'Authorization': this._oauth2.buildAuthHeader(accessToken),
            'Accept': 'application/json',
        },
    };

    request(options, function (err, resp, body) {
        if (err) {
            done(err);
            return;
        }

        try {
            done(null, JSON.parse(body));
        } catch (e) {
            done(e);
        }
    });
};

// FIXME: Add documentation.
Strategy.prototype.logoutURL = function (redirectURL, options) {
    options = options || {};

    redirectURL = resolveURL(redirectURL, options.req, this.options);

    const urlObj = url.parse(this.options.realmURL, true);
    urlObj.pathname += '/tokens/logout';
    urlObj.query = { redirect_uri: redirectURL };

    return url.format(urlObj);
};

module.exports = Strategy;
