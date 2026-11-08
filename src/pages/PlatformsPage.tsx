import { useMemo } from 'react';
import cardStyles from '../components/Card.module.css';
import { EmptyState, FilterGroup, FilterPanel, ResultsBar, SearchBox } from '../components/FilterBar';
import { PlatformCard } from '../components/PlatformCard';
import { PLATFORM_CATEGORIES, PLATFORM_FOCUS } from '../content.config';
import { platforms } from '../lib/content/load';
import { createPlatformIndex, filterPlatforms } from '../lib/search';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useListParams } from '../lib/useListParams';

const FILTER_KEYS = ['category', 'focus'] as const;
const NO_SORTS = ['default'] as const;
const index = createPlatformIndex(platforms);

const usedCategories = PLATFORM_CATEGORIES.filter((c) => platforms.some((p) => p.category === c));
const usedFocus = PLATFORM_FOCUS.filter((f) => platforms.some((p) => p.focus.includes(f)));

export function PlatformsPage() {
  useDocumentTitle('Platforms');
  const { query, filters, setQuery, toggle, reset } = useListParams(FILTER_KEYS, NO_SORTS);
  const results = useMemo(() => filterPlatforms(platforms, index, query, filters), [query, filters]);

  return (
    <div className="container page">
      <h1 className="page-title">Platforms</h1>
      <p className="page-lead">Practice sites and courses the club uses. Each Open button goes to the official site in a new tab.</p>

      <FilterPanel>
        <SearchBox value={query} onChange={setQuery} label="Search platforms" placeholder="Name, topic, or tag" />
        <FilterGroup legend="Category" options={usedCategories} selected={filters.category} onToggle={(v) => toggle('category', v)} />
        <FilterGroup legend="Focus" options={usedFocus} selected={filters.focus} onToggle={(v) => toggle('focus', v)} />
      </FilterPanel>

      <ResultsBar count={results.length} noun="platform" />

      {results.length ? (
        <ul className={cardStyles.grid}>
          {results.map((p) => (
            <li key={p.name}>
              <PlatformCard platform={p} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState onReset={reset} noun="platform" />
      )}
    </div>
  );
}
