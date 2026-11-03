// Site-wide settings. Edit the values below; nothing else in src needs to change.

export const siteConfig = {
  clubName: 'BGSU CTF Club',
  // Shown under the club name on the home page.
  tagline: 'Write-ups, challenge files, and tool guides from the BGSU capture the flag club.',

  // Where this repository lives on GitHub. The Download button on a challenge
  // page links to https://github.com/<owner>/<repo>/tree/<branch>/content/challenges/<slug>/files
  github: {
    owner: 'nicfran01',
    repo: 'bgsu-ctf-website',
    branch: 'main',
  },

  // How many write-ups the home page lists under "Recent write-ups" (3 to 6 reads well).
  recentWriteupCount: 6,
} as const;

export function repoUrl(): string {
  const { owner, repo } = siteConfig.github;
  return `https://github.com/${owner}/${repo}`;
}

export function isRepoConfigured(): boolean {
  const { owner, repo }: { owner: string; repo: string } = siteConfig.github;
  return owner !== 'OWNER' && repo !== 'REPO';
}
