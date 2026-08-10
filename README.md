# ♻️ Recycle Bin — Self-hosted Deleted Content Recovery System

Recycle Bin is a self-hosted, extremely fast, secure, and database-agnostic open-source system designed to prevent accidental or immediate deletion of contents. Instead of physical deletion, records are captured in a snapshot and held for 30 days, allowing users to restore them to their original state (retaining original IDs where possible) or permanently delete them.

**Powered by CRTY**

---

## 🏗️ Architecture

The system is configured as a monorepo using **pnpm workspaces**:

- `apps/api`: REST API built with Fastify + Node.js (extremely fast, features JWT auth, rate limiting, and tenant isolation).
- `apps/web`: React Dashboard UI built with Vite + Vanilla CSS (default dark mode, custom details modal, and search/filter).
- `packages/core`: Core database adapter layer and restore logic built with Drizzle ORM.
- `packages/js`: JavaScript/TypeScript SDK `@crty/recycle-bin` to interact with the API.
- `sdk/php`: PHP Composer SDK `crty/recycle-bin` featuring Laravel Service Providers and Facades.

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v20+)
- pnpm (v11+)
- PostgreSQL (or run via Docker)

### Local Development Setup

1. **Install dependencies**:
   ```bash
   pnpm install --ignore-scripts
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and adjust database credentials.

3. **Build the packages**:
   ```bash
   pnpm build
   ```

4. **Run the development servers**:
   - Run REST API: `pnpm dev` (runs on http://localhost:3000)
   - Run React Dashboard: `pnpm web:dev` (runs on http://localhost:3001)

5. **Run the Test Suites**:
   - Run core tests: `pnpm --filter @crty/recycle-bin-core test`
   - Run API tests: `pnpm --filter @crty/recycle-bin-api test`

---

## 🐳 Running via Docker Compose

Spin up the entire stack (Database, API, and Web client) using:

```bash
docker compose up --build -d
```

- **REST API**: http://localhost:3000
- **Dashboard UI**: http://localhost:3001
- **Database**: Port 5432

---

## 📦 SDK Integrations

### JavaScript SDK
Install:
```bash
npm install @crty/recycle-bin
```

Initialize:
```javascript
import { RecycleBin } from "@crty/recycle-bin";

RecycleBin.init({
  api: "http://localhost:3000/api/v1/recycle-bin",
  siteId: "your-site-id",
  apiKey: "your-api-key"
});
```

Backup a deleted item:
```javascript
await RecycleBin.backup({
  userId: "user-27",
  contentType: "post",
  originalId: "18452",
  snapshot: { id: "18452", title: "Hello World", content: "Test content..." },
  metadata: { ip: "127.0.0.1" }
});
```

Restore:
```javascript
await RecycleBin.restore("rb_xxxxxxxxx");
```

---

### PHP SDK
Install:
```bash
composer require crty/recycle-bin
```

Laravel usage:
```php
use Crty\RecycleBin\Laravel\Facades\RecycleBin;

// Backup item
RecycleBin::backup(
    userId: 'user-27',
    contentType: 'post',
    originalId: '18452',
    snapshot: ['id' => 18452, 'title' => 'Sample Post']
);

// Restore item (conflict checks will automatically run)
RecycleBin::restore('rb_xxxxxxxxx');
```

---

## 🛡️ API Endpoint Contracts

All endpoints are versioned under `/api/v1/recycle-bin/` and require `X-Site-ID` and `Authorization` headers.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/items` | Create backup snapshot |
| `GET` | `/items` | List deleted items (with pagination) |
| `GET` | `/items/:id` | View item snapshot details |
| `POST` | `/items/:id/restore` | Restore original record (with conflict check) |
| `DELETE` | `/items/:id` | Permanent delete (physical purge) |
| `POST` | `/empty` | Bulk permanent delete |
| `POST` | `/cleanup` | Idempotent retention worker trigger |

---

## ⚖️ License
Licensed under the MIT License with Trademark & Attribution clauses. Redistributions or derivative deployments must retain the **Powered by CRTY** visual attribution badge on all pages. See `LICENSE` for details.
