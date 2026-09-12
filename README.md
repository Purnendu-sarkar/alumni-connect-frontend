# alumni-connect-frontend
Frontend for AlumniConnect (Next.js/React) — an alumni networking &amp; mentorship platform connecting university students and graduates. Consumes the AlumniConnect backend API for auth, directory, jobs and events.

## Stack

- Next.js App Router, React, and TypeScript
- React Query for server data, Zustand for in-memory session state
- React Hook Form and Zod for validated forms
- CSS design tokens plus reusable UI components, using Archivo Black and Work Sans

## Run locally

1. Create a local environment file:

   ```powershell
   Copy-Item .env.example .env.local
   ```

2. Point `NEXT_PUBLIC_API_URL` at the Express API and set the tenant domain to match its configuration.

3. Install and launch:

   ```powershell
   npm install
   npm run dev
   ```

Open `http://localhost:3000`.

## Quality commands

```powershell
npm run typecheck
npm run lint
npm run build
```

Public routes use curated preview data if the API is unavailable; sign-in stores the received access token in memory and the authenticated directory then uses it for its API request.
