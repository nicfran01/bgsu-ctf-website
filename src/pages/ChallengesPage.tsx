import { useMemo } from 'react';
import { CHALLENGE_CATEGORIES, DIFFICULTIES } from '../content.config';
import { ChallengeCard } from '../components/ChallengeCard';
import cardStyles from '../components/Card.module.css';
import { EmptyState, FilterGroup, FilterPanel, ResultsBar, SearchBox, SortSelect } from '../components/FilterBar';
import { allChallengeTags, challenges } from '../lib/content/load';
import { CHALLENGE_SORTS, SORT_LABELS, createChallengeIndex, filterChallenges } from '../lib/search';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useListParams } from '../lib/useListParams';
import { TagDropdown } from '../components/TagDropdown';

const FILTER_KEYS = ['category', 'difficulty', 'tag'] as const;
const index = createChallengeIndex(challenges);

// Only offer categories that have at least one challenge.
const usedCategories = CHALLENGE_CATEGORIES.filter((c) => challenges.some((ch) => ch.category === c));

export function ChallengesPage() {
  useDocumentTitle('Challenges');
  const { query, sort, filters, setQuery, setSort, toggle, clear, reset } = useListParams(FILTER_KEYS, CHALLENGE_SORTS);
  const results = useMemo(() => filterChallenges(challenges, index, query, filters, sort), [query, filters, sort]);

  return (
    <div className="container page">
      <h1 className="page-title">Challenges</h1>
      <p className="page-lead">Write-ups for challenges club members have solved, with the files to try them yourself.</p>

      <FilterPanel>
        <SearchBox value={query} onChange={setQuery} label="Search challenges" placeholder="Title, tag, event, or author" />
        <FilterGroup legend="Category" options={usedCategories} selected={filters.category} onToggle={(v) => toggle('category', v)} />
        <FilterGroup legend="Difficulty" options={DIFFICULTIES} selected={filters.difficulty} onToggle={(v) => toggle('difficulty', v)} />
        <TagDropdown legend="Tag" options={allChallengeTags} selected={filters.tag} onToggle={(v) => toggle('tag', v)} onClear={() => clear('tag')} />
      </FilterPanel>

      <ResultsBar count={results.length} noun="challenge">
        <SortSelect value={sort} options={CHALLENGE_SORTS} labels={SORT_LABELS} onChange={setSort} />
      </ResultsBar>

      {results.length ? (
        <ul className={cardStyles.grid}>
          {results.map((c) => (
            <li key={c.slug}>
              <ChallengeCard challenge={c} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState onReset={reset} noun="challenge" />
      )}
    </div>
  );
}
