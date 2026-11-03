import { useRef } from 'react';
import { Link, useParams } from 'react-router';
import { CategoryBadge, DifficultyBadge } from '../components/Badge';
import { ChallengeMeta } from '../components/ChallengeMeta';
import { Markdown } from '../components/Markdown';
import { PrevNext } from '../components/PrevNext';
import { TableOfContents } from '../components/TableOfContents';
import { challenges } from '../lib/content/load';
import { formatDate } from '../lib/format';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useHashScroll } from '../lib/useHashScroll';
import { NotFoundPage } from './NotFoundPage';
import styles from './DetailPage.module.css';

export function ChallengeDetailPage() {
  const { slug } = useParams();
  const index = challenges.findIndex((c) => c.slug === slug);
  const challenge = challenges[index];
  const contentRef = useRef<HTMLDivElement>(null);
  useDocumentTitle(challenge?.title);
  useHashScroll(challenge?.slug);

  if (!challenge) return <NotFoundPage />;

  // challenges is sorted newest first.
  const newer = challenges[index - 1];
  const older = challenges[index + 1];
  const routePath = `/challenges/${challenge.slug}`;

  return (
    <div className="container page">
      <p className={styles.crumb}>
        <Link to="/challenges">Challenges</Link>
      </p>
      <header className={styles.header}>
        <div className={styles.badges}>
          <CategoryBadge value={challenge.category} />
          <DifficultyBadge value={challenge.difficulty} />
        </div>
        <h1 className="page-title">{challenge.title}</h1>
        <p className={styles.byline}>
          By {challenge.author} on <time dateTime={challenge.date}>{formatDate(challenge.date)}</time>
          {challenge.ctf && <> for {challenge.ctf}</>}
        </p>
        <p className="page-lead">{challenge.summary}</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <ChallengeMeta challenge={challenge} />
          <TableOfContents contentRef={contentRef} routePath={routePath} deps={challenge.slug} />
        </aside>
        <article className={styles.article} ref={contentRef}>
          <Markdown markdown={challenge.body} sourcePath={challenge.sourcePath} routePath={routePath} />
          <PrevNext older={older} newer={newer} />
        </article>
      </div>
    </div>
  );
}
