import { parse, YAMLParseError } from 'yaml';

export interface ParsedMarkdown {
  data: Record<string, unknown>;
  body: string;
  /** 1-based line number in the file where the body starts. */
  bodyStartLine: number;
}

export class FrontmatterError extends Error {
  readonly line: number | undefined;

  constructor(message: string, line?: number) {
    super(message);
    this.name = 'FrontmatterError';
    this.line = line;
  }
}

const FENCE = /^---[ \t]*$/;

/**
 * Splits a markdown file into its YAML frontmatter and body. The file must
 * start with a line containing only "---", and the frontmatter ends at the
 * next such line.
 */
export function parseMarkdown(source: string): ParsedMarkdown {
  const text = source.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n');

  if (!FENCE.test(lines[0] ?? '')) {
    throw new FrontmatterError('file must start with a "---" line that opens the frontmatter', 1);
  }
  const end = lines.findIndex((line, i) => i > 0 && FENCE.test(line));
  if (end === -1) {
    throw new FrontmatterError('frontmatter is never closed (add a "---" line after the last field)', 1);
  }

  const yamlText = lines.slice(1, end).join('\n');
  let data: unknown;
  try {
    // The core schema keeps dates like 2025-10-04 as plain strings.
    data = parse(yamlText, { schema: 'core', prettyErrors: false });
  } catch (err) {
    if (err instanceof YAMLParseError) {
      const line = err.linePos?.[0]?.line;
      throw new FrontmatterError(`frontmatter is not valid YAML: ${err.message.split('\n')[0]}`, line ? line + 1 : undefined);
    }
    throw err;
  }
  if (data === null || data === undefined) data = {};
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new FrontmatterError('frontmatter must be a list of "key: value" lines', 2);
  }

  return {
    data: data as Record<string, unknown>,
    body: lines.slice(end + 1).join('\n'),
    bodyStartLine: end + 2,
  };
}
