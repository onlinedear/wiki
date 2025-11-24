---
creator: "${author}"
created: "${createTime}"
last_modified_by: "${author}"
last_modified: "${updateTime}"
version: "v1.0"
visibility: "internal"
---
# Product Overview

NoteDoc is an open-source collaborative wiki and documentation platform.

## Core Features

- Real-time collaborative editing with Tiptap editor
- Spaces (document libraries) for organizing content
- Pages (documents) with rich content support
- Comments with reactions, mentions, and notifications
- User and group management with permissions (CASL)
- File attachments and embeds
- Page history and version control
- Full-text search
- Sharing and public links
- Diagrams (Draw.io, Excalidraw, Mermaid)
- Multi-language support (i18n with 10+ languages)

## Architecture

- Monorepo with separate client and server apps
- Real-time collaboration via Hocuspocus (Yjs CRDT)
- WebSocket support for live updates
- PostgreSQL database with Kysely query builder
- Redis for caching and pub/sub
- S3-compatible storage for files

## Licensing

- Core: AGPL 3.0 (open source)
- Enterprise Edition (EE): Proprietary license
  - Located in `apps/*/src/ee` and `packages/ee`
  - Features: SSO, MFA, API keys, billing, LDAP
