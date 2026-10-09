import { useState } from 'react';

import CodeBlock from '../../components/CodeBlock';
import styles from './Installation.module.css';

type Tab = 'npm' | 'php' | 'docker';

const tabs: { key: Tab; label: string }[] = [
  { key: 'npm',    label: 'JavaScript / TypeScript' },
  { key: 'php',    label: 'PHP / Laravel' },
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
  apiKey:  process.env.RECYCLE_BIN_API_KEY,
  siteId:  'my-app',
});

// Soft-delete a record
await client.delete({ table: 'posts', id: '42', snapshot: post });

// Restore it
await client.restore('rb_item_id');

// List items
const items = await client.list({ search: 'hello', limit: 20 });`;

const phpCode = `# Install
composer require crty/recycle-bin

# Laravel — publish config
php artisan vendor:publish --tag=recycle-bin-config

# config/recycle_bin.php
return [
    'base_url' => env('RECYCLE_BIN_URL', 'http://localhost:3000'),
    'api_key'  => env('RECYCLE_BIN_API_KEY'),
    'site_id'  => env('RECYCLE_BIN_SITE_ID', 'default'),
];

# Usage via Facade
use RecycleBin;

RecycleBin::delete([
    'table'    => 'posts',
    'id'       => $post->id,
    'snapshot' => $post->toArray(),
]);

RecycleBin::restore($itemId);`;

const dockerCode = `# docker-compose.yml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: recycle_bin
      POSTGRES_USER: rb_user
      POSTGRES_PASSWORD: secret
    volumes:
      - pg_data:/var/lib/postgresql/data

  api:
    image: ghcr.io/crtypubg/recycle-bin-api:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL:  postgresql://rb_user:secret@db:5432/recycle_bin
      API_KEY:       your-secret-api-key
      JWT_SECRET:    your-jwt-secret
      SITE_ID:       my-app
    depends_on:
      - db

volumes:
  pg_data:`;

const envCode = `DATABASE_URL=postgresql://user:pass@localhost:5432/recycle_bin
API_KEY=your-secret-api-key-min-32-chars
JWT_SECRET=your-jwt-secret-min-32-chars
PORT=3000
CLEANUP_INTERVAL_HOURS=24
DEFAULT_RETENTION_DAYS=30`;

const endpoints = [
  { method: 'POST',   path: '/api/delete',          desc: 'Soft-delete a record and store snapshot' },
  { method: 'GET',    path: '/api/items',            desc: 'List all soft-deleted items (filterable)' },
  { method: 'POST',   path: '/api/restore/:id',      desc: 'Restore an item to original table' },
  { method: 'DELETE', path: '/api/items/:id',        desc: 'Permanently delete an item immediately' },
  { method: 'GET',    path: '/health',               desc: 'API health check' },
];

export default function Installation() {
  const [tab, setTab] = useState<Tab>('npm');

  return (
    <div className={styles.root}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <p className={styles.eyebrow}>Installation</p>
          <h1 className={styles.title}>Get up and running in minutes.</h1>
          <p className={styles.sub}>
            Recycle Bin ships as a Docker container, a JavaScript SDK, and a PHP Composer package.
            Pick your stack.
          </p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`${styles.tab} ${tab === t.key ? styles.activeTab : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.codeArea}>
          {tab === 'npm' && (
            <CodeBlock code={jsCode} language="typescript" label="JavaScript / TypeScript SDK" />
          )}
          {tab === 'php' && (
            <CodeBlock code={phpCode} language="php" label="PHP / Laravel SDK" />
          )}
          {tab === 'docker' && (
            <CodeBlock code={dockerCode} language="yaml" label="docker-compose.yml" />
          )}
        </div>

        <hr className={styles.divider} />

        {/* Environment variables */}
        <section className={styles.section}>
          <h2 className={styles.h2}>Environment Variables</h2>
          <CodeBlock code={envCode} language="bash" label=".env" />
        </section>

        <hr className={styles.divider} />

        {/* REST API endpoints */}
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
