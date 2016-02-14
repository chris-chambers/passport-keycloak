'use strict';
// module: utils

const url = require('url');

// FIXME: Add documentation.
function resolveURL(urlStr, req, options) {
    if (!req) {
        return urlStr;
    }

    const urlObj = url.parse(urlStr);
    if (urlObj.host) {
        return urlStr;
    }

    options = options || {};
    const app = req.app;
    if (app && app.get && app.get('trust proxy')) {
        options.proxy = true;
    }
    const trustProxy = options.proxy;

    const proto = (req.headers['x-forwarded-proto'] || '').toLowerCase(),
          tls = req.connection.encrypted || (
              trustProxy && 'https' == proto.split(/\s*,\s*/)[0]),
          protocol = tls ? 'https' : 'http',
          host = (trustProxy && req.headers['x-forwarded-host']) || req.headers.host;

    return url.format(Object.assign(urlObj, {
        protocol,
        host,
    }));
};

module.exports = { resolveURL };
