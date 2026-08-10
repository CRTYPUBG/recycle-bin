import { useState } from 'react';

import CodeBlock from '../../components/CodeBlock';
import styles from './Docs.module.css';

const sections = [
  { id: 'overview',    label: 'Overview' },
  { id: 'auth',        label: 'Authentication' },
  { id: 'js-sdk',      label: 'JavaScript SDK' },
  { id: 'php-sdk',     label: 'PHP SDK' },
  { id: 'rest-api',    label: 'REST API' },
  { id: 'database',    label: 'Database Schema' },
];

const jsSdkCode = `import { RecycleBinClient } from '@crty/recycle-bin';

const rb = new RecycleBinClient({
  baseUrl: 'https://your-api.com',
  apiKey:  'rb_live_xxxxx',
  siteId:  'my-app',
});

// Delete (capture snapshot)
await rb.delete({
  table:    'posts',
  id:       '42',
  snapshot: { title: 'Hello', body: '...' },
  metadata: { deletedBy: 'user_99' },
});

// List with search
const { items } = await rb.list({ search: 'hello', limit: 20 });

// Restore
await rb.restore('rb_item_id_here');

// Permanently purge
await rb.purge('rb_item_id_here');`;

const phpSdkCode = `use CRTY\\RecycleBin\\RecycleBinClient;

$rb = new RecycleBinClient(
    baseUrl: config('recycle_bin.base_url'),
    apiKey:  config('recycle_bin.api_key'),
    siteId:  config('recycle_bin.site_id'),
);

// Delete
$rb->delete(table: 'posts', id: '42', snapshot: $post->toArray());

// List
$result = $rb->list(search: 'hello', limit: 20);

// Restore
$rb->restore(itemId: 'rb_item_id_here');`;

const restCode = `# Delete a record
POST /api/delete
Authorization: Bearer <jwt>   # OR
X-API-Key: rb_live_xxxxx
X-Site-ID: my-app
Content-Type: application/json

{
  "table":    "posts",
  "id":       "42",
  "snapshot": { "title": "Hello World" }
}

# Response
{
  "success":    true,
  "item_id":    "rb_abc123",
  "expires_at": "2025-09-09T00:00:00Z"
}`;

const schemaCode = `-- recycle_bin_items table
CREATE TABLE recycle_bin_items (
  id          TEXT        PRIMARY KEY,           -- rb_<uuid>
  site_id     TEXT        NOT NULL,              -- tenant
  table_name  TEXT        NOT NULL,              -- original table
  record_id   TEXT        NOT NULL,              -- original ID
  snapshot    JSONB       NOT NULL,              -- full row data
  metadata    JSONB,                             -- extra info
  deleted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL,              -- deleted_at + 30d
  restored_at TIMESTAMPTZ,                       -- null if not restored
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX ON recycle_bin_items (site_id, expires_at);
CREATE INDEX ON recycle_bin_items USING gin (snapshot);
CREATE INDEX ON recycle_bin_items (site_id, table_name, record_id);`;

export default function Docs() {
  const [active, setActive] = useState('overview');

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.root}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <p className={styles.sidebarLabel}>Documentation</p>
        <nav>
          {sections.map((s) => (
            <button
              key={s.id}
              className={`${styles.sidebarLink} ${active === s.id ? styles.sidebarActive : ''}`}
              onClick={() => scrollTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className={styles.content}>

        <section id="overview" className={styles.section}>
          <p className={styles.eyebrow}>Documentation</p>
          <h1 className={styles.h1}>Recycle Bin — Overview</h1>
          <p className={styles.lead}>
            Recycle Bin is a self-hosted soft-delete and content recovery layer. Instead of immediately
            destroying records from your database, it captures a full snapshot and holds it for 30 days.
            Users or admins can restore content to the original table — with the original ID — at any time
            within that window.
          </p>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>♻</span>
              <p>Soft-delete with snapshot preservation</p>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>🔒</span>
              <p>Multi-tenant isolation via X-Site-ID</p>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>⚡</span>
              <p>Fastify API with automatic CRON cleanup</p>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>🗄</span>
              <p>PostgreSQL with Drizzle ORM schema</p>
            </div>
          </div>
        </section>

        <hr className={styles.hr} />

        <section id="auth" className={styles.section}>
          <h2 className={styles.h2}>Authentication</h2>
          <p className={styles.p}>
            Recycle Bin supports two authentication methods. Use either per request.
          </p>
          <div className={styles.authCards}>
            <div className={styles.authCard}>
              <p className={styles.authLabel}>API Key</p>
              <code className={styles.authCode}>X-API-Key: rb_live_xxxxx</code>
              <p className={styles.authDesc}>
                Recommended for server-to-server integrations. Set in environment as <code>API_KEY</code>.
              </p>
            </div>
            <div className={styles.authCard}>
              <p className={styles.authLabel}>JWT Bearer</p>
              <code className={styles.authCode}>Authorization: Bearer &lt;token&gt;</code>
              <p className={styles.authDesc}>
                For short-lived session tokens signed with <code>JWT_SECRET</code>.
              </p>
            </div>
          </div>
        </section>

        <hr className={styles.hr} />

        <section id="js-sdk" className={styles.section}>
          <h2 className={styles.h2}>JavaScript / TypeScript SDK</h2>
          <p className={styles.p}>
            Install via npm or pnpm, then import <code>RecycleBinClient</code>.
          </p>
          <CodeBlock code={jsSdkCode} language="typescript" label="@crty/recycle-bin" />
        </section>

        <hr className={styles.hr} />

        <section id="php-sdk" className={styles.section}>
          <h2 className={styles.h2}>PHP SDK</h2>
          <p className={styles.p}>
            Install via Composer. Laravel users get Service Provider and Facade auto-discovery.
          </p>
          <CodeBlock code={phpSdkCode} language="php" label="crty/recycle-bin" />
        </section>

        <hr className={styles.hr} />

        <section id="rest-api" className={styles.section}>
          <h2 className={styles.h2}>REST API Reference</h2>
          <p className={styles.p}>
            All endpoints require authentication. The <code>X-Site-ID</code> header is mandatory
            for multi-tenant isolation.
          </p>
          <CodeBlock code={restCode} language="bash" label="REST API" />
        </section>

        <hr className={styles.hr} />

        <section id="database" className={styles.section}>
          <h2 className={styles.h2}>Database Schema</h2>
          <p className={styles.p}>
            Recycle Bin stores all data in a single <code>recycle_bin_items</code> table.
            Drizzle ORM handles migrations automatically on startup.
          </p>
          <CodeBlock code={schemaCode} language="bash" label="recycle_bin_items" />
        </section>

      </div>
    </div>
  );
}
