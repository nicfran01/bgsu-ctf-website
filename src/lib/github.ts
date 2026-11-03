import { siteConfig } from '../site.config';

function base(kind: 'tree' | 'blob'): string {
  const { owner, repo, branch } = siteConfig.github;
  return `https://github.com/${owner}/${repo}/${kind}/${branch}`;
}

const encodePath = (path: string) => path.split('/').map(encodeURIComponent).join('/');

/** The challenge's files/ folder on GitHub. */
export function challengeFilesUrl(slug: string): string {
  return `${base('tree')}/content/challenges/${encodeURIComponent(slug)}/files`;
}

/** One file in the repository, for example content/challenges/foo/files/solve.py */
export function repoFileUrl(repoPath: string): string {
  return `${base('blob')}/${encodePath(repoPath)}`;
}

