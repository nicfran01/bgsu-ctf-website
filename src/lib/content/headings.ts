export interface Heading {
  depth: number;
  text: string;
  /** 0-based line index within the text that was scanned. */
  index: number;
}

export interface HeadingSpec {
  readonly text: string;
  readonly optional: boolean;
}

export interface HeadingProblem {
  message: string;
  /** 0-based line index, when the problem points at a specific heading. */
  index?: number;
  heading: string;
}

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})/;

/**
 * Returns one boolean per line: true when the line is part of a fenced code
 * block (including the fence lines themselves).
 */
export function codeLineMask(lines: readonly string[]): boolean[] {
  const mask: boolean[] = [];
  let fence: string | null = null;
  for (const line of lines) {
    if (fence) {
      mask.push(true);
      const close = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (close?.[1] && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      continue;
    }
    const open = line.match(FENCE_OPEN);
    if (open?.[1]) {
      fence = open[1];
      mask.push(true);
      continue;
    }
    mask.push(false);
  }
  return mask;
}

/** ATX headings (lines starting with #) outside fenced code. */
export function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split('\n');
  const inCode = codeLineMask(lines);
  const headings: Heading[] = [];
  lines.forEach((line, index) => {
    if (inCode[index]) return;
    const match = line.match(/^ {0,3}(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$/);
    if (match?.[1] && match[2] !== undefined) {
      headings.push({ depth: match[1].length, text: match[2].trim(), index });
    }
  });
  return headings;
}

/**
 * Checks that the level-2 headings match the spec exactly and in order.
 * Optional headings may be absent. Any other level-2 heading is a problem.
 */
export function checkHeadingOrder(markdown: string, spec: readonly HeadingSpec[]): HeadingProblem[] {
  const problems: HeadingProblem[] = [];
  const headings = extractHeadings(markdown);
  const expectedOrder = spec.map((s) => `"## ${s.text}"`).join(', ');

  for (const h of headings.filter((h) => h.depth === 1)) {
    problems.push({
      heading: h.text,
      index: h.index,
      message: `remove the level-1 heading "# ${h.text}". The page title comes from frontmatter, and sections start at "##"`,
    });
  }

  const h2s = headings.filter((h) => h.depth === 2);
  const seen = new Set<number>();
  let cursor = 0;

  for (const h of h2s) {
    const specIndex = spec.findIndex((s) => s.text.toLowerCase() === h.text.toLowerCase());
    if (specIndex === -1) {
      problems.push({
        heading: h.text,
        index: h.index,
        message: `"## ${h.text}" is not one of the standard sections. Use "###" to make it a subsection. Standard order: ${expectedOrder}`,
      });
      continue;
    }
    const expected = spec[specIndex]!;
    if (expected.text !== h.text) {
      problems.push({
        heading: h.text,
        index: h.index,
        message: `write the heading exactly as "## ${expected.text}"`,
      });
    }
    if (seen.has(specIndex)) {
      problems.push({ heading: h.text, index: h.index, message: `"## ${expected.text}" appears more than once` });
      continue;
    }
    if (specIndex < cursor) {
      problems.push({
        heading: h.text,
        index: h.index,
        message: `"## ${expected.text}" is out of order. Standard order: ${expectedOrder}`,
      });
    }
    seen.add(specIndex);
    cursor = Math.max(cursor, specIndex + 1);
  }

  spec.forEach((s, i) => {
    if (!s.optional && !seen.has(i)) {
      problems.push({ heading: s.text, message: `missing the required section "## ${s.text}"` });
    }
  });

  return problems;
}
