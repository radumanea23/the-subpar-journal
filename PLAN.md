# The Subpar Journal — Architecture & Implementation Plan

## 1. Project Overview

A personal website with two distinct surfaces:
- **Public**: A minimal, editorial blog with a "newspaper from year 3000" aesthetic
- **Private**: A protected personal dashboard for content creation, daily tracking, and project management

---

## 2. Tech Stack Decisions

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components, file-based routing, built-in API routes, Vercel-native |
| Auth | NextAuth.js v5 + GitHub OAuth | Single provider, no password management, zero credential storage risk |
| Database | Firestore (GCP) | Flexible schema for heterogeneous data (posts, check-ins, projects); real-time capable |
| File Storage | GCP Cloud Storage | Signed URL uploads, CDN-served images, co-located with Firestore |
| 3D | @react-three/fiber + @react-three/drei | Declarative Three.js; cleaner than imperative Three.js in React |
| Rich Text | TipTap | Headless, extensible, React-native, handles image nodes cleanly |
| Styling | Tailwind CSS v4 | Utility-first; easy to enforce design tokens |
| Deployment | Vercel | Zero-config Next.js, edge middleware for auth, preview deployments |

### Auth: Why GitHub OAuth over Credentials

A credentials provider requires storing a hashed password (in `.env` or Firestore) and writing a comparison function. GitHub OAuth requires zero secret management beyond an OAuth app client ID/secret. Since this is a single-user site and you have a GitHub account, OAuth is strictly simpler and more secure. The only tradeoff is needing GitHub to be available at login — acceptable for a personal tool.

To lock the dashboard to yourself specifically: check `session.user.email === process.env.ADMIN_EMAIL` in middleware. Anyone else who somehow triggers the OAuth flow gets redirected to the public homepage.

---

## 3. Folder Structure

```
the-subpar-journal/
├── app/
│   ├── (public)/                   # Route group — no auth required
│   │   ├── layout.tsx              # Public layout (masthead, footer)
│   │   ├── page.tsx                # Blog homepage (cube + feed)
│   │   └── post/
│   │       └── [slug]/
│   │           └── page.tsx        # Individual post page
│   ├── (private)/                  # Route group — auth required
│   │   ├── layout.tsx              # Dashboard shell (sidebar, auth guard)
│   │   └── dashboard/
│   │       ├── page.tsx            # Dashboard home / quick stats
│   │       ├── editor/
│   │       │   ├── page.tsx        # New post
│   │       │   └── [id]/page.tsx   # Edit existing post
│   │       ├── checkin/
│   │       │   └── page.tsx        # Daily check-in form
│   │       ├── calendar/
│   │       │   └── page.tsx        # Check-in history calendar
│   │       ├── analytics/
│   │       │   └── page.tsx        # Year-end stats
│   │       └── projects/
│   │           └── page.tsx        # Project kanban/list
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts        # NextAuth handler
│   │   ├── posts/
│   │   │   ├── route.ts            # GET list, POST create
│   │   │   └── [id]/route.ts       # GET, PUT, DELETE single post
│   │   ├── checkins/
│   │   │   ├── route.ts            # GET list, POST create/update
│   │   │   └── [date]/route.ts     # GET single day
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── upload/
│   │       └── route.ts            # Returns signed GCS upload URL
│   ├── layout.tsx                  # Root layout (fonts, providers)
│   ├── not-found.tsx
│   └── error.tsx
├── components/
│   ├── public/
│   │   ├── SpinningCube.tsx        # Three.js cube (client component)
│   │   ├── BlogFeed.tsx            # Post list
│   │   ├── PostCard.tsx            # Individual card in feed
│   │   ├── Masthead.tsx            # Top header / site name
│   │   └── CategoryBadge.tsx       # AI / Music / Sports / Stocks / Life
│   └── dashboard/
│       ├── Editor.tsx              # TipTap rich text editor
│       ├── ImageUpload.tsx         # Drag-drop → signed URL → GCS
│       ├── CheckInForm.tsx         # Daily form (workout, weight, goals)
│       ├── CheckInCalendar.tsx     # Color-coded monthly/yearly calendar
│       ├── AnalyticsDashboard.tsx  # Charts, streaks, summaries
│       ├── ProjectBoard.tsx        # Kanban columns
│       └── Sidebar.tsx             # Dashboard nav
├── lib/
│   ├── firebase-admin.ts           # Admin SDK (server-side, API routes)
│   ├── firebase-client.ts          # Client SDK (if needed for real-time)
│   ├── storage.ts                  # GCS signed URL helpers
│   ├── auth.ts                     # NextAuth config
│   └── utils.ts                    # Shared helpers (slugify, date fmt)
├── middleware.ts                   # Edge auth protection for /dashboard/*
├── types/
│   └── index.ts                    # Shared TypeScript types
├── public/
│   └── fonts/                      # Self-hosted font files (optional)
├── .env.local                      # Local secrets (never committed)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 4. Data Models (Firestore)

### Collection: `posts`
```typescript
{
  id: string,             // Firestore doc ID (also used as slug base)
  slug: string,           // URL-safe identifier
  title: string,
  excerpt: string,
  content: string,        // TipTap JSON (stored as string)
  category: 'ai' | 'music' | 'sports' | 'stocks' | 'life',
  coverImage?: string,    // GCS public URL
  published: boolean,
  publishedAt?: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### Collection: `checkins`
```typescript
{
  id: string,             // Format: "YYYY-MM-DD"
  date: Timestamp,
  workout: boolean,
  weight?: number,        // kg or lbs — user's choice
  goals: {
    id: string,
    label: string,
    completed: boolean,
  }[],
  note?: string,          // Optional free text
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### Collection: `projects`
```typescript
{
  id: string,
  title: string,
  description?: string,
  status: 'backlog' | 'active' | 'done',
  priority: 'low' | 'medium' | 'high',
  tags: string[],
  tasks: {
    id: string,
    label: string,
    done: boolean,
  }[],
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### Collection: `goals`
```typescript
// Global goal definitions referenced by check-ins
{
  id: string,
  label: string,
  active: boolean,
  order: number,
}
```

---

## 5. Key Technical Decisions

### Server vs Client Components
- **Server**: Feed page, post page, dashboard data fetching (Firestore Admin SDK, no client exposure)
- **Client**: SpinningCube (WebGL), TipTap editor, calendar interactions, real-time form state
- API routes handle all writes; server components handle all reads

### Image Upload Flow
1. Client requests a signed URL from `/api/upload` (POST with filename + contentType)
2. API route generates a v4 signed URL via GCS Admin SDK (15-min expiry)
3. Client uploads directly to GCS (no server proxy, no size limits from Next.js)
4. Client stores the resulting public URL in the post's `coverImage` field

### Middleware Auth Guard
`middleware.ts` intercepts all requests to `/dashboard/*` at the edge, checks for a valid NextAuth session token, and redirects to `/` if absent. This is the outermost protection layer; API routes also validate the session independently.

### Slug Generation
`title → slugify() → check Firestore for collision → append `-2`, `-3` if needed`

---

## 6. Implementation Phases

### Phase 1 — Foundation
- [ ] Init Next.js 14 with TypeScript + Tailwind
- [ ] Configure `next.config.ts` (image domains, env vars)
- [ ] Set up Firestore (Admin SDK) and GCS service account
- [ ] Configure NextAuth with GitHub provider + admin email check
- [ ] Write `middleware.ts` for dashboard protection
- [ ] Deploy skeleton to Vercel, confirm env vars work

### Phase 2 — Public Blog
- [ ] `Masthead` component (site name, GitHub/LinkedIn links)
- [ ] `SpinningCube` — Three.js cube with category face icons
- [ ] `BlogFeed` — server component, fetches published posts
- [ ] `PostCard` — card layout with category badge, date, excerpt
- [ ] `post/[slug]/page.tsx` — full post reader
- [ ] Static 404 and empty state pages

### Phase 3 — Dashboard Shell + Auth
- [ ] Login page (GitHub OAuth button)
- [ ] Dashboard `layout.tsx` with `Sidebar`
- [ ] Dashboard homepage (quick stats: post count, streak, open projects)
- [ ] Confirm middleware correctly blocks non-admin users

### Phase 4 — Blog Editor
- [ ] TipTap editor with: bold, italic, headers, lists, links, code blocks, images
- [ ] `ImageUpload` component (drag-drop + paste support)
- [ ] Signed URL upload to GCS, insert image node into editor
- [ ] Post metadata form (title, excerpt, category, publish toggle)
- [ ] Save as draft vs publish flow
- [ ] Edit existing posts (`/dashboard/editor/[id]`)

### Phase 5 — Check-In System
- [ ] `CheckInForm` — workout toggle, weight input, per-goal checkboxes
- [ ] Manage global goals (add/edit/deactivate)
- [ ] `CheckInCalendar` — color-coded by completion level (all done = green, partial = yellow, none = red, no entry = gray)
- [ ] Streak calculation (current streak, longest streak)

### Phase 6 — Analytics
- [ ] Yearly calendar heatmap (GitHub-style)
- [ ] Workout frequency by month
- [ ] Weight trend chart
- [ ] Goal completion rates
- [ ] Post volume by month and category

### Phase 7 — Projects
- [ ] Project list with status/priority filtering
- [ ] Create / edit / delete projects
- [ ] Per-project task checklist
- [ ] Kanban view (backlog → active → done drag-and-drop)

### Phase 8 — Polish
- [ ] Responsive layout (mobile-first adjustments for dashboard)
- [ ] Loading states and skeleton screens
- [ ] Error boundaries
- [ ] OG meta tags for public posts
- [ ] `sitemap.xml` generation
- [ ] Performance audit (Lighthouse)

---

## 7. Environment Variables

```bash
# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
ADMIN_EMAIL=                    # Your GitHub email — only this user gets dashboard access

# Firebase / GCP
GCP_PROJECT_ID=
GCP_CLIENT_EMAIL=               # Service account email
GCP_PRIVATE_KEY=                # Service account private key
FIRESTORE_DATABASE_ID=          # Usually "(default)"
GCS_BUCKET_NAME=
GCS_PUBLIC_URL_BASE=            # https://storage.googleapis.com/[bucket]
```

---

## 8. Deployment Notes

- Vercel project connected to this GitHub repo; auto-deploys on push to `main`
- Preview deployments for feature branches (dashboard works on preview with same env vars)
- GCS bucket: public read for images, CORS configured for your Vercel domain + localhost
- Firestore security rules: all reads/writes require server-side admin SDK (no client SDK exposed to public)
- Custom domain managed through Vercel DNS or CNAME
