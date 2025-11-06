import { randomBytes } from 'crypto';

function createCookieOptions(options = {}) {
  const defaults = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: undefined
  };

  return { ...defaults, ...options };
}

function ensureCallback(cb) {
  return typeof cb === 'function' ? cb : () => {};
}

export default function session(options = {}) {
  const {
    secret,
    name = 'connect.sid',
    cookie: cookieOptions = {},
    resave = false,
    saveUninitialized = false
  } = options;

  if (!secret) {
    throw new Error('express-session: "secret" option is required');
  }

  const memoryStore = new Map();
  const cookieConfig = createCookieOptions(cookieOptions);

  return function sessionMiddleware(req, res, next) {
    if (!req.cookies) {
      throw new Error('express-session: cookie-parser middleware must be used before sessions');
    }

    let sid = req.cookies[name];
    let isNewSession = false;

    if (!sid || !memoryStore.has(sid)) {
      sid = randomBytes(16).toString('hex');
      memoryStore.set(sid, {});
      isNewSession = true;
    }

    let sessionData = memoryStore.get(sid) || {};

    function setCookie() {
      res.cookie(name, sid, cookieConfig);
    }

    if (isNewSession || saveUninitialized) {
      setCookie();
    }

    Object.defineProperty(req, 'sessionID', {
      value: sid,
      enumerable: true
    });

    req.session = sessionData;

    req.session.regenerate = function regenerate(cb) {
      const callback = ensureCallback(cb);
      const newSid = randomBytes(16).toString('hex');
      memoryStore.set(newSid, {});
      sid = newSid;
      sessionData = memoryStore.get(sid);
      req.session = sessionData;
      res.cookie(name, sid, cookieConfig);
      callback();
    };

    req.session.save = function save(cb) {
      const callback = ensureCallback(cb);
      memoryStore.set(sid, req.session);
      callback();
    };

    req.session.destroy = function destroy(cb) {
      const callback = ensureCallback(cb);
      memoryStore.delete(sid);
      res.clearCookie(name);
      req.session = null;
      callback();
    };

    res.on('finish', () => {
      if (req.session) {
        memoryStore.set(sid, req.session);
        if (resave) {
          setCookie();
        }
      }
    });

    next();
  };
}
