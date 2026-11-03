import type {
  CHALLENGE_CATEGORIES,
  DIFFICULTIES,
  PLATFORMS,
  TOOL_CATEGORIES,
} from '../../content.config.ts';

export type ChallengeCategory = (typeof CHALLENGE_CATEGORIES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type ToolCategory = (typeof TOOL_CATEGORIES)[number];
export type Platform = (typeof PLATFORMS)[number];

/** Frontmatter at the top of content/challenges/<slug>/writeup.md */
export interface ChallengeFrontmatter {
  title: string;
  category: ChallengeCategory;
  difficulty: Difficulty;
  /** YYYY-MM-DD */
  date: string;
  author: string;
  summary: string;
  ctf?: string;
  points?: number;
  tags: string[];
  challengeUrl?: string;
}

/** Frontmatter at the top of content/tools/<slug>/index.md */
export interface ToolFrontmatter {
  name: string;
  category: ToolCategory;
  summary: string;
  platforms: Platform[];
  officialUrl?: string;
  tags: string[];
}

export interface ChallengeFile {
  /** Path relative to the challenge's files/ folder, using forward slashes. */
  path: string;
  size: number;
}

export interface Challenge extends ChallengeFrontmatter {
  slug: string;
  /** Repo-relative path, for example content/challenges/foo/writeup.md */
  sourcePath: string;
  body: string;
  files: ChallengeFile[];
}

export interface Tool extends ToolFrontmatter {
  slug: string;
  sourcePath: string;
  body: string;
}

export interface ContentIssue {
  /** Repo-relative path of the file with the problem. */
  file: string;
  /** Frontmatter field, heading, or other location. Empty when it applies to the whole file. */
  field: string;
  message: string;
  line?: number;
}

/** What each content module (a markdown file imported with ?content) exports. */
export interface LoadedEntry<T> {
  item: T | null;
  issues: ContentIssue[];
}

export class ContentError extends Error {
  readonly issues: ContentIssue[];

  constructor(issues: ContentIssue[]) {
    super(formatIssues(issues));
    this.name = 'ContentError';
    this.issues = issues;
  }
}

export function formatIssue(issue: ContentIssue): string {
  const where = issue.line ? `${issue.file}:${issue.line}` : issue.file;
  const field = issue.field ? ` [${issue.field}]` : '';
  return `${where}${field}: ${issue.message}`;
}

export function formatIssues(issues: ContentIssue[]): string {
  const plural = issues.length === 1 ? 'problem' : 'problems';
  return `Found ${issues.length} content ${plural}:\n` + issues.map((i) => `  ${formatIssue(i)}`).join('\n');
}
