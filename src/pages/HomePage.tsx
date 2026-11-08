import { Link } from 'react-router';
import logo from '../assets/logo-352.png';
import { ChallengeCard } from '../components/ChallengeCard';
import cardStyles from '../components/Card.module.css';
import { challenges, platforms, tools } from '../lib/content/load';
import { plural } from '../lib/format';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { siteConfig } from '../site.config';
import styles from './HomePage.module.css';

export function HomePage() {
  useDocumentTitle();
  const recent = challenges.slice(0, siteConfig.recentWriteupCount);

  return (
    <div className="container page">
      <section className={styles.hero} aria-labelledby="home-title">
        <img src={logo} alt="BGSU CTF Club logo: an orange eagle head inside a circle, holding a small shield" width={176} height={176} className={styles.logo} />
        <div className={styles.intro}>
          <h1 id="home-title" className={styles.title}>
            {siteConfig.clubName}
          </h1>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
          <nav aria-label="Sections" className={styles.links}>
            <Link to="/challenges" className="button">
              Browse challenges
            </Link>
            <Link to="/tools" className="button button-secondary">
              Tool guides
            </Link>
            <Link to="/about" className="button button-secondary">
              About the club
            </Link>
          </nav>
          <p className={styles.counts}>
            {plural(challenges.length, 'write-up')} and {plural(tools.length, 'tool guide')} so far.
          </p>
        </div>
      </section>

      {platforms.length > 0 && (
        <section aria-labelledby="platforms-heading" className={styles.quick}>
          <div className={styles.recentHeader}>
            <h2 id="platforms-heading" className={styles.quickTitle}>
              Practice platforms
            </h2>
            <Link to="/platforms">All platforms</Link>
          </div>
          <ul className={styles.quickList}>
            {platforms.map((p) => (
              <li key={p.name}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className={styles.quickLink}>
                  {p.name}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="recent-heading" className={styles.recent}>
        <div className={styles.recentHeader}>
          <h2 id="recent-heading" className={styles.sectionTitle}>
            Recent write-ups
          </h2>
          <Link to="/challenges">All challenges</Link>
        </div>
        {recent.length ? (
          <ul className={cardStyles.grid}>
            {recent.map((c) => (
              <li key={c.slug}>
                <ChallengeCard challenge={c} headingLevel={3} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.counts}>No write-ups yet.</p>
        )}
      </section>
    </div>
  );
}
