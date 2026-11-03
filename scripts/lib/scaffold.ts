import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { slugIssue } from '../../src/lib/content/validate.ts';

/**
 * Creates content/<kind>/<slug>/ with a markdown file and empty subfolders.
 * Returns the created markdown path, or exits with a message.
 */
export function scaffold(kind: 'challenges' | 'tools', fileName: string, contents: string, subfolders: string[]): string {
  const command = kind === 'challenges' ? 'new:challenge' : 'new:tool';
  const slug = process.argv[2];
  if (!slug) {
    console.error(`Usage: npm run ${command} -- <folder-name>\nExample: npm run ${command} -- cookie-monster`);
    process.exit(1);
  }
  const problem = slugIssue(slug);
  if (problem) {
    console.error(`Error: ${problem}`);
    process.exit(1);
  }

  const root = process.cwd();
  const dir = join(root, 'content', kind, slug);
  if (existsSync(dir)) {
    console.error(`Error: ${relative(root, dir)} already exists. Pick another name or edit the existing files.`);
    process.exit(1);
  }

  for (const sub of subfolders) {
    mkdirSync(join(dir, sub), { recursive: true });
    writeFileSync(join(dir, sub, '.gitkeep'), '');
  }
  const file = join(dir, fileName);
  writeFileSync(file, contents);
  return relative(root, file);
}
