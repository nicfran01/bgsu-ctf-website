import { Link } from 'react-router';
import type { Challenge } from '../lib/content/types';
import { formatDate } from '../lib/format';
import styles from './PrevNext.module.css';

/** Links to the previous (older) and next (newer) write-ups by date. */
export function PrevNext({ older, newer }: { older: Challenge | undefined; newer: Challenge | undefined }) {
  if (!older && !newer) return null;
  return (
    <nav aria-label="Other write-ups" className={styles.nav}>
      {older ? (
        <Link to={`/challenges/${older.slug}`} className={styles.link}>
          <span className={styles.label}>Previous (older)</span>
          <span className={styles.title}>{older.title}</span>
          <span className={styles.date}>{formatDate(older.date)}</span>
        </Link>
      ) : (
        <span />
      )}
      {newer && (
        <Link to={`/challenges/${newer.slug}`} className={`${styles.link} ${styles.next}`}>
          <span className={styles.label}>Next (newer)</span>
          <span className={styles.title}>{newer.title}</span>
          <span className={styles.date}>{formatDate(newer.date)}</span>
        </Link>
      )}
    </nav>
  );
}
