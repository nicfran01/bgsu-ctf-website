import { resourceFolderUrl, type ResourceKind } from '../lib/github';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import styles from './ResourcesPage.module.css';

const RESOURCES: { kind: ResourceKind; label: string; description: string }[] = [
  {
    kind: 'handouts',
    label: 'Handouts',
    description: 'Cheat sheets and worksheets handed out at club meetings.',
  },
  {
    kind: 'slides',
    label: 'Slides',
    description: 'Slide decks from club meetings and workshops.',
  },
];

export function ResourcesPage() {
  useDocumentTitle('Resources');
  return (
    <div className="container page">
      <h1 className="page-title">Resources</h1>
      <p className="page-lead">Meeting files are kept on GitHub. Each button opens the folder in a new tab.</p>

      <ul className={styles.grid}>
        {RESOURCES.map((r) => (
          <li key={r.kind} className={styles.item}>
            <a className={`button ${styles.big}`} href={resourceFolderUrl(r.kind)} target="_blank" rel="noopener noreferrer">
              {r.label}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            <p className={styles.description}>{r.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
