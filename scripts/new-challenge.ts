// npm run new:challenge -- <slug>
import { challengeTemplate } from './lib/templates.ts';
import { scaffold } from './lib/scaffold.ts';

const file = scaffold('challenges', 'writeup.md', challengeTemplate(), ['images', 'files']);
const dir = file.replace(/\/writeup\.md$/, '');

console.log(`Created ${file}

Next steps:
  1. Fill in the frontmatter and replace every TODO in ${file}.
  2. Put screenshots in ${dir}/images/ and link them as ![what it shows](./images/name.png).
  3. Put challenge files, source, Dockerfiles, and solve scripts in ${dir}/files/.
     The Download button appears once that folder has a file in it.
  4. Run "npm run lint:content" and fix anything it reports.
  5. Run "npm run dev" to preview the page.`);
