# AGENTS.md - Pi Web Wrapper

## Mandatory Context Files
Before any work, read: `about.md`, `steps.md`, `AGENTS.md` (this file). These are the single source of truth.

## Workflow
1. Read the 3 MDs above
2. Pick next incomplete task from `steps.md`
3. Complete task, validate, commit
4. Update `steps.md` to mark completed

## Commands
- `bun run dev` - Start both client and server (from root)
- `bun run build` - Build server (from apps/server)
- `bun run typecheck` - Type check server (from apps/server)
- `cd apps/client && bun run build` - Build client
- `cd apps/client && bun run dev` - Dev server with hot reload

## Code Conventions
- TypeScript strict mode, no `any` types
- Tailwind CSS v4 only, no custom CSS files (except index.css with @theme)
- No comments in production code (skip doc comments unless needed)
- Absolute imports: `@/` alias for `client/src/` and `server/src/`
- Functional components with hooks, no class components
- Mobile-first responsive: 375px, 768px, 1280px breakpoints
- No emojis in code, commits, or UI

## Stack
- **Backend:** Bun + Hono + Zod + @earendil-works/pi-coding-agent SDK
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4 + Framer Motion
- **Auth:** JWT + bcrypt (credentials in env vars)
- **Streaming:** WebSocket (Hono upgrade)
- **Persistence:** localStorage (client), filesystem (server sessions)
- **Deployment:** Coolify (Docker)

## Design Tokens
- Palette: bg=#0f172a, surface=#1e293b, surfaceHover=#334155, accent=#3b82f6, textPrimary=#f1f5f9, textSecondary=#94a3b8, highlight=#8b5cf6, success=#10b981, error=#ef4444, warning=#f59e0b
- Typography: display=Inter, mono=JetBrains Mono (Google Fonts, loaded in index.html)
- All colors use Tailwind @theme tokens

## Git Commit Style
`type(scope): description`
- Types: feat, fix, style, chore, refactor, docs
- Scopes: auth, chat, ws, session, ui, deploy, project

## Deploy

### Platform
- **Service:** Coolify
- **URL:** https://pi-web.pages.therry.dev (to be configured)

### Resources
- **Server UUID:** TBD after Coolify resource creation
- **Project UUID:** TBD after Coolify resource creation

### Build
- **Build Pack:** dockerfile
- **Port:** 3000

### Auth
- **Environment Variables (Coolify):**
  - AUTH_USERNAME - Login username
  - AUTH_PASSWORD_HASH - bcrypt hash of password
  - JWT_SECRET - JWT signing secret
  - ANTHROPIC_API_KEY - Anthropic API key (optional per-user)

### Considerations
- Websocket streaming requires no sticky sessions
- User session data stored at /workspace/users/{username}
- Volume mount /workspace/users for persistence across restarts
- Bun runtime required (over bunslim base image)
