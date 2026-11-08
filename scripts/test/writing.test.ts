import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { lintJson, lintMarkdown, lintSource, type Finding } from '../lib/writing-lint.ts';

const EM = '—';
const EN = '–';

const challenge = (body: string) => lintMarkdown('content/challenges/x/writeup.md', `---\ntitle: X\n---\n\n${body}\n`, 'challenge');
const page = (body: string) => lintMarkdown('README.md', body, 'page');
const errors = (f: Finding[]) => f.filter((x) => x.severity === 'error');
const warnings = (f: Finding[], rule?: string) => f.filter((x) => x.severity === 'warning' && (!rule || x.rule === rule));

describe('errors', () => {
  test('em and en dashes are errors with line and column', () => {
    const f = errors(page(`First line.\nThe server crashed ${EM} twice.\nPages 5${EN}10.`));
    assert.equal(f.length, 2);
    assert.deepEqual([f[0]!.rule, f[0]!.line, f[0]!.column], ['em dash', 2, 20]);
    assert.equal(f[1]!.rule, 'en dash');
  });

  test('banned words are matched with inflections and any case', () => {
    const f = errors(page('We Leveraged the bug. Delving deeper. A robust parser. It is crucial.'));
    assert.deepEqual(f.map((x) => x.text), ['Leveraged', 'Delving', 'robust', 'crucial']);
    assert.ok(f.every((x) => x.rule === 'banned-word' && x.fix.length > 0));
  });

  test('banned phrases are matched, including curly apostrophes', () => {
    const f = errors(page('It’s worth noting that this works. In the realm of web bugs. Let us explore.'));
    assert.deepEqual(f.map((x) => x.text.toLowerCase()), ['it’s worth noting', 'in the realm of', 'let us explore']);
  });

  test('words inside longer words do not match', () => {
    assert.deepEqual(errors(page('Check the vitals. The dynamic analysis ran. Fostering is fine? No.')).map((x) => x.text), ['Fostering']);
  });

  test('literal "highlight", "reflect", "emphasize", and "framework" are allowed', () => {
    assert.deepEqual(errors(page('Highlight the text. The reflected XSS. Emphasize nothing. The Flask framework.')), []);
  });

  test('frontmatter values are checked but keys are not', () => {
    const f = lintMarkdown('content/challenges/x/writeup.md', `---\ntitle: A robust title ${EM} here\nsummary: plain\n---\n`, 'challenge');
    assert.deepEqual(errors(f).map((x) => [x.rule, x.line]), [['banned-word', 2], ['em dash', 2]]);
  });
});

describe('skipped regions', () => {
  test('fenced code blocks are skipped, both fence styles', () => {
    const body = ['```bash', `echo "robust ${EM} crucial"`, '```', '~~~', 'leverage', '~~~', 'Plain text.'].join('\n');
    assert.deepEqual(errors(page(body)), []);
  });

  test('inline code is skipped, including double backticks', () => {
    assert.deepEqual(errors(page(`Run \`robust ${EM} x\` and \`\`navigate \` here\`\`.`)), []);
  });

  test('link and image URLs are skipped but link text is checked', () => {
    const f = errors(page('[docs](https://example.com/robust-guide) and https://example.com/vital and [a robust link](./x).'));
    assert.deepEqual(f.map((x) => x.text), ['robust']);
  });

  test('blockquotes in Challenge Description are skipped', () => {
    const f = challenge(`## Challenge Description\n\n> A robust server ${EM} can you break it?\n\nThe prompt above is fine.`);
    assert.deepEqual(errors(f), []);
  });

  test('blockquotes in other sections are still checked', () => {
    const f = challenge(`## Recon\n\n> A robust note ${EM} from me.`);
    assert.equal(errors(f).length, 2);
  });

  test('writing-allow keeps an allowable word on the same line or the next line', () => {
    assert.deepEqual(errors(page('Navigate to /admin. <!-- writing-allow: navigate -->')), []);
    assert.deepEqual(errors(page('<!-- writing-allow: navigate, landscape -->\nNavigate to the landscape view.')), []);
    assert.equal(errors(page('<!-- writing-allow: navigate -->\n\nNavigate to /admin.')).length, 1);
  });

  test('writing-allow cannot allow other words or dashes', () => {
    const f = errors(page(`A robust fix ${EM} really. <!-- writing-allow: robust, em dash -->`));
    assert.deepEqual(f.map((x) => x.rule).sort(), ['banned-word', 'em dash']);
  });

  test('without writing-allow the fix mentions it for allowable words', () => {
    const [f] = errors(page('Navigate to /admin.'));
    assert.match(f!.fix, /writing-allow: navigate/);
  });
});

describe('warnings', () => {
  test('"not X, but Y" and its relatives', () => {
    assert.equal(warnings(page('It was not a bug, but a feature.'), 'negation').length, 1);
    assert.equal(warnings(page('Not only did it crash but it leaked memory.'), 'negation').length, 1);
    assert.equal(warnings(page("It's not about speed. It's about accuracy."), 'negation').length, 1);
    assert.equal(warnings(page('The file was not found, so I tried again.'), 'negation').length, 0);
  });

  test('editorializing participles', () => {
    assert.equal(warnings(page('The server crashed, highlighting the need for tests.'), 'editorial-participle').length, 1);
    assert.equal(warnings(page('Highlighting the text shows the hidden flag.'), 'editorial-participle').length, 0);
  });

  test('three sentences in a row ending in a participle phrase', () => {
    const text = 'I opened the file, looking for strings. I ran the binary, hoping for output. I read the source, finding the bug.';
    assert.equal(warnings(page(text), 'trailing-participles').length, 1);
    assert.equal(warnings(page('I opened the file, looking for strings. I ran the binary, hoping for output. Then I read the source.'), 'trailing-participles').length, 0);
  });

  test('nouns ending in "ing" are not participles', () => {
    const text = 'I printed the string. I checked the padding. I fixed the encoding.';
    assert.equal(warnings(page(text.replace(/the /g, 'it, the ')), 'trailing-participles').length, 0);
  });

  test('three or more sentences starting with the same word', () => {
    assert.equal(warnings(page('The server runs Flask. The cookie is Base64. The flag is in the response.'), 'same-start').length, 1);
    assert.equal(warnings(page('The server runs Flask. A cookie is set. The flag is in the response.'), 'same-start').length, 0);
  });

  test('runs of short fragments', () => {
    assert.equal(warnings(page('Fast setup. Simple tools. Big results. Then a normal sentence follows here.'), 'fragments').length, 1);
    assert.equal(warnings(page('It works. This one is a full sentence with words. Done.'), 'fragments').length, 0);
  });

  test('dots inside names do not end a sentence', () => {
    assert.equal(warnings(page('See [Python docs: urllib.parse.unquote](https://x) for details.'), 'fragments').length, 0);
    assert.equal(warnings(page('Open trail.txt in an editor. Read README.txt first. Then run solve.py with Python.'), 'fragments').length, 0);
  });

  test('list items are separate blocks', () => {
    assert.equal(warnings(page('- The first item.\n- The second item.\n- The third item.'), 'same-start').length, 0);
  });

  test('TODO placeholders warn once per line', () => {
    assert.equal(warnings(page('TODO: one\nTODO: two TODO: three'), 'todo').length, 2);
  });

  test('tool guides warn on missing headings, challenges do not get tool checks', () => {
    const f = lintMarkdown('content/tools/x/index.md', '---\nname: x\n---\n\n## What It Is\n\nText.\n', 'tool');
    assert.ok(warnings(f, 'tool-headings').some((x) => /missing the required section "## Installation"/.test(x.fix)));
    assert.equal(errors(f).length, 0);
  });

  test('warnings do not fire inside code', () => {
    assert.deepEqual(warnings(page('```\nThe a. The b. The c. TODO\n```')), []);
  });
});

describe('source files', () => {
  test('banned words in strings, JSX text, and comments are errors', () => {
    const src = [
      "// A robust helper",
      "const label = 'Leverage this';",
      'export const App = () => <p>Crucial info</p>;',
      'const t = `seamless ${label}`;',
    ].join('\n');
    const f = lintSource('src/App.tsx', src);
    assert.deepEqual(f.map((x) => [x.text, x.line]), [['robust', 1], ['Leverage', 2], ['Crucial', 3], ['seamless', 4]]);
  });

  test('identifiers and import paths are not checked', () => {
    const src = "import { navigate } from './robust';\nconst navigate2 = navigate;\nnavigate('/x');";
    assert.deepEqual(lintSource('src/a.ts', src), []);
  });

  test('dashes are errors anywhere in source, including code', () => {
    const f = lintSource('src/a.ts', `const x = 1; // ok\nconst y = a ${EM} b;`);
    assert.deepEqual(f.map((x) => [x.rule, x.line]), [['em dash', 2]]);
  });
});

describe('JSON content', () => {
  const json = (entries: unknown) => lintJson('content/platforms.json', JSON.stringify(entries, null, 2));

  test('dashes and banned words in values are errors with line and column', () => {
    const f = errors(json([{ name: 'Site', summary: `A robust site ${EM} for practice.` }]));
    assert.deepEqual(f.map((x) => [x.rule, x.text, x.line]), [['banned-word', 'robust', 4], ['em dash', EM, 4]]);
    assert.equal(f[0]!.column, 19);
  });

  test('keys and link values are skipped', () => {
    assert.deepEqual(json([{ robust: 'fine', url: 'https://example.com/leverage' }]), []);
  });

  test('escaped characters are decoded before checking', () => {
    assert.equal(errors(lintJson('content/links.json', '[{"description": "a \\u2014 b"}]')).length, 1);
  });

  test('TODO and "not X, but Y" are warnings', () => {
    const f = json([{ summary: 'TODO: write this' }, { summary: 'It is not a game, but a course.' }]);
    assert.equal(warnings(f, 'todo').length, 1);
    assert.equal(warnings(f, 'negation').length, 1);
    assert.deepEqual(errors(f), []);
  });

  test('the caution field in tool frontmatter is linted', () => {
    const f = lintMarkdown('content/tools/x/index.md', `---\nname: X\ncaution: Scanning is crucial ${EN} ask first.\n---\n`, 'tool');
    assert.deepEqual(errors(f).map((x) => [x.rule, x.line]), [['banned-word', 3], ['en dash', 3]]);
  });
});
