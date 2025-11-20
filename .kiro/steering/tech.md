# Technology Stack

## Build System

- **Monorepo**: Nx workspace with pnpm workspaces
- **Package Manager**: pnpm 10.4.0
- **Node.js**: Target ES2021

## Frontend (apps/client)

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **UI Library**: Mantine 8 (components, hooks, forms)
- **Editor**: Tiptap 2 (ProseMirror-based)
- **State Management**: Jotai (atoms)
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router 7
- **i18n**: i18next + react-i18next
- **Styling**: CSS Modules + PostCSS
- **Icons**: Tabler Icons
- **Validation**: Zod + mantine-form-zod-resolver

## Backend (apps/server)

- **Framework**: NestJS 11 + TypeScript
- **Platform**: Fastify (not Express)
- **Database**: PostgreSQL with Kysely query builder
- **ORM**: Kysely (type-safe SQL builder, not TypeORM)
- **Migrations**: Kysely migrations (manual SQL + TypeScript)
- **Cache**: Redis (ioredis)
- **Queue**: BullMQ
- **Auth**: Passport (JWT, Google OAuth, SAML)
- **WebSockets**: Socket.io
- **Collaboration**: Hocuspocus server (Yjs)
- **Storage**: AWS SDK S3 (S3-compatible)
- **Email**: Nodemailer + React Email templates
- **Validation**: class-validator + class-transformer

## Shared Packages

- **editor-ext**: Custom Tiptap extensions (workspace package)

## Common Commands

### Development
```bash
# Start both client and server
pnpm dev

# Start client only
pnpm client:dev

# Start server only
pnpm server:dev

# Start collaboration server
pnpm collab:dev
```

### Build
```bash
# Build all apps
pnpm build

# Build specific app
pnpm client:build
pnpm server:build
pnpm editor-ext:build
```

### Database Migrations
```bash
# Run migrations (from apps/server)
pnpm migration:up

# Create new migration
pnpm migration:create <name>

# Generate Kysely types from schema
pnpm migration:codegen
```

### Testing
```bash
# Run tests (from specific app)
pnpm test

# E2E tests (server)
pnpm test:e2e
```

### Code Quality
```bash
# Lint
pnpm lint

# Format (Prettier)
pnpm format
```

## Key Dependencies

- **Collaboration**: Yjs, Hocuspocus, y-indexeddb
- **Editor**: Tiptap extensions, lowlight (syntax highlighting), KaTeX (math)
- **Diagrams**: Excalidraw, Mermaid, react-drawio
- **Security**: bcrypt, jsonwebtoken, otplib (MFA)
- **File Processing**: sharp (images), pdfjs-dist, mammoth (Word docs)
- **Utilities**: date-fns, nanoid, uuid, lodash patterns

## Environment Variables

Loaded from `.env` at workspace root. Client uses Vite's `loadEnv` to access specific vars.
