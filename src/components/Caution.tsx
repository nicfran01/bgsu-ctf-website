import { useId } from 'react';
import styles from './Caution.module.css';

/** The callout for a tool's `caution` frontmatter field. */
export function Caution({ text }: { text: string }) {
  const id = useId();
  return (
    <aside className={styles.caution} role="note" aria-labelledby={id}>
      <p id={id} className={styles.label}>
        Caution
      </p>
      <p className={styles.text}>{text}</p>
    </aside>
  );
}
