# React + Vite

This frontend is based on React + Vite with Tailwind styling and a small UI component library used across the app.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Project Overview

This frontend serves the Document Tracking System. It uses React (Vite), Tailwind CSS, and Axios for API calls. The app expects a backend running on `http://localhost:5000` (see root README for more info).

### Important: Registration is Admin-only
The public `/api/auth/register` endpoint is now protected. Only Admin or Technical Admins can register new users via the `/register` UI. Regular users will be created by admins via the `/api/auth/create` endpoint.

## React Compiler
### Run locally
1. Start the backend - see root `README.md` for details. Ensure the backend is running on `http://localhost:5000` or update `VITE_API_URL`.
2. Run frontend dev server:
```
cd frontend
npm install
npm run dev
```

### Linting
```
npm run lint
```


The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
