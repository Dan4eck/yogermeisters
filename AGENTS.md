# Yoga-Flow - Agent Guidelines

This document contains essential information for agentic coding assistants working on this repository.

## Development Commands

### Server & Client
- `npm run dev` - Start development server (Express + Vite dev mode)
- `npm run dev:client` - Start only the Vite dev server on port 5000
- `npm run build` - Production build (uses esbuild, outputs to dist/)
- `npm start` - Start production server (from dist/)

### Type Checking
- `npm run check` - Run TypeScript compiler check (no emit)

### Testing
No test framework is currently configured. When adding tests, use a common framework like Vitest and update this file.

## Production Deployment Workflow

- Deploy application code exclusively through GitHub: verify the change, commit it, and push the intended branch.
- Railway must build and deploy the pushed GitHub commit through its GitHub integration. A deployment is complete only
  after the Railway deployment is online and its source commit matches the pushed SHA.
- Use Railway CLI for status, logs, health checks, and explicitly authorized infrastructure operations. Never upload
  local source with `railway up` or use a local archive as the production deployment source.
- If production was deployed from local source, reconcile it immediately by committing the exact source, pushing it to
  GitHub, and waiting for the GitHub-triggered Railway deployment before making further application changes.

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled - no implicit any types allowed
- Always annotate function parameters and return types explicitly
- Use `type` for type aliases, `interface` for object shapes that may be extended
- Prefer readonly properties when immutability is important
- Use the `type` keyword for type-only imports: `import type { RetreatRecord } from "@shared/retreat-content"`

### Import Conventions
- Client imports: `@/` maps to `./client/src/`
- Shared code: `@shared/` maps to `./shared/`
- Assets: `@assets/` maps to `./attached_assets/`
- Group imports: external libraries first, then internal, then relative imports
- Use named exports for functions and components
- Use the `type` keyword for type-only imports: `import type { ButtonProps } from "..."`
- Order: 1) React imports, 2) External libraries, 3) Internal imports (@/@shared), 4) Relative imports

### Component Patterns
- Use functional components with hooks
- Components should be exported as `export default function ComponentName()`
- Use forwardRef when needed for DOM elements
- Use React.memo only for components with expensive renders, not by default
- Destructure props directly: `function MyComponent({ prop1, prop2 }: Props)`

### Styling
- The active landing experience is V2 under `client/src/components/landing-v2/`
- Use CSS modules for V2 sections and route-level V2 pages
- Keep shared V2 tokens scoped under `.landing-v2-root` in `client/src/index.css`
- `@/components/ui/` is intentionally minimal; only add shadcn/ui components when they are actually used
- For dynamic class merging, use the `cn()` utility from `@/lib/utils` only where class composition is needed

### Error Handling
- Server: Express is currently only a minimal static server plus `/healthz`
- Always provide user-friendly error messages
- Log errors on the server with the `log()` utility from `server/index.ts`

### Naming Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Functions: camelCase (`getUserById`)
- Variables: camelCase (`userData`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- Types/Interfaces: PascalCase (`UserProfile` for types, `IUserProfile` is discouraged)
- Files: kebab-case for utilities, PascalCase for components

### Server-Side Patterns
- Use Express.js with TypeScript only for Railway static deployment and health checks
- Do not add API routes or database access unless the product explicitly needs server-side behavior
- Default server port: 3001 (or PORT environment variable)

### Client-Side Patterns
- Use Wouter for routing (Switch/Route components)
- Use Lucide React for icons
- State management: React hooks (useState, useReducer, useContext)
- Retreat data is imported from `@shared/retreat-content`, not fetched from an API

### File Organization
```
client/src/
  components/     - Reusable UI components
  components/landing-v2/ - Active V2 landing components, content, and CSS modules
  components/ui/ - Minimal shared UI primitives that are actively imported
  hooks/          - Custom React hooks
  lib/            - Utilities and helpers
  pages/          - Route components
server/
  index.ts        - Minimal Express server setup
  static.ts       - Production static SPA serving
  vite.ts         - Development Vite middleware
shared/
  retreats/       - Retreat content, translations, filtering, and types
```

### Adding UI Components
- Prefer local CSS modules for V2 page/section components
- Add shared UI primitives only when at least two call sites need them
- Export components as named exports for primitives, with default export for main page/section components

### Formatting Conventions
- Use semicolons at the end of statements
- Use single quotes for strings
- Maximum line length: ~120 characters (soft limit)
- One blank line between functions and logical sections
- Indentation: 2 spaces (TypeScript/JavaScript default)
- No trailing whitespace

### Environment Variables
- `PORT` - Server port (defaults to 3001)
- `NODE_ENV` - Environment mode (development/production)

### Security Considerations
- Never commit secrets or keys to the repository
- Do not commit `.env`
- Add server-side validation if API routes are introduced later

### Important Notes
- The server and client run on the same port in development
- Always run `npm run check` before committing to ensure type safety
- No comments in code unless explicitly requested
- The project uses ESM modules (type: "module" in package.json)
