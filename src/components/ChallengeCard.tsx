import { Link } from 'react-router';
import type { Challenge } from '../lib/content/types';
import { formatDate } from '../lib/format';
import { CategoryBadge, DifficultyBadge, TagList } from './Badge';
import styles from './Card.module.css';

export function ChallengeCard({ challenge, headingLevel = 2 }: { challenge: Challenge; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className={styles.card}>
      <div className={styles.badges}>
        <CategoryBadge value={challenge.category} />
        <DifficultyBadge value={challenge.difficulty} />
      </div>
      <Heading className={styles.title}>
        <Link to={`/challenges/${challenge.slug}`} className={styles.link}>
          {challenge.title}
        </Link>
      </Heading>
      <p className={styles.meta}>
        <time dateTime={challenge.date}>{formatDate(challenge.date)}</time>
        {challenge.ctf && <span>{challenge.ctf}</span>}
        {challenge.points !== undefined && <span>{challenge.points} pts</span>}
      </p>
      <p className={styles.summary}>{challenge.summary}</p>
      <TagList tags={challenge.tags} />
    </article>
  );
}
