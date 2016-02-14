'use strict';

const path = require('path'),
      url = require('url');

const express = require('express'),
      passport = require('passport');

const KeycloakStrategy = require('../../src');

const userStore = {};

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, userStore[id]));

const app = express();
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');
// app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

const keycloak = new KeycloakStrategy({
    serverURL: 'https://localhost:9999',
    realm: 'test-realm',
    clientID: 'test-client',
    clientSecret: '00000000-0000-0000-0000-000000000000',
    callbackURL: '/auth/callback',
    passReqToCallback: true,
    proxy: true,
}, (req, accessToken, refreshToken, profile, done) => {
    const user = Object.assign({}, profile);
    userStore[user.id] = user;
    done(null, user);
});

passport.use(keycloak);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
        return;
    }

    req.session.returnTo = req.originalUrl;
    res.redirect('/auth');
}

app.get('/', function (req, res) {
    const title = 'Simple keycloak-passport';
    if (!req.isAuthenticated()) {
        res.render('index-noauth', { title });
    } else {
        res.render('index', {
            title,
            user: req.user,
        });
    }
});

app.get('/secret', ensureAuthenticated, function (req, res) {
    res.render('secret');
});

app.get('/auth', passport.authenticate('keycloak'));
app.get('/auth/callback',
        passport.authenticate('keycloak'),
        function (req, res) {
            const returnTo = req.session.returnTo;
            delete req.session.returnTo;
            res.redirect(returnTo || '/');
        });

app.post('/auth/logout', function (req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/');
        return;
    }

    let redirectURL;
    switch (req.body.logout) {
    case 'global':
        redirectURL = keycloak.logoutURL('/', { req });
        req.logout();
        break;
    case 'app':
        redirectURL = '/';
        req.logout();
        break;
    default:
        redirectURL = '/';
        console.error(`Unsupported logout style: ${req.body.logout}`);
        break;
    }
    res.redirect(redirectURL);
});

const server = app.listen(3000, () => {
    const addr = `${server.address().address}:${server.address().port}`;
    console.log(`listening at ${addr}`);
});
