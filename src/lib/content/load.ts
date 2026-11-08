// Loads every challenge, tool, platform, link, and the About page at build time with
// import.meta.glob. Adding a folder under content/ is enough for it to show up.
// The "?content" query is handled by scripts/vite-content-plugin.ts, which
// parses and validates each file before it reaches the browser. Markdown
// bodies are loaded separately, on demand, by useMarkdownBody.

import type { ChallengeSummary, ContentIssue, LinkEntry, LoadedEntry, PlatformEntry, ToolSummary } from './types';

const challengeModules = import.meta.glob<LoadedEntry<ChallengeSummary>>('/content/challenges/*/writeup.md', {
  query: '?content',
  import: 'default',
  eager: true,
});
const toolModules = import.meta.glob<LoadedEntry<ToolSummary>>('/content/tools/*/index.md', {
  query: '?content',
  import: 'default',
  eager: true,
});
const aboutModules = import.meta.glob<LoadedEntry<string>>('/content/about.md', {
  query: '?content',
  import: 'default',
  eager: true,
});

const platformModules = import.meta.glob<LoadedEntry<PlatformEntry[]>>('/content/platforms.json', {
  query: '?content',
  import: 'default',
  eager: true,
});
const linkModules = import.meta.glob<LoadedEntry<LinkEntry[]>>('/content/links.json', {
  query: '?content',
  import: 'default',
  eager: true,
});

const entries = [
  ...Object.values(challengeModules),
  ...Object.values(toolModules),
  ...Object.values(aboutModules),
  ...Object.values(platformModules),
  ...Object.values(linkModules),
];
const items = <T,>(modules: Record<string, LoadedEntry<T>>): T[] =>
  Object.values(modules).flatMap((m) => (m.item === null ? [] : [m.item]));

/** Newest first. */
export const challenges: ChallengeSummary[] = items(challengeModules).sort(
  (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
);

/** A to Z by name. */
export const tools: ToolSummary[] = items(toolModules).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

export const aboutMarkdown: string = items(aboutModules)[0] ?? '';

/** In the order they appear in content/platforms.json. */
export const platforms: PlatformEntry[] = items(platformModules)[0] ?? [];

/** In the order they appear in content/links.json. */
export const links: LinkEntry[] = items(linkModules)[0] ?? [];

/** Problems found while loading. A production build stops before this can be non-empty. */
export const contentIssues: ContentIssue[] = entries.flatMap((e) => e.issues);

export const allChallengeTags: string[] = [...new Set(challenges.flatMap((c) => c.tags))].sort();
