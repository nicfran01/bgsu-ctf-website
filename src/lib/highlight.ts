// Languages available for syntax highlighting in fenced code blocks.
// Add a language here (from highlight.js/lib/languages) if a write-up needs it.
import type { Element, Root } from 'hast';
import { toText } from 'hast-util-to-text';
import { createLowlight } from 'lowlight';
import { visit } from 'unist-util-visit';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import http from 'highlight.js/lib/languages/http';
import ini from 'highlight.js/lib/languages/ini';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import php from 'highlight.js/lib/languages/php';
import plaintext from 'highlight.js/lib/languages/plaintext';
import powershell from 'highlight.js/lib/languages/powershell';
import python from 'highlight.js/lib/languages/python';
import shell from 'highlight.js/lib/languages/shell';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import x86asm from 'highlight.js/lib/languages/x86asm';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

export const highlightLanguages = {
  bash,
  c,
  cpp,
  css,
  dockerfile,
  http,
  ini,
  javascript,
  json,
  php,
  plaintext,
  powershell,
  python,
  shell,
  sql,
  typescript,
  x86asm,
  xml,
  yaml,
};

// A small rehype plugin in place of rehype-highlight, which always bundles
// lowlight's 37 "common" grammars even when you pass your own list.

const lowlight = createLowlight(highlightLanguages);

export function rehypeHighlightCode() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, _index, parent) => {
      if (node.tagName !== 'code' || parent?.type !== 'element' || parent.tagName !== 'pre') return;
      const classes = Array.isArray(node.properties.className) ? node.properties.className.map(String) : [];
      node.properties.className = classes.includes('hljs') ? classes : [...classes, 'hljs'];
      const language = classes.find((c) => c.startsWith('language-'))?.slice('language-'.length);
      if (!language || !lowlight.registered(language)) return;
      const result = lowlight.highlight(language, toText(node, { whitespace: 'pre' }));
      node.children = result.children as Element['children'];
    });
  };
}
