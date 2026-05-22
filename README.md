# SkyPath

SkyPath is a production-ready flight booking Progressive Web App built with Next.js 14, Supabase, Zustand, Tailwind CSS, and next-pwa.

## Live URL + test credentials

- Live URL: `https://your-sky-path.example.com`
- Test email: `test@example.com`
- Test password: `Password123!`

> Replace the above values with your deployed environment details once the app is published.

## Local setup

1. Clone the repository:
   ```bash
   git clone <repo-url> skypath
   cd skypath
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```
4. Populate the environment variables with your Supabase project values.
5. Run migrations:
   ```bash
   npm run build
   ```
   or use Supabase CLI to apply `supabase/migrations/*.sql`.
6. Start the development server:
   ```bash
   npm run dev
   ```

## Supabase project configuration

1. Create a new Supabase project.
2. Enable Supabase Auth and allow email/password sign-in.
3. Run the SQL migrations in `supabase/migrations/001_schema.sql`, `002_functions.sql`, and `003_seed.sql`.
4. Set the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Configure Row Level Security policies using the provided SQL migration.
6. Upload PWA icons to `public/icons/icon-192.png` and `public/icons/icon-512.png`.

## Zustand store architecture

SkyPath uses two persistent Zustand stores:

- `flightStore.ts`
  - Stores search state, selected flight, booking progress, and passenger details.
  - Persisted keys: `searchQuery`, `selectedFlight`, `currentStep`, and non-sensitive passenger fields (`fullName`, `nationality`, `dob`).
  - Excluded fields: `passportNo`, `selectedSeat`, and `confirmation` to protect sensitive PII and avoid stale booking state.

- `userStore.ts`
  - Stores Supabase session tokens, user profile, and cached bookings.
  - Persisted session fields: `access_token`, `refresh_token`, `expires_at`, `token_type`, and `user`.
  - Full booking objects are not persisted to avoid stale reservation state and privacy concerns.

### Partialize rationale

Persisting only minimal session tokens and user context keeps the app resilient and secure while still restoring sign-in state. Sensitive passport details and ephemeral seat selection data are intentionally excluded to reduce security and privacy risks.

## Implementation comparison

| Approach | Pros | Cons | Why chosen |
|---|---|---|---|
| Server actions + Supabase RPC | Strong security, centralized business rules, auth-aware logic | More initial setup, requires careful input shaping | Chosen for transaction safety and enforcement of seat locking/cancellation rules |
| Client-side booking UI + API routes | Easier to debug, fits React lifecycle | More surface area for auth mistakes, weaker database guarantees | Not chosen because it would duplicate booking logic outside the database |
| Full server-rendered pages only | Fast initial load, SEO-friendly | Harder to implement realtime seat selection and installation prompt | Not chosen because PWA and interactive seat map require client hydration |

## Task completion checklist

- [x] Supabase schema with flight, seat, booking, passenger, reschedule tables
- [x] Row Level Security enabled and policies defined
- [x] Trigger enforcing cancellation window
- [x] Stored procedures for reserve, cancel, reschedule
- [x] Seed data for 8 flights and 114 seats per flight
- [x] Next.js App Router pages for home, search, login, register, booking, confirm, bookings, reschedule
- [x] Zustand stores with persist middleware and partialize configuration
- [x] Reusable UI components and responsive Tailwind styling
- [x] Seat map with realtime Supabase updates and mobile support
- [x] PWA configuration with next-pwa and offline fallback
- [x] Comprehensive README with setup, architecture, and trade-offs

## Trade-offs & future improvements

- The current reschedule UI fetches seat data in the client for selected alternative flights; with more time, this could be migrated to a dedicated server action or edge function for stronger validation.
- Additional user profile management and email confirmation flows are omitted for scope.
- A native calendar integration and booking notification system would improve real-world usability.
- Performance can be further enhanced with server-side caching for popular flights and search results.

## Project structure

```
skypath/
├── supabase/migrations/
│   ├── 001_schema.sql
│   ├── 002_functions.sql
│   └── 003_seed.sql
├── public/
│   ├── manifest.json
│   ├── offline.html
│   └── icons/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── offline/page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── search/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   ├── book/
│   │   │   ├── [flightId]/page.tsx
│   │   │   └── actions.ts
│   │   ├── confirm/
│   │   │   └── [bookingId]/page.tsx
│   │   └── bookings/
│   │       ├── page.tsx
│   │       ├── BookingsClient.tsx
│   │       └── [bookingId]/reschedule/page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── flight/
│   │   ├── seat/
│   │   ├── booking/
│   │   ├── layout/
│   │   └── providers/
│   ├── store/
│   ├── lib/
│   ├── types/
│   └── middleware.ts
├── .env.example
├── next.config.ts
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```
