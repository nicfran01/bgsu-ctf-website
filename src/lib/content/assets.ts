// Image URLs for everything in content/**/images. Vite copies each image into
// the build with a hashed name and prefixes the configured base path, so the
// URLs work locally, on Vercel, and under a GitHub Pages sub-path.

const imageUrls = import.meta.glob<string>('/content/**/images/**/*.{png,jpg,jpeg,gif,svg,webp,avif,PNG,JPG,JPEG,GIF,SVG,WEBP}', {
  query: '?url',
  import: 'default',
  eager: true,
});

/** Keys are repo-relative, for example content/challenges/foo/images/a.png */
export const assetUrls: Record<string, string> = Object.fromEntries(
  Object.entries(imageUrls).map(([key, url]) => [key.replace(/^\//, ''), url]),
);
