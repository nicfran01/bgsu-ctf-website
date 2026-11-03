// Vite plugin for the content/ folder.
//
// The site discovers content with import.meta.glob and a custom "?content"
// query, for example
//   import.meta.glob('/content/challenges/*/writeup.md', { query: '?content', ... })
// This plugin answers those imports: it reads the markdown file, parses and
// validates the frontmatter, and returns the result as JSON. Parsing happens
// here at build time, so the YAML parser is never shipped to the browser.
//
// It also validates the whole content/ folder when a build starts. Any problem
// stops `vite build` with the file and field name. In the dev server the same
// messages show in the error overlay.

import { readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { formatIssues, type LoadedEntry } from '../src/lib/content/types.ts';
import { loadChallenge, loadPage, loadTool, type ValidationContext } from '../src/lib/content/validate.ts';
import { readContentTree, validateContentTree } from './lib/content-fs.ts';

const QUERY = '?content';

export function contentPlugin(): Plugin {
  let root = process.cwd();
  let server: ViteDevServer | undefined;
  let ctx: ValidationContext | undefined;

  const context = () => (ctx ??= readContentTree(root).ctx);

  const reportToOverlay = () => {
    const { issues } = validateContentTree(root);
    if (issues.length && server) {
      server.ws.send({ type: 'error', err: { message: formatIssues(issues), stack: '', plugin: 'content' } });
    }
    return issues;
  };

  return {
    name: 'bgsu-ctf-content',
    enforce: 'pre',

    configResolved(config) {
      root = config.root;
    },

    buildStart() {
      ctx = undefined;
      if (server) return;
      const { issues } = validateContentTree(root);
      if (issues.length) this.error(formatIssues(issues));
    },

    load(id) {
      if (!id.endsWith(QUERY)) return undefined;
      const file = id.slice(0, -QUERY.length);
      const repoPath = relative(root, file).split(sep).join('/');
      const source = { path: repoPath, source: readFileSync(file, 'utf8') };

      let entry: LoadedEntry<unknown>;
      if (/^content\/challenges\/[^/]+\/writeup\.md$/.test(repoPath)) {
        const r = loadChallenge(source, context());
        entry = { item: r.challenge, issues: r.issues };
      } else if (/^content\/tools\/[^/]+\/index\.md$/.test(repoPath)) {
        const r = loadTool(source, context());
        entry = { item: r.tool, issues: r.issues };
      } else if (repoPath === 'content/about.md') {
        const r = loadPage(source, context());
        entry = { item: r.body, issues: r.issues };
      } else {
        this.error(`${repoPath}: "?content" only works for challenge write-ups, tool guides, and content/about.md`);
      }

      if (entry.issues.length && !server) this.error(formatIssues(entry.issues));
      return `export default ${JSON.stringify(entry)};`;
    },

    configureServer(devServer) {
      server = devServer;
      const contentDir = resolve(root, 'content');
      devServer.watcher.add(contentDir);

      const onChange = (path: string) => {
        if (!path.startsWith(contentDir)) return;
        // Images and files/ folders feed into the checks, so reload every content module.
        ctx = undefined;
        for (const mod of devServer.moduleGraph.idToModuleMap.values()) {
          if (mod.id?.endsWith(QUERY)) devServer.moduleGraph.invalidateModule(mod);
        }
        if (reportToOverlay().length === 0) devServer.ws.send({ type: 'full-reload' });
      };
      for (const event of ['add', 'unlink', 'change', 'addDir', 'unlinkDir'] as const) {
        devServer.watcher.on(event, onChange);
      }
      devServer.ws.on('connection', () => setTimeout(reportToOverlay, 200));
    },
  };
}
