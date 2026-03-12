# Code Style & Conventions

## Language & Types
- TypeScript throughout (strict)
- Zod for runtime validation and type inference
- DB columns use snake_case; app code uses camelCase (Zod `.transform()` handles conversion)

## Formatting (Biome)
- Indent: spaces (not tabs)
- Quotes: double quotes for JS/TS strings
- Import organization: auto via Biome assist

## React Patterns
- Functional components only
- Custom hooks for complex state logic (e.g., `useFeedStore`)
- `useMemo` and `useCallback` for performance optimization
- No `"use client"` directives (removed as part of refactor)

## Component Structure
- shadcn/ui components in `src/components/ui/`
- Feature components in `src/components/<feature>/`
- Route files in `src/routes/` (TanStack file-based routing)
- Custom hooks in `src/hooks/`
- Shared types/utils in `src/lib/`

## Naming Conventions
- Files: kebab-case (e.g., `feed-dashboard.tsx`, `use-feed-store.ts`)
- Components: PascalCase
- Hooks: camelCase prefixed with `use`
- Types/Interfaces: PascalCase

## Routing (TanStack Router)
- File-based routing in `src/routes/`
- Root layout in `src/routes/__root.tsx`
- Auto-generated route tree in `src/routeTree.gen.ts` (do not edit manually)

## Shadcn
- Always use `pnpm dlx shadcn@latest add <component>` to add new components
