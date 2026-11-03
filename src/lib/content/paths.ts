// Path helpers for repo-relative paths with forward slashes. Shared by the
// validator (Node) and the markdown renderer (browser).

/** Joins a relative path onto a directory, resolving "." and "..". */
export function resolveRelative(dir: string, relative: string): string {
  const parts = dir.split('/').filter(Boolean);
  for (const segment of relative.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') parts.pop();
    else parts.push(segment);
  }
  return parts.join('/');
}

export function dirname(path: string): string {
  return path.slice(0, path.lastIndexOf('/'));
}

/** True for links with a scheme (https:, mailto:) or protocol-relative links. */
export function isExternal(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//');
}
