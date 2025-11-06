import Strategy from './strategy.js';

class Passport {
  constructor() {
    this._strategies = new Map();
    this._serializeUser = null;
    this._deserializeUser = null;
  }

  use(name, strategy) {
    if (!strategy) {
      strategy = name;
      name = strategy.name;
    }

    if (!name) {
      throw new Error('passport.use: strategy must have a name');
    }

    this._strategies.set(name, strategy);
    return this;
  }

  serializeUser(fn) {
    this._serializeUser = fn;
  }

  deserializeUser(fn) {
    this._deserializeUser = fn;
  }

  initialize() {
    const self = this;

    return function initializeMiddleware(req, res, next) {
      req._passport = { instance: self };

      req.login = req.logIn = function logIn(user, options, cb) {
        let callback = cb;
        let opts = options;

        if (typeof opts === 'function') {
          callback = opts;
          opts = {};
        }

        if (!self._serializeUser) {
          throw new Error('passport.serializeUser must be called to set up serialization');
        }

        self._serializeUser(user, (err, obj) => {
          if (err) {
            return callback ? callback(err) : next(err);
          }

          if (!req.session) {
            throw new Error('passport.initialize() middleware requires session support');
          }

          req.session.passport = req.session.passport || {};
          req.session.passport.user = obj;
          req.user = user;

          if (callback) {
            callback();
          }
        });
      };

      req.logout = req.logOut = function logOut(options, cb) {
        let callback = cb;
        if (typeof options === 'function') {
          callback = options;
        }

        if (req.session && req.session.passport) {
          delete req.session.passport;
        }

        req.user = undefined;

        if (callback) {
          callback();
        }
      };

      req.isAuthenticated = function isAuthenticated() {
        return !!req.user;
      };

      req.isUnauthenticated = function isUnauthenticated() {
        return !req.isAuthenticated();
      };

      next();
    };
  }

  session() {
    const self = this;

    return function sessionMiddleware(req, res, next) {
      if (!req.session) {
        return next(new Error('passport.session() requires session middleware'));
      }

      const passportSession = req.session.passport;

      if (passportSession && passportSession.user != null) {
        if (!self._deserializeUser) {
          return next(new Error('passport.deserializeUser must be configured'));
        }

        self._deserializeUser(passportSession.user, (err, user) => {
          if (err) {
            return next(err);
          }

          if (!user) {
            delete req.session.passport;
          } else {
            req.user = user;
          }

          next();
        });
      } else {
        next();
      }
    };
  }

  authenticate(name, options = {}, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    const strategy = this._strategies.get(name);

    if (!strategy) {
      throw new Error(`Unknown authentication strategy "${name}"`);
    }

    const self = this;

    return function authenticateMiddleware(req, res, next) {
      function verified(err, user, info) {
        if (callback) {
          return callback(err, user, info);
        }

        if (err) {
          return next(err);
        }

        if (!user) {
          const message = info && info.message ? info.message : 'Unauthorized';

          if (options.failureRedirect) {
            return res.redirect(options.failureRedirect);
          }

          const status = options.failureStatus || 401;
          return res.status(status).json({ success: false, message });
        }

        req.login(user, options, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }

          if (options.successRedirect) {
            return res.redirect(options.successRedirect);
          }

          return next();
        });
      }

      strategy._verifyCallback = verified;

      try {
        strategy.authenticate(req, options);
      } catch (err) {
        verified(err);
      }
    };
  }
}

const passport = new Passport();

export { Passport, Strategy };
export default passport;
