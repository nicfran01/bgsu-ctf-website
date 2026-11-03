// Matching logic for the writing linter. The word lists live in
// scripts/writing-rules.ts; this file only decides where to look.

import ts from 'typescript';
import { QUOTED_PROMPT_SECTION, TOOL_HEADINGS } from '../../src/content.config.ts';
import { checkHeadingOrder, codeLineMask } from '../../src/lib/content/headings.ts';
import { BANNED_CHARACTERS, BANNED_TERMS, WARNINGS } from '../writing-rules.ts';

export type Severity = 'error' | 'warning';

export interface Finding {
  file: string;
  line: number;
  column: number;
  severity: Severity;
  rule: string;
  text: string;
  fix: string;
}

export type MarkdownKind = 'challenge' | 'tool' | 'page';

const termRegexes = BANNED_TERMS.map((term) => ({
  term,
  regex: new RegExp(`(?<![\\p{L}\\p{N}])(?:${term.pattern})(?![\\p{L}\\p{N}])`, 'giu'),
}));

const blank = (s: string) => s.replace(/[^\n]/g, ' ');
const byPosition = (a: Finding, b: Finding) => a.line - b.line || a.column - b.column;

// ---------------------------------------------------------------------------
// Checks shared by markdown and source files

function checkErrors(file: string, line: number, columnOffset: number, text: string, allowed: Set<string>): Finding[] {
  const out: Finding[] = [];
  for (const c of BANNED_CHARACTERS) {
    let i = text.indexOf(c.char);
    while (i !== -1) {
      out.push({ file, line, column: columnOffset + i + 1, severity: 'error', rule: c.label, text: c.char, fix: c.fix });
      i = text.indexOf(c.char, i + 1);
    }
  }
  for (const { term, regex } of termRegexes) {
    regex.lastIndex = 0;
    for (const m of text.matchAll(regex)) {
      if (term.allowable && allowed.has(term.label.toLowerCase())) continue;
      const fix = term.allowable ? `${term.fix}. If the literal meaning is right, add <!-- writing-allow: ${term.label} -->` : term.fix;
      out.push({ file, line, column: columnOffset + (m.index ?? 0) + 1, severity: 'error', rule: 'banned-word', text: m[0], fix });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Markdown

interface MaskedMarkdown {
  /** Same line count and columns as the source, with skipped text replaced by spaces. */
  lines: string[];
  /** Allowable labels per line, from writing-allow comments. */
  allowed: Set<string>[];
  /** Lines that belong to the frontmatter block. */
  frontmatter: boolean[];
  /** Lines inside fenced code blocks. */
  code: boolean[];
}

export function maskMarkdown(source: string, kind: MarkdownKind): MaskedMarkdown {
  const original = source.replace(/\r\n?/g, '\n').split('\n');
  const lines = [...original];
  const allowed = lines.map(() => new Set<string>());
  const frontmatter = lines.map(() => false);

  // Frontmatter: keep values, drop keys and YAML comments.
  if (/^---\s*$/.test(lines[0] ?? '')) {
    const end = lines.findIndex((l, i) => i > 0 && /^---\s*$/.test(l));
    if (end > 0) {
      for (let i = 0; i <= end; i++) {
        frontmatter[i] = true;
        let l = lines[i]!;
        if (i === 0 || i === end || /^\s*#/.test(l)) {
          lines[i] = blank(l);
          continue;
        }
        l = l.replace(/^(\s*[\w-]+:\s*)/, (m) => blank(m));
        if (!/^\s*["']/.test(l)) l = l.replace(/\s#.*$/, (m) => blank(m));
        lines[i] = l;
      }
    }
  }

  const code = codeLineMask(lines.map((l, i) => (frontmatter[i] ? '' : l)));
  code.forEach((inCode, i) => {
    if (inCode) lines[i] = blank(lines[i]!);
  });

  // HTML comments, after reading writing-allow labels from them.
  let text = lines.join('\n');
  text = text.replace(/<!--[\s\S]*?-->/g, (comment, offset: number) => {
    const allow = /writing-allow:\s*([^>]*?)\s*-->/.exec(comment)?.[1];
    if (allow) {
      const lineIndex = text.slice(0, offset).split('\n').length - 1;
      const labels = allow.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      const targets = [lineIndex];
      // A comment alone on its line applies to the next line too.
      if (original[lineIndex]!.trim() === comment.trim()) targets.push(lineIndex + 1);
      for (const t of targets) for (const label of labels) allowed[t]?.add(label);
    }
    return blank(comment);
  });
  const masked = text.split('\n');

  let section = '';
  for (let i = 0; i < masked.length; i++) {
    if (frontmatter[i] || code[i]) continue;
    let l = masked[i]!;
    const heading = /^ {0,3}##[ \t]+(.*?)[ \t#]*$/.exec(original[i]!);
    if (heading?.[1]) section = heading[1].trim();

    if (kind === 'challenge' && section === QUOTED_PROMPT_SECTION && /^ {0,3}>/.test(l)) {
      masked[i] = blank(l);
      continue;
    }
    l = l.replace(/(`+)(?:(?!\1)[\s\S])*?\1/g, (m) => blank(m)); // inline code
    l = l.replace(/\]\([^)]*\)/g, (m) => ']' + blank(m.slice(1))); // link and image targets
    l = l.replace(/^(\s*\[[^\]]+\]:\s*)\S+.*$/, (_m, lead: string) => lead + blank(_m.slice(lead.length))); // reference links
    l = l.replace(/<https?:[^>]*>/gi, (m) => blank(m)); // autolinks
    l = l.replace(/\b(?:src|href)\s*=\s*(["'])[^"']*\1/gi, (m) => blank(m)); // HTML attributes
    l = l.replace(/\bhttps?:\/\/[^\s)>\]]+/gi, (m) => blank(m)); // bare URLs
    masked[i] = l;
  }

  return { lines: masked, allowed, frontmatter, code };
}

interface Block {
  text: string;
  /** For each character of text, the 0-based source line it came from. */
  lineOf: number[];
}

/** Groups prose lines into paragraphs. Each list item and blockquote line run starts a new block. */
function proseBlocks(m: MaskedMarkdown): Block[] {
  const blocks: Block[] = [];
  let current: Block | null = null;
  const flush = () => {
    if (current && current.text.trim()) blocks.push(current);
    current = null;
  };

  m.lines.forEach((line, i) => {
    if (m.frontmatter[i] || m.code[i] || !line.trim() || /^\s{0,3}(#|\|)/.test(line)) {
      flush();
      return;
    }
    const listItem = /^(\s*)(?:[-*+]|\d+[.)])\s+/.exec(line);
    if (listItem) flush();
    const content = line.replace(/^\s*(?:>\s?)*/, '').replace(/^(?:[-*+]|\d+[.)])\s+/, '');
    if (!current) current = { text: '', lineOf: [] };
    const piece = (current.text ? ' ' : '') + content;
    current.text += piece;
    for (let k = 0; k < piece.length; k++) current.lineOf.push(i);
  });
  flush();
  return blocks;
}

interface Sentence {
  text: string;
  line: number;
}

function splitSentences(block: Block): Sentence[] {
  const out: Sentence[] = [];
  // A sentence ends at . ! or ? followed by whitespace or the end of the block,
  // so names like urllib.parse.unquote or file.txt stay in one sentence.
  const re = /(?:[^.!?]|[.!?]+(?!["')\]]*(?:\s|$)))+(?:[.!?]+["')\]]*|$)/g;
  for (const m of block.text.matchAll(re)) {
    const raw = m[0];
    const lead = raw.length - raw.trimStart().length;
    const text = raw.trim();
    if (!/[\p{L}\p{N}]/u.test(text)) continue;
    out.push({ text, line: (block.lineOf[(m.index ?? 0) + lead] ?? 0) + 1 });
  }
  return out;
}

const ingNouns = new Set(WARNINGS.ingNouns);

function endsWithParticiple(sentence: string): boolean {
  const body = sentence.replace(/[.!?"')\]]+$/, '');
  const m = /,\s+(?:(?:his|her|their|its|the|a|an|my|our|your)\s+[\p{L}-]+\s+)?([\p{L}]+ing)\b[^,]*$/iu.exec(body);
  return !!m?.[1] && !ingNouns.has(m[1].toLowerCase());
}

const wordCount = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const firstWord = (s: string) => /^[^\p{L}\p{N}]*([\p{L}\p{N}']+)/u.exec(s)?.[1]?.toLowerCase() ?? '';

function checkWarnings(file: string, m: MaskedMarkdown): Finding[] {
  const out: Finding[] = [];
  const warn = (line: number, rule: string, text: string, fix: string) =>
    out.push({ file, line, column: 1, severity: 'warning', rule, text: text.length > 70 ? `${text.slice(0, 67)}...` : text, fix });

  const blocks = proseBlocks(m);
  for (const block of blocks) {
    for (const rule of WARNINGS.negation) {
      for (const match of block.text.matchAll(new RegExp(rule.pattern, 'giu'))) {
        warn((block.lineOf[match.index ?? 0] ?? 0) + 1, 'negation', match[0], `${rule.message}: ${rule.fix}`);
      }
    }
    for (const match of block.text.matchAll(new RegExp(WARNINGS.editorialParticiple.pattern, 'giu'))) {
      warn((block.lineOf[match.index ?? 0] ?? 0) + 1, 'editorial-participle', match[0].replace(/^,\s*/, ', '), WARNINGS.editorialParticiple.fix);
    }

    const sentences = splitSentences(block);
    const report = (key: (s: Sentence) => string | null, min: number, rule: string, fix: (run: Sentence[]) => string) => {
      for (const run of consecutiveRuns(sentences, key)) {
        if (run.length >= min) warn(run[0]!.line, rule, run.map((s) => s.text).join(' '), fix(run));
      }
    };
    report((s) => (endsWithParticiple(s.text) ? 'yes' : null), WARNINGS.trailingParticipleRun, 'trailing-participles', (r) => `${r.length} sentences in a row end with a ", ...ing" phrase. Vary the structure`);
    report((s) => firstWord(s.text) || null, WARNINGS.sameStartRun, 'same-start', (r) => `${r.length} sentences in a row start with "${firstWord(r[0]!.text)}". Vary the openings`);
    report((s) => (wordCount(s.text) <= WARNINGS.fragmentMaxWords ? 'yes' : null), WARNINGS.fragmentRun, 'fragments', (r) => `${r.length} short fragments in a row. Combine them into full sentences`);
  }

  m.lines.forEach((line, i) => {
    if (m.code[i]) return;
    const match = new RegExp(WARNINGS.todo.pattern).exec(line);
    if (match) {
      out.push({ file, line: i + 1, column: match.index + 1, severity: 'warning', rule: 'todo', text: snippet(line, match.index), fix: WARNINGS.todo.fix });
    }
  });
  return out;
}

const snippet = (line: string, from: number) => line.slice(from, from + 60).trim();

/** Splits items into runs of neighbors that share the same non-null key. */
function consecutiveRuns<T>(items: T[], key: (item: T) => string | null): T[][] {
  const runs: T[][] = [];
  let run: T[] = [];
  let runKey: string | null = null;
  for (const item of items) {
    const k = key(item);
    if (k !== null && k === runKey) run.push(item);
    else {
      if (run.length) runs.push(run);
      run = k === null ? [] : [item];
      runKey = k;
    }
  }
  if (run.length) runs.push(run);
  return runs;
}

export function lintMarkdown(file: string, source: string, kind: MarkdownKind): Finding[] {
  const m = maskMarkdown(source, kind);
  const findings: Finding[] = [];
  m.lines.forEach((line, i) => findings.push(...checkErrors(file, i + 1, 0, line, m.allowed[i]!)));
  findings.push(...checkWarnings(file, m));

  if (kind === 'tool') {
    const bodyStart = m.frontmatter.lastIndexOf(true) + 1;
    const body = source.replace(/\r\n?/g, '\n').split('\n').slice(bodyStart).join('\n');
    for (const p of checkHeadingOrder(body, TOOL_HEADINGS)) {
      findings.push({
        file,
        line: p.index !== undefined ? bodyStart + p.index + 1 : 1,
        column: 1,
        severity: 'warning',
        rule: 'tool-headings',
        text: p.heading,
        fix: p.message,
      });
    }
  }
  return findings.sort(byPosition);
}

// ---------------------------------------------------------------------------
// TypeScript and TSX source

/** Lints user-facing strings, JSX text, and comments in a source file. */
export function lintSource(file: string, source: string): Finding[] {
  const findings: Finding[] = [];
  const lines = source.split('\n');

  // Dashes are never right anywhere in src, including code.
  lines.forEach((line, i) => findings.push(...checkErrors(file, i + 1, 0, line, new Set()).filter((f) => f.rule !== 'banned-word')));

  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const pieces: { pos: number; text: string }[] = [];
  const seenComments = new Set<number>();

  const visit = (node: ts.Node) => {
    for (const range of ts.getLeadingCommentRanges(source, node.getFullStart()) ?? []) {
      if (seenComments.has(range.pos)) continue;
      seenComments.add(range.pos);
      pieces.push({ pos: range.pos, text: source.slice(range.pos, range.end) });
    }
    const isModuleSpecifier = ts.isStringLiteral(node) && (ts.isImportDeclaration(node.parent) || ts.isExportDeclaration(node.parent) || ts.isExternalModuleReference(node.parent));
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !isModuleSpecifier) {
      pieces.push({ pos: node.getStart(sf), text: node.getText(sf) });
    } else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node) || ts.isJsxText(node)) {
      pieces.push({ pos: node.getStart(sf), text: node.getText(sf) });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  for (const piece of pieces) {
    piece.text.split('\n').forEach((part, k) => {
      const start = sf.getLineAndCharacterOfPosition(piece.pos);
      const line = start.line + k;
      const column = k === 0 ? start.character : 0;
      findings.push(...checkErrors(file, line + 1, column, part, new Set()).filter((f) => f.rule === 'banned-word'));
    });
  }
  return findings.sort(byPosition);
}
