import type { ChallengeSummary } from '../lib/content/types';
import { formatBytes, formatDate } from '../lib/format';
import { challengeFilesUrl, repoFileUrl } from '../lib/github';
import { isRepoConfigured } from '../site.config';
import { CategoryBadge, DifficultyBadge, TagList } from './Badge';
import styles from './Sidebar.module.css';

export function ChallengeMeta({ challenge }: { challenge: ChallengeSummary }) {
  const hasFiles = challenge.files.length > 0;
  const filesDir = `content/challenges/${challenge.slug}/files`;

  return (
    <section aria-labelledby="details-heading" className={styles.panel}>
      <h2 id="details-heading" className={styles.heading}>
        Challenge details
      </h2>

      {(hasFiles || challenge.challengeUrl) && (
        <div className={styles.actions}>
          {hasFiles && (
            <a className="button" href={challengeFilesUrl(challenge.slug)} target="_blank" rel="noopener noreferrer">
              Download files
              <span className="visually-hidden"> (opens GitHub in a new tab)</span>
            </a>
          )}
          {challenge.challengeUrl && (
            <a className="button button-secondary" href={challenge.challengeUrl} target="_blank" rel="noopener noreferrer">
              Open live challenge
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          )}
          {import.meta.env.DEV && hasFiles && !isRepoConfigured() && (
            <p className={styles.devNote}>Dev note: set github.owner and github.repo in src/site.config.ts so this link works.</p>
          )}
        </div>
      )}

      <dl className={styles.facts}>
        <div>
          <dt>Category</dt>
          <dd>
            <CategoryBadge value={challenge.category} />
          </dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd>
            <DifficultyBadge value={challenge.difficulty} />
          </dd>
        </div>
        {challenge.points !== undefined && (
          <div>
            <dt>Points</dt>
            <dd>{challenge.points}</dd>
          </div>
        )}
        {challenge.ctf && (
          <div>
            <dt>Event</dt>
            <dd>{challenge.ctf}</dd>
          </div>
        )}
        <div>
          <dt>Write-up by</dt>
          <dd>{challenge.author}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>
            <time dateTime={challenge.date}>{formatDate(challenge.date)}</time>
          </dd>
        </div>
      </dl>

      {challenge.tags.length > 0 && (
        <div className={styles.block}>
          <h3 className={styles.subheading}>Tags</h3>
          <TagList tags={challenge.tags} />
        </div>
      )}

      {hasFiles && (
        <div className={styles.block}>
          <h3 className={styles.subheading}>Files</h3>
          <ul className={styles.files}>
            {challenge.files.map((f) => (
              <li key={f.path}>
                <a href={repoFileUrl(`${filesDir}/${f.path}`)} target="_blank" rel="noopener noreferrer">
                  {f.path}
                </a>
                <span className={styles.size}>{formatBytes(f.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
