# Smart Expense Tracker

Full-stack personal finance tracker built with:

- `server`: Node.js + Express + MongoDB + Mongoose + Zod + JWT auth
- `client`: React + Vite + TypeScript + Axios

The repository uses npm workspaces with separate `client` and `server` apps.

## Project Structure

- `client/` - React + Vite frontend
- `server/` - Express API (routes/services/repositories)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:
   - Copy `server/.env.example` to `server/.env`
   - Copy `client/.env.example` to `client/.env`

3. Run the backend:

```bash
npm run dev:server
```

4. In a second terminal, run the frontend:

```bash
npm run dev:client
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:4000`.

## Environment Variables

### Server (`server/.env`)

- `PORT` - API port (default `4000`)
- `CLIENT_ORIGIN` - frontend origin for CORS
- `MONGODB_URI` - MongoDB connection string (required)
- `JWT_SECRET` - JWT signing secret (required)
- `JWT_EXPIRES_IN` - token lifetime (default `7d`)

### Client (`client/.env`)

- `VITE_API_URL` - API base URL (default `http://localhost:4000/api`)

## Seed Script

Seed default categories:

```bash
npm run seed:categories
```

This command inserts default categories only when the category collection is empty.

## Design Decisions

- Layered backend architecture: routes -> services -> repositories
- Cookie-based JWT auth (`httpOnly`) and request-level auth middleware
- Zod request validation with consistent API error shape
- Dashboard summary uses grouped aggregation in repository layer
- Budgets are persisted on the server (not localStorage)

## API Highlights

- Auth: signup, login, logout, me
- Transactions: CRUD + filtering + pagination
- Categories: authenticated list
- Dashboard: summary and chart endpoints
- Profile: get/update profile, change password, delete account
- Budgets: get/upsert monthly budgets

## Figma

- Add your Figma file link here before submission.

## Known Limitations

- Automated tests are not included yet.
- No refresh-token rotation yet.
- Basic rate limiting is only applied to auth endpoints.
