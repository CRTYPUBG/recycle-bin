import { Link } from 'react-router-dom';
import Button from '../Button';
import styles from './SdkShowcase.module.css';

const sdkCards = [
  {
    id: 'js',
    lang: 'JavaScript / TypeScript',
    package: '@crty/recycle-bin',
    install: 'npm install @crty/recycle-bin',
    badge: 'npm',
    badgeColor: '#cb3837',
    snippet: `import { RecycleBinClient } from '@crty/recycle-bin';

const rb = new RecycleBinClient({
  baseUrl: 'https://your-api.com',
  apiKey:  process.env.RB_API_KEY,
  siteId:  'my-app',
});

await rb.delete({ table: 'posts', id: '42', snapshot: post });
await rb.restore('rb_item_id');`,
    icon: (
      <svg viewBox="0 0 128 128" aria-label="JS">
        <rect width="128" height="128" fill="#F0DB4F" rx="16"/>
        <path fill="#323330" d="M67.3 91.7c1.4 2.4 3.3 4.1 6.6 4.1 2.8 0 4.5-1.4 4.5-3.3 0-2.3-1.8-3.1-4.9-4.5l-1.7-.7c-4.9-2.1-8.1-4.7-8.1-10.3 0-5.1 3.9-9 10-9 4.3 0 7.4 1.5 9.6 5.4l-5.3 3.4c-1.2-2.1-2.4-2.9-4.3-2.9-2 0-3.2 1.2-3.2 2.9 0 2 1.2 2.8 4.1 4.1l1.7.7c5.8 2.5 9 5 9 10.7 0 6.1-4.8 9.5-11.3 9.5-6.3 0-10.4-3-12.4-6.9l5.7-3.2zM39.7 91.9c1.1 1.9 2.1 3.5 4.5 3.5 2.3 0 3.7-.9 3.7-4.4V68h6.9v23.1c0 6.9-4 10-9.9 10-5.3 0-8.4-2.7-9.9-6l4.7-2.2z"/>
      </svg>
    ),
  },
  {
    id: 'php',
    lang: 'PHP / Laravel',
    package: 'crty/recycle-bin',
    install: 'composer require crty/recycle-bin',
    badge: 'Packagist',
    badgeColor: '#ff9900',
    snippet: `use CRTY\\RecycleBin\\RecycleBinClient;

$rb = new RecycleBinClient(
    baseUrl: config('recycle_bin.base_url'),
    apiKey:  config('recycle_bin.api_key'),
    siteId:  config('recycle_bin.site_id'),
);

$rb->delete(table: 'posts', id: $post->id, snapshot: $post->toArray());
$rb->restore(itemId: $itemId);`,
    icon: (
      <svg viewBox="0 0 128 128" aria-label="PHP">
        <ellipse cx="64" cy="64" rx="64" ry="42" fill="#8993BE"/>
        <text x="64" y="75" fontFamily="Arial" fontWeight="bold" fontSize="36" fill="#fff" textAnchor="middle">php</text>
      </svg>
    ),
  },
];

const logos = [
  { label: 'JavaScript', color: '#F0DB4F', icon: <svg viewBox="0 0 128 128"><rect width="128" height="128" fill="#F0DB4F" rx="10"/><path fill="#323330" d="M67.3 91.7c1.4 2.4 3.3 4.1 6.6 4.1 2.8 0 4.5-1.4 4.5-3.3 0-2.3-1.8-3.1-4.9-4.5l-1.7-.7c-4.9-2.1-8.1-4.7-8.1-10.3 0-5.1 3.9-9 10-9 4.3 0 7.4 1.5 9.6 5.4l-5.3 3.4c-1.2-2.1-2.4-2.9-4.3-2.9-2 0-3.2 1.2-3.2 2.9 0 2 1.2 2.8 4.1 4.1l1.7.7c5.8 2.5 9 5 9 10.7 0 6.1-4.8 9.5-11.3 9.5-6.3 0-10.4-3-12.4-6.9l5.7-3.2zM39.7 91.9c1.1 1.9 2.1 3.5 4.5 3.5 2.3 0 3.7-.9 3.7-4.4V68h6.9v23.1c0 6.9-4 10-9.9 10-5.3 0-8.4-2.7-9.9-6l4.7-2.2z"/></svg> },
  { label: 'TypeScript', color: '#3178C6', icon: <svg viewBox="0 0 128 128"><rect width="128" height="128" fill="#3178C6" rx="10"/><path fill="#fff" d="M22.7 60.8v6.8h13.9v40h8.4v-40h13.9v-6.7H22.7v-.1zM65.9 84.1c0 12.5 6.7 18.7 20.3 18.7 4.6 0 9.6-.7 13.5-2.5v-8.3c-3.9 2.2-8 3.3-12.1 3.3-6.9 0-11.1-3.2-11.1-9.1V85h23.9v-4.9c0-11.5-5.6-17.9-16.5-17.9-11.7 0-18 6.6-18 17.4v4.5zm10-6.8c0-4.9 2.6-7.9 7.5-7.9 4.7 0 7 3 7 7.9v.5H75.9v-.5z"/></svg> },
  { label: 'PHP',        color: '#8993BE', icon: <svg viewBox="0 0 128 128"><ellipse cx="64" cy="64" rx="64" ry="42" fill="#8993BE"/><text x="64" y="75" fontFamily="Arial" fontWeight="bold" fontSize="36" fill="#fff" textAnchor="middle">php</text></svg> },
  { label: 'Laravel',   color: '#FF2D20', icon: <svg viewBox="0 0 128 128"><rect width="128" height="128" fill="#FF2D20" rx="10"/><path fill="#fff" d="M42 30l14 8v46l-14-8V30zm42 0l-14 8v46l14-8V30zM64 66l-14-8v16l14 8 14-8V58l-14 8z"/></svg> },
  { label: 'Docker',    color: '#2496ED', icon: <svg viewBox="0 0 128 128"><rect width="128" height="128" fill="#2496ED" rx="10"/><g fill="#fff"><rect x="24" y="58" width="12" height="12"/><rect x="38" y="58" width="12" height="12"/><rect x="52" y="58" width="12" height="12"/><rect x="38" y="44" width="12" height="12"/><rect x="52" y="44" width="12" height="12"/><rect x="52" y="30" width="12" height="12"/><rect x="66" y="58" width="12" height="12"/><path d="M18 66c0 12 10 24 30 24 22 0 38-10 45-28-6-3-13-2-13-2s-2 8-9 12c-8-6-8-6-8-6H18z"/></g></svg> },
  { label: 'REST API',  color: '#25C2A0', icon: <svg viewBox="0 0 128 128"><rect width="128" height="128" fill="#25C2A0" rx="10"/><circle cx="34" cy="40" r="10" fill="#fff"/><circle cx="94" cy="40" r="10" fill="#fff"/><circle cx="64" cy="90" r="10" fill="#fff"/><line x1="34" y1="40" x2="94" y2="40" stroke="#fff" strokeWidth="4"/><line x1="34" y1="40" x2="64" y2="90" stroke="#fff" strokeWidth="4"/><line x1="94" y1="40" x2="64" y2="90" stroke="#fff" strokeWidth="4"/></svg> },
];

// Duplicate for seamless loop
const marqueeItems = [...logos, ...logos];

export default function SdkShowcase() {
  return (
    <section className={styles.root}>
      <div className="container">
        <p className={styles.eyebrow}>SDKs</p>
        <h2 className={styles.title}>Works with your stack.</h2>
        <p className={styles.sub}>
          Official clients for JavaScript, TypeScript, PHP, and Laravel.
          Or use the REST API directly from any language.
        </p>
        <Link to="/installation">
          <Button variant="outline">View Installation Guide →</Button>
        </Link>
      </div>

      {/* ── SDK Feature Cards ── */}
      <div className={`${styles.cards} container`}>
        {sdkCards.map((card) => (
          <div key={card.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>{card.icon}</span>
              <div>
                <p className={styles.cardLang}>{card.lang}</p>
                <p className={styles.cardPackage}>{card.package}</p>
              </div>
              <span className={styles.cardBadge} style={{ background: card.badgeColor + '22', color: card.badgeColor, borderColor: card.badgeColor + '44' }}>
                {card.badge}
              </span>
            </div>

            <div className={styles.installBar}>
              <span className={styles.installPrompt}>$</span>
              <code className={styles.installCmd}>{card.install}</code>
            </div>

            <pre className={styles.snippet}><code>{card.snippet}</code></pre>
          </div>
        ))}
      </div>

      {/* ── Infinite logo marquee ── */}
      <div className={styles.marqueeWrapper} aria-hidden="true">
        <div className={styles.marquee}>
          {marqueeItems.map((logo, i) => (
            <div key={i} className={styles.marqueeItem}>
              <span className={styles.marqueeIcon}>{logo.icon}</span>
              <span className={styles.marqueeLabel}>{logo.label}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
