// Templates used by `npm run new:challenge` and `npm run new:tool`.
// The headings come from src/content.config.ts so the templates always match
// what the validator expects.

import {
  CHALLENGE_CATEGORIES,
  DIFFICULTIES,
  PLATFORMS,
  TOOL_CATEGORIES,
  TOOL_HEADINGS,
  WRITEUP_HEADINGS,
} from '../../src/content.config.ts';

const WRITEUP_PROMPTS: Record<string, string> = {
  Overview: 'TODO: 2 to 4 sentences. What the challenge is, and what it teaches.',
  'Challenge Description':
    'TODO: paste the original prompt as a quote (start each line with ">"), then list any provided files or URLs.\n\n> TODO: original challenge prompt',
  Recon: 'TODO: what you looked at first and what you found. Show commands and their output in code blocks.',
  Walkthrough:
    'TODO: numbered steps. Each step gets a "###" heading, the command you ran, the output, and a screenshot if it helps.\n\n### 1. TODO: first step',
  Solution: 'TODO: the final exploit or solve script.\n\n```python\n# TODO: solve script\n```',
  Flag: '```text\nTODO: flag\n```',
  Takeaways: 'TODO: what to remember, and how the bug would be fixed in real code.',
  References: 'TODO: links you used. Delete this section if there are none.',
};

const TOOL_PROMPTS: Record<string, string> = {
  'What It Is': 'TODO: one short paragraph. What the tool does, in plain terms.',
  'When To Use It': 'TODO: a short list of situations where this tool is the right choice.',
  Installation: '### Linux\n\nTODO: install commands.\n\n### macOS\n\nTODO: install commands.\n\n### Windows\n\nTODO: install commands, or delete this subsection if the tool does not run on Windows.',
  'Basic Usage': 'TODO: real example commands with their output.',
  'Common Pitfalls': 'TODO: mistakes people make with this tool and how to avoid them.',
  References: 'TODO: official docs and any guides you used.',
};

/** Local date as YYYY-MM-DD. */
export function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function challengeTemplate(date = today()): string {
  const body = WRITEUP_HEADINGS.map((h) => `## ${h.text}\n\n${WRITEUP_PROMPTS[h.text] ?? 'TODO'}\n`).join('\n');
  return `---
title: "TODO: Challenge title"
category: ${CHALLENGE_CATEGORIES[0]} # one of: ${CHALLENGE_CATEGORIES.join(', ')}
difficulty: ${DIFFICULTIES[0]} # one of: ${DIFFICULTIES.join(', ')}
date: ${date} # YYYY-MM-DD, the date you solved it or the event date
ctf: "TODO: event or source name (delete this line if there is none)"
# points: 100
author: "TODO: your name"
tags: [] # for example [sqli, cookies]
summary: "TODO: one or two sentences shown on the challenge card."
# challengeUrl: https://example.com/challenge
---

${body}`;
}

export function toolTemplate(): string {
  const body = TOOL_HEADINGS.map((h) => `## ${h.text}\n\n${TOOL_PROMPTS[h.text] ?? 'TODO'}\n`).join('\n');
  return `---
name: "TODO: Tool name"
category: ${TOOL_CATEGORIES[TOOL_CATEGORIES.length - 1]} # one of: ${TOOL_CATEGORIES.join(', ')}
summary: "TODO: one sentence shown on the tool card."
platforms: [${PLATFORMS.slice(0, 3).join(', ')}] # any of: ${PLATFORMS.join(', ')}
# officialUrl: https://example.com
# caution: "Only use this against targets you own or have permission to test."
#   Shown in a box above the guide. Use it when misusing the tool could break a law or university policy.
tags: []
---

${body}`;
}
