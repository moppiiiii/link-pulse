# Task Completion Checklist

After completing any coding task, run the following:

## 1. Lint & Format
```bash
pnpm fix:check   # Auto-fix lint and formatting issues
```

## 2. Type Check (optional, currently commented out in hooks)
```bash
npx tsc --noEmit
```

## 3. Tests
```bash
pnpm test
```

## 4. Unused Code Check
```bash
pnpm knip
```

## Git Hooks (automatic)
- **pre-commit**: Biome check + fix on staged files (via Lefthook)
- **pre-push**: `pnpm audit` for security

## Notes
- `src/routeTree.gen.ts` is auto-generated — never edit manually
- `src/styles.css` is excluded from Biome checks
- Biome only checks files under `src/`, `.vscode/`, `index.html`, `vite.config.ts`
