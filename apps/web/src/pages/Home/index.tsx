import { Fragment } from 'react';
import Button from '../../components/Button';
import SdkShowcase from '../../components/SdkShowcase';
import styles from './Home.module.css';

const features = [
  { icon: '30', label: 'DAYS',        title: 'Automatic Retention',  desc: 'Deleted content is held for 30 days before permanent removal. Every record gets a countdown.', accent: 'cyan' },
  { icon: '⚙',  label: 'SELF-HOSTED', title: 'Your Server. Your Data.', desc: 'Runs entirely on your infrastructure. Zero external data transmission to any third-party.', accent: 'blue' },
  { icon: '⚡', label: 'FAST',        title: 'Minimal Overhead',     desc: 'Built on Fastify + PostgreSQL. Sub-millisecond soft-delete with asynchronous cleanup workers.', accent: 'purple' },
  { icon: '🔒', label: 'SECURE',      title: 'Security First',       desc: 'JWT + API key dual auth, tenant isolation via X-Site-ID, rate limiting, and CORS control.', accent: 'cyan' },
];

const flow = [
  { step: '01', label: 'CREATE',      desc: 'Content is created in your existing database.' },
  { step: '02', label: 'DELETE',      desc: 'User triggers deletion. Record is flagged.' },
  { step: '03', label: 'SNAPSHOT',    desc: 'Full data snapshot captured and stored safely.' },
  { step: '04', label: 'RECYCLE BIN', desc: '30-day retention window begins. Indexed, searchable.' },
  { step: '05', label: 'RESTORE',     desc: 'One-click restore to original table and ID.' },
];


export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={`${styles.heroContent} container`}>
          <div className={styles.badge}>
            <span className={styles.dot} />
            Open Source · MIT License
          </div>

          <h1 className={styles.headline}>
            Self-hosted recycle bin<br />
            <span className={styles.gradText}>for your web application.</span>
          </h1>

          <p className={styles.sub}>
            Delete safely. Restore instantly.<br />
            Your data, your server, your rules.
          </p>

          <div className={styles.heroCta}>
            <Button as="a" href="/installation" variant="primary">Get Started →</Button>
            <Button as="a" href="https://github.com/CRTYPUBG/recycle-bin" target="_blank" rel="noopener noreferrer" variant="outline">View on GitHub</Button>
          </div>

          <div className={styles.heroVisual} aria-hidden>
            <div className={styles.terminal}>
              <div className={styles.terminalDots}><span /><span /><span /></div>
              <pre className={styles.terminalBody}>{`$ curl -X POST https://your-domain/api/delete \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Site-ID: my-app" \\
  -d '{"table":"posts","id":"42"}'

{
  "status": "soft_deleted",
  "expires_at": "2025-09-09T00:00:00Z",
  "restore_url": "/api/restore/rb_abc123"
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={`${styles.features} section`}>
        <div className="container">
          <div className={styles.featureGrid}>
            {features.map((f) => (
              <div key={f.label} className={`${styles.featureCard} ${styles[`accent_${f.accent}`]}`}>
                <div className={styles.featureStat}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <span className={styles.featureLabel}>{f.label}</span>
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ── Flow ── */}
      <section className={`${styles.flowSection} section`}>
        <div className="container">
          <p className={styles.sectionEyebrow}>How it works</p>
          <h2 className={styles.sectionTitle}>Five steps. Zero data loss.</h2>
          <div className={styles.flow}>
            {flow.map((f, i) => (
              <Fragment key={f.step}>
                <div className={styles.flowStep}>
                  <div className={styles.flowNum}>{f.step}</div>
                  <div className={styles.flowLabel}>{f.label}</div>
                  <p className={styles.flowDesc}>{f.desc}</p>
                </div>
                {i < flow.length - 1 && <div className={styles.flowArrow} aria-hidden>↓</div>}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      <SdkShowcase />

      <hr className="divider" />

      {/* ── CTA banner ── */}
      <section className={`${styles.ctaBanner} section`}>
        <div className="container">
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>Ready to stop losing data?</h2>
            <p className={styles.ctaSub}>Deploy in minutes. Open source. No vendor lock-in.</p>
            <div className={styles.ctaActions}>
              <Button as="a" href="/installation" variant="primary">Get Started for Free →</Button>
              <Button as="a" href="/docs" variant="ghost">Read the Docs</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
