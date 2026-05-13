# Skill Loop

Skill Loop is a community skill exchange and UMKM business skill platform. It is designed as a local skill economy: learners spend tokens to book sessions, mentors earn tokens by teaching, UMKM teams post project needs, and admins govern trust across the ecosystem.

The product direction comes from `PLAN.md`: this is not just a course catalog. It is a multi-sided platform for learners, mentors, local businesses, and community organizers.

## Current Product Surface

- Landing page with platform story, skill marketplace preview, UMKM project preview, heatmap, leaderboard, and governance loop.
- Skill marketplace at `/marketplace`.
- Class detail and booking flow at `/marketplace/[id]`.
- Learner dashboard at `/dashboard/learner`.
- Mentor dashboard at `/dashboard/mentor`.
- UMKM project board at `/projects`.
- Admin governance dashboard at `/admin`.
- Authentication flow with login, register, logout, role redirects, and protected role dashboards.
- API routes for skills, bookings, projects, applications, reviews, health checks, and mentor verification.

## Platform Loops

### Learner Loop

1. Discover a class in the marketplace.
2. Pick a schedule and book with tokens.
3. Track active bookings from the learner dashboard.
4. Review completed sessions.
5. Earn trust/review bonuses and continue learning.

### Mentor Loop

1. Publish a class or mentoring offer.
2. Receive bookings from learners.
3. Complete sessions.
4. Receive token release after completion.
5. Improve rating, trust score, and leaderboard position.

### UMKM Loop

1. Post a local project need.
2. Receive mentor/freelancer applications.
3. Shortlist applicants in the owner-only pipeline.
4. Assign work with token rewards.
5. Reuse trusted local talent for future projects.

### Admin Loop

1. Verify mentors.
2. Monitor projects and applicant activity.
3. Enforce governance rules.
4. Protect against self-booking, fake reviews, unsafe projects, and low-trust behavior.

## Features Implemented

- Skill marketplace with mentor badges, ratings, trust score, location, mode, and token pricing.
- Booking form with seeded schedule options.
- Token wallet activity and pending token release concepts.
- Review submission endpoint for completed bookings.
- Mentor class management surface and class draft UI.
- Leaderboard for ecosystem incentives.
- Smart-city skill heatmap for demand/supply signals.
- UMKM project board with application endpoint.
- Applicant pipeline preview.
- Admin mentor verification endpoint.
- Governance rule engine preview.
- Seed fallback mode when no database is connected.
- Drizzle PostgreSQL schema for users, skills, bookings, wallet transactions, reviews, projects, and applications.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Drizzle ORM
- PostgreSQL through Vercel-hosted database env vars
- npm workspaces

## Repository Structure

```text
apps/web
  Next.js application, routes, API handlers, and Tailwind styling

packages/db
  Drizzle schema, migration config, and Vercel/Postgres client

packages/domain
  Seed data, platform domain types, and reusable demo snapshots
```

## Local Setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The app works with seeded domain data until a PostgreSQL database is connected.

## Authentication

Skill Loop includes a first-party role-based authentication flow.

Routes:

- `/login`
- `/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/register`

Roles:

- `learner`
- `mentor`
- `business`
- `admin`

Role redirects:

- Learners go to `/dashboard/learner`.
- Mentors go to `/dashboard/mentor`.
- Business users go to `/projects`.
- Admins go to `/admin`.

Demo accounts work when no database is connected:

| Role | Email | Password |
|---|---|---|
| Learner | `learner@skillloop.test` | `skillloop123` |
| Mentor | `mentor@skillloop.test` | `skillloop123` |
| Business | `business@skillloop.test` | `skillloop123` |
| Admin | `admin@skillloop.test` | `skillloop123` |

Production behavior:

- New users are stored in the `users` table.
- Passwords are hashed before storage.
- The session is stored in an HttpOnly cookie.
- Learner and mentor dashboards are role protected.
- Admin pages require the `admin` role.
- Business-only project posting is guarded by role.

## Useful Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run db:generate
npm run db:push
npm run db:studio
```

## Database Setup

Copy `.env.example` to `.env.local`, then paste the database environment variables from Vercel.

```bash
cp .env.example .env.local
npm run db:generate
npm run db:push
```

When `POSTGRES_URL` is missing, API routes return seeded data or redirect in seed-demo mode. When `POSTGRES_URL` exists, routes can use the Drizzle client.

## API Routes

- `GET /api/health`
- `GET /api/skills`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/bookings`
- `POST /api/bookings`
- `POST /api/projects/applications`
- `POST /api/reviews`
- `POST /api/admin/mentor-verification`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/register`

## Governance Rules

The current UI and domain layer represent these rules:

- Learners can review only after a session is completed.
- Mentors cannot book their own classes.
- Tokens are released to mentors after session completion.
- UMKM project applicants are scoped to project owners.
- Admins can verify mentors and moderate projects.

## Design Direction

The interface follows the original `DESIGN.md` direction:

- Warm cream canvas.
- White product cards.
- Charcoal primary type.
- Fin orange for important AI/product CTA moments.
- Report palette colors for in-product analytics, badges, heatmaps, and status accents.
- Minimal shadows; depth mostly comes from white-on-cream surfaces and hairline borders.

## Next Implementation Steps

- Add real authentication and role sessions.
- Replace seed action redirects with persisted database writes for all forms.
- Add Row Level Security policies once auth is connected.
- Add project owner views for application management.
- Add booking status transitions: pending, confirmed, completed, cancelled.
- Add wallet escrow logic for booking holds, releases, refunds, and review bonuses.
- Add review eligibility checks in the service layer.
- Add admin report/suspension flows.
- Add tests for booking governance and wallet transaction rules.
