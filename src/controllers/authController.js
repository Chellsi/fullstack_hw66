import passport from '../config/passport.js';
import {
  createUser,
  findUserByEmail,
  findUserByUsername
} from '../data/usersStore.js';

// Сторінка реєстрації
export const getRegisterPage = (req, res) => {
  const theme = req.cookies.theme || 'light';
  res.render('auth/register', {
    title: 'Реєстрація',
    theme,
    error: null
  });
};

// Сторінка входу
export const getLoginPage = (req, res) => {
  const theme = req.cookies.theme || 'light';
  res.render('auth/login', {
    title: 'Вхід',
    theme,
    error: null
  });
};

// Реєстрація користувача
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Всі поля обов\'язкові'
      });
    }

    const existingEmail = findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Користувач з таким email вже існує'
      });
    }

    const existingUsername = findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Користувач з таким ім\'ям вже існує'
      });
    }

    const newUser = await createUser({ username, email, password });

    req.login(newUser, (error) => {
      if (error) {
        return next(error);
      }

      res.status(201).json({
        success: true,
        message: 'Реєстрація успішна',
        user: newUser
      });
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка сервера'
    });
  }
};

// Вхід користувача
export const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || 'Невірний email або пароль'
      });
    }

    req.login(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      res.json({
        success: true,
        message: 'Вхід успішний',
        user
      });
    });
  })(req, res, next);
};

// Вихід користувача
export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    if (req.session) {
      req.session.destroy((destroyError) => {
        if (destroyError) {
          return next(destroyError);
        }

        res.clearCookie('connect.sid');
        res.json({
          success: true,
          message: 'Вихід успішний'
        });
      });
    } else {
      res.json({
        success: true,
        message: 'Вихід успішний'
      });
    }
  });
};

// Отримання поточного користувача
export const getCurrentUser = (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Не авторизований'
    });
  }
};

// Профіль користувача (захищена сторінка)
export const getProfilePage = (req, res) => {
  const theme = req.cookies.theme || 'light';
  res.render('auth/profile', {
    title: 'Профіль',
    theme,
    user: req.user
  });
};
