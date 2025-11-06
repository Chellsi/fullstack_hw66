export default class Strategy {
  constructor() {
    this.name = 'strategy';
  }

  success(user, info) {
    if (this._verifyCallback) {
      this._verifyCallback(null, user, info);
    }
  }

  fail(info) {
    if (this._verifyCallback) {
      this._verifyCallback(null, false, info);
    }
  }

  error(err) {
    if (this._verifyCallback) {
      this._verifyCallback(err);
    }
  }

  authenticate() {
    throw new Error('Strategy#authenticate must be overridden');
  }
}
