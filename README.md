# Business Card API

Цифровая визитка в виде GraphQL API: профиль, ссылки, навыки, опыт работы и проекты.

**Стек:** TypeScript · Node.js 22 · NestJS 11 · GraphQL (Apollo Server 5, code-first) · Prisma 6 · PostgreSQL 17 · Docker

- Демо (Apollo Sandbox): <https://business-card-api-caxj.onrender.com/graphql> — бесплатный план Render, первый запрос после простоя может занять до минуты
- Исходный код: <https://github.com/lvovkonstantin57-del/business-card-api>

---

## Быстрый старт

Нужен только Docker:

```bash
docker compose up --build
```

Откройте <http://localhost:3000/graphql> — это Apollo Sandbox, в нём уже открыт пример запроса, достаточно нажать **Run**.

При старте контейнер сам применяет миграции и заполняет базу (см. [Инициализация БД](#инициализация-и-заполнение-бд)). Повторные запуски и рестарты безопасны.

### Локальная разработка без Docker для API

```bash
cp .env.example .env
docker compose up -d db        # только PostgreSQL
npm ci
npm run db:deploy              # миграции
npm run db:seed                # данные
npm run start:dev              # http://localhost:3000/graphql
```

### Тесты

```bash
npm test                       # unit: бизнес-логика, DataLoader
npm run test:e2e               # e2e: реальный HTTP + PostgreSQL (нужна поднятая и заполненная БД)
```

e2e-тест в том числе проверяет, что запрос `profiles { links skills experience projects }` выполняется **ровно за 5 SQL-запросов** при любом количестве профилей (нет N+1).

---

## Пример запроса

```graphql
query {
  profile {
    name
    headline
    description
    links { kind label url }
    skills { name category level }
    experience {
      company
      position
      period { start end isCurrent durationMonths }
      achievements
    }
    projects { name description url repositoryUrl technologies }
  }
}
```

`profile(slug: String)` без аргумента возвращает владельца визитки; `profiles` — все профили (пригодится, чтобы показать батчинг).

Полная схема: [`schema.gql`](schema.gql) (генерируется из кода).

---

## Архитектура

```
src/
├── main.ts, app.module.ts
├── config/env.ts                  # валидация переменных окружения (fail fast)
├── prisma/                        # PrismaService (глобальный модуль)
├── health/                        # GET /health — для Docker/Render healthcheck
├── common/
│   ├── dataloader/                # generic one-to-many DataLoader
│   └── scalars/                   # скаляр LocalDate (YYYY-MM-DD)
├── graphql/
│   ├── graphql.config.ts          # Apollo, Sandbox, контекст запроса
│   └── loaders.factory.ts         # набор DataLoader'ов на каждый запрос
└── modules/
    ├── profile/                   # resolver → service → repository
    ├── experience/                # resolver (вычисляемое поле period) → service → repository
    ├── skill/  project/  link/    # model + repository
prisma/
├── schema.prisma
├── migrations/                    # версионированные SQL-миграции
└── seed/{seed.ts,data.ts}         # идемпотентный сид; data.ts — содержимое визитки
```

### Слои и ответственность

| Слой | Что делает | Чего не делает |
|---|---|---|
| **Resolver** (`*.resolver.ts`) | Описывает GraphQL-поля, достаёт аргументы и контекст, делегирует | Нет бизнес-правил и обращений к Prisma |
| **Service** (`*.service.ts`) | Бизнес-правила: какой профиль считать «владельцем», ошибка NotFound, расчёт периода и стажа | Не знает про GraphQL и SQL; `ExperienceService` — чистая функция, тестируется без БД |
| **Repository** (`*.repository.ts`) | Единственное место с Prisma-запросами: фильтры, сортировка (`ORDER BY`) | Нет бизнес-логики |
| **Model** (`models/*.model.ts`) | GraphQL-типы (code-first) | — |

Для модулей `skill`, `project`, `link` сервисный слой сознательно не заводился: бизнес-логики там нет, а пустой сервис-прокси только добавил бы кода. Когда логика появится (например, фильтрация навыков по категории), сервис добавляется без изменения резолверов других модулей.

### Почему code-first GraphQL

TypeScript-классы — единственный источник правды: типы в резолверах и схема не расходятся. SDL генерируется в `schema.gql` и коммитится — изменения API видны на ревью.

### Вложенные данные и N+1 → DataLoader

Связи профиля (`links`, `skills`, `experience`, `projects`) — это `@ResolveField`, а не `include` в корневом запросе. Это даёт:

1. **Ленивую загрузку** — если клиент не запросил `projects`, запрос к таблице `Project` не выполняется.
2. **Батчинг** — все `.load(profileId)` за один тик собираются в один `WHERE "profileId" IN (...)`.

Итог: количество SQL-запросов = 1 + число запрошенных связей, **независимо от числа профилей**. Это проверяется e2e-тестом, а с `LOG_SQL=true` видно в логах.

Детали реализации:

- `createOneToManyLoader` — один generic-хелпер вместо четырёх копий; группирует строки по родителю и сохраняет порядок из репозитория (сортировка остаётся ответственностью слоя данных).
- DataLoader'ы создаются **на каждый запрос** в фабрике контекста GraphQL. Общий на всё приложение кеш DataLoader привёл бы к устаревшим данным и утечке памяти. Альтернатива — `REQUEST`-scoped провайдеры — заставила бы Nest пересоздавать всю цепочку зависимостей на каждый запрос; фабрика в контексте оставляет DI-граф синглтонами.

Почему не `include` целиком в корневом резолвере: так загружались бы все связи даже когда они не нужны, а при росте схемы (новые вложенные поля) пришлось бы вручную синхронизировать `include` с GraphQL-селекцией.

### Модель данных

- `Profile` — агрегат; все сущности принадлежат ровно одному профилю, `onDelete: Cascade`.
- `slug` — стабильный естественный ключ: по нему работает идемпотентный сид и аргумент `profile(slug:)`.
- `Experience.startDate / endDate` — тип `DATE` (`@db.Date`), а не timestamp: период работы — это календарные даты. В API — собственный скаляр `LocalDate` (`YYYY-MM-DD`), а не `DateTime` с часовым поясом.
- `endDate = NULL` означает текущее место работы; `isCurrent` и `durationMonths` вычисляются в `ExperienceService`, а не хранятся (нет рассинхронизации данных, стаж текущей работы всегда актуален).
- `achievements`, `technologies` — `text[]` в PostgreSQL: это упорядоченные списки значений без собственной идентичности, отдельная таблица не дала бы ничего, кроме лишнего JOIN.
- `LinkKind`, `SkillCategory`, `SkillLevel` — enum'ы и в БД, и в GraphQL: невалидное значение невозможно сохранить и легко обработать на клиенте.
- `sortOrder` — явный порядок отображения (порядок в `data.ts` = порядок в API).
- Индексы `(profileId, ...)` покрывают ровно те запросы, что делают репозитории (`WHERE profileId IN ... ORDER BY ...`).

### Инициализация и заполнение БД

`docker-entrypoint.sh` при каждом старте:

1. `prisma migrate deploy` — применяет только новые миграции из `prisma/migrations` (не `db push`: схема версионируется, изменения воспроизводимы и ревьюятся как SQL).
2. `node dist/prisma/seed/seed.js` — **идемпотентный** сид.
3. `exec node dist/src/main.js` — `exec`, чтобы Node получал SIGTERM напрямую и корректно завершался (`enableShutdownHooks`).

Сид делает `upsert` профиля по `slug` и во вложенной записи заменяет дочерние коллекции (`deleteMany` + `createMany`). Prisma выполняет вложенную запись одной транзакцией — читатель никогда не увидит «полупустой» профиль. Поэтому сид можно запускать на каждом старте: данные визитки всегда соответствуют `prisma/seed/data.ts`, дублей не возникает.

`docker compose` ждёт `pg_isready` (healthcheck + `depends_on: condition: service_healthy`) прежде чем стартовать API, поэтому `docker compose up` с нуля работает без ретраев.

### Docker

- Multi-stage сборка: `deps` (кешируется, пока не изменился `package-lock.json`) → `build` (компиляция + `npm prune --omit=dev`) → `runtime` (только `dist`, prod-зависимости, Prisma-схема и миграции).
- Запуск от непривилегированного пользователя `node`, `HEALTHCHECK` через `/health` (проверяет и процесс, и соединение с БД).
- `prisma` (CLI) лежит в `dependencies`, а не в `devDependencies`, потому что миграции применяются в runtime-образе.

### Прочее

- **Конфигурация** валидируется при старте (`src/config/env.ts`): без `DATABASE_URL` приложение падает сразу с понятной ошибкой, а не на первом запросе.
- **Apollo Sandbox** вместо устаревшего GraphQL Playground; introspection и Sandbox включены и в production осознанно — это публичная витрина.
- **Ошибки**: неизвестный `slug` → `NotFoundException`, которую Nest/Apollo отдают как GraphQL-ошибку.
- **Глубина запросов**: схема ациклична (у дочерних типов нет обратной ссылки на `Profile`), поэтому глубина запроса ограничена самой схемой и отдельный depth-limit не нужен. При появлении циклов стоит добавить `graphql-depth-limit` / complexity.

---

## Деплой (Render)

В репозитории есть Blueprint [`render.yaml`](render.yaml): **Render → New → Blueprint → выбрать репозиторий**. Будут созданы бесплатный PostgreSQL и web-сервис из `Dockerfile`; `DATABASE_URL` подставится автоматически, миграции и сид выполнятся при старте контейнера. Sandbox будет доступен по `https://<service>.onrender.com/graphql`.

> На бесплатном плане сервис «засыпает» после простоя, первый запрос может занять ~30–60 с.

## CI

`.github/workflows/ci.yml`: typecheck → unit-тесты → сборка → миграции и сид на PostgreSQL-сервисе → e2e; отдельной задачей собирается Docker-образ.

## Как изменить данные визитки

Отредактируйте `prisma/seed/data.ts` и перезапустите приложение (`docker compose up --build` или `npm run db:seed`).

## Переменные окружения

| Переменная | По умолчанию | Описание |
|---|---|---|
| `DATABASE_URL` | — (обязательна) | Строка подключения PostgreSQL |
| `PORT` | `3000` | Порт HTTP-сервера |
| `NODE_ENV` | `development` | В `production` схема не пишется на диск |
| `LOG_SQL` | `false` | Логировать SQL-запросы Prisma |
