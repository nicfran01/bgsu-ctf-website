// Loads every challenge, tool, and the About page at build time with
// import.meta.glob. Adding a folder under content/ is enough for it to show up.
// The "?content" query is handled by scripts/vite-content-plugin.ts, which
// parses and validates each file before it reaches the browser.

import type { Challenge, ContentIssue, LoadedEntry, Tool } from './types';

const challengeModules = import.meta.glob<LoadedEntry<Challenge>>('/content/challenges/*/writeup.md', {
  query: '?content',
  import: 'default',
  eager: true,
});
const toolModules = import.meta.glob<LoadedEntry<Tool>>('/content/tools/*/index.md', {
  query: '?content',
  import: 'default',
  eager: true,
});
const aboutModules = import.meta.glob<LoadedEntry<string>>('/content/about.md', {
  query: '?content',
  import: 'default',
  eager: true,
});

const entries = [...Object.values(challengeModules), ...Object.values(toolModules), ...Object.values(aboutModules)];
const items = <T,>(modules: Record<string, LoadedEntry<T>>): T[] =>
  Object.values(modules).flatMap((m) => (m.item === null ? [] : [m.item]));

/** Newest first. */
export const challenges: Challenge[] = items(challengeModules).sort(
  (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
);

/** A to Z by name. */
export const tools: Tool[] = items(toolModules).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

export const aboutMarkdown: string = items(aboutModules)[0] ?? '';

/** Problems found while loading. A production build stops before this can be non-empty. */
export const contentIssues: ContentIssue[] = entries.flatMap((e) => e.issues);

export const allChallengeTags: string[] = [...new Set(challenges.flatMap((c) => c.tags))].sort();
