# CLAUDE.md

Rules for working in this repository. Read this before changing anything.

## What this is

A static site for the BGSU CTF club: challenge write-ups, challenge files, and tool guides. React 19 + Vite + strict TypeScript, plain CSS (tokens in `src/styles/tokens.css`, CSS modules per component), HashRouter, deployed to GitHub Pages and Vercel from the same code.

## The most important rule

**Content changes never require code changes.** Adding a challenge, write-up, or tool means adding a folder with a markdown file under `content/`. If a request seems to need a code change to show new content, the content model is wrong; fix the model in one place, never special-case one challenge in code.

Do not invent club facts, dates, names, meeting places, or links. Use a clearly marked `TODO:` placeholder instead.

## Content model

```text
content/
  challenges/<slug>/
    writeup.md      frontmatter + write-up body
    images/         images referenced from the write-up as ./images/<name>
    files/          downloadable files (never bundled; linked on GitHub)
  tools/<slug>/
    index.md        frontmatter + guide body
    images/
  about.md          About page body (frontmatter optional)
```

- The folder name is the slug and the URL. It must match `^[a-z0-9]+(-[a-z0-9]+)*$`. There is no slug field.
- Allowed values (categories, difficulties, tool categories, platforms) and the required headings live only in `src/content.config.ts`.
- Challenge frontmatter: `title`, `category`, `difficulty`, `date` (YYYY-MM-DD), `author`, `summary` are required; `ctf`, `points` (number), `tags` (list), `challengeUrl` (http/https) are optional. Unknown fields are errors.
- Tool frontmatter: `name`, `category`, `summary`, `platforms` (list) are required; `officialUrl`, `tags` are optional.
- Bodies have no `#` heading. The page title comes from frontmatter.
- Images use relative paths into the same folder's `images/` and need alt text. Relative links such as `./files/solve.py` open the file on GitHub.
- The Download button appears only when `files/` has a file other than `.gitkeep`. It links to `https://github.com/<owner>/<repo>/tree/<branch>/content/challenges/<slug>/files`, with owner, repo, and branch from `src/site.config.ts`.

## How content is loaded

- `src/lib/content/load.ts` discovers files with `import.meta.glob(..., { query: '?content' })`. Those modules carry frontmatter only (`ChallengeSummary`, `ToolSummary`), never the markdown body.
- Markdown bodies load on demand through `useMarkdownBody`, which imports each file with the `?body` query. Each write-up becomes its own small chunk, so the main bundle does not grow with the amount of content. Never import bodies eagerly.
- `scripts/vite-content-plugin.ts` answers those imports: it parses frontmatter with `yaml` at build time and validates with `src/lib/content/validate.ts`, so the YAML parser never ships to the browser. It also validates the whole `content/` tree in `buildStart` and fails the build with file and field names.
- `src/lib/content/{types,frontmatter,validate,headings,paths}.ts` are shared by the browser, the Vite plugin, the linter, and the scaffold scripts. Keep them free of DOM, Node, and `import.meta` APIs.
- Pages that render markdown (`ChallengeDetailPage`, `ToolDetailPage`, `AboutPage`) are lazy-loaded so list pages stay small.
- The Tag filter on the Challenges page is a dropdown (`TagDropdown`) so a long tag list stays out of the way. Category and difficulty stay as buttons.
- Routing is HashRouter. In-page section links are `#/<route>#<heading-id>`; `useHashScroll` handles them.

## Standard write-up structure

Every challenge write-up has these level-2 headings in this order. The scaffold template creates them, and the validator fails the build if one is missing, renamed, duplicated, or out of order. Use `###` for subsections.

1. Overview (what the challenge is and what it teaches, 2 to 4 sentences)
2. Challenge Description (the original prompt as a blockquote, plus provided files or URLs)
3. Recon (what we looked at first and what we found)
4. Walkthrough (numbered `###` steps with commands, output, and screenshots)
5. Solution (final exploit or solve script in a code block)
6. Flag
7. Takeaways (what to remember, and how the bug would be fixed in real code)
8. References (optional)

Tool guides use: What It Is, When To Use It, Installation (`###` Linux, macOS, Windows as applicable), Basic Usage (real example commands), Common Pitfalls, References. Missing tool headings are warnings, not errors.

## Writing rules (strict)

These apply to every word in the UI, the About page, the README, templates, example content, code comments, and every write-up. Write plainly, like a competent student explaining what they did to a teammate.

Hard rules (errors, enforced by `npm run lint:content`):

- Never use em dashes or en dashes as punctuation. Use a period, comma, colon, or parentheses. Hyphens for compound words, "to" for ranges.
- Do not use: delve, tapestry, landscape (figurative), interplay, intricacies, nuance/nuanced, multifaceted, dynamics, paradigm, foster, garner, underscore, showcase, navigate (figurative), unpack, pivotal, crucial, vital, vibrant, intricate, profound, compelling, seamless, robust, leverage, "in the realm of", "it's worth noting", "dive in", "let's explore", "ultimately", "notably", "importantly", "fundamentally", "inherently", "arguably", "stands as a testament", "plays a vital role", "cannot be overstated", "nestled", "boasts", "stunning", "breathtaking", "bustling".
- "Highlight", "emphasize", "reflect", and "framework" are banned only as narrator editorializing or figurative language. Literal use is fine.

Construction rules:

- No "not X, but Y", "not only X but Y", or "it's not about X, it's about Y". State the point directly.
- No trailing participle phrases that editorialize (", highlighting how...", ", underscoring the importance of...").
- No three-item fragment lists for effect ("Fast. Simple. Powerful.").
- No echo sentences that restate the previous sentence in parallel form.
- No "from X to Y" unless X and Y sit on a real measurable scale.
- No motivational one-liners, aphorisms, or sentences that exist to sound profound.
- No filler transitions or announcements ("Now let's look at", "This is where it gets interesting").
- Do not open sentences with "And" or "But" for rhythm.
- No elegant variation. Use the same term for the same thing every time.
- No vague placeholders. Say what happened ("the server returns a 500").
- No promotional or marketing tone.

One stray instance is not the problem; density and repetition are. Vary sentence length and structure, prefer specific facts, and show the command, output, or reasoning instead of describing it.

## Writing linter

- `scripts/check-writing.ts` runs in `npm run build`, `npm run lint:content`, and the "Check content" pull request workflow.
- All word lists, fixes, and warning thresholds are in `scripts/writing-rules.ts`. Matching logic is in `scripts/lib/writing-lint.ts`.
- Scope: every `.md` under `content/` (frontmatter values included), `README.md`, and strings, JSX text, and comments in `src/**/*.{ts,tsx}`. Dashes are checked on every line of `src`. This file (CLAUDE.md) and `writing-rules.ts` are not linted because they have to name the banned words.
- Skipped: fenced code, inline code, link and image URLs, HTML comments, and blockquote lines inside the Challenge Description section of a write-up (the verbatim prompt).
- Escape hatch: words marked `allowable` in `writing-rules.ts` (currently `navigate` and `landscape`) may be kept with `<!-- writing-allow: navigate -->` on the same line or the line above. Dashes can never be allowed. Do not add words to the allowable list without asking the maintainer.
- Warnings (printed, never failing): "not X, but Y" patterns, editorializing participles, three trailing-participle sentences in a row, three or more sentences starting with the same word, runs of short fragments, missing tool headings, leftover `TODO`.

## Commands

| Command | Use |
| --- | --- |
| `npm run dev` | Dev server with live reload and content error overlay |
| `npm run build` | Linter, `tsc -b`, `vite build` |
| `npm run lint:content` | Writing linter plus frontmatter, heading, and image checks |
| `npm test` | `node:test` suites in `scripts/test/` (validator and linter) |
| `npm run new:challenge -- <slug>` | Scaffold a challenge folder |
| `npm run new:tool -- <slug>` | Scaffold a tool folder |
| `VITE_BASE=/<repo>/ npm run build` | Build as GitHub Pages serves it |

Before finishing any change: run `npm test` and `npm run build`, and look at the affected page in a browser.

## Conventions

- TypeScript is strict with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. TypeScript is pinned to 6.0 because the linter uses the classic compiler API (`ts.createSourceFile`), which TypeScript 7 does not provide.
- Colors come only from `src/styles/tokens.css`, sampled from `BGSU_CTF_Logo_1.png`. Keep orange for buttons, links, active states, and category badges. No background gradients, glassmorphism, particle effects, or terminal gimmicks. Text must meet WCAG AA (the token file lists ratios).
- Dark theme only: the logo has its navy background baked in.
- Syntax highlighting uses lowlight with the language list in `src/lib/highlight.ts`. Add a language there when a write-up needs one. Do not switch back to `rehype-highlight`; it bundles 37 extra grammars.
- Keep dependencies few and mainstream. Ask before adding one.
- Favicons and resized logos in `public/` and `src/assets/` were generated from the original logo with ImageMagick and are committed.
