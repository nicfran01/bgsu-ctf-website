import { DIFFICULTIES, label } from '../content.config';
import type { Difficulty } from '../lib/content/types';
import styles from './Badge.module.css';

export function CategoryBadge({ value }: { value: string }) {
  return <span className={`${styles.badge} ${styles.category}`}>{label(value)}</span>;
}

export function DifficultyBadge({ value }: { value: Difficulty }) {
  const level = DIFFICULTIES.indexOf(value) + 1;
  return (
    <span className={`${styles.badge} ${styles.difficulty}`}>
      <span className={styles.pips} aria-hidden="true">
        {DIFFICULTIES.map((d, i) => (
          <span key={d} className={i < level ? `${styles.pip} ${styles.on}` : styles.pip} />
        ))}
      </span>
      {label(value)}
    </span>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <ul className={styles.tags} aria-label="Tags">
      {tags.map((t) => (
        <li key={t} className={styles.tag}>
          {t}
        </li>
      ))}
    </ul>
  );
}
