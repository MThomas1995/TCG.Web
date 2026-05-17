# TCG — Trading Card Game Project

## Purpose

This project exists to help the user **learn .NET and C#** naturally, working towards a job vacancy. The goal is not just to build features, but to understand *why* things work the way they do — the language syntax, the framework conventions, and how all the pieces fit together.

## Project Vision

A **physical trading card game** with a full digital ecosystem:
- Physical cards have QR codes printed on the back
- Scanning a QR code takes the user to a digital card viewer page
- Long term: digital deck building, user accounts, and a live interactive card battle game

## Architecture Overview

```
TCG.Api    (C# .NET — private repo)   ✓ built
TCG.Web    (Next.js — public repo)    ← current focus
TCG.Game   (Phaser.js — separate repo) ← future
```

### TCG.Api — C# ASP.NET Core Web API
- Stores and serves all card data
- MVC Controllers with async/await throughout
- EF Core + SQLite for persistence
- CORS configured for frontend access
- Private GitHub repo: `MThomas1995/TCG.Api`

### TCG.Web — Next.js Frontend
- Public-facing card viewer (QR code destination)
- Admin dashboard for managing cards
- User profiles and deck builder (future)
- Server-side rendering for fast QR scan loads and SEO
- Public GitHub repo: `TCG.Web` (to be created)

### TCG.Game — Phaser.js Game Client
- Interactive card battle game
- Rich visuals — card flips, animations, effects
- Connects to TCG.Api via WebSockets (SignalR) for real-time game state
- Separate repo, linked from TCG.Web
- Not started yet — last priority

## How Claude Should Assist

1. **Explain as you go.** When writing or modifying code, briefly explain *what* it does and *why* it's done that way. The user is building mental models, not just copying code.
2. **Teach concepts in context.** Introduce concepts at the point they're actually used — not in the abstract.
3. **Don't over-engineer.** Keep code simple and idiomatic.
4. **Point out conventions.** When something is "the .NET way" or "the Next.js way", say so — these conventions matter for job-readiness.
5. **Build incrementally.** Add one concept or feature at a time.
6. **Collaborative coding.** Claude may write or update code directly, but must always explain what was written and why. The goal is learning through working examples, not blind copy-paste.

## Code Quality Standards

All code — including dev/learning code — should be written to production standard. This means:

- **No unsafe type casts.** Don't use `as SomeType` to silence TypeScript — validate or handle the value properly.
- **Validate env variables at startup.** If the app requires an env variable, fail fast with a clear error message if it's missing. Don't let undefined silently propagate.
- **No hardcoded URLs or secrets.** All environment-specific values (API URLs, ports, keys) go in env files.
- **Explicit over implicit.** Code should be clear about what it does and what it requires.
- **Handle failure paths.** Account for missing data, failed fetches, and bad input at system boundaries.

## TCG.Api — Current State

**Solution structure**
```
TCG.Api.sln
└── CardStore/
    ├── Controllers/
    │   └── CardsController.cs     # CRUD endpoints
    ├── Data/
    │   └── CardContext.cs         # EF Core DbContext
    ├── Models/
    │   └── Card.cs                # Card, Stats, UpdateCardRequest
    ├── Services/
    │   ├── ICardService.cs        # Interface
    │   └── CardService.cs         # Implementation
    ├── Migrations/                # EF Core migrations
    ├── Program.cs                 # App config, DI, middleware
    └── CardStore.csproj
```

**Card model**
- `Id` — auto-assigned by database
- `Name` — required string
- `Stats` — owned entity (Attack, Defend, Hp) — stored flat in Cards table
- `Description` — required string
- `ImagePath` — required string

**Endpoints**
- `GET /cards` — all cards
- `GET /cards/{id}` — single card (QR code destination)
- `POST /cards` — create a card
- `PATCH /cards/{id}` — partial update (any combination of fields)
- `DELETE /cards/{id}` — delete a card

**Running the API**
```bash
cd CardStore
dotnet run
```

## QR Code Strategy

Each card character has the same QR code across all physical prints — linking to `/cards/{id}`. This keeps printing costs low. The QR code takes the user to the TCG.Web card viewer page which fetches and displays the card data.

One-for-one physical card tracking (for digital deck ownership) is a future consideration using a redemption code system — not in scope yet.

## Key Concepts Covered So Far

- **Program.cs** — DI container and HTTP pipeline configuration
- **MVC Controllers** vs Minimal APIs — using Controllers for automatic validation via `[ApiController]`
- **Dependency Injection** — `ICardService` / `CardService`, `CardContext` injected via constructors
- **async/await** — all service and controller methods are async; EF Core async methods (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`)
- **Entity Framework Core** — DbContext, DbSet, owned entities (`OwnsOne`), migrations
- **Data Annotations** — `[Required]`, `[Range]` on model properties
- **Records vs Classes** — records for DTOs (`UpdateCardRequest`), classes for EF Core entities
- **CORS** — configured to allow any origin for frontend access
- **Nullable reference types** — `string?` vs `string`, `int?` vs `int`

## Deployment

### TCG.Api — Railway
- Live at: `https://tcgapi-production-9ff6.up.railway.app`
- Deployed from `MThomas1995/TCG.Api` GitHub repo, root directory set to `CardStore`
- EF Core migrations run automatically on startup (`db.Database.Migrate()` in `Program.cs`)
- SQLite database is ephemeral — resets on container restart. Cards must be re-seeded via `POST /cards` after a reset
- Images served from `wwwroot/images/` committed to the repo

### TCG.Web — Vercel
- Live at: `https://tcg-2nithwus3-michaelrt1995-5745s-projects.vercel.app`
- Deployed from `MThomas1995/TCG.Web` GitHub repo, root directory set to `frontend`
- Environment variable `NEXT_PUBLIC_TCG_API_URL` set to the Railway API URL in Vercel project settings
- No sign-in required to view — Deployment Protection is disabled

### Known limitations
- SQLite on Railway is not persistent — a container restart wipes card data. Migrate to a hosted database (e.g. PostgreSQL via Railway) before going further with user data or deck management
- Vercel URL is a preview URL — set a custom domain when ready to share more broadly

## User Accounts & Collection

### Auth strategy
- JWT (JSON Web Token) — signed token issued on login, sent with every request via `Authorization: Bearer <token>` header
- Token contains `UserId` and expiry, verified server-side without a database lookup
- Open registration — anyone can sign up

### Schema

**User**
- `Id` — auto-assigned
- `Email` — unique, required
- `PasswordHash` — bcrypt hashed, never store plaintext
- `CreatedAt`

**UserCard** (one row per physical card instance owned)
- `Id` — unique per card instance
- `UserId` → User
- `CardId` → Card
- `AcquiredAt`

One-row-per-instance is intentional: it maps to physical card ownership and supports redemption codes later (add a `RedemptionCode` column). A `Quantity` approach would require a schema redesign when that comes. Table size is not a concern at this scale — Postgres handles tens of millions of rows with proper indexes on `UserId` and `CardId`.

### Planned endpoints
- `POST /auth/register` — create account
- `POST /auth/login` — returns JWT
- `GET /me/cards` — authenticated user's collection
- `POST /me/cards/{cardId}` — add a card to collection (later: via redemption code)

### Frontend (TCG.Web)
- Login / register pages
- Account dashboard — displays the user's card collection
- Protected routes — redirect to login if unauthenticated
- JWT stored in `httpOnly` cookie (secure) or `localStorage` (simpler) — TBD

## Next Milestones

- [x] TCG.Web — Next.js card viewer
- [ ] TCG.Web — Admin dashboard
- [ ] TCG.Api — Persistent database (PostgreSQL)
- [ ] TCG.Api — Authentication (JWT)
- [ ] TCG.Api — User accounts and collection
- [ ] TCG.Web — User account dashboard and card collection view
- [ ] TCG.Game — Phaser.js game client
- [ ] TCG.Api — SignalR WebSocket hub for real-time game state
