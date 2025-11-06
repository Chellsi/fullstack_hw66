#!/bin/bash

# Кольори для виводу
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Тестування веб-сторінок Express API             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}\n"

# Перевірка, чи сервер запущений
echo -e "${YELLOW}Перевірка доступності сервера...${NC}"
if curl -s --head --request GET "$BASE_URL" | grep "200 OK" > /dev/null; then
  echo -e "${GREEN}✓ Сервер працює!${NC}\n"
else
  echo -e "\033[0;31m✗ Сервер не відповідає. Будь ласка, запустіть сервер командою: npm run dev${NC}\n"
  exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Доступні сторінки для перегляду в браузері:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

echo -e "${GREEN}1. Головна сторінка:${NC}"
echo -e "   ${BASE_URL}/"
echo -e "   Шаблонізатор: PUG"
echo -e "   Опис: Головна сторінка з переходами до розділів\n"

echo -e "${GREEN}2. Список користувачів (PUG):${NC}"
echo -e "   ${BASE_URL}/users/page"
echo -e "   Шаблонізатор: PUG"
echo -e "   Опис: Сітка карток з користувачами\n"

echo -e "${GREEN}3. Деталі користувача 1 (PUG):${NC}"
echo -e "   ${BASE_URL}/users/page/123"
echo -e "   Користувач: Іван Петренко (admin)\n"

echo -e "${GREEN}4. Деталі користувача 2 (PUG):${NC}"
echo -e "   ${BASE_URL}/users/page/456"
echo -e "   Користувач: Марія Коваленко (user)\n"

echo -e "${GREEN}5. Деталі користувача 3 (PUG):${NC}"
echo -e "   ${BASE_URL}/users/page/789"
echo -e "   Користувач: Петро Сидоренко (user)\n"

echo -e "${GREEN}6. Список статей (EJS):${NC}"
echo -e "   ${BASE_URL}/articles/page"
echo -e "   Шаблонізатор: EJS"
echo -e "   Опис: Список статей з метаданими\n"

echo -e "${GREEN}7. Деталі статті 1 (EJS):${NC}"
echo -e "   ${BASE_URL}/articles/page/456"
echo -e "   Стаття: Вступ до Node.js\n"

echo -e "${GREEN}8. Деталі статті 2 (EJS):${NC}"
echo -e "   ${BASE_URL}/articles/page/789"
echo -e "   Стаття: Express.js для початківців\n"

echo -e "${GREEN}9. Деталі статті 3 (EJS):${NC}"
echo -e "   ${BASE_URL}/articles/page/101"
echo -e "   Стаття: Шаблонізатори в Express\n"

echo -e "${GREEN}10. Тест 404 помилки:${NC}"
echo -e "   ${BASE_URL}/users/page/999"
echo -e "   Опис: Неіснуючий користувач\n"

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Перевірка статус-кодів сторінок:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

# Функція для перевірки сторінки
check_page() {
  local url=$1
  local description=$2
  local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$status" = "200" ]; then
    echo -e "${GREEN}✓${NC} $description - ${GREEN}$status OK${NC}"
  else
    echo -e "\033[0;31m✗${NC} $description - \033[0;31m$status${NC}"
  fi
}

check_page "$BASE_URL/" "Головна сторінка"
check_page "$BASE_URL/users/page" "Список користувачів"
check_page "$BASE_URL/users/page/123" "Користувач 123"
check_page "$BASE_URL/users/page/456" "Користувач 456"
check_page "$BASE_URL/users/page/789" "Користувач 789"
check_page "$BASE_URL/articles/page" "Список статей"
check_page "$BASE_URL/articles/page/456" "Стаття 456"
check_page "$BASE_URL/articles/page/789" "Стаття 789"
check_page "$BASE_URL/articles/page/101" "Стаття 101"

echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Швидкі посилання для копіювання:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

echo "Головна:        $BASE_URL/"
echo "Користувачі:    $BASE_URL/users/page"
echo "Статті:         $BASE_URL/articles/page"

echo -e "\n${GREEN}✓ Тестування завершено!${NC}"
echo -e "${YELLOW}💡 Підказка: Відкрийте будь-яке посилання у браузері для перегляду${NC}\n"