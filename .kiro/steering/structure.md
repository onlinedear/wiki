# Project Structure

## Monorepo Layout

```
docmost/
├── apps/
│   ├── client/          # React frontend
│   └── server/          # NestJS backend
├── packages/
│   ├── editor-ext/      # Shared Tiptap extensions
│   └── ee/              # Enterprise license marker
├── docs/                # Documentation and guides
├── scripts/             # Utility scripts
├── data/storage/        # Local file storage (dev)
└── .env                 # Environment configuration
```

## Frontend Structure (apps/client/src)

```
src/
├── features/            # Feature-based modules
│   ├── auth/           # Authentication
│   ├── page/           # Page/document management
│   ├── space/          # Space management
│   ├── user/           # User management
│   ├── comment/        # Comments system
│   ├── editor/         # Editor components
│   ├── search/         # Search functionality
│   └── workspace/      # Workspace settings
├── components/
│   ├── common/         # Shared components
│   ├── icons/          # Icon components
│   ├── layouts/        # Layout components
│   ├── settings/       # Settings components
│   └── ui/             # UI primitives
├── pages/              # Route pages
│   ├── auth/
│   ├── dashboard/
│   ├── page/
│   ├── settings/
│   └── space/
├── ee/                 # Enterprise features
│   ├── api-key/
│   ├── billing/
│   ├── mfa/
│   └── security/
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
│   ├── api-client.ts   # API client setup
│   ├── config.ts       # App configuration
│   └── utils.tsx       # Helper functions
├── public/locales/     # i18n translation files
├── App.tsx             # Main app with routes
├── main.tsx            # Entry point
└── i18n.ts             # i18n configuration
```

## Backend Structure (apps/server/src)

```
src/
├── core/               # Core business logic
│   ├── auth/          # Authentication
│   ├── page/          # Page management
│   ├── space/         # Space management
│   ├── user/          # User management
│   ├── comment/       # Comments
│   ├── workspace/     # Workspace
│   ├── group/         # Groups
│   ├── share/         # Sharing
│   └── casl/          # Permissions (CASL)
├── database/
│   ├── repos/         # Repository pattern (data access)
│   ├── migrations/    # Database migrations
│   ├── types/         # Kysely type definitions
│   └── services/      # Database services
├── collaboration/     # Real-time collaboration
│   ├── server/        # Hocuspocus server
│   ├── extensions/    # Hocuspocus extensions
│   └── adapter/       # Redis adapter
├── integrations/      # External integrations
│   ├── environment/   # Config management
│   ├── storage/       # File storage (S3)
│   ├── mail/          # Email service
│   ├── queue/         # Job queue (BullMQ)
│   ├── redis/         # Redis setup
│   ├── search/        # Search (Typesense)
│   ├── import/        # Import services
│   └── export/        # Export services
├── ee/                # Enterprise features
│   ├── api-key/
│   ├── mfa/
│   └── [other EE modules]
├── common/
│   ├── decorators/    # Custom decorators
│   ├── guards/        # Auth guards
│   ├── interceptors/  # Interceptors
│   └── middlewares/   # Middleware
├── ws/                # WebSocket gateway
├── app.module.ts      # Root module
└── main.ts            # Entry point
```

## Key Patterns

### Frontend

- **Feature modules**: Each feature has its own folder with components, queries, services, types
- **Queries**: TanStack Query hooks in `queries/` subdirectories
- **Services**: API calls in `services/` subdirectories
- **Atoms**: Jotai state in `atoms/` subdirectories
- **Path alias**: `@/` maps to `src/`
- **CSS Modules**: Component-specific styles with `.module.css`

### Backend

- **Module structure**: Each feature is a NestJS module with:
  - `*.module.ts` - Module definition
  - `*.controller.ts` - HTTP endpoints
  - `*.service.ts` - Business logic
  - `dto/*.dto.ts` - Data transfer objects
  - `guards/*.guard.ts` - Authorization guards
- **Repository pattern**: Database access through repos in `database/repos/`
- **Path aliases**:
  - `@docmost/db/*` → `src/database/*`
  - `@docmost/ee/*` → `src/ee/*`
  - `@docmost/transactional/*` → `src/integrations/transactional/*`

### Database

- **Migrations**: TypeScript files in `database/migrations/`
  - Format: `YYYYMMDDTHHMMSS-description.ts`
  - Manual SQL migrations also supported
- **Repos**: One repo per table/entity
- **Types**: Auto-generated from schema via `pnpm migration:codegen`

### Enterprise Features

- Located in `apps/*/src/ee/` directories
- Dynamically loaded in production
- Separate license (see `packages/ee/LICENSE`)
- Examples: SSO, MFA, API keys, billing, LDAP

## Configuration Files

- `nx.json` - Nx workspace config
- `pnpm-workspace.yaml` - pnpm workspace definition
- `tsconfig.json` - TypeScript configs (per app)
- `vite.config.ts` - Vite config (client)
- `nest-cli.json` - NestJS CLI config (server)
- `.env` - Environment variables (workspace root)
