## Описание

Проект представляет собой серверную часть веб-приложения, разработанную на Node.js с использованием Express.js. Для управления БД используется ORM Prisma, а сама база данных реализована на MongoDB, развернутой в Docker-контейнере.

## Технологии

- **Node.js**: Серверная среда для выполнения JavaScript-кода.
- **Express.js**: Легкий и гибкий веб-фреймворк для Node.js.
- **Prisma ORM**: Мощный инструмент для работы с базами данных, обеспечивающий типизацию и удобный API.
- **MongoDB**: Документно-ориентированная NoSQL база данных.
- **Docker**: Платформа для разработки, доставки и запуска приложений в контейнерах.

## Установка и запуск

### Предварительные требования

- Установленные [Node.js](https://nodejs.org/) и [npm](https://www.npmjs.com/get-npm).
- Установленный [Docker](https://www.docker.com/).

### Шаги для запуска проекта

1. Склонируйте репозиторий https://github.com/dinar1122/express-api.git

2. Откройте терминал (или командную строку) и перейдите в корневую директорию сервера:
   ```bash
   cd express-api
   ```

3. Переименуйте файл `.env.local` в `.env`:
   ```bash
   mv .env.local .env
   ```

4. Запустите команду `docker-compose`, которая поднимет сервер, клиент и базу данных:
   ```bash
   docker-compose up
   ```

# Если вы хотите скачать образ базы данных MongoDB отдельно

Запустите контейнер с образом MongoDB и настройками replica set (он автоматически скачает и запустит этот образ):

```bash
docker run --name mongo \
   -p 27017:27017 \
   -e MONGO_INITDB_ROOT_USERNAME="monty" \
   -e MONGO_INITDB_ROOT_PASSWORD="pass" \
   -d prismagraphql/mongo-single-replica:5.0.3
```
