import { useRef } from 'react';
import { Link, useParams } from 'react-router';
import { CategoryBadge, TagList } from '../components/Badge';
import { Markdown } from '../components/Markdown';
import sidebar from '../components/Sidebar.module.css';
import { TableOfContents } from '../components/TableOfContents';
import { label } from '../content.config';
import { tools } from '../lib/content/load';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useMarkdownBody } from '../lib/content/useMarkdownBody';
import { useHashScroll } from '../lib/useHashScroll';
import { NotFoundPage } from './NotFoundPage';
import styles from './DetailPage.module.css';

export function ToolDetailPage() {
  const { slug } = useParams();
  const tool = tools.find((t) => t.slug === slug);
  const contentRef = useRef<HTMLDivElement>(null);
  useDocumentTitle(tool?.name);
  const body = useMarkdownBody(tool?.sourcePath);
  // Wait for the body, so #section links have headings to scroll to.
  useHashScroll(body === null ? undefined : tool?.slug);

  if (!tool) return <NotFoundPage />;
  const routePath = `/tools/${tool.slug}`;

  return (
    <div className="container page">
      <p className={styles.crumb}>
        <Link to="/tools">Tools</Link>
      </p>
      <header className={styles.header}>
        <div className={styles.badges}>
          <CategoryBadge value={tool.category} />
        </div>
        <h1 className="page-title">{tool.name}</h1>
        <p className="page-lead">{tool.summary}</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <section aria-labelledby="details-heading" className={sidebar.panel}>
            <h2 id="details-heading" className={sidebar.heading}>
              Tool details
            </h2>
            {tool.officialUrl && (
              <div className={sidebar.actions}>
                <a className="button" href={tool.officialUrl} target="_blank" rel="noopener noreferrer">
                  Official site
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </div>
            )}
            <dl className={sidebar.facts}>
              <div>
                <dt>Category</dt>
                <dd>
                  <CategoryBadge value={tool.category} />
                </dd>
              </div>
              <div>
                <dt>Platforms</dt>
                <dd>{tool.platforms.map(label).join(', ')}</dd>
              </div>
            </dl>
            {tool.tags.length > 0 && (
              <div>
                <h3 className={sidebar.subheading}>Tags</h3>
                <TagList tags={tool.tags} />
              </div>
            )}
          </section>
          <TableOfContents contentRef={contentRef} routePath={routePath} deps={body === null ? null : tool.slug} />
        </aside>
        <article className={styles.article} ref={contentRef}>
          {body === null ? (
            <p className={styles.loading} aria-busy="true">Loading...</p>
          ) : (
            <Markdown markdown={body} sourcePath={tool.sourcePath} routePath={routePath} />
          )}
        </article>
      </div>
    </div>
  );
}
