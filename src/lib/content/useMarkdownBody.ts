import { useEffect, useState } from 'react';

// One lazily loaded module per write-up and tool guide. Each detail page
// downloads only its own markdown body.
const bodies: Record<string, () => Promise<string>> = {
  ...import.meta.glob<string>('/content/challenges/*/writeup.md', { query: '?body', import: 'default' }),
  ...import.meta.glob<string>('/content/tools/*/index.md', { query: '?body', import: 'default' }),
};

/** The markdown body of a content file, or null while it loads. */
export function useMarkdownBody(sourcePath: string | undefined): string | null {
  const [loaded, setLoaded] = useState<{ path: string; body: string } | null>(null);

  useEffect(() => {
    const load = sourcePath ? bodies[`/${sourcePath}`] : undefined;
    if (!sourcePath || !load) return;
    let current = true;
    load().then((body) => {
      if (current) setLoaded({ path: sourcePath, body });
    });
    return () => {
      current = false;
    };
  }, [sourcePath]);

  return loaded && loaded.path === sourcePath ? loaded.body : null;
}
