// Frontmatter and structure validation shared by the browser loader, the
// build-time Vite plugin, the writing linter, and the scaffold scripts.
// Nothing in this file may touch the DOM, Node APIs, or import.meta.glob.

import {
  CHALLENGE_CATEGORIES,
  DIFFICULTIES,
  PLATFORMS,
  TOOL_CATEGORIES,
  WRITEUP_HEADINGS,
} from '../../content.config.ts';
import { FrontmatterError, parseMarkdown } from './frontmatter.ts';
import { checkHeadingOrder, codeLineMask } from './headings.ts';
import { dirname, isExternal, resolveRelative } from './paths.ts';
import type {
  Challenge,
  ChallengeFile,
  ChallengeFrontmatter,
  ContentIssue,
  Tool,
  ToolFrontmatter,
} from './types.ts';

export interface SourceFile {
  /** Repo-relative path with forward slashes, for example content/challenges/foo/writeup.md */
  path: string;
  source: string;
}

export interface ValidationContext {
  /** True when a repo-relative asset path (for example content/challenges/foo/images/a.png) exists. */
  assetExists(repoPath: string): boolean;
  /** Downloadable files in content/challenges/<slug>/files. */
  filesFor(slug: string): ChallengeFile[];
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugIssue(slug: string): string | null {
  if (SLUG_PATTERN.test(slug)) return null;
  return `folder name "${slug}" must be lowercase letters, numbers, and single hyphens (for example "cookie-monster"), because it becomes the URL`;
}

/** content/challenges/<slug>/writeup.md -> <slug> */
export function slugFromPath(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 2] ?? '';
}

// ---------------------------------------------------------------------------
// Field checks

type Data = Record<string, unknown>;

class FieldReader {
  readonly issues: ContentIssue[] = [];

  constructor(
    private readonly file: string,
    private readonly data: Data,
  ) {}

  private fail(field: string, message: string) {
    this.issues.push({ file: this.file, field, message, line: 1 });
  }

  requiredString(field: string): string {
    const value = this.data[field];
    if (value === undefined || value === null || value === '') {
      this.fail(field, `required field "${field}" is missing`);
      return '';
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      this.fail(field, `"${field}" must be text`);
      return '';
    }
    return String(value).trim();
  }

  optionalString(field: string): string | undefined {
    const value = this.data[field];
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'string' && typeof value !== 'number') {
      this.fail(field, `"${field}" must be text`);
      return undefined;
    }
    return String(value).trim();
  }

  requiredEnum<T extends string>(field: string, allowed: readonly T[]): T {
    const value = this.requiredString(field);
    if (!value) return allowed[0]!;
    const normalized = value.toLowerCase();
    if (!(allowed as readonly string[]).includes(normalized)) {
      this.fail(field, `"${field}" must be one of ${allowed.join(', ')} (got "${value}")`);
      return allowed[0]!;
    }
    return normalized as T;
  }

  requiredDate(field: string): string {
    const value = this.requiredString(field);
    if (!value) return '';
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      this.fail(field, `"${field}" must be written as YYYY-MM-DD (got "${value}")`);
      return value;
    }
    const [, y, m, d] = match.map(Number) as [number, number, number, number];
    const date = new Date(Date.UTC(y, m - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
      this.fail(field, `"${field}" is not a real calendar date (got "${value}")`);
    }
    return value;
  }

  optionalNumber(field: string): number | undefined {
    const value = this.data[field];
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      this.fail(field, `"${field}" must be a number such as 100 (got "${String(value)}")`);
      return undefined;
    }
    return value;
  }

  optionalUrl(field: string): string | undefined {
    const value = this.optionalString(field);
    if (value === undefined) return undefined;
    if (!/^https?:\/\/[^\s]+$/i.test(value)) {
      this.fail(field, `"${field}" must be a full link starting with http:// or https:// (got "${value}")`);
      return undefined;
    }
    return value;
  }

  stringList(field: string, required = false): string[] {
    const value = this.data[field];
    if (value === undefined || value === null) {
      if (required) this.fail(field, `required field "${field}" is missing (use a list like [linux, macos])`);
      return [];
    }
    if (!Array.isArray(value) || value.some((v) => typeof v !== 'string' && typeof v !== 'number')) {
      this.fail(field, `"${field}" must be a list of words, for example [sqli, cookies]`);
      return [];
    }
    if (required && value.length === 0) this.fail(field, `"${field}" needs at least one value`);
    return value.map((v) => String(v).trim()).filter(Boolean);
  }

  enumList<T extends string>(field: string, allowed: readonly T[], required = false): T[] {
    const values = this.stringList(field, required).map((v) => v.toLowerCase());
    const bad = values.filter((v) => !(allowed as readonly string[]).includes(v));
    if (bad.length) {
      this.fail(field, `"${field}" values must come from ${allowed.join(', ')} (got ${bad.map((b) => `"${b}"`).join(', ')})`);
    }
    return values.filter((v): v is T => (allowed as readonly string[]).includes(v));
  }

  unknownKeys(known: readonly string[]) {
    for (const key of Object.keys(this.data)) {
      if (known.includes(key)) continue;
      const close = known.find((k) => k.toLowerCase() === key.toLowerCase());
      const hint = close ? ` Did you mean "${close}"?` : ` Allowed fields: ${known.join(', ')}`;
      this.fail(key, `unknown field "${key}".${hint}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Markdown body checks

const MARKDOWN_IMAGE = /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g;
const HTML_IMAGE = /<img\b[^>]*>/gi;

function checkImages(file: SourceFile, body: string, bodyStartLine: number, ctx: ValidationContext): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const lines = body.split('\n');
  const inCode = codeLineMask(lines);
  const dir = dirname(file.path);

  lines.forEach((rawLine, i) => {
    if (inCode[i]) return;
    const line = rawLine.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length));
    const lineNo = bodyStartLine + i;
    const refs: { alt: string | undefined; src: string }[] = [];
    for (const m of line.matchAll(MARKDOWN_IMAGE)) refs.push({ alt: m[1], src: m[2] ?? '' });
    for (const m of line.matchAll(HTML_IMAGE)) {
      const tag = m[0];
      refs.push({ alt: tag.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1], src: tag.match(/\bsrc\s*=\s*["']([^"']*)["']/i)?.[1] ?? '' });
    }
    for (const { alt, src } of refs) {
      if (!alt || !alt.trim()) {
        issues.push({ file: file.path, field: 'image', line: lineNo, message: `image "${src}" needs alt text that says what it shows, for example ![login form with the cookie panel open](${src})` });
      }
      if (!src || isExternal(src) || src.startsWith('#')) continue;
      if (src.startsWith('/')) {
        issues.push({ file: file.path, field: 'image', line: lineNo, message: `image path "${src}" must be relative, for example ./images/${src.split('/').pop()}` });
        continue;
      }
      const target = resolveRelative(dir, decodeURI(src));
      if (!target.startsWith(`${dir}/images/`)) {
        issues.push({ file: file.path, field: 'image', line: lineNo, message: `image "${src}" must live in this folder's images/ directory and be linked as ./images/<name>` });
      } else if (!ctx.assetExists(target)) {
        issues.push({ file: file.path, field: 'image', line: lineNo, message: `image "${src}" does not exist (looked for ${target})` });
      }
    }
  });
  return issues;
}

// ---------------------------------------------------------------------------
// Entry points

const CHALLENGE_FIELDS = ['title', 'category', 'difficulty', 'date', 'ctf', 'points', 'author', 'tags', 'summary', 'challengeUrl'] as const;
const TOOL_FIELDS = ['name', 'category', 'summary', 'platforms', 'officialUrl', 'tags'] as const;

function parseOrIssue(file: SourceFile) {
  try {
    return { parsed: parseMarkdown(file.source), issues: [] as ContentIssue[] };
  } catch (err) {
    if (err instanceof FrontmatterError) {
      const issue: ContentIssue = { file: file.path, field: 'frontmatter', message: err.message };
      if (err.line !== undefined) issue.line = err.line;
      return { parsed: null, issues: [issue] };
    }
    throw err;
  }
}

function withOptional<T extends object>(base: T, extras: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(extras)) if (v !== undefined) out[k] = v;
  return out as T;
}

export function loadChallenge(file: SourceFile, ctx: ValidationContext): { challenge: Challenge | null; issues: ContentIssue[] } {
  const slug = slugFromPath(file.path);
  const { parsed, issues } = parseOrIssue(file);
  const slugProblem = slugIssue(slug);
  if (slugProblem) issues.push({ file: file.path, field: 'folder', message: slugProblem });
  if (!parsed) return { challenge: null, issues };

  const r = new FieldReader(file.path, parsed.data);
  const fm: ChallengeFrontmatter = withOptional(
    {
      title: r.requiredString('title'),
      category: r.requiredEnum('category', CHALLENGE_CATEGORIES),
      difficulty: r.requiredEnum('difficulty', DIFFICULTIES),
      date: r.requiredDate('date'),
      author: r.requiredString('author'),
      summary: r.requiredString('summary'),
      tags: r.stringList('tags').map((t) => t.toLowerCase()),
    },
    {
      ctf: r.optionalString('ctf'),
      points: r.optionalNumber('points'),
      challengeUrl: r.optionalUrl('challengeUrl'),
    },
  );
  r.unknownKeys(CHALLENGE_FIELDS);
  issues.push(...r.issues);

  for (const p of checkHeadingOrder(parsed.body, WRITEUP_HEADINGS)) {
    const issue: ContentIssue = { file: file.path, field: 'headings', message: p.message };
    if (p.index !== undefined) issue.line = parsed.bodyStartLine + p.index;
    issues.push(issue);
  }
  issues.push(...checkImages(file, parsed.body, parsed.bodyStartLine, ctx));

  const challenge: Challenge = { ...fm, slug, sourcePath: file.path, body: parsed.body, files: ctx.filesFor(slug) };
  return { challenge: issues.length ? null : challenge, issues };
}

export function loadTool(file: SourceFile, ctx: ValidationContext): { tool: Tool | null; issues: ContentIssue[] } {
  const slug = slugFromPath(file.path);
  const { parsed, issues } = parseOrIssue(file);
  const slugProblem = slugIssue(slug);
  if (slugProblem) issues.push({ file: file.path, field: 'folder', message: slugProblem });
  if (!parsed) return { tool: null, issues };

  const r = new FieldReader(file.path, parsed.data);
  const fm: ToolFrontmatter = withOptional(
    {
      name: r.requiredString('name'),
      category: r.requiredEnum('category', TOOL_CATEGORIES),
      summary: r.requiredString('summary'),
      platforms: r.enumList('platforms', PLATFORMS, true),
      tags: r.stringList('tags').map((t) => t.toLowerCase()),
    },
    { officialUrl: r.optionalUrl('officialUrl') },
  );
  r.unknownKeys(TOOL_FIELDS);
  issues.push(...r.issues);
  issues.push(...checkImages(file, parsed.body, parsed.bodyStartLine, ctx));

  const tool: Tool = { ...fm, slug, sourcePath: file.path, body: parsed.body };
  return { tool: issues.length ? null : tool, issues };
}

/** about.md may have frontmatter, but it is not required. */
export function loadPage(file: SourceFile, ctx: ValidationContext): { body: string; issues: ContentIssue[] } {
  if (!file.source.trimStart().startsWith('---')) {
    return { body: file.source, issues: checkImages(file, file.source, 1, ctx) };
  }
  const { parsed, issues } = parseOrIssue(file);
  if (!parsed) return { body: '', issues };
  return { body: parsed.body, issues: [...issues, ...checkImages(file, parsed.body, parsed.bodyStartLine, ctx)] };
}

export interface ContentSet {
  challenges: Challenge[];
  tools: Tool[];
  about: string;
  issues: ContentIssue[];
}

export function loadContent(
  input: { challenges: SourceFile[]; tools: SourceFile[]; about?: SourceFile | undefined },
  ctx: ValidationContext,
): ContentSet {
  const issues: ContentIssue[] = [];
  const challenges: Challenge[] = [];
  const tools: Tool[] = [];

  for (const file of input.challenges) {
    const result = loadChallenge(file, ctx);
    issues.push(...result.issues);
    if (result.challenge) challenges.push(result.challenge);
  }
  for (const file of input.tools) {
    const result = loadTool(file, ctx);
    issues.push(...result.issues);
    if (result.tool) tools.push(result.tool);
  }
  let about = '';
  if (input.about) {
    const result = loadPage(input.about, ctx);
    issues.push(...result.issues);
    about = result.body;
  }

  challenges.sort(compareNewest);
  tools.sort((a, b) => a.name.localeCompare(b.name));
  return { challenges, tools, about, issues };
}

export function compareNewest(a: Challenge, b: Challenge): number {
  return b.date.localeCompare(a.date) || a.title.localeCompare(b.title);
}
