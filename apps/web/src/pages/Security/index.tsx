import styles from './Security.module.css';


const items = [
  {
    icon: '🔑',
    title: 'API Key + JWT Auth',
    desc: 'Every request must carry either a static API key or a short-lived JWT token. Both are verified server-side before any data is accessed.',
  },
  {
    icon: '🏢',
    title: 'Tenant Isolation',
    desc: 'The X-Site-ID header enforces strict row-level tenant isolation. One site can never read or restore another site\'s data.',
  },
  {
    icon: '⏱',
    title: 'Rate Limiting',
    desc: 'All endpoints are rate-limited by default (100 req/min per IP). Configure limits via environment variables.',
  },
  {
    icon: '🔐',
    title: 'Snapshot Encryption',
    desc: 'Snapshot data is stored as JSONB in PostgreSQL. You can enable field-level encryption at the adapter layer for sensitive tables.',
  },
  {
    icon: '🛡',
    title: 'CORS Control',
    desc: 'Configurable CORS origin whitelist prevents unauthorized browser-side access to the Recycle Bin API.',
  },
  {
    icon: '🧹',
    title: 'Automatic Purge',
    desc: 'A cron worker runs every 24 hours to permanently delete records past their retention window. No stale data accumulates.',
  },
];

export default function Security() {
  return (
    <div className={styles.root}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Security</p>
          <h1 className={styles.title}>Designed with security first.</h1>
          <p className={styles.sub}>
            Recycle Bin is self-hosted. You control the server, the database, and the network. These
            are the built-in security controls that protect your data.
          </p>
        </div>

        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.title} className={styles.card}>
              <span className={styles.icon}>{item.icon}</span>
              <h2 className={styles.cardTitle}>{item.title}</h2>
              <p className={styles.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>

        <hr className={styles.hr} />

        <section className={styles.section}>
          <h2 className={styles.h2}>Responsible Disclosure</h2>
          <p className={styles.p}>
            If you discover a security vulnerability in Recycle Bin, please report it privately via
            GitHub Security Advisories. Do not open a public issue.
          </p>
          <a
            href="https://github.com/CRTYPUBG/recycle-bin/security/advisories/new"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.disclosureLink}
          >
            Report a Vulnerability ↗
          </a>
        </section>
      </div>
    </div>
  );
}
