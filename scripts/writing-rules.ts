// Every list the writing linter uses lives in this file. Edit it to change
// what `npm run lint:content` reports. scripts/check-writing.ts does the
// matching; nothing else needs to change.
//
// This file is not linted itself, since it has to spell out the banned words.

export interface BannedTerm {
  /** Shown in the report. */
  label: string;
  /**
   * Regular expression source, matched case-insensitively. The linter adds
   * letter boundaries on both sides, so "vital" does not match "vitals".
   * Write curly and straight apostrophes as ['’].
   */
  pattern: string;
  /** Suggested fix shown next to the match. */
  fix: string;
  /**
   * True when the word has a literal meaning the linter cannot tell apart.
   * An author may then keep it by adding <!-- writing-allow: <label> --> on
   * the same line or the line above.
   */
  allowable?: boolean;
}

// ---------------------------------------------------------------------------
// ERRORS: these fail the build.

/** Characters that must never appear. They cannot be allowed with a comment. */
export const BANNED_CHARACTERS = [
  { char: '—', label: 'em dash', fix: 'use a period, comma, colon, or parentheses' },
  { char: '–', label: 'en dash', fix: 'use a hyphen in compound words, or "to" for ranges (5 to 10)' },
] as const;

export const BANNED_TERMS: BannedTerm[] = [
  // Words
  { label: 'delve', pattern: 'delv(?:e|es|ed|ing)', fix: 'say what you did: "read", "looked at", "traced"' },
  { label: 'tapestry', pattern: 'tapestr(?:y|ies)', fix: 'name the actual parts' },
  { label: 'landscape', pattern: 'landscapes?', fix: 'name the actual set of things (for example "the tools available")', allowable: true },
  { label: 'interplay', pattern: 'interplays?', fix: 'say how the two things affect each other' },
  { label: 'intricacies', pattern: 'intricac(?:y|ies)', fix: 'name the specific details' },
  { label: 'nuance', pattern: 'nuanc(?:e|es|ed)', fix: 'state the specific difference' },
  { label: 'multifaceted', pattern: 'multi-?faceted', fix: 'list the parts' },
  { label: 'dynamics', pattern: 'dynamics', fix: 'say what changes and why' },
  { label: 'paradigm', pattern: 'paradigms?', fix: 'name the approach' },
  { label: 'foster', pattern: 'foster(?:s|ed|ing)?', fix: '"build", "help", "encourage"' },
  { label: 'garner', pattern: 'garner(?:s|ed|ing)?', fix: '"get", "earn", "collect"' },
  { label: 'underscore', pattern: 'underscor(?:e|es|ed|ing)', fix: 'for the _ character, write `_` in backticks; otherwise say "shows"' },
  { label: 'showcase', pattern: 'showcas(?:e|es|ed|ing)', fix: '"show", "list"' },
  { label: 'navigate', pattern: 'navigat(?:e|es|ed|ing)', fix: '"go to", "open", "browse to"', allowable: true },
  { label: 'unpack', pattern: 'unpack(?:s|ed|ing)?', fix: 'for a packer such as UPX say "decompress" or "remove the packing", or put the command in backticks; otherwise "explain"' },
  { label: 'pivotal', pattern: 'pivotal', fix: 'say what depends on it' },
  { label: 'crucial', pattern: 'crucial(?:ly)?', fix: 'say what breaks without it' },
  { label: 'vital', pattern: 'vital(?:ly)?', fix: 'say what breaks without it' },
  { label: 'vibrant', pattern: 'vibrant', fix: 'describe it specifically, or cut it' },
  { label: 'intricate', pattern: 'intricate(?:ly)?', fix: '"detailed", "long", or describe the steps' },
  { label: 'profound', pattern: 'profound(?:ly)?', fix: 'state the actual effect' },
  { label: 'compelling', pattern: 'compelling(?:ly)?', fix: 'give the reason directly' },
  { label: 'seamless', pattern: 'seamless(?:ly)?', fix: 'say what it does, for example "with no extra steps"' },
  { label: 'robust', pattern: 'robust(?:ly|ness)?', fix: 'say what it handles, for example "handles malformed input"' },
  { label: 'leverage', pattern: 'leverag(?:e|es|ed|ing)', fix: '"use"' },
  { label: 'ultimately', pattern: 'ultimately', fix: 'cut it, or "in the end"' },
  { label: 'notably', pattern: 'notably', fix: 'cut it' },
  { label: 'importantly', pattern: 'importantly', fix: 'cut it and state the fact' },
  { label: 'fundamentally', pattern: 'fundamentally', fix: 'cut it' },
  { label: 'inherently', pattern: 'inherently', fix: 'cut it, or say why' },
  { label: 'arguably', pattern: 'arguably', fix: 'make the claim or drop it' },
  { label: 'nestled', pattern: 'nestled', fix: '"inside", "in"' },
  { label: 'boasts', pattern: 'boast(?:s|ed|ing)', fix: '"has"' },
  { label: 'stunning', pattern: 'stunning(?:ly)?', fix: 'describe it specifically' },
  { label: 'breathtaking', pattern: 'breathtaking(?:ly)?', fix: 'describe it specifically' },
  { label: 'bustling', pattern: 'bustling', fix: '"busy", or cut it' },

  // Phrases
  { label: 'in the realm of', pattern: 'in the realm of', fix: '"in"' },
  { label: "it's worth noting", pattern: "it(?:['’]s| is) worth noting", fix: 'cut it and state the fact' },
  { label: 'dive in', pattern: 'dive in(?:to)?', fix: 'cut it, or "start with"' },
  { label: "let's explore", pattern: "let(?:['’]s| us) explore", fix: 'cut it and start with the content' },
  { label: 'stands as a testament', pattern: 'stand(?:s|ing)? as a testament', fix: 'say what it shows' },
  { label: 'plays a vital role', pattern: 'play(?:s|ed|ing)? an? (?:vital|crucial|pivotal|key) role', fix: 'say what it does' },
  { label: 'cannot be overstated', pattern: "(?:cannot|can['’]t|can not) be overstated", fix: 'state the fact' },
];

// ---------------------------------------------------------------------------
// WARNINGS: printed, but the build still passes.

export const WARNINGS = {
  /** "not X, but Y", "not only X but Y", "it's not about X, it's about Y" */
  negation: [
    { pattern: String.raw`\bnot only\b[^.!?]{1,80}?\bbut\b`, message: '"not only X but Y" construction', fix: 'state the point directly' },
    { pattern: String.raw`\bit(?:['’]s| is) not about\b[^.!?]*?[.,;]\s*it(?:['’]s| is) about\b`, message: '"it\'s not about X, it\'s about Y" construction', fix: 'state the point directly' },
    { pattern: String.raw`\bnot (?!only\b)[a-z]+(?: [a-z]+){0,3},? but\b`, message: '"not X, but Y" construction', fix: 'say what it is' },
  ],
  /** ", highlighting ..." and friends at the end of a clause */
  editorialParticiple: {
    pattern: String.raw`,\s+(?:highlighting|underscoring|reflecting|emphasizing|showcasing|symbolizing|demonstrating|illustrating)\b`,
    fix: 'delete the phrase; the facts before it should stand on their own',
  },
  /** How many sentences in a row may end with a trailing ", [verb]ing ..." phrase before warning. */
  trailingParticipleRun: 3,
  /** Words ending in "ing" that are nouns in technical writing, so they do not count as participles. */
  ingNouns: [
    'string', 'strings', 'thing', 'nothing', 'something', 'anything', 'everything', 'during', 'padding', 'encoding',
    'logging', 'mapping', 'routing', 'setting', 'settings', 'heading', 'warning', 'ping', 'ring', 'king', 'spring',
    'building', 'morning', 'evening', 'meeting', 'meetings', 'listing',
  ],
  /** How many sentences in a row may start with the same word before warning. */
  sameStartRun: 3,
  /** A "short fragment" is a sentence with this many words or fewer. */
  fragmentMaxWords: 3,
  /** How many short fragments in a row before warning. */
  fragmentRun: 3,
  /** Placeholder text left from the scaffold templates. */
  todo: { pattern: String.raw`\bTODO\b`, fix: 'replace the placeholder with real content' },
};
