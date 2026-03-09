# Online Store Project

В проекте реализован Fullstack интернет-магазин с безопасной авторизацией и ролевой моделью.

## Стек технологий
- **Frontend:** React, Vite, SCSS, Axios
- **Backend:** Node.js, Express, Swagger, bcrypt, jsonwebtoken, cookie-parser

## Запуск проекта

### 1. Запуск Backend (API)
Перейдите в папку backend, установите зависимости и запустите сервер:
```bash
cd backend
npm install
node app.js
```
Сервер запустится на `http://localhost:3000`
Документация Swagger: `http://localhost:3000/api-docs`

### 2. Запуск Frontend
Откройте новый терминал, перейдите в папку frontend, установите зависимости и запустите клиент:
```bash
cd frontend
npm install
npm run dev
```
Клиент запустится на `http://localhost:5173`