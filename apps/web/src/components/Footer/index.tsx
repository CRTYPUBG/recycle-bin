import { Link } from 'react-router-dom';
import Logo from '../Logo';
import styles from './Footer.module.css';

type NavLink =
  | { label: string; to: string }
  | { label: string; href: string; external?: boolean };

const cols: { label: string; links: NavLink[] }[] = [
  {
    label: 'Product',
    links: [
      { label: 'Documentation', to: '/docs' },
      { label: 'Installation',  to: '/installation' },
      { label: 'Changelog',     to: '/changelog' },
      { label: 'Security',      to: '/security' },
    ],
  },
  {
    label: 'SDKs',
    links: [
      { label: 'JavaScript / TypeScript', href: '/docs' },
      { label: 'PHP / Laravel',           href: '/docs' },
      { label: 'Docker',                  href: '/installation' },
      { label: 'REST API',                href: '/docs' },
    ],
  },
  {
    label: 'Community',
    links: [
      { label: 'GitHub',      href: 'https://github.com/CRTYPUBG/recycle-bin', external: true },
      { label: 'Issues',      href: 'https://github.com/CRTYPUBG/recycle-bin/issues', external: true },
      { label: 'Discussions', href: 'https://github.com/CRTYPUBG/recycle-bin/discussions', external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        <div className={styles.brand}>
          <Logo size={28} />
          <p className={styles.desc}>
            Open source recycle bin infrastructure<br />
            for modern web applications.
          </p>
          <p className={styles.powered}>
            Powered by <span>CRTY</span>
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.label} className={styles.col}>
            <p className={styles.colLabel}>{col.label}</p>
            <ul>
              {col.links.map((lnk) => (
                <li key={lnk.label}>
                  {'to' in lnk ? (
                    <Link to={lnk.to} className={styles.link}>{lnk.label}</Link>
                  ) : (
                    <a
                      href={lnk.href}
                      className={styles.link}
                      {...('external' in lnk && lnk.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {lnk.label}{'external' in lnk && lnk.external ? ' ↗' : ''}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={`${styles.bottom} container`}>
        <p>© {new Date().getFullYear()} CRTY. MIT License.</p>
        <p>rb.crty-dev.com</p>
      </div>
    </footer>
  );
}
