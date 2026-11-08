import { label } from '../content.config';
import type { PlatformEntry } from '../lib/content/types';
import { CategoryBadge } from './Badge';
import badgeStyles from './Badge.module.css';
import styles from './Card.module.css';

export function PlatformCard({ platform }: { platform: PlatformEntry }) {
  return (
    <article className={styles.card}>
      <div className={styles.badges}>
        <CategoryBadge value={platform.category} />
      </div>
      <h2 className={styles.title}>{platform.name}</h2>
      {platform.cost && <p className={styles.meta}>{label(platform.cost)}</p>}
      <p className={styles.summary}>{platform.summary}</p>
      <ul className={styles.focus} aria-label="Focus">
        {platform.focus.map((f) => (
          <li key={f} className={`${badgeStyles.badge} ${badgeStyles.difficulty}`}>
            {label(f)}
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        <a className="button" href={platform.url} target="_blank" rel="noopener noreferrer">
          Open
          <span className="visually-hidden"> {platform.name} (opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
}
