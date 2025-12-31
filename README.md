
# AdonisJS Starter Kit

Full-stack, opinionated starter kit that brings together AdonisJS 7 (beta) and React with TanStack Router in a monorepo, designed to quickly bootstrap new projects and experiment with ideas. Shared as-is : some parts reflect my personal workflow and preferences.

## What's inside?

- AdonisJS 7
- React + TanStack Router & Query
- Tuyau for type-safe API calls + @tuyau/react-query for React Query integration
- Tailwind CSS & Shadcn UI
- PostgreSQL 18
- Turborepo & PNPM for monorepo management
- Oxlint & Oxformat for fast linting/formatting
- Module-based folder structure

## Getting started

### Installation

1. Clone the repo:
	```bash
	git clone <repository-url>
	cd adonis-starter-kit
	```
2. Install dependencies:
	```bash
	pnpm install
	```
3. Start the database:
	```bash
	docker compose up -d
	```
4. Run migrations:
	```bash
	cd apps/api
	node ace migration:run
	```
5. Start the dev servers:
	```bash
	pnpm dev
	```

The API will be running at `http://localhost:3333` and the frontend at `http://localhost:5173`.

## Project structure

```
apps/
  api/   # AdonisJS backend
  app/   # React frontend
compose.yaml
turbo.json
pnpm-workspace.yaml
```

## Useful scripts

- `pnpm dev` – start everything in dev mode
- `pnpm build` – build both front and back
- `pnpm lint` – lint the whole project
- `pnpm format` – format code with Oxformat

---

Feel free to fork, get inspired, or contribute if you want! 

MIT License
