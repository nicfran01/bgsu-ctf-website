// npm run new:tool -- <slug>
import { toolTemplate } from './lib/templates.ts';
import { scaffold } from './lib/scaffold.ts';

const file = scaffold('tools', 'index.md', toolTemplate(), ['images']);

console.log(`Created ${file}

Next steps:
  1. Fill in the frontmatter and replace every TODO in ${file}.
  2. Run "npm run lint:content" and fix anything it reports.
  3. Run "npm run dev" to preview the page.`);
