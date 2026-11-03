import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { assetUrls } from '../lib/content/assets';
import { dirname, isExternal, resolveRelative } from '../lib/content/paths';
import { repoFileUrl } from '../lib/github';
import { rehypeHighlightCode } from '../lib/highlight';
import { CodeBlock } from './CodeBlock';

interface MarkdownProps {
  markdown: string;
  /** Repo-relative path of the markdown file, used to resolve ./images and ./files links. */
  sourcePath: string;
  /** Route of the page showing this markdown, for example /challenges/foo. Used for #section links. */
  routePath: string;
}

const rehypePlugins = [rehypeSlug, rehypeHighlightCode];

export function Markdown({ markdown, sourcePath, routePath }: MarkdownProps) {
  const dir = dirname(sourcePath);

  const components: Components = {
    a({ href = '', children, node: _node, ...props }) {
      if (href.startsWith('#')) {
        // HashRouter owns the URL hash, so section links become #/route#section.
        return <a href={`#${routePath}${href}`} {...props}>{children}</a>;
      }
      if (isExternal(href)) {
        const newTab = /^https?:/i.test(href);
        return (
          <a href={href} {...props} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {children}
          </a>
        );
      }
      if (href.startsWith('/')) {
        // Site routes such as /tools/curl.
        return <a href={`#${href}`} {...props}>{children}</a>;
      }
      // Relative links to files in this folder (./files/solve.py) open on GitHub.
      return (
        <a href={repoFileUrl(resolveRelative(dir, href))} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    },
    img({ src = '', alt = '', node: _node, ...props }) {
      const url = typeof src === 'string' && !isExternal(src) ? assetUrls[resolveRelative(dir, decodeURI(src))] ?? src : src;
      return <img src={url} alt={alt} loading="lazy" {...props} />;
    },
    pre({ node: _node, ...props }) {
      return <CodeBlock {...(props as ComponentPropsWithoutRef<typeof CodeBlock>)} />;
    },
    table({ node: _node, ...props }) {
      return (
        <div className="table-scroll" tabIndex={0}>
          <table {...props} />
        </div>
      );
    },
  };

  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
