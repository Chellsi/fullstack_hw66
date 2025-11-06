# 🚀 Гід з розгортання проекту

## 📋 Підготовка до розгортання

### 1. Структура файлів

Переконайтеся, що у вас є наступна структура:

```
src/
├── controllers/
│   ├── usersController.js
│   └── articlesController.js
├── middlewares/
│   └── index.js
├── routes/
│   ├── users.js
│   └── articles.js
├── views/
│   ├── users/
│   │   ├── index.pug
│   │   └── detail.pug
│   ├── articles/
│   │   ├── index.ejs
│   │   └── detail.ejs
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── layout.pug
│   ├── index.pug
│   └── error.pug
├── public/
│   └── css/
│       └── style.css
└── server.mjs
```

### 2. Перевірка package.json

Переконайтеся, що у вас правильний `package.json`:

```json
{
  "name": "express-restful-api",
  "version": "1.0.0",
  "type": "module",
  "main": "server.mjs",
  "scripts": {
    "start": "node src/server.mjs",
    "dev": "nodemon src/server.mjs"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pug": "^3.0.2",
    "ejs": "^3.1.9"
  }
}
```

## 🔧 Локальне тестування

### Крок 1: Встановлення

```bash
npm install
```

### Крок 2: Запуск

```bash
npm run dev
```

### Крок 3: Перевірка

Відкрийте в браузері:
- http://localhost:3000/
- http://localhost:3000/users/page
- http://localhost:3000/articles/page

## 📤 Публікація на GitHub

### 1. Ініціалізація Git

```bash
# Ініціалізувати репозиторій
git init

# Додати файли
git add .

# Перший коміт
git commit -m "Initial commit: Express API with PUG and EJS"
```

### 2. Створення репозиторію на GitHub

1. Перейдіть на https://github.com
2. Клікніть "New repository"
3. Назвіть репозиторій (наприклад, `express-templating-api`)
4. НЕ додавайте README (він вже є)
5. Клікніть "Create repository"

### 3. Підключення до GitHub

```bash
# Додати remote
git remote add origin https://github.com/YOUR_USERNAME/express-templating-api.git

# Пуш коду
git branch -M main
git push -u origin main
```

### 4. Перевірка на GitHub

Переконайтеся, що всі файли завантажені:
- ✅ Папка `src/` з усіма підпапками
- ✅ `README.md`
- ✅ `package.json`
- ✅ `.gitignore`
- ❌ Папка `node_modules/` (НЕ повинна бути в Git)

## 🌐 Розгортання на Render.com (безкоштовно)

### Крок 1: Створіть обліковий запис

1. Перейдіть на https://render.com
2. Зареєструйтеся (можна через GitHub)

### Крок 2: Створіть новий Web Service

1. Клікніть "New +" → "Web Service"
2. Підключіть ваш GitHub репозиторій
3. Виберіть репозиторій з проектом

### Крок 3: Налаштування

- **Name**: `express-api` (або інше)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### Крок 4: Розгортання

1. Клікніть "Create Web Service"
2. Зачекайте 2-3 хвилини
3. Ваш додаток буде доступний за URL: `https://express-api-xxxx.onrender.com`

### Крок 5: Тестування

Відкрийте URL та перевірте:
- https://your-app.onrender.com/
- https://your-app.onrender.com/users/page
- https://your-app.onrender.com/articles/page

## 🌐 Розгортання на Heroku

### Крок 1: Встановіть Heroku CLI

```bash
# Mac
brew tap heroku/brew && brew install heroku

# Windows (використайте інсталятор з heroku.com)
```

### Крок 2: Логін

```bash
heroku login
```

### Крок 3: Створення додатку

```bash
# Створити додаток
heroku create express-api-yourname

# Пуш коду
git push heroku main

# Відкрити в браузері
heroku open
```

### Крок 4: Перегляд логів

```bash
heroku logs --tail
```

## 🐳 Розгортання з Docker (опціонально)

### Створіть Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Створіть .dockerignore:

```
node_modules
npm-debug.log
.git
.gitignore
README.md
```

### Команди Docker:

```bash
# Білд
docker build -t express-api .

# Запуск
docker run -p 3000:3000 express-api

# Відкрити
open http://localhost:3000
```

## 🔒 Безпека перед продакшн

### 1. Додайте змінні оточення

Створіть файл `.env`:
```
PORT=3000
NODE_ENV=production
```

Оновіть `server.mjs`:
```javascript
const PORT = process.env.PORT || 3000;
```

### 2. Додайте helmet для безпеки

```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

### 3. Додайте rate limiting

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);
```

### 4. Додайте CORS

```bash
npm install cors
```

```javascript
import cors from 'cors';
app.use(cors());
```

## ✅ Чеклист перед розгортанням

- [ ] Код працює локально
- [ ] Всі тести пройдені
- [ ] README.md оновлений
- [ ] .gitignore налаштований
- [ ] node_modules не в Git
- [ ] Змінні оточення налаштовані
- [ ] Логи налаштовані
- [ ] Обробка помилок працює
- [ ] 404 сторінка працює
- [ ] Безпека налаштована (helmet, cors)

## 🐛 Troubleshooting

### Помилка: "Cannot find module"
```bash
# Перевірте node_modules
rm -rf node_modules package-lock.json
npm install
```

### Помилка: "Port already in use"
```bash
# Знайти процес
lsof -ti:3000

# Вбити процес
lsof -ti:3000 | xargs kill -9
```

### Помилка: "Views not found"
```bash
# Перевірте шляхи
ls -la src/views/
ls -la src/public/
```

### Стилі не завантажуються на продакшн
```javascript
// Додайте в server.mjs
app.use(express.static(join(__dirname, 'public')));
```

## 📞 Підтримка

Якщо виникли проблеми:
1. Перевірте логи: `heroku logs --tail` або в Render dashboard
2. Перевірте змінні оточення
3. Перевірте версію Node.js: `node --version`
4. Переконайтеся, що всі залежності встановлені

## 🎉 Готово!

Ваш додаток тепер доступний онлайн! Поділіться URL з викладачем або колегами.

**Приклад URL:**
- https://express-api-xxxx.onrender.com/
- https://express-api-xxxx.onrender.com/users/page
- https://express-api-xxxx.onrender.com/articles/page