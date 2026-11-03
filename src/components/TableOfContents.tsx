import { useEffect, useState, type RefObject } from 'react';
import styles from './TableOfContents.module.css';

interface TocItem {
  id: string;
  text: string;
  depth: number;
}

/**
 * Reads the h2 and h3 elements rendered inside `contentRef`. Reading the DOM
 * keeps the links in sync with the ids rehype-slug generates.
 */
export function TableOfContents({ contentRef, routePath, deps }: { contentRef: RefObject<HTMLElement | null>; routePath: string; deps: unknown }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [active, setActive] = useState<string>('');
  // Open on wide screens, collapsed on phones where it sits above the article.
  const [startOpen] = useState(() => window.matchMedia('(min-width: 64rem)').matches);

  // A passive effect, because the sidebar renders before the article and the
  // article's ref is not attached yet when layout effects run.
  useEffect(() => {
    const headings = contentRef.current?.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]') ?? [];
    setItems([...headings].map((h) => ({ id: h.id, text: h.textContent ?? '', depth: h.tagName === 'H2' ? 2 : 3 })));
  }, [contentRef, deps]);

  useEffect(() => {
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  const list = (
    <ol className={styles.list}>
      {items.map((item) => (
        <li key={item.id} className={item.depth === 3 ? styles.sub : undefined}>
          <a
            href={`#${routePath}#${item.id}`}
            className={item.id === active ? `${styles.link} ${styles.active}` : styles.link}
            aria-current={item.id === active ? 'location' : undefined}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <nav aria-labelledby="toc-heading" className={styles.toc}>
      <details className={styles.details} open={startOpen}>
        <summary id="toc-heading" className={styles.summary}>
          On this page
        </summary>
        {list}
      </details>
    </nav>
  );
}
