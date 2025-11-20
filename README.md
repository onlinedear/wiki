<div align="center">
    <h1><b>Docmost</b></h1>
    <p>
        Open-source collaborative wiki and documentation software
        <br />
        <a href="https://docmost.com"><strong>Website</strong></a> | 
        <a href="https://docmost.com/docs"><strong>Documentation</strong></a> |
        <a href="https://twitter.com/DocmostHQ"><strong>Twitter / X</strong></a> |
        <a href="https://github.com/docmost/docmost/discussions"><strong>Discussions</strong></a>
    </p>
    <p>
        <img src="https://img.shields.io/github/v/release/docmost/docmost?style=flat-square" alt="Release">
        <img src="https://img.shields.io/github/license/docmost/docmost?style=flat-square" alt="License">
        <img src="https://img.shields.io/github/stars/docmost/docmost?style=flat-square" alt="Stars">
    </p>
</div>

<br />

## 📖 About Docmost

Docmost is a powerful open-source collaborative wiki and documentation platform built for modern teams. It combines real-time collaboration, rich content editing, and flexible organization to help teams create, share, and maintain their knowledge base.

### ✨ Key Highlights

- **Real-time Collaboration** - Multiple users can edit documents simultaneously with live cursors and updates
- **Rich Editor** - Powered by Tiptap with support for markdown, tables, code blocks, and more
- **Flexible Organization** - Organize content in spaces (document libraries) with nested pages
- **Advanced Permissions** - Fine-grained access control with user groups and role-based permissions
- **Enterprise Ready** - SSO, MFA, API keys, and audit logs (Enterprise Edition)
- **Self-hosted** - Full control over your data with Docker deployment
- **Multi-language** - Support for 10+ languages with active community translations

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Download docker-compose.yml
curl -O https://raw.githubusercontent.com/docmost/docmost/main/docker-compose.yml

# Generate a secure secret
openssl rand -hex 32

# Edit docker-compose.yml with your configuration
# - Set APP_URL to your domain
# - Set APP_SECRET to the generated secret
# - Set strong database password

# Start Docmost
docker-compose up -d

# Access at http://localhost:3000
```

### Manual Installation

See our [complete deployment guide](./docs/Docmost完整部署指南.md) for detailed instructions on:
- Manual deployment on Ubuntu/Debian/CentOS
- Cloud platform deployment (AWS, GCP, Azure)
- Kubernetes deployment
- Production configuration and optimization

## 📚 Features

### Core Features

- **📝 Real-time Collaborative Editing** - Work together with live updates and cursor tracking
- **🎨 Rich Content Editor** - Markdown support, tables, code blocks, task lists, and more
- **📊 Diagrams** - Integrated Draw.io, Excalidraw, and Mermaid support
- **📁 Spaces** - Organize documents in separate workspaces with custom permissions
- **🔍 Full-text Search** - Fast and accurate search across all content
- **💬 Comments** - Threaded comments with mentions, reactions, and notifications
- **📎 File Attachments** - Upload and embed files, images, and documents
- **🔗 Embeds** - Embed content from Airtable, Loom, Miro, YouTube, and more
- **📜 Page History** - Track changes and restore previous versions
- **👥 User & Group Management** - Organize users into groups with role-based access
- **🔐 Permissions** - Fine-grained access control with CASL-based authorization
- **🌍 Internationalization** - Support for 10+ languages
- **🔗 Sharing** - Generate public links for external sharing

### Enterprise Edition Features

- **🔒 Single Sign-On (SSO)** - SAML 2.0 and OAuth 2.0 integration
- **🔐 Multi-Factor Authentication (MFA)** - TOTP-based 2FA for enhanced security
- **🔑 API Keys** - Programmatic access with fine-grained permissions
- **📊 Audit Logs** - Track all user activities and changes
- **🏢 LDAP Integration** - Connect with Active Directory and LDAP servers
- **💳 Billing Management** - Subscription and license management

## 🏗️ Architecture

Docmost is built as a modern monorepo with separate client and server applications:

### Technology Stack

**Frontend**
- React 18 with TypeScript
- Vite for fast development and building
- Mantine UI component library
- TanStack Query for data fetching
- Jotai for state management
- Tiptap editor with Yjs for collaboration

**Backend**
- NestJS framework with TypeScript
- PostgreSQL 16+ database
- Kysely query builder
- Redis for caching and pub/sub
- Hocuspocus for real-time collaboration
- S3-compatible storage

**Real-time Collaboration**
- Yjs CRDT for conflict-free editing
- Hocuspocus WebSocket server
- Redis adapter for scaling

### Project Structure

```
docmost/
├── apps/
│   ├── client/          # React frontend application
│   └── server/          # NestJS backend application
├── packages/
│   ├── editor-ext/      # Shared Tiptap editor extensions
│   └── ee/              # Enterprise Edition license marker
├── docs/                # Documentation and guides
├── scripts/             # Utility and verification scripts
├── examples/            # Usage examples and templates
└── data/                # Local development data
```

For detailed structure information, see [Project Structure](./docs/structure.md).

## 📖 Documentation

### Getting Started
- [Quick Start Guide](./docs/START_HERE.md) - Get up and running quickly
- [Deployment Guide](./docs/Docmost完整部署指南.md) - Complete deployment instructions
- [API Key Usage Guide](./docs/API密钥使用完整指南.md) - API authentication and usage

### Feature Documentation
- [MFA/SSO Implementation](./docs/MFA_SSO_实现说明.md) - Multi-factor authentication and SSO
- [Comment System](./docs/评论管理功能说明.md) - Comments, reactions, and notifications
- [API Key Management](./docs/API_KEY_README.md) - API key features and management

### Development
- [Development Setup](https://docmost.com/docs/self-hosting/development) - Local development guide
- [Contributing Guidelines](./CONTRIBUTING.md) - How to contribute to Docmost

For a complete list of documentation, see the [docs directory](./docs/README.md).

## 🛠️ Development

### Prerequisites

- Node.js 22.x
- pnpm 10.4.0
- PostgreSQL 16+
- Redis 7.2+

### Setup

```bash
# Clone the repository
git clone https://github.com/docmost/docmost.git
cd docmost

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Configure your .env file with database and Redis URLs

# Run database migrations
cd apps/server
pnpm migration:up
cd ../..

# Start development servers
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Available Scripts

```bash
# Development
pnpm dev              # Start both client and server in dev mode
pnpm client:dev       # Start only frontend
pnpm server:dev       # Start only backend

# Building
pnpm build            # Build all apps
pnpm client:build     # Build frontend
pnpm server:build     # Build backend

# Production
pnpm start            # Start production server

# Database
cd apps/server
pnpm migration:up     # Run migrations
pnpm migration:down   # Rollback migration
pnpm migration:codegen # Generate types from schema
```

## 🔒 Security

### Reporting Security Issues

If you discover a security vulnerability, please email security@docmost.com. Do not create public GitHub issues for security vulnerabilities.

### Security Features

- SHA-256 password hashing with bcrypt
- JWT-based authentication
- CSRF protection
- Rate limiting
- SQL injection prevention via parameterized queries
- XSS protection with content sanitization
- Secure file upload validation

## 📄 License

### Open Source License

Docmost core is licensed under the **AGPL 3.0** license. This includes all code except for the Enterprise Edition features.

### Enterprise Edition License

Enterprise features are available under a proprietary license. All files in the following directories are licensed under the Docmost Enterprise license defined in `packages/ee/LICENSE`:

- `apps/server/src/ee/`
- `apps/client/src/ee/`
- `packages/ee/`

Enterprise features include:
- Single Sign-On (SSO)
- Multi-Factor Authentication (MFA)
- API Keys
- Audit Logs
- LDAP Integration
- Priority Support

For Enterprise Edition licensing, contact sales@docmost.com.

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Report Bugs** - Open an issue with detailed reproduction steps
2. **Suggest Features** - Share your ideas in GitHub Discussions
3. **Submit Pull Requests** - Fix bugs or add features
4. **Improve Documentation** - Help us improve our docs
5. **Translate** - Help translate Docmost into your language

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

See our [Contributing Guide](./CONTRIBUTING.md) for detailed information.

## 🌍 Community & Support

- **GitHub Discussions** - Ask questions and share ideas
- **Twitter/X** - Follow [@DocmostHQ](https://twitter.com/DocmostHQ) for updates
- **Documentation** - Visit [docmost.com/docs](https://docmost.com/docs)
- **Email** - Contact support@docmost.com

## 🙏 Acknowledgments

Special thanks to the following projects and organizations:

### Open Source Projects

- [Tiptap](https://tiptap.dev/) - Headless editor framework
- [Yjs](https://yjs.dev/) - CRDT framework for real-time collaboration
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [React](https://react.dev/) - UI library
- [Mantine](https://mantine.dev/) - React component library
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Redis](https://redis.io/) - In-memory data store

### Services

<img width="100" alt="Crowdin" src="https://github.com/user-attachments/assets/a6c3d352-e41b-448d-b6cd-3fbca3109f07" />

[Crowdin](https://crowdin.com/) for providing access to their localization platform.

<img width="48" alt="Algolia" src="https://github.com/user-attachments/assets/6ccad04a-9589-4965-b6a1-d5cb1f4f9e94" />

[Algolia](https://www.algolia.com/) for providing full-text search to the docs.

## 📊 Project Status

Docmost is actively maintained and under continuous development. We release new features and improvements regularly.

- **Current Version**: 0.23.2
- **Status**: Production Ready
- **Release Cycle**: Regular updates and security patches

## 📸 Screenshots

<p align="center">
<img alt="Docmost Home" src="https://docmost.com/screenshots/home.png" width="70%">
<br />
<em>Home Dashboard</em>
</p>

<p align="center">
<img alt="Docmost Editor" src="https://docmost.com/screenshots/editor.png" width="70%">
<br />
<em>Rich Text Editor with Real-time Collaboration</em>
</p>

---

<div align="center">
    <p>
        Made with ❤️ by the Docmost team and contributors
        <br />
        <a href="https://docmost.com">Website</a> •
        <a href="https://docmost.com/docs">Docs</a> •
        <a href="https://github.com/docmost/docmost">GitHub</a> •
        <a href="https://twitter.com/DocmostHQ">Twitter</a>
    </p>
</div>

