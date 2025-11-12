# Top 10 Albums Annual Picks Platform - Design Specification

## 1. Vision & Goals
- Deliver an immersive, data-driven destination for music enthusiasts featuring curated Top 10 album selections for each year.
- Provide seamless discovery with Spotify integration for instant listening.
- Offer administrative tooling to curate and manage annual picks securely and efficiently.
- Ensure responsive, performant, and scalable architecture suitable for growing catalog and traffic.

## 2. Target Audience
- Music aficionados seeking curated yearly best-of lists.
- Editorial teams curating selections.
- Visitors exploring historical and current music trends on any device.

## 3. High-Level Architecture
```
┌──────────────┐        ┌─────────────────┐        ┌─────────────────────┐
│ React/Vue    │        │ Node.js (Nest)  │        │ Spotify Web API      │
│ Frontend SPA │◀──────▶│ or Python (FastAPI)│◀──▶│ (OAuth + metadata)   │
└─────▲────────┘        └───────▲─────────┘        └─────────▲──────────┘
      │                         │                              │
      │ GraphQL/REST            │ PostgreSQL + Redis           │
      │ WebSockets (live edits) │ S3-compatible storage        │
      │                         │                              │
      ▼                         ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Infrastructure: Containerized services orchestrated via Kubernetes or    │
│ serverless (AWS Fargate / Cloud Run) with CDN-backed asset delivery.     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Frontend
- **Framework**: React (Next.js for SSR/SSG) or Vue (Nuxt).
- **State management**: Redux Toolkit/RTK Query or Pinia + Vue Query for API caching.
- **Routing**: Year-based dynamic routes (`/year/2024`).
- **Styling**: Tailwind CSS with custom themes; CSS variables for dark/light modes.
- **Animation**: Framer Motion (React) or VueUse Motion for transitions between yearly collections.
- **Internationalization**: i18n support for future localization.

### 3.2 Backend
- **Runtime**: Node.js (NestJS) or Python (FastAPI/Django REST Framework).
- **API Layer**: GraphQL (Apollo Server) or REST with OpenAPI schema.
- **Services**:
  - Album Collection Service (yearly picks CRUD).
  - Spotify Integration Service (OAuth token management, metadata fetch, caching).
  - Media Service (image uploads, CDN handling).
  - Admin Auth Service (JWT/OAuth2 + RBAC).
- **Database**: PostgreSQL with Prisma (Node) or SQLAlchemy (Python) for relational data integrity.
- **Caching**: Redis for Spotify metadata and frequent queries.
- **Background Jobs**: BullMQ (Node) or Celery (Python) for periodic Spotify syncs.
- **File Storage**: S3-compatible bucket for custom artwork uploads.

### 3.3 Infrastructure & DevOps
- Containerization via Docker; orchestrate with Kubernetes or ECS.
- CI/CD pipeline (GitHub Actions) running linting, tests, build previews, automated deployments.
- Observability: Prometheus + Grafana, centralized logging (ELK stack).
- CDN (CloudFront/Fastly) for album art and static assets.

## 4. Data Model

### 4.1 Database Schema (PostgreSQL)
```sql
TABLE users {
  id UUID PK,
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role user_role DEFAULT 'editor',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
}

ENUM user_role {
  admin,
  editor,
  viewer
}

TABLE artists {
  id UUID PK,
  spotify_id TEXT UNIQUE,
  name TEXT NOT NULL,
  genres TEXT[],
  image_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
}

TABLE albums {
  id UUID PK,
  spotify_id TEXT UNIQUE,
  title TEXT NOT NULL,
  release_date DATE,
  artist_id UUID FK -> artists.id,
  cover_url TEXT,
  spotify_url TEXT,
  total_tracks INT,
  label TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
}

TABLE yearly_collections {
  id UUID PK,
  year INT UNIQUE NOT NULL,
  title TEXT DEFAULT 'Top 10 Albums',
  slug TEXT UNIQUE,
  hero_image_url TEXT,
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
}

TABLE collection_albums {
  id UUID PK,
  collection_id UUID FK -> yearly_collections.id,
  album_id UUID FK -> albums.id,
  rank INT CHECK (rank BETWEEN 1 AND 10),
  editor_notes TEXT,
  highlight_track TEXT,
  spotify_preview_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE (collection_id, rank)
}

TABLE audit_logs {
  id UUID PK,
  user_id UUID FK -> users.id,
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
}
```

### 4.2 API Contracts
- `GET /collections/current`: returns current year's collection with album details.
- `GET /collections/{year}`: fetch past year selections.
- `GET /collections`: list years with filters (`published`, `genre`, `search`).
- `POST /collections`: admin-only creation with validation.
- `PATCH /collections/{id}` and `DELETE /collections/{id}` for admin operations.
- Spotify integration endpoints for metadata refresh (`POST /spotify/refresh`).

## 5. Frontend Experience

### 5.1 Landing Page (Current Year)
- Hero section featuring collage of album covers in glassmorphism card layout.
- Auto-playing background gradient animation responding to album colors.
- Year picker carousel with smooth horizontal scroll + keyboard support.
- Grid layout (2×5 on desktop, 1×10 on mobile) for albums; each card includes cover, rank, artist, CTA buttons (Play on Spotify, Add to Playlist).
- Dynamic theming pulling dominant colors from cover art (use `color-thief` or `vibrant.js`).
- Sticky mini-player for 30-second previews (Spotify embed).

### 5.2 Navigation & Discovery
- Global navigation: Home, Archives, Genres, About, Admin (conditional display).
- Archive view: timeline interface with infinite scroll and filtering by genre/critic.
- Search bar with auto-complete for albums/artists.
- Social sharing cards (OpenGraph/Twitter) auto-generated per collection.

### 5.3 Interaction & Animation
- Use motion transitions when switching years (slide/fade, parallax backgrounds).
- Hover effects revealing critic notes, highlight tracks.
- Smooth scroll with scroll-snap for album cards on mobile.
- Skeleton loaders and optimistic UI updates during data fetches.

### 5.4 Responsive Design
- Mobile-first layout, breakpoints: 360, 768, 1024, 1440.
- Use CSS Grid / Flexbox with clamp-based typography.
- Support dark/light themes with user preference detection.
- Ensure accessible contrast ratios (WCAG AA minimum).

## 6. Admin Panel

### 6.1 Technology
- Build with **React Admin** (if backend is REST) or Next.js + `react-query` for custom UI.
- Alternatively use Django Admin (if using Django) enhanced with `django-grappelli` for modern look.

### 6.2 Features
- **Authentication**: OAuth 2.0 with password + optional SSO (Google Workspace). JWT with refresh tokens, stored in HTTP-only cookies.
- **Role-based Access**: Admin can manage users/roles; Editors can manage collections; Viewers read-only.
- **Dashboard**: Stats on views, engagement, Spotify playback metrics.
- **Collection CRUD**:
  - Year selector with validation (unique year).
  - Drag-and-drop ranking of albums (1-10).
  - Inline Spotify search to auto-fill metadata via API.
  - Custom notes, highlight track input, publish toggle.
- **Media Management**:
  - Upload custom cover overrides (with auto image optimization + CDN).
  - Support cropping/resizing (integrate `react-easy-crop`).
- **Bulk Operations**: Duplicate previous year, batch edit ranks, import/export JSON.
- **Audit Trail**: Show history of changes with revert capability.

### 6.3 UX Considerations
- Persistent form state and autosave drafts.
- Inline validation (unique rank, required fields, valid Spotify URLs).
- Confirmation modals for destructive actions.
- Keyboard shortcuts for power users.
- List virtualisation for large data sets.

## 7. Spotify Web API Integration
- Implement OAuth Client Credentials for metadata fetching (public data).
- Securely store refresh tokens; rotate automatically.
- Cache album metadata (title, artists, images) for 24h to reduce rate limit hits.
- Pre-fetch album colors using background job.
- Sync job schedules: daily metadata refresh, weekly new release suggestions.

## 8. Performance & Scalability
- Server-side rendering or static generation for SEO-critical pages (`/year/{year}`) with incremental regeneration.
- Use image optimization (Next.js Image or Imgix) for responsive album art.
- Implement HTTP caching with ETags and CDN caching for static resources.
- Lazy-load Spotify embeds and heavy components.
- Enable prefetching of adjacent years.
- Database indexing on `year`, `rank`, `spotify_id`.
- Use pagination & `Accept-Ranges` for archives.

## 9. Security
- HTTPS everywhere (HSTS).
- Content Security Policy restricting Spotify domains.
- JWT stored in HttpOnly cookies with CSRF tokens for admin forms.
- Rate limiting and captcha for public endpoints that accept input (search).
- Input validation & sanitization (OWASP standards).
- Regular dependency scanning (Dependabot, Snyk).

## 10. Testing Strategy
- Unit tests for services, hooks, and components.
- Integration tests for API endpoints (Jest + Supertest / Pytest).
- End-to-end tests (Playwright/Cypress) covering user flows and admin CRUD.
- Visual regression testing for album card layouts.
- Contract tests for Spotify API interactions using mocked responses.

## 11. Deployment Strategy
- Staging environment mirroring production with feature flags.
- Blue-green deployments or canary releases for backend.
- Rollback automation via CI.
- Infrastructure as Code (Terraform).

## 12. UI/UX Best Practices for Music Collections
- **Color Palette**: Deep charcoal background (#121212) with vibrant accent gradients (#1DB954 Spotify green, neon purple). Provide light mode with warm neutrals.
- **Typography**: Pair sans-serif display (e.g., "Clash Display" for headings) with readable sans-serif body ("Inter"). Use variable font weights for hierarchy.
- **Imagery**: Hero mosaic and focus on album art; subtle drop shadows and glassmorphism overlays.
- **Microinteractions**: Soft hover glows around covers, progress indicators on Spotify play buttons.
- **Accessibility**: Provide alt text for covers, keyboard navigable controls, ARIA labels for audio players.
- **Personalization**: Option to log in with Spotify to save favorites or sync playlists (future enhancement).

## 13. Roadmap Extensions
- User accounts with personal collections and playlist export.
- Collaborative curation with community voting.
- Integration with Apple Music / Tidal APIs.
- Podcast-style editorial content for each year.
- Live data analytics dashboard for admins.

## 14. Development Milestones
1. **MVP**: Current year landing page, archives, Spotify playback links, basic admin CRUD.
2. **Phase 2**: Advanced animations, full audit trail, caching, CI/CD automation.
3. **Phase 3**: Personalization, social features, expanded analytics.

## 15. Maintenance & Documentation
- Maintain comprehensive API docs (Swagger/OpenAPI + GraphQL Playground).
- Developer onboarding guide with environment setup instructions.
- Changelog maintained via Keep a Changelog format.

