import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { loadChallenge, loadTool, type ValidationContext } from '../../src/lib/content/validate.ts';
import { challengeTemplate, toolTemplate } from '../lib/templates.ts';

const PATH = 'content/challenges/sample/writeup.md';

const ctx = (assets: string[] = []): ValidationContext => ({
  assetExists: (p) => assets.includes(p),
  filesFor: () => [],
});

const BODY = ['Overview', 'Challenge Description', 'Recon', 'Walkthrough', 'Solution', 'Flag', 'Takeaways']
  .map((h) => `## ${h}\n\nText.\n`)
  .join('\n');

function writeup(fields: Record<string, string>, body = BODY): string {
  const base: Record<string, string> = {
    title: 'Sample',
    category: 'web',
    difficulty: 'easy',
    date: '2026-10-01',
    author: 'Someone',
    summary: 'A sample.',
    ...fields,
  };
  const fm = Object.entries(base)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  return `---\n${fm}\n---\n\n${body}`;
}

const check = (source: string, assets?: string[]) => loadChallenge({ path: PATH, source }, ctx(assets));

describe('challenge frontmatter', () => {
  test('a valid write-up loads with no issues', () => {
    const r = check(writeup({ tags: '[a, B]', points: '100' }));
    assert.deepEqual(r.issues, []);
    assert.equal(r.challenge?.slug, 'sample');
    assert.deepEqual(r.challenge?.tags, ['a', 'b']);
    assert.equal(r.challenge?.points, 100);
  });

  test('a bad enum names the file and field', () => {
    const r = check(writeup({ difficulty: 'insane' }));
    assert.equal(r.challenge, null);
    assert.equal(r.issues[0]?.file, PATH);
    assert.equal(r.issues[0]?.field, 'difficulty');
    assert.match(r.issues[0]!.message, /easy, medium, hard.*insane/);
  });

  test('a missing required field is reported', () => {
    const r = check(writeup({ author: '' }));
    assert.ok(r.issues.some((i) => i.field === 'author' && /missing/.test(i.message)));
  });

  test('a badly formatted date is reported', () => {
    const r = check(writeup({ date: '10/01/2026' }));
    assert.ok(r.issues.some((i) => i.field === 'date' && /YYYY-MM-DD/.test(i.message)));
  });

  test('an impossible date is reported', () => {
    const r = check(writeup({ date: '2026-02-30' }));
    assert.ok(r.issues.some((i) => i.field === 'date' && /real calendar date/.test(i.message)));
  });

  test('points must be a number', () => {
    const r = check(writeup({ points: 'lots' }));
    assert.ok(r.issues.some((i) => i.field === 'points'));
  });

  test('challengeUrl must be a full link', () => {
    const r = check(writeup({ challengeUrl: 'example.com' }));
    assert.ok(r.issues.some((i) => i.field === 'challengeUrl'));
  });

  test('an unknown field suggests the right spelling', () => {
    const r = check(writeup({ challengeURL: 'https://example.com' }));
    assert.ok(r.issues.some((i) => i.field === 'challengeURL' && /Did you mean "challengeUrl"/.test(i.message)));
  });

  test('missing frontmatter fence is reported', () => {
    const r = check('title: nope\n');
    assert.equal(r.issues[0]?.field, 'frontmatter');
  });

  test('invalid YAML is reported', () => {
    const r = check('---\ntitle: [unclosed\n---\n');
    assert.equal(r.issues[0]?.field, 'frontmatter');
    assert.match(r.issues[0]!.message, /not valid YAML/);
  });

  test('a bad folder name is reported', () => {
    const r = loadChallenge({ path: 'content/challenges/Bad_Name/writeup.md', source: writeup({}) }, ctx());
    assert.ok(r.issues.some((i) => i.field === 'folder'));
  });
});

describe('write-up headings', () => {
  const headingIssues = (body: string) => check(writeup({}, body)).issues.filter((i) => i.field === 'headings');

  test('out-of-order headings are reported with a line number', () => {
    const body = BODY.replace('## Recon', '## TEMP').replace('## Walkthrough', '## Recon').replace('## TEMP', '## Walkthrough');
    const issues = headingIssues(body);
    assert.ok(issues.some((i) => /out of order/.test(i.message) && typeof i.line === 'number'));
  });

  test('a missing section is reported', () => {
    const issues = headingIssues(BODY.replace('## Flag\n\nText.\n', ''));
    assert.ok(issues.some((i) => /missing the required section "## Flag"/.test(i.message)));
  });

  test('References is optional but must be last', () => {
    assert.deepEqual(headingIssues(BODY + '\n## References\n\nLinks.\n'), []);
    const early = BODY.replace('## Overview', '## References\n\nx\n\n## Overview');
    assert.ok(headingIssues(early).some((i) => /out of order/.test(i.message)));
  });

  test('extra level-2 sections and level-1 headings are reported', () => {
    assert.ok(headingIssues(BODY + '\n## Bonus\n').some((i) => /not one of the standard sections/.test(i.message)));
    assert.ok(headingIssues('# Title\n\n' + BODY).some((i) => /level-1 heading/.test(i.message)));
  });

  test('headings inside code blocks are ignored', () => {
    assert.deepEqual(headingIssues(BODY.replace('## Recon\n\nText.', '## Recon\n\n```bash\n## Bonus\n# comment\n```')), []);
  });

  test('wrong capitalization is reported', () => {
    assert.ok(headingIssues(BODY.replace('## Recon', '## recon')).some((i) => /exactly as "## Recon"/.test(i.message)));
  });
});

describe('images', () => {
  const withImage = (md: string) => writeup({}, BODY.replace('## Recon\n\nText.', `## Recon\n\n${md}`));

  test('an existing relative image passes', () => {
    const r = check(withImage('![a diagram](./images/a.png)'), ['content/challenges/sample/images/a.png']);
    assert.deepEqual(r.issues, []);
  });

  test('a missing image is reported with its line', () => {
    const r = check(withImage('![a diagram](./images/missing.png)'));
    assert.ok(r.issues.some((i) => i.field === 'image' && /does not exist/.test(i.message) && typeof i.line === 'number'));
  });

  test('empty alt text is reported', () => {
    const r = check(withImage('![](./images/a.png)'), ['content/challenges/sample/images/a.png']);
    assert.ok(r.issues.some((i) => i.field === 'image' && /alt text/.test(i.message)));
  });

  test('images outside the images folder are reported', () => {
    const r = check(withImage('![a diagram](../other/a.png)'));
    assert.ok(r.issues.some((i) => /images\/ directory/.test(i.message)));
  });

  test('image syntax inside code is ignored', () => {
    assert.deepEqual(check(withImage('`![](./x.png)`')).issues, []);
  });
});

describe('scaffold templates', () => {
  test('the challenge template passes validation', () => {
    assert.deepEqual(check(challengeTemplate('2026-01-01')).issues, []);
  });

  test('the tool template passes validation', () => {
    const r = loadTool({ path: 'content/tools/sample/index.md', source: toolTemplate() }, ctx());
    assert.deepEqual(r.issues, []);
  });

  test('a tool with a platform outside the list is reported', () => {
    const source = toolTemplate().replace(/platforms: \[[^\]]*\]/, 'platforms: [linux, amiga]');
    const r = loadTool({ path: 'content/tools/sample/index.md', source }, ctx());
    assert.ok(r.issues.some((i) => i.field === 'platforms' && /amiga/.test(i.message)));
  });
});
