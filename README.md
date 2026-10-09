# Shopcash API

Base template for ConnectSoft APIs: NestJS 12 + TypeORM/Postgres + Zod, with authentication, admin back-office,
API keys, error handling, health checks and API reference already in place. It holds no business rules — add your
feature modules on top of it.

## Getting started

```bash
pnpm install
cp .env.example .env          # then fill TOKEN_SECRET and SYSADMIN_PASSWORD
docker compose up -d db       # Postgres on DATABASE_PORT
pnpm start:dev
```

- API: `http://localhost:3000/api`
- API reference (public): `http://localhost:3000/api/reference`
- API reference (back-office): `http://localhost:3000/api/admin/reference`
- Health: `GET /api/health` (readiness, checks the database) and `GET /api/health/live` (liveness)

Pending migrations run on startup (`DATABASE_RUN_MIGRATIONS=true`), and the super admin is created from the
`SYSADMIN_*` variables on first boot.

## Scripts

| Script                                    | What it does                                                    |
| ----------------------------------------- | --------------------------------------------------------------- |
| `pnpm start:dev`                          | Run in watch mode                                               |
| `pnpm build` / `pnpm start:prod`          | Compile to `dist/` / run the compiled app                       |
| `pnpm test`                               | Unit tests (`test/unit`), no database needed                    |
| `pnpm test:e2e`                           | E2E tests (`test/e2e`) against a fresh `shopcash_test` database |
| `pnpm lint` / `pnpm format`               | oxlint (type-aware) / prettier                                  |
| `pnpm typecheck`                          | `tsc --noEmit` over `src` and `test`                            |
| `pnpm migration:generate <path/Name>`     | Diff entities vs. database and write a migration                |
| `pnpm migration:create <path/Name>`       | Write an empty migration                                        |
| `pnpm migration:run` / `migration:revert` | Apply / undo migrations                                         |

Migrations live in `src/shared/infra/database/migrations`, e.g.
`pnpm migration:generate src/shared/infra/database/migrations/AddOrders`.

`docker compose --profile app up --build` runs the API in a container next to the database.

## Project structure

```
src/
  main.ts, app.module.ts      bootstrap and root module
  configure-app.ts            HTTP setup (prefix, CORS, helmet, proxy), shared with e2e tests
  api-reference.ts            public and admin API references (Scalar)
  env.ts                      typed environment variables (validated on startup)
  shared/                     building blocks, no feature code
    application/              UseCase, UnitOfWork, EventDispatcher, Mailer
    domain/                   DomainEntity, AggregateRoot, DomainEvent, Repository, exceptions, Password
    infra/                    database, events, mail, health, exception filter, guards helpers
  platform/                   public API (PlatformModule)
    users/                    sign up, sign in, sessions, password reset/change
    api-keys/                 API key authentication for external systems
  admin/                      back-office API (AdminModule)
    auth/                     admin users, roles, sign in, super admin seed
    api-keys/                 API key management
test/
  unit/, e2e/, helpers/
```

Each feature module follows the same layers:

```
<feature>/
  domain/          entities, events, exceptions, repository interfaces — plain TypeScript, no framework
  application/     use cases and service interfaces (ports)
  infra/
    database/      TypeORM entities and repository implementations
    http/          controllers, DTOs (Zod), guards, decorators
    services/      Nest services wiring use cases to transactions and repositories
  <feature>.module.ts
```

Path aliases: `@/*` → `src/*`, `@shared/*`, `@platform/*`, `@admin/*`. The project is ESM, so imports end in `.js`
(e.g. `import { UseCase } from '@shared/application/usecase.js'`).

## Adding a feature

1. Create `src/platform/<feature>` (or `src/admin/<feature>`) with the layers above.
2. Domain entities extend `AggregateRoot`/`DomainEntity` (UUID v7 ids) and throw exceptions extending the
   `Abstract*Exception` classes, which the exception filter maps to HTTP status codes.
3. Register the TypeORM entities in `src/shared/infra/database/entities.ts`, then generate a migration.
4. In the infra service, run each use case inside `TypeOrmUnitOfWork.execute(manager => ...)`, building the
   repositories from `manager` so they share the transaction.
5. Import the module in `PlatformModule` or `AdminModule`. That also places it in the right API reference.

Use cases receive their dependencies through the constructor, so they are unit-tested with in-memory
repositories (see `test/helpers`).

## Authentication

| Who              | How                                    | Guard / decorators                                               |
| ---------------- | -------------------------------------- | ---------------------------------------------------------------- |
| Platform users   | `Authorization: Bearer <access token>` | `@UseGuards(AuthGuard)`, `@Public()`, `@CurrentUser()`           |
| Admins           | `Authorization: Bearer <admin token>`  | `@UseGuards(AdminAuthGuard)`, `@AdminRoles()`, `@CurrentAdmin()` |
| External systems | `x-api-key: <key>`                     | `@UseGuards(ApiKeyGuard)` (import `ApiKeysModule`)               |

- User and admin tokens are signed for different audiences: a user token is rejected on admin routes and vice versa.
- Access tokens are short-lived. Refresh tokens are rotated on every use, revoked on sign out and on password reset,
  and stored hashed. Reset tokens and API keys are also stored hashed.
- Passwords are hashed with scrypt (async, off the event loop). The policy lives in `DefaultPasswordPolicyValidator`.
- Sign in, sign up and password endpoints are rate limited to 5 requests/minute per IP; everything else to
  `RATE_LIMIT_PER_MINUTE`. Set `TRUST_PROXY=true` behind a reverse proxy.
- `ConsoleMailer` logs e-mails (e.g. password reset tokens) instead of sending them. Replace it in
  `src/shared/infra/mail/mail.module.ts` with a real provider before production.

## Errors

Every error response has the same shape:

```json
{
  "statusCode": 409,
  "message": "Conflict",
  "errorCode": "USER_ALREADY_EXISTS",
  "detail": "User with email already exists",
  "context": { "email": "john@example.com" }
}
```

`errorCode` is stable and meant for clients; `context` carries data to build a message. Validation errors
(`VALIDATION_ERROR`) list the failing fields in `detail`. Unexpected errors return 500 without internal details and
are logged.

## Environment

See `.env.example`. Required: `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `TOKEN_SECRET`
(at least 32 characters). The app refuses to start when a variable is missing or invalid.
