import { Link } from 'react-router';
import { label } from '../content.config';
import type { ToolSummary } from '../lib/content/types';
import { CautionBadge, CategoryBadge, TagList } from './Badge';
import styles from './Card.module.css';

export function ToolCard({ tool }: { tool: ToolSummary }) {
  return (
    <article className={styles.card}>
      <div className={styles.badges}>
        <CategoryBadge value={tool.category} />
        {tool.caution && <CautionBadge />}
      </div>
      <h2 className={styles.title}>
        <Link to={`/tools/${tool.slug}`} className={styles.link}>
          {tool.name}
        </Link>
      </h2>
      <p className={styles.meta}>{tool.platforms.map(label).join(', ')}</p>
      <p className={styles.summary}>{tool.summary}</p>
      <TagList tags={tool.tags} />
    </article>
  );
}
