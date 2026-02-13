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

### Database
- `npm run db:push` - Push Drizzle schema changes to database

### Testing
No test framework is currently configured. When adding tests, use a common framework like Vitest and update this file.

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled - no implicit any types allowed
- Always annotate function parameters and return types explicitly
- Use `type` for type aliases, `interface` for object shapes that may be extended
- Prefer readonly properties when immutability is important
- Use the `type` keyword for type-only imports: `import type { User } from "@shared/schema"`

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
- Use Tailwind CSS utility classes
- For dynamic class merging, use the `cn()` utility from `@/lib/utils`
- shadcn/ui components are located in `@/components/ui/`
- Follow shadcn/ui patterns when creating new components
- Use `cva` (class-variance-authority) for component variants

### Error Handling
- Server routes: Use try-catch blocks, return appropriate HTTP status codes
- Client: Use React Query's error handling for API calls
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
- Use Express.js with TypeScript
- API routes should be prefixed with `/api`
- Use Drizzle ORM for database operations
- Use Zod schemas for request validation (defined in shared/schema.ts)
- Use the `storage` module for database operations (implements IStorage interface)
- Routes should be registered in `server/routes.ts`
- Log errors using the `log()` utility from `server/index.ts`
- Use async/await for all asynchronous operations
- Default server port: 3001 (or PORT environment variable)

### Client-Side Patterns
- Use Wouter for routing (Switch/Route components)
- Use TanStack Query (React Query) for server state with `apiRequest()` and `getQueryFn()` utilities
- Use Framer Motion for animations (motion.div, motion.button, etc.)
- Use Lucide React for icons
- State management: React hooks (useState, useReducer, useContext)
- Form handling: react-hook-form with Zod validation
- Use `use-mobile.tsx` hook for responsive breakpoints
- API calls include `credentials: "include"` for session support

### File Organization
```
client/src/
  components/     - Reusable UI components
  components/ui/ - shadcn/ui components
  hooks/          - Custom React hooks
  lib/            - Utilities and helpers
  pages/          - Route components
server/
  routes.ts       - API route definitions
  storage.ts      - Database operations
  index.ts        - Express server setup
shared/
  schema.ts       - Drizzle schemas and Zod validators
```

### Database Migrations
- Schema changes require updating `shared/schema.ts`
- Run `npm run db:push` to apply schema changes to database
- Drizzle migrations are generated in `./migrations/` directory
- Use Zod schemas for validation: `createInsertSchema()` from drizzle-zod

### Adding UI Components
- Follow shadcn/ui component patterns from `@/components/ui/`
- Use the `cn()` utility for dynamic class merging
- Components support variants using `cva` (class-variance-authority)
- Export components as named exports, with default export for the main component
- shadcn/ui uses the "new-york" style variant

### API Patterns
- All API routes prefixed with `/api`
- Use `apiRequest()` for mutations (POST/PUT/DELETE)
- Use `getQueryFn()` with React Query for data fetching
- All fetch calls include `credentials: "include"` for session cookies
- Error handling: throw descriptive errors with HTTP status codes

### Formatting Conventions
- Use semicolons at the end of statements
- Use single quotes for strings
- Maximum line length: ~120 characters (soft limit)
- One blank line between functions and logical sections
- Indentation: 2 spaces (TypeScript/JavaScript default)
- No trailing whitespace

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required for production)
- `PORT` - Server port (defaults to 3001)
- `NODE_ENV` - Environment mode (development/production)

### Security Considerations
- Never commit secrets or keys to the repository
- Validate all user inputs with Zod schemas
- Use parameterized queries via Drizzle ORM (no SQL injection risk)
- Sanitize error messages before sending to clients
- Session cookies use credentials: "include" for authentication

### Important Notes
- The server and client run on the same port in development
- Always run `npm run check` before committing to ensure type safety
- No comments in code unless explicitly requested
- The project uses ESM modules (type: "module" in package.json)
- Database: PostgreSQL with Drizzle ORM
- Sessions: Express sessions with memory store (development)
