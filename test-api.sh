#!/bin/bash

# Кольори для виводу
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
TOKEN="my-secret-token"

echo -e "${BLUE}=== Тестування Express API ===${NC}\n"

# Тест 1: Кореневий маршрут
echo -e "${BLUE}[Тест 1]${NC} GET / (без автентифікації)"
curl -s $BASE_URL/
echo -e "\n"

# Тест 2: GET /users з автентифікацією
echo -e "${BLUE}[Тест 2]${NC} GET /users (з автентифікацією)"
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/users
echo -e "\n"

# Тест 3: GET /users без автентифікації (має провалитись)
echo -e "${BLUE}[Тест 3]${NC} GET /users (БЕЗ автентифікації) - очікуємо 401"
curl -s -w "\nStatus: %{http_code}\n" $BASE_URL/users
echo -e "\n"

# Тест 4: POST /users з валідними даними
echo -e "${BLUE}[Тест 4]${NC} POST /users (з валідними даними)"
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Іван Петренко"}' \
  -w "\nStatus: %{http_code}\n"
echo -e "\n"

# Тест 5: POST /users з порожнім ім'ям (має провалитись)
echo -e "${BLUE}[Тест 5]${NC} POST /users (з порожнім ім'ям) - очікуємо 400"
curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":""}' \
  -w "\nStatus: %{http_code}\n"
echo -e "\n"

# Тест 6: GET /users/123 (існуючий користувач)
echo -e "${BLUE}[Тест 6]${NC} GET /users/123 (існуючий користувач)"
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/users/123
echo -e "\n"

# Тест 7: GET /users/999 (неіснуючий користувач) - має провалитись
echo -e "${BLUE}[Тест 7]${NC} GET /users/999 (неіснуючий користувач) - очікуємо 404"
curl -s -w "\nStatus: %{http_code}\n" -H "Authorization: Bearer $TOKEN" $BASE_URL/users/999
echo -e "\n"

# Тест 8: PUT /users/123 (оновлення користувача)
echo -e "${BLUE}[Тест 8]${NC} PUT /users/123 (оновлення користувача)"
curl -s -X PUT $BASE_URL/users/123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Петро Іваненко"}' \
  -w "\nStatus: %{http_code}\n"
echo -e "\n"

# Тест 9: DELETE /users/123
echo -e "${BLUE}[Тест 9]${NC} DELETE /users/123"
curl -s -X DELETE $BASE_URL/users/123 \
  -H "Authorization: Bearer $TOKEN" \
  -w "Status: %{http_code}\n"
echo -e "\n"

# Тест 10: GET /articles
echo -e "${BLUE}[Тест 10]${NC} GET /articles (з автентифікацією та правами)"
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/articles
echo -e "\n"

# Тест 11: POST /articles
echo -e "${BLUE}[Тест 11]${NC} POST /articles (створення статті)"
curl -s -X POST $BASE_URL/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Моя перша стаття"}' \
  -w "\nStatus: %{http_code}\n"
echo -e "\n"

# Тест 12: GET /articles/456 (існуюча стаття)
echo -e "${BLUE}[Тест 12]${NC} GET /articles/456 (існуюча стаття)"
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/articles/456
echo -e "\n"

# Тест 13: PUT /articles/456
echo -e "${BLUE}[Тест 13]${NC} PUT /articles/456 (оновлення статті)"
curl -s -X PUT $BASE_URL/articles/456 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Оновлена стаття"}' \
  -w "\nStatus: %{http_code}\n"
echo -e "\n"

# Тест 14: DELETE /articles/456
echo -e "${BLUE}[Тест 14]${NC} DELETE /articles/456"
curl -s -X DELETE $BASE_URL/articles/456 \
  -H "Authorization: Bearer $TOKEN" \
  -w "Status: %{http_code}\n"
echo -e "\n"

# Тест 15: Неіснуючий маршрут (404)
echo -e "${BLUE}[Тест 15]${NC} GET /nonexistent (неіснуючий маршрут) - очікуємо 404"
curl -s -w "\nStatus: %{http_code}\n" $BASE_URL/nonexistent
echo -e "\n"

echo -e "${GREEN}=== Тестування завершено ===${NC}"