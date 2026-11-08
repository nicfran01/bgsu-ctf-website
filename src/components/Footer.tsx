import type { ReactNode } from 'react';
import { links } from '../lib/content/load';
import { isRepoConfigured, repoUrl, siteConfig } from '../site.config';
import styles from './Footer.module.css';

// Outline icons drawn with currentColor, so they take the link color.
const instagramIcon = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" className={styles.icon}>
    <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
  </svg>
);

/** Icons for known sites, matched on the link's host name. */
const ICONS_BY_HOST: Record<string, ReactNode> = {
  'instagram.com': instagramIcon,
};

function iconFor(url: string): ReactNode {
  const host = new URL(url).hostname.replace(/^www\./, '');
  return ICONS_BY_HOST[host] ?? null;
}

export function Footer() {
  // The links in content/links.json, then the repository.
  const row: { name: string; url: string; description?: string }[] = links.map((l) => ({
    name: l.name,
    url: l.url,
    description: l.description,
  }));
  if (isRepoConfigured()) row.push({ name: 'Source and content on GitHub', url: repoUrl() });

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>{siteConfig.clubName}</p>
        {row.length > 0 && (
          <ul className={styles.links} aria-label="Club links">
            {row.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className={styles.link} title={l.description}>
                  {iconFor(l.url)}
                  {l.name}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
