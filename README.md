# Document Tracking System
## Environment

Create a `.env` file for the backend with these variables (example):

```
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=some-strong-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CLIENT_ORIGIN=http://localhost:5174
```

The `ADMIN_USERNAME` and `ADMIN_PASSWORD` will be used to create an admin user when the server starts (only if it doesn't exist). Make sure you change the password for production and secure your `.env` file.

## Improvements added

- Admin creation at backend startup using env vars.
- CORS added and Vite server proxy set up (frontend dev server proxies `/api` to backend).
- Better frontend authentication flow: `AuthState` auto-loads user if a token exists in `localStorage`.
- User-friendly UI improvements: animated alerts, responsive header, modern card components, hover and loading effects, skeleton loaders and spinner.
- Document owner `populate` in backend responses (owner username included in document responses).

## User Roles & Admin creation

- The system includes multiple roles for users: `user`, `employee`, `manager`, `ceo`, `admin`, `technical-admin`.
- NOTE: The `POST /api/auth/register` endpoint is now restricted to Admin and Technical Admin (no public user registration by default). Use `POST /api/auth/create` for creating other users if you have the appropriate role.
- Admin users can create accounts with specific roles using the `POST /api/auth/create` endpoint (protected).
    - `technical-admin` can create all roles including other admins and technical-admins.
    - `admin` can create `manager`, `ceo`, `employee`, and `user` roles.
    - `manager`, `ceo`, and `hr` can create `employee` and `user` roles.
    - `user` cannot create other accounts.

The frontend includes an admin-only form in the Dashboard that shows only the roles the current admin can create.

## Frontend UI additions (how to use)

- The header automatically adapts to mobile screens and includes a responsive menu.
- Documents grid uses animated cards and shows a skeleton while loading.
- Alerts are animated and will auto-hide. You can still use `setAlert` from the `AlertContext` to show messages from anywhere.

## Next steps & suggestions

- For production, use a secure secret manager for `JWT_SECRET` and admin credentials; don't store them in files in source control.
- Implement refresh tokens, rate limiting, and tests (backend & frontend).
    - Rate limiting and lock-out: endpoints /auth/login has a simple rate-limiter (IP based) and user accounts will be locked after several failed attempts for a short window. Adjust these settings for production.
    - Password reset flow: a minimal reset token flow was implemented so you can request a reset token and then reset using the token. The token is returned in the response for development; hook this up to a mailer in production.
- Add CI with lint & unit tests.

## Security & Rate Limiting

- The project includes a simple IP-based rate limit on `/api/auth/login` (default: 10 attempts / 10 minutes per IP) to mitigate brute-force attacks. Review and tune values for production.
- Accounts get locked after repeated failed login attempts and `lockUntil` indicates when the account will be unlocked. This prevents repeated attempts even from multiple IPs if attacker manages to use valid usernames; choose sensible thresholds for your application.
A full-stack web application that lets users upload, manage, and track documents with version history and role-based access controls.

## Key Features
- **Document Management:** Create, read, update, delete (CRUD) documents with version control.
- **Advanced Search:** Full-text search and filtering by status, tags, and date ranges.
- **Approval Workflows:** Structured lifecycle (Draft -> Pending Approval -> Approved/Rejected).
- **Activity Logs:** Comprehensive system-wide audit logging for Admins.
- **Reporting:** Custom CSV report generation and export.
- **Comments & Collaboration:** Discuss documents directly on the page.
- **Bulk Actions:** Delete, Close, Assign, or Tag multiple documents at once.
- **Role-Based Access Control:** Granular permissions for Admins, Managers, and Viewers.
-   **Version Control:** Automatically track and view document revisions and history.
-   **Search & Filter:** Find documents by title, content, tags, or metadata.
-   **Responsive UI:** Built with Tailwind CSS for a modern, responsive user interface.
-   **User-Friendly Notifications:** An alert system provides clear feedback for user actions.

## Tech Stack

-   **Frontend:** React (Vite), Tailwind CSS
-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB (e.g., MongoDB Atlas)
-   **Input Validation:** express-validator

## Folder Structure

```
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── ...
│   └── ...
└── backend/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── app.js
```

## Prerequisites

-   Node.js (v14+ recommended)
-   npm or yarn
-   A MongoDB database (local or a free cluster on MongoDB Atlas)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>
    ```

2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Install frontend dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
# backend/.env
PORT=5000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret_key>
```

Create a `.env` file in the `frontend` directory:

```
# frontend/.env
VITE_API_URL=http://localhost:5000
```

## API Overview

The backend exposes a RESTful API under `/api`. Key endpoints include:

| Endpoint             | Method | Description                  |
| -------------------- | ------ | ---------------------------- |
| `/api/auth/register` | POST   | Register a new user          |
| `/api/auth/login`    | POST   | Log in and obtain a JWT      |
| `/api/documents`     | GET    | Get a list of documents      |
| `/api/documents`     | POST   | Create a new document        |
| `/api/documents/:id` | GET    | Get a document by ID         |
| `/api/documents/:id` | PUT    | Update a document by ID      |
| `/api/documents/:id` | DELETE | Delete a document by ID      |

## Running Locally

To run the app in development mode, you will need two terminals.

1.  **Start the Backend:**
    In the `backend/` directory, run:
    ```bash
    npm run dev
    ```
If you don't have a MongoDB connection or want to run the backend without database access (e.g., front-end development or tests that don't require DB), you can set `SKIP_DB=true`:

```powershell
set SKIP_DB=true
npm run dev
```
When `SKIP_DB` is set the backend will start without connecting to MongoDB; some features will be disabled (e.g., admin creation, data queries).

2.  **Start the Frontend:**
    In the `frontend/` directory, run:
    ```bash
    npm run dev
    ```

The frontend will be available at `http://localhost:5173` (or the next available port), and the backend will be at `http://localhost:5000`.

### Troubleshooting: Login stuck on "Signing in..."

- If you see the login spinner but nothing happens, open your browser DevTools and inspect Network tab for POST `/api/auth/login` and GET `/api/auth`.
- If the login call returns 500:
    - Confirm `JWT_SECRET` is set in `backend/.env` and the backend was restarted after setting it.
    - Check server logs for warnings about missing `JWT_SECRET` or stack traces.
- If login call returns a token but `GET /api/auth` returns 401/403:
    - The token may not be set in axios headers; the frontend sets `x-auth-token` from `localStorage` after login. Confirm `localStorage` has `token`.
    - Ensure the backend and frontend are using the same JWT secret for sign/verify.
- If the login call receives a 400 (invalid credentials): confirm the admin user exists. The server will attempt to create an admin from `ADMIN_USERNAME`/`ADMIN_PASSWORD` env variables on startup. Check backend logs to confirm admin creation.
- If account is locked, the server will respond with 403 and a message including lock expiration time. Reset `failedLoginAttempts` if necessary in the database or wait for lockUntil to expire.

## Database connectivity check (quick test)

If the backend cannot connect to MongoDB (e.g., `ENODATA` or `MongoNetworkError`), use this quick test locally to diagnose the problem.

1) Add `MONGODB_URI` to `backend/.env` or pass connection string as an argument:
```powershell
cd backend
set MONGODB_URI="mongodb+srv://user:pass@cluster-host/my-db"
npm run test-db-connect
```

or:
```powershell
cd backend
npm run test-db-connect "mongodb+srv://user:pass@cluster-host/my-db"
```

2) Script output helps identify common errors:
    - `MongoParseError`: connection string format is invalid (percent-encode special characters in the password)
    - `ENOTFOUND`: DNS lookup failed (check Atlas cluster host name)
    - `MongoNetworkError`: network problem (check Atlas IP whitelist / network settings)
    - Authenticaton errors indicate wrong username/password

3) When testing with Atlas:
    - Ensure the Atlas cluster host is correct in the URI
    - Confirm Atlas cluster is running
    - Add the IP where the request originates (or 0.0.0.0/0 for dev) in Atlas Network Access

4) If you prefer not to use Atlas during frontend dev, you can run a local Mongo instance:
```powershell
docker run -d --name dt-mongo -p 27017:27017 mongo:6.0
set MONGODB_URI="mongodb://localhost:27017/docs-tracker"
npm run dev
```

## Health endpoint and runtime checks

- The backend exposes a simple non-DB health check at `/health` that you can use to verify the server is up:

```
GET https://your-backend-vercel-url.vercel.app/health

Response:
{
    "status": "ok",
    "time": "2025-12-08T..."
}
```

- Use this to confirm the Vercel function is reachable (build succeeded) while DB issues may still prevent other API endpoints from working.

- To check runtime logs in Vercel:
    1. In Vercel project, go to your deployment
    2. Click the "Runtime Logs" tab
    3. Look for errors relating to `MONGODB`, `ENODATA`, `MongoNetworkError`, or `Authentication failed`.



## Vercel Deployment - Peer dependency issue & workaround

    - Short-term (quick fix): Add a `.npmrc` with `legacy-peer-deps=true` to the frontend project (or repo root). This will allow `npm` to install dependencies without failing on strict peer dependency conflicts. This repo contains such `.npmrc` files.
    - Long-term (recommended): Update libraries and dev dependencies to versions compatible with React 19 (or pin `react` and `react-dom` to React 18 if libraries are not yet ready). Updating `@testing-library/react` or similar libraries may fix the conflicts.
        - Long-term (recommended): Update libraries and dev dependencies to versions compatible with React 19 (e.g., testing-library, other libraries). The changes above attempt this by bumping `@testing-library/react` and `@testing-library/jest-dom` to versions that are expected to support React 19.
    - Another CLI workaround for CI is to use `npm install --legacy-peer-deps` if you do not want to use `.npmrc`.

Make sure to configure required Vercel environment variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`.

### Vercel deployment (monorepo)

This repo includes a monorepo setup with `frontend` and `backend` folders. The `api` folder at the root contains a serverless entrypoint that exports the Express app from `backend/app.js` so Vercel can run it as a serverless function.

1) Create a new Vercel project from this Git repository.
2) In Vercel project Settings > Environment Variables, add the following (Production/Staging as necessary):
    - `MONGODB_URI` (MongoDB Atlas URI)
    - `JWT_SECRET` (JWT secret)
    - `ADMIN_USERNAME`, `ADMIN_PASSWORD` (optional for seeding the admin user)
    - `CLIENT_ORIGIN` (frontend origin for CORS)
3) You can use `SKIP_DB` to opt-out of DB access for a deployment (for testing only). DO NOT use `SKIP_DB=true` in production.
4) The repo includes a `vercel.json` configuration which instructs Vercel to use `@vercel/static-build` for the `frontend` and `@vercel/node` for the `api` serverless functions, and to route `/api/*` requests to the serverless function.

Note: Vercel uses serverless functions; each request may run in a cold container, so we've added a guard to reuse Mongoose connection state where possible (`mongoose.connection.readyState`) and to avoid blocking `app.listen()` in serverless environments. Ensure `MONGODB_URI` points to a stable Atlas cluster that allows the Vercel lambda space to connect (add IP 0.0.0.0/0 in Atlas Network Access or set a VPC peering if needed for security).


## End-to-end & Unit Testing

You can run the test suites using the following commands (ensure the dev servers are running where needed):

Frontend E2E (Cypress):
```powershell
cd frontend
npm install
npm run cypress:open     # interactive
npm run cypress:run      # headless
```

Frontend Unit Tests (Jest):
```powershell
cd frontend
npm install
npm run test
```

Set the following environment variables for the admin user used by tests:
```powershell
set ADMIN_USERNAME=admin
set ADMIN_PASSWORD=password
set CYPRESS_BASE_URL=http://localhost:5173
```

## Useful API endpoints & debugging

- `/api/health` — a small health endpoint to verify the API is up (if you add one, useful for CI checks).
- `/api/auditlogs?targetId=<id>` — returns audit logs for a resource; requires authentication.
- `/api/auth/password-reset` — request a password reset token for development (returns token in response). For production, configure an email service and don't return tokens in responses.

### Database / Admin seeding
- If you didn't set `ADMIN_USERNAME`/`ADMIN_PASSWORD`, create an admin user manually using `POST /api/auth/create` by an existing admin or technical-admin. If there's no admin user you can temporarily set env vars during initial startup or run a small script to inject a user in MongoDB.


## Tests & Linting

- **Backend tests (Jest + SuperTest)** — run from `backend/`:

```bash
cd backend
npm install
npm test
```

- **Frontend lint (ESLint)** — run from `frontend/`:

```bash
cd frontend
npm install
npm run lint
```

## Features added in this update
- Added `hr` role (HR users can create `employee` and `user` accounts).
- User registration via `/api/auth/register` is now protected (Admin-only).
- Admin Users page now includes pagination, role-based filtering & per-role limits.
- Backend now returns paginated metadata for user listings.

## License

This project is released under the MIT License.
