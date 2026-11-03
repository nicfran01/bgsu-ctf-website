import { Markdown } from '../components/Markdown';
import { aboutMarkdown } from '../lib/content/load';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useHashScroll } from '../lib/useHashScroll';
import { siteConfig } from '../site.config';

export function AboutPage() {
  useDocumentTitle('About');
  useHashScroll('about');
  return (
    <div className="container page">
      <h1 className="page-title">About {siteConfig.clubName}</h1>
      <div style={{ marginTop: 'var(--space-5)' }}>
        <Markdown markdown={aboutMarkdown} sourcePath="content/about.md" routePath="/about" />
      </div>
    </div>
  );
}
