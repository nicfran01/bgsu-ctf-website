// npm run lint:content
//
// Checks every markdown file under content/, README.md, and the user-facing
// strings in src/ against the writing rules in scripts/writing-rules.ts. It
// also runs the frontmatter, heading, and image checks from the build.
// Errors fail the command (and the build). Warnings are printed only.

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { lintMarkdown, lintSource, type Finding, type MarkdownKind } from './lib/writing-lint.ts';
import { validateContentTree } from './lib/content-fs.ts';

const root = process.cwd();
const toPosix = (p: string) => p.split(sep).join('/');

function walk(dir: string, match: (name: string) => boolean): string[] {
  const out: string[] = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, match));
    else if (match(entry.name)) out.push(full);
  }
  return out.sort();
}

function kindOf(repoPath: string): MarkdownKind {
  if (/^content\/challenges\/[^/]+\/writeup\.md$/.test(repoPath)) return 'challenge';
  if (/^content\/tools\/[^/]+\/index\.md$/.test(repoPath)) return 'tool';
  return 'page';
}

const findings: Finding[] = [];
let fileCount = 0;

for (const abs of walk(join(root, 'content'), (n) => n.endsWith('.md'))) {
  const file = toPosix(relative(root, abs));
  findings.push(...lintMarkdown(file, readFileSync(abs, 'utf8'), kindOf(file)));
  fileCount++;
}

findings.push(...lintMarkdown('README.md', readFileSync(join(root, 'README.md'), 'utf8'), 'page'));
fileCount++;

for (const abs of walk(join(root, 'src'), (n) => /\.(ts|tsx)$/.test(n))) {
  findings.push(...lintSource(toPosix(relative(root, abs)), readFileSync(abs, 'utf8')));
  fileCount++;
}

// Frontmatter, required headings, images, and folder layout.
for (const issue of validateContentTree(root).issues) {
  findings.push({
    file: issue.file,
    line: issue.line ?? 1,
    column: 1,
    severity: 'error',
    rule: issue.field ? `content/${issue.field}` : 'content',
    text: '',
    fix: issue.message,
  });
}

// ---------------------------------------------------------------------------
// Report

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code: number, s: string) => (color ? `\u001b[${code}m${s}\u001b[0m` : s);
const red = (s: string) => paint(31, s);
const yellow = (s: string) => paint(33, s);
const dim = (s: string) => paint(2, s);
const bold = (s: string) => paint(1, s);

findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);

let lastFile = '';
for (const f of findings) {
  if (f.file !== lastFile) {
    console.log(`\n${bold(f.file)}`);
    lastFile = f.file;
  }
  const where = dim(`${f.line}:${f.column}`.padEnd(8));
  const sev = f.severity === 'error' ? red('error  ') : yellow('warning');
  const text = f.text ? ` "${f.text}"` : '';
  console.log(`  ${where} ${sev}  ${f.rule}${text}\n           ${dim('->')} ${f.fix}`);
}

const errors = findings.filter((f) => f.severity === 'error').length;
const warnings = findings.length - errors;
const summary = `${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'} in ${fileCount} files checked`;
console.log(`\n${errors ? red(summary) : warnings ? yellow(summary) : summary}`);
if (errors) {
  console.log('Errors must be fixed before the site builds. The rules are in scripts/writing-rules.ts and CLAUDE.md.');
  process.exit(1);
}
