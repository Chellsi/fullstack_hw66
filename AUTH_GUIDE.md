# 🔐 Гід по автентифікації та авторизації

## Огляд системи

Проект використовує **JWT (JSON Web Tokens)** для автентифікації користувачів з збереженням токенів у **httpOnly cookies** для максимальної безпеки.

## 🔑 Як працює автентифікація

### 1. Реєстрація нового користувача

```
Користувач → Форма реєстрації → POST /auth/register → Сервер
                                                          ↓
                                                    Валідація даних
                                                          ↓
                                                    Хешування пароля (bcrypt)
                                                          ↓
                                                    Збереження в "БД"
                                                          ↓
                                                    Генерація JWT токена
                                                          ↓
                                                    Встановлення cookie
                                                          ↓
Профіль користувача ← Перенаправлення ← Відповідь з токеном
```

### 2. Вхід існуючого користувача

```
Користувач → Форма входу → POST /auth/login → Сервер
                                                  ↓
                                            Пошук користувача
                                                  ↓
                                            Перевірка пароля (bcrypt.compare)
                                                  ↓
                                            Генерація JWT токена
                                                  ↓
                                            Встановлення cookie
                                                  ↓
Профіль користувача ← Перенаправлення ← Відповідь з токеном
```

### 3. Доступ до захищених ресурсів

```
Користувач → GET /auth/profile → Middleware authenticateToken
                                          ↓
                                    Читання cookie 'token'
                                          ↓
                                    Перевірка JWT (jwt.verify)
                                          ↓
                         Валідний?    /        \    Невалідний
                                     /          \
                              req.user = data    401 Unauthorized
                                     ↓
                              Контролер профілю
                                     ↓
                              Рендеринг сторінки
```

## 🔐 Безпека

### HttpOnly Cookies

**Що це?**
- Cookies, до яких JavaScript НЕ має доступу
- Захист від XSS атак (Cross-Site Scripting)

**Налаштування:**
```javascript
res.cookie('token', jwtToken, {
  httpOnly: true,      // Захист від XSS
  secure: production,  // Тільки HTTPS в продакшн
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 днів
});
```

### Хешування паролів

**Чому не зберігаємо паролі відкритим текстом?**
- Якщо БД зламають, паролі будуть захищені
- Неможливо відновити оригінальний пароль з хешу

**Приклад:**
```javascript
// Реєстрація
const hashedPassword = await bcrypt.hash('user123', 10);
// Зберігаємо: $2a$10$XQqhH7Z9F0Y6JYxN6X1nP...

// Вхід
const isValid = await bcrypt.compare('user123', hashedPassword);
// true або false
```

### JWT Токени

**Структура JWT:**
```
header.payload.signature
```

**Payload (дані):**
```javascript
{
  id: "1",
  username: "admin",
  email: "admin@example.com",
  role: "admin",
  iat: 1640000000,  // Issued At
  exp: 1640604800   // Expiration
}
```

**Підпис:**
- Генерується з використанням секретного ключа
- Гарантує, що токен не був підроблений

## 🛡️ Middleware

### authenticateToken (обов'язкова автентифікація)

```javascript
export function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ 
      message: 'Invalid token' 
    });
  }
}
```

**Використання:**
```javascript
router.get('/profile', authenticateToken, getProfilePage);
```

### optionalAuth (опціональна автентифікація)

```javascript
export function optionalAuth(req, res, next) {
  const token = req.cookies.token;

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      req.user = null;
    }
  }

  next();  // Продовжуємо в будь-якому випадку
}
```

**Використання:**
```javascript
// Застосовується глобально
app.use(optionalAuth);
```

## 📝 Приклади використання

### 1. Реєстрація через форму

```html
<form id="registerForm">
  <input type="text" name="username" required>
  <input type="email" name="email" required>
  <input type="password" name="password" required>
  <button type="submit">Зареєструватися</button>
</form>

<script>
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  const response = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (response.ok) {
    window.location.href = '/auth/profile';
  }
});
</script>
```

### 2. Вхід через API

```javascript
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const data = await response.json();
console.log(data.user);  // Інформація про користувача
```

### 3. Отримання поточного користувача

```javascript
const response = await fetch('/auth/me');
const data = await response.json();

if (data.success) {
  console.log(`Привіт, ${data.user.username}!`);
}
```

### 4. Вихід з системи

```javascript
await fetch('/auth/logout', { method: 'POST' });
window.location.href = '/auth/login';
```

## 🔄 Потік даних

### Збереження стану

```
1. Користувач входить
   ↓
2. Сервер генерує JWT
   ↓
3. Токен → Cookie (httpOnly)
   ↓
4. Браузер автоматично відправляє cookie при кожному запиті
   ↓
5. Middleware перевіряє токен
   ↓
6. Дані користувача доступні в req.user
```

### Передача даних в шаблони

```javascript
// Middleware attachUserToLocals
export function attachUserToLocals(req, res, next) {
  res.locals.user = req.user || null;
  res.locals.theme = req.cookies.theme || 'light';
  next();
}
```

```pug
// В PUG шаблоні
if user
  p Привіт, #{user.username}!
else
  a(href='/auth/login') Увійти
```

## 🚨 Обробка помилок

### 401 Unauthorized
```javascript
// Токен відсутній
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```javascript
// Токен невалідний
{
  "success": false,
  "message": "Invalid or expired token."
}
```

### 400 Bad Request
```javascript
// Помилка валідації
{
  "success": false,
  "message": "Всі поля обов'язкові"
}
```

## 🔧 Налаштування

### Змінні оточення

Створіть файл `.env`:
```env
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=production
PORT=3000
```

### В production ОБОВ'ЯЗКОВО:

1. **Змініть JWT_SECRET** на складний випадковий рядок
2. **Увімкніть HTTPS** (secure: true для cookies)
3. **Додайте rate limiting** (обмеження кількості запитів)
4. **Логуйте всі спроби входу**
5. **Додайте CORS** політику

## 📚 Додаткові ресурси

- [JWT.io](https://jwt.io/) - Декодування та налагодження JWT
- [OWASP Auth Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## ✅ Чеклист безпеки

- [x] Паролі хешуються (bcrypt)
- [x] JWT токени в httpOnly cookies
- [x] Обмежений термін дії токенів
- [x] Валідація вхідних даних
- [ ] Rate limiting (TODO для production)
- [ ] HTTPS в production (TODO)
- [ ] CSRF захист (TODO для production)
- [ ] Логування спроб входу (TODO)

## 🎓 Навчальні цілі

Ця реалізація демонструє:
1. ✅ Створення системи реєстрації/входу
2. ✅ Використання JWT для автентифікації
3. ✅ Безпечне зберігання токенів у httpOnly cookies
4. ✅ Захист маршрутів через middleware
5. ✅ Хешування паролів
6. ✅ Валідація даних