# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered personal color diagnosis and virtual try-on service. TypeScript monorepo using Nx + pnpm.

## Common Commands

```bash
# Install
pnpm install

# Build
pnpm build:backend          # All backend services
pnpm build:frontend         # Next.js web app

# Dev servers
pnpm serve:web              # Next.js (port 3000)
pnpm serve:auth             # Auth service (port 3301)
pnpm serve:gateway          # API Gateway (port 3300)
pnpm serve:file-mng         # File management (port 3302)
pnpm serve:personal-color   # Personal color service (port 3305)

# Nx
nx run <project>:<target>   # e.g. nx run service-auth:serve
nx test <project>           # Run tests for a project
nx graph                    # Dependency visualization
```

## Architecture

**Microservices monorepo** with NestJS (Fastify) backend services, Next.js frontend, and shared libraries.

```
apps/backend/
  service-auth/              # Authentication & JWT
  service-file-mng/          # File management (MinIO)
  service-gateway/           # API Gateway (reverse proxy)
  service-personal-color/    # AI personal color analysis & virtual try-on

apps/frontend/web/           # Next.js 14 + React 19 + Tailwind CSS

libs/
  glb-commons/               # Global infrastructure (TypeORM, Redis, MinIO, ACL, logging, entities)
  cbiz-commons/              # Core business logic commons
```

### Import Aliases

- `@capstone-project/glb-commons` → `libs/glb-commons/src/index.ts`
- `@capstone-project/cbiz-commons` → `libs/cbiz-commons/src/index.ts`

### Backend Service Pattern

Each service follows: **Controller → Service → Repository → Entity (TypeORM)**

- Base repositories: `RnBaseRepository`, `RnBaseTenantRepository`
- Multi-tenant architecture with tenant-specific and default databases
- Custom decorators: `@Public()`, `@User()`, `@ServiceException()`, `@ApiDefaultHeaders()`
- CRUD utilities from `@dataui/crud` packages

### Infrastructure

MySQL + Redis + RabbitMQ + MinIO + Elasticsearch. Secrets managed via Doppler. Docker compose configs in `tools/docker-compose/`.

### Personal Color Service (service-personal-color)

Core AI service using Gemini API (`GeminiApiClientService`, `GeminiPersonalColorProviderService`, `GeminiTryOnProviderService`). Key entities in `glb-commons`: `RnDefaultPersonalColorEntity`, `RnDefaultPcUserEntity`, `RnDefaultPcAnalysisEntity`, `RnDefaultPcSavedLookEntity`.

## Git Commit Conventions

From `.cursorrules` — commit messages must be:
- Written in **Korean**
- Conventional Commits format (`feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`)
- Subject under 72 chars, no period
- Body as bullet list only (`- `) with WHAT + WHERE (file path or Nx target)
- No explanations of why; action-based verb endings (~함, ~추가함, ~수정함, etc.)
- Moving existing code/enums is `refactor`, not `feat`
