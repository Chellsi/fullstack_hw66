import { Strategy as BaseStrategy } from 'passport';

export class Strategy extends BaseStrategy {
  constructor(options = {}, verify) {
    super();

    if (typeof options === 'function') {
      verify = options;
      options = {};
    }

    if (!verify) {
      throw new Error('LocalStrategy requires a verify callback');
    }

    this.name = 'local';
    this._verify = verify;
    this._usernameField = options.usernameField || 'username';
    this._passwordField = options.passwordField || 'password';
    this._passReqToCallback = options.passReqToCallback || false;
  }

  authenticate(req, options = {}) {
    const body = req.body || {};
    const query = req.query || {};

    const username = body[this._usernameField] ?? query[this._usernameField];
    const password = body[this._passwordField] ?? query[this._passwordField];

    if (!username || !password) {
      const message = options.badRequestMessage || 'Missing credentials';
      return this.fail({ message });
    }

    const done = (err, user, info) => {
      if (err) {
        return this.error(err);
      }

      if (!user) {
        return this.fail(info);
      }

      this.success(user, info);
    };

    try {
      if (this._passReqToCallback) {
        const result = this._verify(req, username, password, done);
        if (result && typeof result.then === 'function') {
          result.catch((err) => this.error(err));
        }
      } else {
        const result = this._verify(username, password, done);
        if (result && typeof result.then === 'function') {
          result.catch((err) => this.error(err));
        }
      }
    } catch (err) {
      this.error(err);
    }
  }
}

export default Strategy;
