# Project Rules

## Stack

- Backend: FastAPI + SQLAlchemy + SQLite
- Frontend: Vite + React + TypeScript + Tailwind

## Backend rules

- Always use `Depends(get_db)` for database sessions
- Always return 404 with a clear message if resource not found
- Use SQLAlchemy ORM, never raw SQL queries
- IDs are generated with `uuid.uuid4().hex`
- Follow existing router and schema patterns in the project

## Frontend rules

- All API calls go through `src/services/api.ts`
- Use TypeScript types for all API responses
- Components go in `src/components/`
- Pages go in `src/pages/`

## Git rules

- Commits in English
- Use conventional commits: feat:, fix:, refactor:, chore:
