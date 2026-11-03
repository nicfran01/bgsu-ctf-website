import Fuse, { type IFuseOptions } from 'fuse.js';
import { DIFFICULTIES } from '../content.config';
import type { Challenge, Tool } from './content/types';

export const CHALLENGE_SORTS = ['newest', 'oldest', 'title', 'difficulty'] as const;
export type ChallengeSort = (typeof CHALLENGE_SORTS)[number];

export const SORT_LABELS: Record<ChallengeSort, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  title: 'Title A to Z',
  difficulty: 'Difficulty, easy first',
};

const FUSE_BASE = { threshold: 0.3, ignoreLocation: true } as const;

const challengeFuseOptions: IFuseOptions<Challenge> = {
  ...FUSE_BASE,
  keys: [
    { name: 'title', weight: 2 },
    { name: 'summary', weight: 1 },
    { name: 'tags', weight: 1 },
    { name: 'category', weight: 1 },
    { name: 'ctf', weight: 1 },
    { name: 'author', weight: 1 },
  ],
};

const toolFuseOptions: IFuseOptions<Tool> = {
  ...FUSE_BASE,
  keys: [
    { name: 'name', weight: 2 },
    { name: 'summary', weight: 1 },
    { name: 'category', weight: 1 },
    { name: 'tags', weight: 1 },
  ],
};

export function createChallengeIndex(items: Challenge[]) {
  return new Fuse(items, challengeFuseOptions);
}

export function createToolIndex(items: Tool[]) {
  return new Fuse(items, toolFuseOptions);
}

function search<T>(items: T[], index: Fuse<T>, query: string): T[] {
  const q = query.trim();
  return q ? index.search(q).map((r) => r.item) : items;
}

const matches = (selected: string[], value: string) => selected.length === 0 || selected.includes(value);
const matchesAny = (selected: string[], values: string[]) => selected.length === 0 || values.some((v) => selected.includes(v));

export interface ChallengeFilters {
  category: string[];
  difficulty: string[];
  tag: string[];
}

export function filterChallenges(
  items: Challenge[],
  index: Fuse<Challenge>,
  query: string,
  filters: ChallengeFilters,
  sort: ChallengeSort,
): Challenge[] {
  const result = search(items, index, query).filter(
    (c) => matches(filters.category, c.category) && matches(filters.difficulty, c.difficulty) && matchesAny(filters.tag, c.tags),
  );
  return sortChallenges(result, sort);
}

export function sortChallenges(items: Challenge[], sort: ChallengeSort): Challenge[] {
  const newest = (a: Challenge, b: Challenge) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title);
  const rank = (c: Challenge) => DIFFICULTIES.indexOf(c.difficulty);
  const sorted = [...items];
  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
    case 'difficulty':
      return sorted.sort((a, b) => rank(a) - rank(b) || newest(a, b));
    case 'newest':
      return sorted.sort(newest);
  }
}

export interface ToolFilters {
  category: string[];
  platform: string[];
}

export function filterTools(items: Tool[], index: Fuse<Tool>, query: string, filters: ToolFilters): Tool[] {
  return search(items, index, query)
    .filter((t) => matches(filters.category, t.category) && matchesAny(filters.platform, t.platforms))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}
