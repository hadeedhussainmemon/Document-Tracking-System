# Backend - Document Tracking System

This is the backend for the Document Tracking System.

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env` with the following values:

```
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CLIENT_ORIGIN=http://localhost:5173
```

3. Run the development server

```bash
npm run dev
```

## Testing

The repo contains Jest + Supertest tests using an in-memory MongoDB server.

To run tests

```bash
npm install
npm test
```

Note for Windows users: You might need to set `NODE_ENV=test` (Jest sets it automatically during `npm test`) or run `set NODE_ENV=test && npm test` if you customize the test command.
