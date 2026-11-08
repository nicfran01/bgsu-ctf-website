// Reads the content/ folder from disk for the Vite plugin, the linter, and the
// scaffold scripts. The browser build reads the same files with import.meta.glob.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { ChallengeFile, ContentIssue } from '../../src/lib/content/types.ts';
import { loadContent, type ContentSet, type SourceFile, type ValidationContext } from '../../src/lib/content/validate.ts';

export const IGNORED_NAMES = new Set(['.gitkeep', '.DS_Store', 'Thumbs.db']);

export interface ContentTree {
  challenges: SourceFile[];
  tools: SourceFile[];
  about: SourceFile | undefined;
  platforms: SourceFile | undefined;
  links: SourceFile | undefined;
  filesBySlug: Record<string, ChallengeFile[]>;
  /** Problems found while walking the folders (for example a folder with no markdown file). */
  issues: ContentIssue[];
  ctx: ValidationContext;
}

const toPosix = (p: string) => p.split(sep).join('/');

function listDirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function walkFiles(dir: string, base = dir): ChallengeFile[] {
  if (!existsSync(dir)) return [];
  const out: ChallengeFile[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_NAMES.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full, base));
    else if (entry.isFile()) out.push({ path: toPosix(relative(base, full)), size: statSync(full).size });
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

function strayFiles(dir: string, rootDir: string, kind: string): ContentIssue[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && !IGNORED_NAMES.has(d.name))
    .map((d) => ({
      file: toPosix(relative(rootDir, join(dir, d.name))),
      field: 'folder',
      message: `files directly inside content/${kind}/ are ignored. Put each ${kind === 'challenges' ? 'challenge' : 'tool'} in its own folder`,
    }));
}

export function readContentTree(rootDir: string): ContentTree {
  const contentDir = join(rootDir, 'content');
  const issues: ContentIssue[] = [];
  const read = (abs: string): SourceFile => ({ path: toPosix(relative(rootDir, abs)), source: readFileSync(abs, 'utf8') });

  const challenges: SourceFile[] = [];
  const filesBySlug: Record<string, ChallengeFile[]> = {};
  const challengesDir = join(contentDir, 'challenges');
  issues.push(...strayFiles(challengesDir, rootDir, 'challenges'));
  for (const slug of listDirs(challengesDir)) {
    const file = join(challengesDir, slug, 'writeup.md');
    if (!existsSync(file)) {
      issues.push({ file: `content/challenges/${slug}`, field: 'folder', message: 'this folder has no writeup.md, so the challenge would not appear on the site' });
      continue;
    }
    challenges.push(read(file));
    filesBySlug[slug] = walkFiles(join(challengesDir, slug, 'files'));
  }

  const tools: SourceFile[] = [];
  const toolsDir = join(contentDir, 'tools');
  issues.push(...strayFiles(toolsDir, rootDir, 'tools'));
  for (const slug of listDirs(toolsDir)) {
    const file = join(toolsDir, slug, 'index.md');
    if (!existsSync(file)) {
      issues.push({ file: `content/tools/${slug}`, field: 'folder', message: 'this folder has no index.md, so the tool would not appear on the site' });
      continue;
    }
    tools.push(read(file));
  }

  const aboutPath = join(contentDir, 'about.md');
  const about = existsSync(aboutPath) ? read(aboutPath) : undefined;
  const optional = (name: string) => (existsSync(join(contentDir, name)) ? read(join(contentDir, name)) : undefined);
  const platforms = optional('platforms.json');
  const links = optional('links.json');

  const ctx: ValidationContext = {
    assetExists: (repoPath) => existsSync(join(rootDir, ...repoPath.split('/'))),
    filesFor: (slug) => filesBySlug[slug] ?? [],
  };

  return { challenges, tools, about, platforms, links, filesBySlug, issues, ctx };
}

/** Reads and validates everything under content/. */
export function validateContentTree(rootDir: string): ContentSet & { tree: ContentTree } {
  const tree = readContentTree(rootDir);
  const set = loadContent(tree, tree.ctx);
  return { ...set, issues: [...tree.issues, ...set.issues], tree };
}
