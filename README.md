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
- For production, store `JWT_SECRET` in a secure secrets manager or environment variable and use HttpOnly secure cookies for tokens instead of localStorage where possible.

A full-stack web application that lets users upload, manage, and track documents with version history and role-based access controls.

## Key Features

-   **User Authentication:** Secure login/registration with role-based access (users and admins).
-   **Document Management:** Full CRUD (Create, Read, Update, Delete) operations for documents.
-   **Granular Access Control:** Per-document access rights for viewers and editors, in addition to document owners and admins.
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

## Vercel Deployment - Peer dependency issue & workaround

    - Short-term (quick fix): Add a `.npmrc` with `legacy-peer-deps=true` to the frontend project (or repo root). This will allow `npm` to install dependencies without failing on strict peer dependency conflicts. This repo contains such `.npmrc` files.
    - Long-term (recommended): Update libraries and dev dependencies to versions compatible with React 19 (or pin `react` and `react-dom` to React 18 if libraries are not yet ready). Updating `@testing-library/react` or similar libraries may fix the conflicts.
        - Long-term (recommended): Update libraries and dev dependencies to versions compatible with React 19 (e.g., testing-library, other libraries). The changes above attempt this by bumping `@testing-library/react` and `@testing-library/jest-dom` to versions that are expected to support React 19.
    - Another CLI workaround for CI is to use `npm install --legacy-peer-deps` if you do not want to use `.npmrc`.

Make sure to configure required Vercel environment variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`.


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
