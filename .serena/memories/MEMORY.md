# link-pulse Project Memory

## Project Purpose
Tech news feed reader/aggregator. Users can browse, filter, search, and manage articles from various RSS/tech sources. Supports favorites, read/unread states, category filtering, and view modes.

## Tech Stack
- **Framework**: TanStack Start (SSR) + TanStack Router (file-based routing)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui (Radix UI)
- **State**: Custom React hooks (`useFeedStore`), `@tanstack/store`
- **Auth**: Better Auth
- **Database**: Supabase
- **Validation**: Zod (with snake_case → camelCase transform)
- **Package Manager**: pnpm
- **Build/Deploy**: Vite + Cloudflare Workers (wrangler)
- **Linting/Formatting**: Biome
- **Testing**: Vitest + Testing Library
- **Git Hooks**: Lefthook

## Key Files
- `src/routes/` — File-based routing
- `src/components/feed/` — Main feed UI components
- `src/components/ui/` — shadcn/ui components
- `src/hooks/use-feed-store.ts` — Main state hook
- `src/lib/types.ts` — Zod schemas and types
- `src/lib/mock-data.ts` — Mock articles/categories/sources
- `src/lib/auth.ts` / `src/lib/auth-client.ts` — Better Auth config
- `src/utils/supabase.ts` — Supabase client
- `src/routes/__root.tsx` — Root layout
- `src/routes/index.tsx` — Home route

## Details
- [suggested_commands.md](suggested_commands.md)
- [style_conventions.md](style_conventions.md)
- [task_completion.md](task_completion.md)
