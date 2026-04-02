# Local Development Setup

This guide covers running the full development environment locally using Docker for the PostgreSQL database.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js 20+ and npm
- Git

## Quick Start

### 1. Copy environment variables

```bash
cp .env.example .env
```

The `.env` file is pre-configured for local Docker development — no changes needed for a basic setup.

### 2. Start the database

```bash
docker-compose up -d
```

This starts a PostgreSQL 16 container at `localhost:5432`. Data persists in a named Docker volume (`postgres_data`) across restarts.

Verify the container is healthy:

```bash
docker-compose ps
```

### 3. Apply schema migrations

```bash
npx prisma migrate dev --name init
```

This creates all database tables defined in `prisma/schema.prisma` and runs the seed script automatically.

### 4. Seed initial data (if not auto-seeded)

```bash
npm run db:seed
```

The seed script is idempotent — safe to run multiple times without creating duplicate records.

### 5. Start the app

```bash
npm run dev
```

The app is now running at [http://localhost:3000](http://localhost:3000) connected to your local Docker database.

---

## Database Connection

| Setting        | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| Host           | `localhost`                                                  |
| Port           | `5432`                                                       |
| User           | `postgres`                                                   |
| Password       | `postgres`                                                   |
| Database       | `template_dev`                                               |
| Connection URL | `postgresql://postgres:postgres@localhost:5432/template_dev` |

---

## Stopping and Restarting

```bash
# Stop the database (data is preserved in named volume)
docker-compose down

# Start again
docker-compose up -d

# Stop AND delete all data (full reset)
docker-compose down -v
```

---

## Troubleshooting

### Port 5432 already in use

Another PostgreSQL instance is running locally. Either stop it or change the host port in `docker-compose.yml`:

```yaml
ports:
  - '5433:5432' # use 5433 on your machine instead
```

Then update `DATABASE_URL` in your `.env` to use port `5433`.

### Connection refused

The container may still be starting. Check its health:

```bash
docker-compose ps
```

Wait until the `db` service shows `healthy`, then retry.

### Schema out of sync after pulling changes

```bash
npx prisma migrate dev
```

Prisma detects any new migration files and applies them automatically.

### Full database reset

```bash
npx prisma migrate reset
```

This drops all data, re-applies all migrations, and runs the seed script. Use only in development.

---

## Related Guides

- [Database Migrations](./database-migrations.md) — how to create, apply, and roll back schema changes
