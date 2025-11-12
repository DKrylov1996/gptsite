# Top 10 Albums Annual Collections

A full-stack web application that showcases annual Top 10 album selections with Spotify integration, interactive filtering, and an authenticated admin panel for curating yearly lineups.

## Project structure

```
.
├── backend/        # Node.js Express API serving collections and Spotify enrichment
├── frontend/       # Vite + React client with public experience and admin panel
└── docs/           # Design documentation and planning artefacts
```

## Prerequisites

- Node.js 18+
- npm 9+
- Spotify Web API credentials for live metadata enrichment (optional but recommended)

## Backend setup

1. Copy the example environment file and edit the values as needed:

   ```bash
   cd backend
   cp .env.example .env
   ```

   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` protect the admin panel.
   - `ADMIN_PASSWORD_HASH` accepts `scrypt:<salt>:<hash>` strings. You can regenerate with `node scripts/hash-password.js` (see below).
   - `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` enable automatic artwork and metadata syncing.

2. Install dependencies and start the API:

   ```bash
   npm install
   npm run dev
   ```

   The API defaults to `http://localhost:4000`.

### Hashing admin passwords

Generate a secure password hash using the included helper script:

```bash
node scripts/hash-password.js your-new-password
```

Copy the printed value into `ADMIN_PASSWORD_HASH`.

## Frontend setup

1. Create an environment file to point the client to the API (defaults are shown):

   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Install dependencies and start the development server:

   ```bash
   npm install
   npm run dev
   ```

   The site runs on `http://localhost:5173` and expects the backend at `VITE_API_URL` (default `http://localhost:4000/api`).

## Development workflow

- **Collections**: stored in `backend/data/collections.json` and exposed through `/api/collections`.
- **Spotify enrichment**: automatically fills artwork, release dates, and links when `spotifyAlbumId` is provided in admin forms.
- **Admin panel**: reachable at `/admin`, featuring create/edit/delete flows, current year selection, and inline validation.

## Testing the experience

1. Start the backend (`npm run dev` in `/backend`).
2. Start the frontend (`npm run dev` in `/frontend`).
3. Visit `http://localhost:5173` for the public site or `http://localhost:5173/admin` for the admin dashboard.

Use the credentials configured in your `.env` file to sign in.

## Production build

- Backend: `npm run start` (after installing dependencies) launches the API server.
- Frontend: `npm run build` in `/frontend` outputs static assets to `dist/`. Serve the build from any static host and proxy API requests to the backend.

## Scripts reference

### Backend scripts

- `npm run dev` – start Express with `nodemon`.
- `npm run start` – start Express in production mode.
- `npm run lint` – lint backend source files.

### Frontend scripts

- `npm run dev` – start Vite dev server.
- `npm run build` – type-check and build the React app.
- `npm run preview` – preview the production build locally.

## Notes

- The repository includes illustrative album data so the site renders rich content without external calls.
- Spotify requests gracefully fall back to existing metadata when credentials are missing or rate limits occur.
- Tailwind CSS and Framer Motion power the responsive, animated UI tailored for music discovery experiences.
