// Middleware для логування запитів
export function logRequests(req, res, next) {
  console.log(`${new Date().toISOString()} - ${req.method} request to ${req.url}`);
  next();
}

// Middleware для перевірки автентифікації через сесію Passport
export function authenticateToken(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  if (req.accepts('html')) {
    return res.redirect('/auth/login');
  }

  return res.status(401).json({
    success: false,
    message: 'Не авторизований'
  });
}

// Middleware для опціональної автентифікації (не блокує, якщо токена немає)
export function optionalAuth(req, res, next) {
  req.user = req.user || null;
  next();
}

// Middleware для базової автентифікації (для API)
export function basicAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).send('Access denied. No credentials sent.');
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send('Access denied. Invalid token format.');
  }
  
  req.user = { id: '123', role: 'admin' };
  next();
}

// Middleware для валідації даних користувача
export function validateUserInput(req, res, next) {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).send('Bad Request');
  }
  
  next();
}

// Middleware для валідації даних статті
export function validateArticleInput(req, res, next) {
  const { title } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).send('Bad Request');
  }
  
  next();
}

// Middleware для перевірки прав доступу до статей
export function checkArticleAccess(req, res, next) {
  const user = req.user;
  
  if (!user) {
    return res.status(401).send('Access denied. Authentication required.');
  }
  
  if (user.role !== 'admin' && user.role !== 'author') {
    return res.status(403).send('Access denied. Insufficient permissions.');
  }
  
  next();
}

// Middleware для перевірки існування ресурсу
export function checkResourceExists(validIds) {
  return (req, res, next) => {
    const id = req.params.userId || req.params.articleId;
    
    if (!validIds.includes(id)) {
      return res.status(404).send('Not Found');
    }
    
    next();
  };
}

// Middleware для передачі інформації про користувача в шаблони
export function attachUserToLocals(req, res, next) {
  res.locals.user = req.user || null;
  res.locals.theme = req.cookies.theme || 'light';

  // Додаємо версію favicon для примусового оновлення після зміни файлу
  res.locals.faviconPath = '/favicon.ico?v=1';

  next();
}