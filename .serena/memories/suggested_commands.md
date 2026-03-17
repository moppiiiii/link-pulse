# Suggested Commands

## Development
```bash
pnpm dev          # Start dev server on port 3000
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm deploy       # Build + deploy to Cloudflare Workers
```

## Testing
```bash
pnpm test         # Run all tests with Vitest
```

## Linting & Formatting (Biome)
```bash
pnpm lint         # Lint only
pnpm format       # Format only
pnpm check        # Lint + format check
pnpm fix:check    # Lint + format with auto-fix
```

## Code Quality
```bash
pnpm knip         # Detect unused exports/files
pnpm audit        # Security audit (also runs pre-push via Lefthook)
```

## UI Components (shadcn)
```bash
pnpm dlx shadcn@latest add <component>   # Add a shadcn component
```

## Auth
```bash
pnpm dlx @better-auth/cli secret    # Generate BETTER_AUTH_SECRET
pnpm dlx @better-auth/cli migrate   # Run DB migrations
```

## Import Alias
- `#/*` maps to `./src/*` (e.g., `import { ... } from "#/lib/types"`)
