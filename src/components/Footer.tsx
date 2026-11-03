import { isRepoConfigured, repoUrl, siteConfig } from '../site.config';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>{siteConfig.clubName}</p>
        {isRepoConfigured() && (
          <p>
            <a href={repoUrl()} target="_blank" rel="noopener noreferrer">
              Source and content on GitHub
            </a>
          </p>
        )}
      </div>
    </footer>
  );
}
