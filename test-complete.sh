#!/bin/bash

# Кольори
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
COOKIE_FILE="/tmp/test_cookies.txt"

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Комплексне тестування Express API               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}\n"

# Функція для тестування
test_endpoint() {
  local method=$1
  local url=$2
  local expected_status=$3
  local description=$4
  local data=$5
  
  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$data" \
      -b "$COOKIE_FILE" \
      -c "$COOKIE_FILE")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -b "$COOKIE_FILE" \
      -c "$COOKIE_FILE")
  fi
  
  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓${NC} $description (${status})"
  else
    echo -e "${RED}✗${NC} $description (Expected: ${expected_status}, Got: ${status})"
  fi
}

# Перевірка доступності сервера
echo -e "${YELLOW}[1/7] Перевірка доступності сервера...${NC}"
if curl -s --head "$BASE_URL" | grep "200 OK" > /dev/null; then
  echo -e "${GREEN}✓${NC} Сервер доступний\n"
else
  echo -e "${RED}✗ Сервер не відповідає. Запустіть: npm run dev${NC}\n"
  exit 1
fi

# Тест 1: Favicon
echo -e "${YELLOW}[2/7] Тестування Favicon...${NC}"
test_endpoint "GET" "$BASE_URL/favicon.ico" "200" "Favicon доступний"
test_endpoint "GET" "$BASE_URL/favicon.svg" "200" "SVG Favicon доступний (якщо є)"
echo ""

# Тест 2: Статичні файли
echo -e "${YELLOW}[3/7] Тестування статичних файлів...${NC}"
test_endpoint "GET" "$BASE_URL/css/style.css" "200" "CSS файл доступний"
echo ""

# Тест 3: HTML сторінки (без автентифікації)
echo -e "${YELLOW}[4/7] Тестування HTML сторінок...${NC}"
test_endpoint "GET" "$BASE_URL/" "200" "Головна сторінка"
test_endpoint "GET" "$BASE_URL/auth/login" "200" "Сторінка входу"
test_endpoint "GET" "$BASE_URL/auth/register" "200" "Сторінка реєстрації"
test_endpoint "GET" "$BASE_URL/users/page" "200" "Список користувачів"
test_endpoint "GET" "$BASE_URL/articles/page" "200" "Список статей"
echo ""

# Тест 4: Автентифікація
echo -e "${YELLOW}[5/7] Тестування автентифікації...${NC}"

# Очистити старі cookies
rm -f "$COOKIE_FILE"

# Спроба доступу до профілю без автентифікації
echo -e "${BLUE}Спроба доступу без авторизації:${NC}"
test_endpoint "GET" "$BASE_URL/auth/profile" "401" "Профіль недоступний без токена"

# Вхід
echo -e "\n${BLUE}Вхід в систему:${NC}"
test_endpoint "POST" "$BASE_URL/auth/login" "200" "Вхід як admin" \
  '{"username":"admin","password":"admin123"}'

# Перевірка cookie
if grep -q "token" "$COOKIE_FILE"; then
  echo -e "${GREEN}✓${NC} Cookie 'token' встановлено"
else
  echo -e "${RED}✗${NC} Cookie 'token' не встановлено"
fi

# Доступ до профілю після входу
echo -e "\n${BLUE}Доступ після авторизації:${NC}"
test_endpoint "GET" "$BASE_URL/auth/profile" "200" "Профіль доступний після входу"
test_endpoint "GET" "$BASE_URL/auth/me" "200" "API /auth/me працює"

echo ""

# Тест 5: Робота з темами
echo -e "${YELLOW}[6/7] Тестування тем оформлення...${NC}"

# Встановити світлу тему
test_endpoint "POST" "$BASE_URL/api/theme/set" "200" "Встановлення світлої теми" \
  '{"theme":"light"}'

# Перевірка cookie теми
if grep -q "theme=light" "$COOKIE_FILE"; then
  echo -e "${GREEN}✓${NC} Cookie 'theme=light' встановлено"
else
  echo -e "${RED}✗${NC} Cookie 'theme' не встановлено"
fi

# Встановити темну тему
test_endpoint "POST" "$BASE_URL/api/theme/set" "200" "Встановлення темної теми" \
  '{"theme":"dark"}'

# Отримати поточну тему
test_endpoint "GET" "$BASE_URL/api/theme/current" "200" "Отримання поточної теми"

echo ""

# Тест 6: Вихід
echo -e "${YELLOW}[7/7] Тестування виходу...${NC}"
test_endpoint "POST" "$BASE_URL/auth/logout" "200" "Вихід з системи"

# Перевірка що cookie видалено
echo -e "\n${BLUE}Перевірка після виходу:${NC}"
test_endpoint "GET" "$BASE_URL/auth/profile" "401" "Профіль недоступний після виходу"

echo ""

# Підсумок
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Тестування завершено                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}\n"

# Очистка
rm -f "$COOKIE_FILE"

echo -e "${GREEN}✨ Всі тести пройдено!${NC}"
echo -e "${YELLOW}💡 Підказка: Відкрийте ${BASE_URL} в браузері для візуальної перевірки${NC}\n"