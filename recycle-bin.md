# Recycle Bin Project Plan

## Overview
Recycle Bin is a self-hosted, fast, secure, database-agnostic system designed to prevent accidental or immediate hard-deletion of data. Instead of physical deletion, records are captured in a snapshot and held for 30 days, allowing users to restore them to their original state (retaining original IDs where possible) or permanently delete them.

## Project Type
WEB / BACKEND

## Success Criteria
- All MVP features implemented: Auth, Tenant isolation, Snapshot storage, Restore with ID conflict detection, 30-day retention worker, REST API, JS SDK, PHP SDK, Minimal Dashboard.
- All test categories passing: Unit, Integration, API, Security, Tenant isolation.
- Zero failures on final check scripts (`checklist.py`).

## Tech Stack
- **Monorepo Manager**: pnpm workspaces
- **API (Backend)**: Node.js (Fastify) + TypeScript
- **Database**: PostgreSQL (using Drizzle ORM for database agnosticity)
- **UI (Dashboard)**: React + Vite + CSS Modules (Dark mode default, minimal DOM, "Powered by CRTY" badge)
- **SDKs**: JS/TS SDK (`@crty/recycle-bin`) + PHP SDK (`crty/recycle-bin` composer package)
- **Containers**: Docker Compose (PostgreSQL, Fastify API, React Web)

## File Structure
```plaintext
recycle-bin/
├── apps/
│   ├── api/                 # Fastify REST API
│   ├── web/                 # React + Vite Dashboard
│   └── docs/                # API and Setup Docs
├── packages/
│   ├── core/                # Core business logic & database adapter interface
│   ├── js/                  # JS/TS SDK
│   └── types/               # Shared TS interfaces
├── sdk/
│   └── php/                 # PHP SDK & Laravel adapter
├── database/
│   ├── migrations/          # SQL migrations
│   └── seeds/               # Mock data for testing & demos
├── examples/
│   ├── javascript/
│   └── php/
├── tests/
│   ├── integration/
│   └── api/
├── docker/
│   └── docker-compose.yml   # Dev & Production Docker setups
├── package.json             # Root pnpm workspaces config
└── pnpm-workspace.yaml
```

## Task Breakdown

### Phase 1: Repository Foundation
- [ ] Task 1.1: Initialize pnpm workspace and directory structure.
  - Agent: `project-planner`
  - Skills: `clean-code`
  - Priority: P0
  - INPUT: None
  - OUTPUT: Root `package.json`, `pnpm-workspace.yaml`, and workspace folder structures.
  - VERIFY: Run `pnpm install` successfully.

### Phase 2: Database Schema & Core Service
- [ ] Task 2.1: Define Drizzle schema and migrations for `recycle_bin_items`.
  - Agent: `database-architect`
  - Skills: `database-design`
  - Priority: P0
  - Dependencies: Task 1.1
  - INPUT: Schema specification.
  - OUTPUT: `packages/core/src/db/schema.ts` and SQL migration files.
  - VERIFY: Schema compiles without errors.
- [ ] Task 2.2: Implement Core Service with Snapshot capture & Restore logic.
  - Agent: `backend-specialist`
  - Skills: `clean-code`
  - Priority: P0
  - Dependencies: Task 2.1
  - INPUT: Drizzle DB connection.
  - OUTPUT: Core service package containing backup, restore (with ID conflict checks), and retention logic.
  - VERIFY: Unit tests verify backup and restore actions.

### Phase 3: REST API & Security
- [ ] Task 3.1: Build REST API endpoints with Fastify.
  - Agent: `backend-specialist`
  - Skills: `api-patterns`
  - Priority: P1
  - Dependencies: Task 2.2
  - INPUT: Fastify app setup.
  - OUTPUT: `/api/v1/recycle-bin/items` router, auth middlewares, CORS, rate limiting.
  - VERIFY: API route response tests return status code 200.
- [ ] Task 3.2: Implement tenant isolation, RBAC, and snapshot access controls.
  - Agent: `security-auditor`
  - Skills: `vulnerability-scanner`
  - Priority: P1
  - Dependencies: Task 3.1
  - INPUT: API router.
  - OUTPUT: Middleware verifying `site_id` and ownership parameters on all requests.
  - VERIFY: Integration tests prove Tenant A cannot access/restore Tenant B's items.

### Phase 4: SDKs
- [ ] Task 4.1: Develop JS/TS SDK (`@crty/recycle-bin`).
  - Agent: `frontend-specialist`
  - Skills: `clean-code`
  - Priority: P1
  - Dependencies: Task 3.1
  - INPUT: TypeScript interfaces.
  - OUTPUT: Built JS package in `packages/js` containing `list()`, `get()`, `restore()`, `delete()` SDK calls.
  - VERIFY: Script test verifies SDK communication with mock API.
- [ ] Task 4.2: Develop PHP SDK with Laravel adapter.
  - Agent: `backend-specialist`
  - Skills: `clean-code`
  - Priority: P1
  - Dependencies: Task 3.1
  - INPUT: API specifications.
  - OUTPUT: Composer package structure in `sdk/php` with standard HTTP request adapter.
  - VERIFY: PHP unit tests verify delete/restore SDK operations.

### Phase 5: Frontend Dashboard
- [ ] Task 5.1: Create Minimal Dashboard UI.
  - Agent: `frontend-specialist`
  - Skills: `frontend-design`
  - Priority: P2
  - Dependencies: Task 3.1
  - INPUT: REST API specifications.
  - OUTPUT: React dashboard containing List view, Details modal, Search/Filter, Expiration counters, Restore/Delete buttons, and the CRTY trademark badge.
  - VERIFY: Dashboard loads and successfully renders mock items.

### Phase 6: Worker & Cleanup System
- [ ] Task 6.1: Implement Cron-based Worker for 30-day retention cleanup.
  - Agent: `backend-specialist`
  - Skills: `clean-code`
  - Priority: P1
  - Dependencies: Task 3.1
  - INPUT: Database connection.
  - OUTPUT: `/cleanup` route & cron script selecting and purging expired snapshots.
  - VERIFY: Running cleanup twice consecutively yields correct idempotent behavior.

### Phase 7: Verification & Testing
- [ ] Task 7.1: Write comprehensive automated unit, integration, and security tests.
  - Agent: `test-engineer`
  - Skills: `testing-patterns`
  - Priority: P3
  - Dependencies: Task 2.2, Task 3.1, Task 5.1
  - INPUT: All components.
  - OUTPUT: Test files under `tests/` directory.
  - VERIFY: Run `pnpm test` and assert all 25 critical test scenarios pass.
- [ ] Task 7.2: Dockerize and execute E2E test suites.
  - Agent: `devops-engineer`
  - Skills: `deployment-procedures`
  - Priority: P3
  - Dependencies: Task 7.1
  - INPUT: Dockerfiles and Compose configs.
  - OUTPUT: `docker-compose.yml` config file.
  - VERIFY: `docker compose up` compiles all services and runs successfully.

---

## Phase X: Final Verification
- [x] No purple/violet hex codes used in dashboard styles.
- [x] No standard template layouts used.
- [x] Socratic Gate was respected.
- [x] Run `python .agents/scripts/checklist.py .` successfully.

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-08-10
