import styles from './Changelog.module.css';


const entries = [
  {
    version: 'v1.0.0',
    date: '2025-08-10',
    tag: 'Latest',
    changes: [
      { type: 'feat', text: 'Initial public release of Recycle Bin.' },
      { type: 'feat', text: 'Fastify REST API with JWT + API Key authentication.' },
      { type: 'feat', text: 'Multi-tenant isolation via X-Site-ID header.' },
      { type: 'feat', text: 'PostgreSQL backend with Drizzle ORM schema.' },
      { type: 'feat', text: 'JavaScript / TypeScript SDK (@crty/recycle-bin).' },
      { type: 'feat', text: 'PHP / Laravel SDK with Service Provider and Facade.' },
      { type: 'feat', text: 'Docker Compose deployment configuration.' },
      { type: 'feat', text: 'Automatic 30-day retention with CRON cleanup worker.' },
      { type: 'feat', text: 'Rate limiting, CORS control, and snapshot compression.' },
      { type: 'feat', text: 'MIT License with CRTY trademark attribution clause.' },
    ],
  },
];

const typeColor: Record<string, string> = {
  feat: 'cyan',
  fix:  'blue',
  break: 'red',
  chore: 'muted',
};

export default function Changelog() {
  return (
    <div className={styles.root}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Changelog</p>
          <h1 className={styles.title}>What's new.</h1>
          <p className={styles.sub}>
            All notable changes to Recycle Bin are documented here.
          </p>
        </div>

        <div className={styles.timeline}>
          {entries.map((entry) => (
            <div key={entry.version} className={styles.entry}>
              <div className={styles.meta}>
                <div className={styles.versionBadge}>
                  <span className={styles.version}>{entry.version}</span>
                  {entry.tag && <span className={styles.tag}>{entry.tag}</span>}
                </div>
                <span className={styles.date}>{entry.date}</span>
              </div>

              <div className={styles.changes}>
                {entry.changes.map((c, i) => (
                  <div key={i} className={styles.change}>
                    <span className={`${styles.changeType} ${styles[`type_${typeColor[c.type]}`]}`}>
                      {c.type}
                    </span>
                    <span className={styles.changeText}>{c.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
