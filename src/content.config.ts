// Allowed values for content frontmatter and the required heading structure.
// The site, the build-time validator, the writing linter, and the scaffold
// scripts all read from this file. To add a category, add it to the list.

export const CHALLENGE_CATEGORIES = [
  'web',
  'crypto',
  'forensics',
  'network',
  'pwn',
  'reverse',
  'osint',
  'misc',
] as const;

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export const TOOL_CATEGORIES = [
  'recon',
  'web',
  'crypto',
  'forensics',
  'network',
  'reverse',
  'pwn',
  'general',
] as const;

export const PLATFORMS = ['linux', 'macos', 'windows', 'web'] as const;

// Display labels. Anything missing here falls back to the raw value.
export const LABELS: Record<string, string> = {
  web: 'Web',
  crypto: 'Crypto',
  forensics: 'Forensics',
  network: 'Network Security',
  pwn: 'Pwn',
  reverse: 'Reverse',
  osint: 'OSINT',
  misc: 'Misc',
  recon: 'Recon',
  general: 'General',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  linux: 'Linux',
  macos: 'macOS',
  windows: 'Windows',
};

export function label(value: string): string {
  return LABELS[value] ?? value;
}

// Every challenge write-up has these level-2 headings, in this order.
// Headings marked optional may be left out, but if present they must be in place.
export const WRITEUP_HEADINGS = [
  { text: 'Overview', optional: false },
  { text: 'Challenge Description', optional: false },
  { text: 'Recon', optional: false },
  { text: 'Walkthrough', optional: false },
  { text: 'Solution', optional: false },
  { text: 'Flag', optional: false },
  { text: 'Takeaways', optional: false },
  { text: 'References', optional: true },
] as const;

// Tool guides use these level-2 headings. The linter warns (it does not fail)
// when a guide is missing one or has them out of order.
export const TOOL_HEADINGS = [
  { text: 'What It Is', optional: false },
  { text: 'When To Use It', optional: false },
  { text: 'Installation', optional: false },
  { text: 'Basic Usage', optional: false },
  { text: 'Common Pitfalls', optional: false },
  { text: 'References', optional: false },
] as const;

// The section of a write-up whose blockquotes are the original challenge prompt.
// The writing linter skips quoted lines inside it.
export const QUOTED_PROMPT_SECTION = 'Challenge Description';
