import { useMemo } from 'react';
import cardStyles from '../components/Card.module.css';
import { EmptyState, FilterGroup, FilterPanel, ResultsBar, SearchBox } from '../components/FilterBar';
import { ToolCard } from '../components/ToolCard';
import { PLATFORMS, TOOL_CATEGORIES } from '../content.config';
import { tools } from '../lib/content/load';
import { createToolIndex, filterTools } from '../lib/search';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useListParams } from '../lib/useListParams';

const FILTER_KEYS = ['category', 'platform'] as const;
const NO_SORTS = ['name'] as const;
const index = createToolIndex(tools);

const usedCategories = TOOL_CATEGORIES.filter((c) => tools.some((t) => t.category === c));
const usedPlatforms = PLATFORMS.filter((p) => tools.some((t) => t.platforms.includes(p)));

export function ToolsPage() {
  useDocumentTitle('Tools');
  const { query, filters, setQuery, toggle, reset } = useListParams(FILTER_KEYS, NO_SORTS);
  const results = useMemo(() => filterTools(tools, index, query, filters), [query, filters]);

  return (
    <div className="container page">
      <h1 className="page-title">Tools</h1>
      <p className="page-lead">Guides for the tools members use most: what each one does, when to reach for it, and how to install it.</p>

      <FilterPanel>
        <SearchBox value={query} onChange={setQuery} label="Search tools" placeholder="Name, use, or tag" />
        <FilterGroup legend="Category" options={usedCategories} selected={filters.category} onToggle={(v) => toggle('category', v)} />
        <FilterGroup legend="Platform" options={usedPlatforms} selected={filters.platform} onToggle={(v) => toggle('platform', v)} />
      </FilterPanel>

      <ResultsBar count={results.length} noun="tool" />

      {results.length ? (
        <ul className={cardStyles.grid}>
          {results.map((t) => (
            <li key={t.slug}>
              <ToolCard tool={t} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState onReset={reset} noun="tool" />
      )}
    </div>
  );
}
