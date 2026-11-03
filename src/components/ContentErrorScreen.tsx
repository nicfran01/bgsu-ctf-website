import type { ContentIssue } from '../lib/content/types';
import { formatIssue } from '../lib/content/types';

// Shown in development when a content file has a problem. A production build
// never gets here, because the build stops on the same problems.
export function ContentErrorScreen({ issues }: { issues: ContentIssue[] }) {
  return (
    <main className="container page">
      <h1 className="page-title">Content problems</h1>
      <p className="page-lead">Fix these files and save. The page reloads on its own.</p>
      <ul style={{ marginTop: 'var(--space-5)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
        {issues.map((issue, i) => (
          <li key={i} style={{ marginBottom: 'var(--space-2)' }}>
            {formatIssue(issue)}
          </li>
        ))}
      </ul>
    </main>
  );
}
