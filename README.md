# Blusalt Drone Dispatch Controller (Node.js + TypeScript)

REST API service for managing a fleet of medication-delivery drones. Implements the requirements with a focus on validation, state management, audit logging, and operational readiness.

## Architecture Pattern (Layered/Hexagonal-Inspired)

This codebase follows a **layered architecture** with clear boundaries between HTTP, business logic, and persistence. It’s also **hexagonal-inspired** in the sense that core rules live in services, while adapters (Express controllers, Sequelize repositories, background jobs) sit at the edges.

Benefits:
- **Predictable boundaries**: changes in HTTP or database layers don’t leak into business rules.
- **Testability**: services can be unit-tested with mocked repositories/adapters.
- **Maintainability**: controllers stay thin, services hold the rules, repositories handle data access.
- **Extensibility**: swap SQLite for Postgres or add new transports without rewriting core logic.
- **Microservice-ready**: the domain logic is isolated enough to extract into a standalone service with minimal refactoring.

## What This Service Does

- Register drones with strict validation and fleet size limits
- Load drones with medication items while enforcing weight and battery rules
- Inspect loaded medications for a given drone
- List drones available for loading with optional filters
- Check drone battery level
- Run a periodic battery audit job and persist audit history
- Provide Swagger API documentation at `/api/v1/docs`


## Tech Stack

- Node.js 18+, TypeScript
- Express + Helmet + HPP + CORS
- Sequelize ORM + SQLite (local)
- Zod for request validation
- Swagger (OpenAPI) docs
- BullMQ + Redis (optional) with node-cron fallback
- Winston logging, rate limiting, request logging

## Architecture Overview

High-level flow:

```
HTTP -> Express -> Route -> Controller -> Service -> Repository -> Sequelize (SQLite)
                                      |-> EventBus -> Audit Service -> AuditRepository
```

Key layers:
- **Routes**: define REST endpoints and attach request validators.
- **Controllers**: HTTP concerns (parsing inputs, returning responses).
- **Services**: business rules (state transitions, battery rules, weight limits).
- **Repositories**: persistence operations with Sequelize.
- **Audit**: periodic battery checks + event-driven audit log.

## Data Model

### Drone
- `serialNumber` (max 100 chars, unique)
- `model` (Lightweight | Middleweight | Cruiserweight | Heavyweight)
- `weightLimit` (max 500g)
- `batteryCapacity` (0-100)
- `state` (IDLE | LOADING | LOADED | DELIVERING | DELIVERED | RETURNING)

### Medication
- `name` (letters/numbers/`-`/`_` only)
- `weight`
- `code` (uppercase letters/`_`/numbers only)
- `image` (URL string, optional)

### Drone Load (join)
Many-to-many relation between drones and medications.

### Audit Log
Stores battery audit entries (drone state + battery capacity snapshot).

## Validation Rules (Business + Input)

Business rules enforced in `DroneService`:
- Fleet size is capped at 10 drones.
- Loading is allowed only in IDLE/LOADING state.
- Battery must be **>= 25%** to enter LOADING or load medications.
- Total medication weight (current + new) must not exceed drone `weightLimit`.

Input validation enforced via Zod:
- Drone registration enforces required fields + max length/limits.
- Medication validation enforces regex for name/code and positive weight.

## Background Jobs (Battery Audit)

- **Preferred**: BullMQ with Redis for scheduled jobs
- **Fallback**: `node-cron` if Redis is unavailable
- Logs audit entries periodically (`BATTERY_CHECK_CRON`, default: every minute)

## Local Development

### Prerequisites
- Node.js >= 18
- npm >= 9
- Redis is optional (the app runs without it)

### Quick Start

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

Server will start at `http://localhost:3000`.

### Bootstrap Script

A convenience script exists at `scripts/bootstrap.sh`:

```bash
./scripts/bootstrap.sh
```

It will:
- ensure `node`/`npm` exist
- create `.env` if missing
- install dependencies
- seed the database if needed
- start the dev server

### Run Without Redis

```bash
REDIS_ENABLED=false npm run dev
```

### Run With Redis

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

## Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

Tests use an **in-memory SQLite** database and mock Redis/BullMQ; no external services are required.

## API Reference (Core Endpoints)

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/drones` | Register a drone |
| POST | `/drones/:droneId/load` | Load medications into a drone |
| GET | `/drones/:droneId/medications` | Get loaded medications |
| GET | `/drones/available` | List drones available for loading |
| GET | `/drones/:droneId/battery` | Check battery level |
| POST | `/medications` | Create medication |
| GET | `/medications` | List medications |
| GET | `/medications/:id` | Get medication by ID |

### Swagger Docs

Interactive docs at: `http://localhost:3000/api/v1/docs`

### Example Requests (cURL)

Register a drone:

```bash
curl -X POST http://localhost:3000/api/v1/drones \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "DRN-NEW-001",
    "model": "Lightweight",
    "weightLimit": 200,
    "batteryCapacity": 100
  }'
```

Load a drone with medications:

```bash
curl -X POST http://localhost:3000/api/v1/drones/1/load \
  -H "Content-Type: application/json" \
  -d '{ "medicationIds": [1, 2] }'
```

Check loaded medications:

```bash
curl http://localhost:3000/api/v1/drones/1/medications
```

List available drones:

```bash
curl "http://localhost:3000/api/v1/drones/available?minBattery=25&limit=5"
```

Check battery level:

```bash
curl http://localhost:3000/api/v1/drones/1/battery
```

Create a medication:

```bash
curl -X POST http://localhost:3000/api/v1/medications \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vitamin-C-1000",
    "weight": 80,
    "code": "VIT_C_1000",
    "image": "https://example.com/vitamin-c.png"
  }'
```

List medications (with filters):

```bash
curl "http://localhost:3000/api/v1/medications?search=vitamin&minWeight=50&maxWeight=200"
```

## Preloaded Seed Data

The seed script creates:
- **10 drones** (all models, various battery levels)
- **10 medications** (valid names/codes/weights)

Seed files:
- `src/seeds/drones.seed.ts`
- `src/seeds/medications.seed.ts`

## Configuration (Environment Variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `DB_DIALECT` | `sqlite` | Database dialect (`sqlite` or `postgres`) |
| `DB_STORAGE` | `./database.sqlite` | SQLite file path |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `drones` | PostgreSQL database name |
| `DB_USER` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | `password` | PostgreSQL password |
| `REDIS_ENABLED` | `true` | Set to `false` to disable Redis |
| `REDIS_HOST` | `127.0.0.1` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | _(empty)_ | Redis password |
| `REDIS_DB` | `0` | Redis database number |
| `REDIS_TLS` | `false` | Enable TLS for Redis |
| `QUEUE_PREFIX` | `drone-dispatch` | BullMQ queue prefix |
| `BATTERY_CHECK_CRON` | `*/1 * * * *` | Battery audit schedule |
| `UPLOAD_DIR` | `./src/uploads` | Medication image upload directory |
| `MAX_FILE_SIZE` | `5242880` | Max upload size (bytes) |
| `LOG_LEVEL` | `info` | Log level |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

## Notes on Constraints vs Challenge

- **Max weight**: enforced via model + service checks (`weightLimit <= 500` and total loaded weight per drone).
- **Battery minimum**: enforced for loading and for state transition to LOADING (>= 25%).
- **Audit trail**: created from periodic battery checks (BullMQ or node-cron fallback).
- **JSON I/O**: all endpoints consume/return JSON; image path is stored as string (URL).

## Project Structure

```
src/
├── modules/
│   ├── drone/
│   ├── medication/
│   └── audit/
├── seeds/
├── shared/
│   ├── cache/
│   ├── database/
│   ├── docs/
│   ├── errors/
│   ├── eventBus/
│   ├── middleware/
│   ├── queue/
│   ├── redis/
│   └── utils/
├── app.ts
└── server.ts
```

## Assumptions

- Medication `image` is stored as a string URL in the DB.
- When Redis is unavailable, auditing still runs (via `node-cron`).
- The app targets a default local SQLite DB for ease of evaluation.

## Design Decisions

- **SQLite by default**: keeps the app runnable locally with zero external DB setup; Postgres is supported via env vars.
- **Service/repository split**: isolates business rules (battery/weight/state) from persistence logic for easier testing.
- **Event-driven audit**: drone events feed an audit service; periodic battery audits create historical logs.
- **Redis optional**: BullMQ provides reliable scheduling when Redis is present; `node-cron` ensures audits still run without it.
- **Strict validation**: Zod schemas enforce the challenge’s name/code constraints and numeric limits early in the request lifecycle.
