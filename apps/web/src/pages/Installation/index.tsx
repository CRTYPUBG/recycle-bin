import { useState } from 'react';

import CodeBlock from '../../components/CodeBlock';
import styles from './Installation.module.css';

type Tab = 'npm' | 'php' | 'docker';

const tabs: { key: Tab; label: string }[] = [
  { key: 'npm', label: 'JavaScript / TypeScript' },
  { key: 'php', label: 'PHP / Laravel' },
  { key: 'docker', label: 'Docker' },
];

const jsCode = `// Install
npm install @crty/recycle-bin
# or
pnpm add @crty/recycle-bin

// Usage
import { RecycleBinClient } from '@crty/recycle-bin';

const client = new RecycleBinClient({
  baseUrl: 'https://your-api.com',
  apiKey: process.env.RECYCLE_BIN_API_KEY,
  siteId: 'my-app',
});

// Soft-delete a record
await client.delete({ table: 'posts', id: '42', snapshot: post });

// Restore it
await client.restore('rb_item_id');

// List items
const items = await client.list({ search: 'hello', limit: 20 });`;

const phpCode = `# Install
composer require crty/recycle-bin

# Laravel - publish config
php artisan vendor:publish --tag=recycle-bin-config

# config/recycle_bin.php
return [
    'base_url' => env('RECYCLE_BIN_URL', 'http://localhost:3000'),
    'api_key' => env('RECYCLE_BIN_API_KEY'),
    'site_id' => env('RECYCLE_BIN_SITE_ID', 'default'),
];

# Usage via Facade
use RecycleBin;

RecycleBin::delete([
    'table' => 'posts',
    'id' => $post->id,
    'snapshot' => $post->toArray(),
]);

RecycleBin::restore($itemId);`;

const dockerCode = `# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: recycle_bin_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: recycle_bin
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d recycle_bin"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: recycle_bin_api
    environment:
      - PORT=3000
      - HOST=0.0.0.0
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/recycle_bin
      - JWT_SECRET=crty_recycle_bin_secret_key
      - API_KEY=crty_api_key_default
      - CORS_ORIGINS=*
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: recycle_bin_web
    ports:
      - "3001:80"
    depends_on:
      - api

volumes:
  pgdata:`;

const dockerCommandsCode = `# Run from the repository root

# Validate the Compose configuration
docker compose config

# Build images and start all services in the background
docker compose up --build -d

# Check service status
docker compose ps

# Follow logs from all services
docker compose logs -f --tail=100

# View logs for a specific service
docker compose logs -f api

# Stop services and preserve database data
docker compose down

# WARNING: permanently removes the database volume and its data
# Only run this if you intentionally want to delete the data:
# docker compose down -v`;

const envCode = `DATABASE_URL=postgresql://user:pass@localhost:5432/recycle_bin
API_KEY=your-secret-api-key-min-32-chars
JWT_SECRET=your-jwt-secret-min-32-chars
PORT=3000
CLEANUP_INTERVAL_HOURS=24
DEFAULT_RETENTION_DAYS=30`;

const endpoints = [
  {
    method: 'POST',
    path: '/api/delete',
    desc: 'Soft-delete a record and store snapshot',
  },
  {
    method: 'GET',
    path: '/api/items',
    desc: 'List all soft-deleted items (filterable)',
  },
  {
    method: 'POST',
    path: '/api/restore/:id',
    desc: 'Restore an item to original table',
  },
  {
    method: 'DELETE',
    path: '/api/items/:id',
    desc: 'Permanently delete an item immediately',
  },
  {
    method: 'GET',
    path: '/health',
    desc: 'API health check',
  },
];

export default function Installation() {
  const [tab, setTab] = useState<Tab>('npm');

  return (
    <div className={styles.root}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Installation</p>
          <h1 className={styles.title}>Get up and running in minutes.</h1>
          <p className={styles.sub}>
            Recycle Bin ships as a Docker container, a JavaScript SDK, and a PHP Composer package.
            Pick your stack.
          </p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Installation methods">
          {tabs.map((t) => (
            <button
              key={t.key}
              id={`installation-tab-${t.key}`}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              aria-controls={`installation-panel-${t.key}`}
              className={`${styles.tab} ${tab === t.key ? styles.activeTab : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          className={styles.codeArea}
          id={`installation-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`installation-tab-${tab}`}
        >
          {tab === 'npm' && (
            <CodeBlock
              code={jsCode}
              language="typescript"
              label="JavaScript / TypeScript SDK"
            />
          )}

          {tab === 'php' && (
            <CodeBlock
              code={phpCode}
              language="php"
              label="PHP / Laravel SDK"
            />
          )}

          {tab === 'docker' && (
            <>
              <section className={styles.section}>
                <h2 className={styles.h2}>1. Docker Compose configuration</h2>
                <p className={styles.sub}>
                  Save this configuration as docker-compose.yml in the repository root.
                </p>
                <CodeBlock
                  code={dockerCode}
                  language="yaml"
                  label="docker-compose.yml"
                />
              </section>

              <section className={styles.section}>
                <h2 className={styles.h2}>2. Start the application</h2>
                <p className={styles.sub}>
                  Open a terminal in the repository root, where docker-compose.yml is located.
                  This command builds the API and web images, then starts PostgreSQL and the
                  application services in the background.
                </p>
                <CodeBlock
                  code="docker compose up --build -d"
                  language="bash"
                  label="Build and start"
                />
                <p className={styles.sub}>
                  If the images have already been built and you do not need to rebuild them,
                  use this command instead.
                </p>
                <CodeBlock
                  code="docker compose up -d"
                  language="bash"
                  label="Start existing images"
                />
              </section>

              <section className={styles.section}>
                <h2 className={styles.h2}>3. Manage Docker services</h2>
                <CodeBlock
                  code={dockerCommandsCode}
                  language="bash"
                  label="Docker commands"
                />
                <p className={styles.sub}>
                  The command docker compose down stops and removes the containers but preserves
                  the named database volume. The command docker compose down -v also removes
                  that volume and permanently deletes its stored database data.
                </p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.h2}>4. Configure environment variables</h2>
                <p className={styles.sub}>
                  Use the variables below as a reference. Configure the values required by your
                  deployment and never use example credentials in production.
                </p>
                <CodeBlock code={envCode} language="bash" label=".env example" />
              </section>
            </>
          )}
        </div>

        <hr className={styles.divider} />

        <section className={styles.section}>
          <h2 className={styles.h2}>REST API Endpoints</h2>
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Method</span>
              <span>Path</span>
              <span>Description</span>
            </div>

            {endpoints.map((ep) => (
              <div key={ep.path} className={styles.tableRow}>
                <span className={`${styles.method} ${styles[ep.method.toLowerCase()]}`}>
                  {ep.method}
                </span>
                <code className={styles.path}>{ep.path}</code>
                <span className={styles.desc}>{ep.desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}