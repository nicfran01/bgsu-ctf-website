import type { ReactNode } from 'react';
import { label } from '../content.config';
import styles from './FilterBar.module.css';

export function SearchBox({ value, onChange, label: text, placeholder }: { value: string; onChange: (v: string) => void; label: string; placeholder: string }) {
  return (
    <div className={styles.search}>
      <label htmlFor="list-search" className={styles.searchLabel}>
        {text}
      </label>
      <input
        id="list-search"
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

export function FilterGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (!options.length) return null;
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.chips}>
        {options.map((option) => {
          const on = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              className={on ? `${styles.chip} ${styles.chipOn}` : styles.chip}
              onClick={() => onToggle(option)}
            >
              {label(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function FilterPanel({ children }: { children: ReactNode }) {
  return <div className={styles.panel}>{children}</div>;
}

export function ResultsBar({ count, noun, children }: { count: number; noun: string; children?: ReactNode }) {
  return (
    <div className={styles.results}>
      <p aria-live="polite" className={styles.count}>
        {count} {count === 1 ? noun : `${noun}s`}
      </p>
      {children}
    </div>
  );
}

export function SortSelect<S extends string>({ value, options, labels, onChange }: { value: S; options: readonly S[]; labels: Record<S, string>; onChange: (v: S) => void }) {
  return (
    <div className={styles.sort}>
      <label htmlFor="list-sort">Sort</label>
      <select id="list-sort" value={value} onChange={(e) => onChange(e.target.value as S)} className={styles.select}>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o]}
          </option>
        ))}
      </select>
    </div>
  );
}

export function EmptyState({ onReset, noun }: { onReset: () => void; noun: string }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No {noun}s match these filters.</p>
      <p>Try fewer filters or a shorter search.</p>
      <button type="button" className="button" onClick={onReset}>
        Reset filters
      </button>
    </div>
  );
}
