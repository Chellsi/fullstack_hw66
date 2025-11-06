import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { findUserByEmail, findUserById, sanitizeUser } from '../data/usersStore.js';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = findUserByEmail(email);

        if (!user) {
          return done(null, false, { message: 'Невірний email або пароль' });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return done(null, false, { message: 'Невірний email або пароль' });
        }

        return done(null, sanitizeUser(user));
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  try {
    const user = findUserById(id);

    if (!user) {
      return done(null, false);
    }

    return done(null, sanitizeUser(user));
  } catch (error) {
    done(error);
  }
});

export default passport;
