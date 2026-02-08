# Blusalt Drone Dispatch Controller

REST API service for managing a fleet of medication-delivery drones. Built with **Node.js**, **TypeScript**, **Express**, **Sequelize** (SQLite), and optionally **Redis** + **BullMQ**.

## Features

- Register drones (fleet limit: 10)
- Load drones with medication items (weight and battery validations)
- Check loaded medications for a given drone
- Check available drones for loading
- Check drone battery level
- Periodic battery audit with history/event log
- Swagger API documentation at `/api/v1/docs`

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Redis** (optional) — for caching and BullMQ job queues. The app runs fully without Redis using in-process `node-cron` as a fallback for the battery audit job, and caching is simply skipped.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config
cp .env.example .env

# 3. Seed the database (creates SQLite file with 10 drones + 10 medications)
npm run seed

# 4. Start the development server
npm run dev
```

The server starts at **http://localhost:3000**.

### Running Without Redis

No extra configuration needed. If Redis is not running, the app automatically:
- Falls back to `node-cron` for the periodic battery audit job
- Skips response caching (requests go directly to the database)

To explicitly disable Redis (suppress connection retry logs):

```bash
REDIS_ENABLED=false npm run dev
```

Or set `REDIS_ENABLED=false` in your `.env` file.

### Running With Redis

If you have Redis available (e.g. via Docker):

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

The app will auto-detect the connection and use BullMQ for the battery audit job and Redis for response caching.

## Build & Run (Production)

```bash
npm run build
npm start
```

## Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Tests use an **in-memory SQLite** database and mocked Redis/BullMQ — no external services required.

## API Endpoints

All endpoints are prefixed with `/api/v1`. Input and output are JSON.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/drones` | Register a new drone |
| `POST` | `/drones/:droneId/load` | Load a drone with medications |
| `GET` | `/drones/:droneId/medications` | Get loaded medications for a drone |
| `GET` | `/drones/available` | List drones available for loading |
| `GET` | `/drones/:droneId/battery` | Check drone battery level |
| `POST` | `/medications` | Create a medication (supports image upload) |
| `GET` | `/medications` | List all medications |
| `GET` | `/medications/:id` | Get a medication by ID |

### Register a Drone

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

### Load a Drone

```bash
curl -X POST http://localhost:3000/api/v1/drones/1/load \
  -H "Content-Type: application/json" \
  -d '{ "medicationIds": [1, 2] }'
```

### Check Available Drones

```bash
curl http://localhost:3000/api/v1/drones/available
```

### Check Battery Level

```bash
curl http://localhost:3000/api/v1/drones/1/battery
```

### Interactive Documentation

Full Swagger docs are available at: **http://localhost:3000/api/v1/docs**

## Business Rules

- **Weight limit**: A drone cannot be loaded with more weight than its `weightLimit` (max 500g)
- **Battery threshold**: A drone cannot enter LOADING state if battery is below **25%**
- **Fleet size**: Maximum of 10 drones can be registered
- **State machine**: Drones follow strict state transitions: `IDLE → LOADING → LOADED → DELIVERING → DELIVERED → RETURNING → IDLE`
- **Battery audit**: A periodic job checks all drone battery levels every minute and logs the results to the audit trail

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `DB_DIALECT` | `sqlite` | Database dialect (`sqlite` or `postgres`) |
| `DB_STORAGE` | `./database.sqlite` | SQLite file path |
| `DB_HOST` | `localhost` | PostgreSQL host (if using postgres) |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `drones` | PostgreSQL database name |
| `DB_USER` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | `password` | PostgreSQL password |
| `REDIS_ENABLED` | `true` | Set to `false` to disable Redis entirely |
| `REDIS_HOST` | `127.0.0.1` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | _(empty)_ | Redis password |
| `REDIS_DB` | `0` | Redis database number |
| `REDIS_TLS` | `false` | Enable TLS for Redis |
| `QUEUE_PREFIX` | `drone-dispatch` | BullMQ queue prefix |
| `BATTERY_CHECK_CRON` | `*/1 * * * *` | Cron schedule for battery audit |
| `UPLOAD_DIR` | `./src/uploads` | Medication image upload directory |
| `MAX_FILE_SIZE` | `5242880` | Max upload file size in bytes (5MB) |
| `LOG_LEVEL` | `info` | Logging level |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per rate limit window |

## Project Structure

```
src/
├── modules/
│   ├── drone/          # Drone registration, loading, state management
│   ├── medication/     # Medication CRUD and image upload
│   └── audit/          # Battery audit job, event logging, subscribers
├── seeds/              # Seed data (10 drones, 10 medications)
├── shared/
│   ├── database/       # Sequelize connection and sync
│   ├── redis/          # Redis connection (optional)
│   ├── queue/          # BullMQ queue and workers (optional)
│   ├── cache/          # Response caching layer
│   ├── middleware/      # Validation, error handling, rate limiting, logging
│   ├── errors/         # Custom error classes
│   ├── eventBus/       # Event emitter for audit trail
│   ├── docs/           # Swagger/OpenAPI configuration
│   └── utils/          # Constants, logger, response helpers
├── app.ts              # Express app setup
└── server.ts           # Bootstrap and server start
tests/
├── integration/        # Integration tests
└── helpers/            # Test utilities
```

## Preloaded Data

The database is seeded with **10 drones** across all model types and **10 medications**:

**Drones:**

| Serial Number | Model | Weight Limit | Battery |
|---------------|-------|-------------|---------|
| DRN-LW-001 | Lightweight | 150g | 100% |
| DRN-LW-002 | Lightweight | 200g | 85% |
| DRN-MW-001 | Middleweight | 300g | 70% |
| DRN-MW-002 | Middleweight | 350g | 50% |
| DRN-CW-001 | Cruiserweight | 400g | 90% |
| DRN-CW-002 | Cruiserweight | 420g | 15% |
| DRN-HW-001 | Heavyweight | 500g | 100% |
| DRN-HW-002 | Heavyweight | 500g | 60% |
| DRN-HW-003 | Heavyweight | 480g | 30% |
| DRN-LW-003 | Lightweight | 180g | 20% |

**Medications:**

| Name | Weight | Code |
|------|--------|------|
| Aspirin-100mg | 50g | ASP_100 |
| Ibuprofen-200mg | 75g | IBU_200 |
| Paracetamol-500mg | 100g | PAR_500 |
| Amoxicillin-250mg | 120g | AMX_250 |
| Morphine-10mg | 30g | MRP_10 |
| Insulin-Pen | 200g | INS_PEN |
| Epinephrine-Auto | 150g | EPI_AUTO |
| Vaccine-CovidBooster | 80g | VAC_COVID |
| Antibiotic-Cream | 45g | ANT_CRM |
| Bandage-Kit | 250g | BDG_KIT |

## Indexing Recommendations

For scalable search and filtering, consider these indexes:

- `drones`: index on `state`, `batteryCapacity`, and `serialNumber` (for availability and search)
- `medications`: index on `name`, `code`, and `weight` (for search and weight filters)
- `audit_logs`: index on `droneId, createdAt` and on `eventType`
