Backend setup

1. Install dependencies

```bash
cd backend
npm install
```

2. Create MySQL database and tables

- Import `db_schema.sql` into your MySQL server (or run the statements in your SQL client).
- Update `backend/.env` with your MySQL credentials:
  - `DB_HOST`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`

3. Start server

```bash
npm start
```

Server listens on port 8000 (see `server.js`).

Notes:
- The project uses MySQL via `configer/db.js`.
- There are modular controllers and routes in `controllers/` and `routes/` if you want to refactor `server.js` to use them.
