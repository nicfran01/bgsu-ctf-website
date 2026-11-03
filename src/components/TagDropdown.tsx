import { useEffect, useId, useRef, useState } from 'react';
import styles from './TagDropdown.module.css';

interface TagDropdownProps {
  legend: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}

/**
 * Multi-select for long lists such as tags. The options live in a panel that
 * opens from a button, and the current selection shows as removable chips.
 */
export function TagDropdown({ legend, options, selected, onToggle, onClear }: TagDropdownProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const labelId = useId();

  // Close when clicking outside the dropdown.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
    else setFilter('');
  }, [open]);

  if (!options.length) return null;

  const visible = options.filter((o) => o.toLowerCase().includes(filter.trim().toLowerCase()));
  const summary = selected.length ? `${selected.length} selected` : 'Any';

  return (
    <div
      className={styles.root}
      ref={rootRef}
      onBlur={(e) => {
        // Close when keyboard focus moves to another element outside the dropdown.
        // Ignore focus that goes nowhere (null) or to a container around the
        // dropdown: Safari moves focus to the nearest focusable ancestor (the
        // page's <main>) when you click plain text, which is not leaving.
        const next = e.relatedTarget as Node | null;
        const root = rootRef.current;
        if (open && root && next && !root.contains(next) && !next.contains(root)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      <span id={labelId} className={styles.legend}>
        {legend}
      </span>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${legend} filter: ${summary}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{summary}</span>
        <span className={styles.caret} aria-hidden="true">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          className={styles.panel}
          role="group"
          aria-labelledby={labelId}
          onMouseDown={(e) => {
            // Keep focus where it is when clicking an option, so no browser moves
            // it elsewhere mid-click. The click itself still toggles the checkbox.
            if (!(e.target instanceof HTMLInputElement && e.target.type === 'search')) e.preventDefault();
          }}
        >
          <input
            ref={searchRef}
            type="search"
            className={styles.search}
            placeholder={`Find a ${legend.toLowerCase()}`}
            aria-label={`Find a ${legend.toLowerCase()}`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <ul className={styles.list}>
            {visible.map((option) => (
              <li key={option}>
                <label className={styles.option}>
                  <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} />
                  <span>{option}</span>
                </label>
              </li>
            ))}
            {!visible.length && <li className={styles.none}>No matches</li>}
          </ul>
          <div className={styles.footer}>
            <button type="button" className={styles.link} onClick={onClear} disabled={!selected.length}>
              Clear
            </button>
            <button type="button" className={styles.link} onClick={() => setOpen(false)}>
              Done
            </button>
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <ul className={styles.chips} aria-label={`Selected ${legend.toLowerCase()}s`}>
          {selected.map((value) => (
            <li key={value}>
              <button type="button" className={styles.chip} onClick={() => onToggle(value)} aria-label={`Remove ${value}`}>
                {value}
                <span aria-hidden="true"> ×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
