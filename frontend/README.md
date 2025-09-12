Development
-----------

This frontend uses Vite. During development the dev server proxies requests to /api to http://localhost:8000 (Laravel backend).

- Start backend (Laravel):
  - php artisan serve (or use your usual Valet/Local setup)
- Start frontend:
  - npm install
  - npm run dev

Environment
-----------

Copy `.env.example` to `.env` and set `VITE_API_URL` to the production API base URL when building for production. In development the proxy in `vite.config.js` avoids the need for CORS configuration.
