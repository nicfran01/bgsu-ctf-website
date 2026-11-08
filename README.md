# BGSU CTF Club Website

The club's site for challenge write-ups, challenge files, tool guides, practice platforms, meeting handouts and slides, and club links. Every page comes from files in the `content/` folder. A write-up or tool guide is a folder with a markdown file. A platform or link is an entry in a JSON file, and a handout or slide deck is a file uploaded to a folder. Each change goes through a pull request, and you never need to touch the code in `src/`.

## Quick start

You need [Node.js](https://nodejs.org/) 22.12 or newer (the repo's `.nvmrc` pins 24) and git.

```bash
git clone https://github.com/OWNER/REPO.git
cd REPO
npm install
npm run dev
```

Open the address `npm run dev` prints (usually http://localhost:5173). The page reloads when you save a file.

## Add a challenge write-up

### 1. Create the folder

Pick a short folder name made of lowercase letters, numbers, and hyphens. The folder name becomes the page address, so `cookie-monster` ends up at `/#/challenges/cookie-monster`.

```bash
npm run new:challenge -- cookie-monster
```

That creates:

```text
content/challenges/cookie-monster/
  writeup.md      the write-up, with frontmatter and every required heading
  images/         screenshots and diagrams used in the write-up
  files/          challenge files, source, Dockerfiles, solve scripts
```

### 2. Fill in the frontmatter

The block between the two `---` lines at the top of `writeup.md` describes the challenge.

| Field | Required | What to put |
| --- | --- | --- |
| `title` | yes | Challenge name as the event listed it |
| `category` | yes | One of `web`, `crypto`, `forensics`, `network`, `pwn`, `reverse`, `osint`, `misc` |
| `difficulty` | yes | `easy`, `medium`, or `hard` |
| `date` | yes | `YYYY-MM-DD`. The home page shows the newest write-ups first |
| `author` | yes | Your name, as you want it shown |
| `summary` | yes | 1 or 2 sentences for the challenge card |
| `ctf` | no | Event or source name |
| `points` | no | A number, such as `100` |
| `tags` | no | A list, such as `[sqli, cookies]` |
| `challengeUrl` | no | Full link to a live challenge or the original CTF page |

If a field is missing or has a value the site does not allow, the build stops and names the file and the field.

### 3. Write the sections

Every write-up has these `##` headings, in this order. The template already contains them.

1. **Overview**: what the challenge is and what it teaches, 2 to 4 sentences
2. **Challenge Description**: the original prompt as a quote (start lines with `>`), plus provided files or URLs
3. **Recon**: what you looked at first and what you found
4. **Walkthrough**: numbered steps, each with a `###` heading, the command you ran, its output, and a screenshot when it helps
5. **Solution**: the final exploit or solve script in a code block
6. **Flag**
7. **Takeaways**: what to remember, and how the bug would be fixed in real code
8. **References** (optional): links you used

Do not add a `#` title at the top. The page title comes from the frontmatter. Use `###` for anything under a section.

Put commands and their output in fenced code blocks with a language, such as `bash`, `console`, `python`, or `text`. The site adds syntax colors and a copy button.

### 4. Add images and files

- Put images in `images/` and link them with a relative path and a description of what the image shows: `![Burp request with the session cookie selected](./images/burp-cookie.png)`. A missing image or empty description stops the build.
- Put anything a reader should download in `files/`. Once that folder has a file in it, the challenge page shows a **Download files** button that opens the folder on GitHub. Files are never copied into the website itself.
- To link one file from the text, use a relative link: `[solve.py](./files/solve.py)`.

### 5. Check it and open a pull request

```bash
npm run lint:content
npm run dev
```

Fix every error the linter prints, look at the page in your browser, then commit and open a pull request. The same check runs on the pull request, and an officer merges it once the check passes.

## Add a tool guide

```bash
npm run new:tool -- nmap
```

This creates `content/tools/nmap/index.md` and an `images/` folder. Frontmatter fields:

| Field | Required | What to put |
| --- | --- | --- |
| `name` | yes | Tool name |
| `category` | yes | One of `recon`, `web`, `crypto`, `forensics`, `network`, `reverse`, `pwn`, `password`, `wireless`, `active-directory`, `general` |
| `summary` | yes | One sentence for the tool card |
| `platforms` | yes | Any of `linux`, `macos`, `windows`, `web`, as a list |
| `officialUrl` | no | The tool's home page |
| `caution` | no | 1 or 2 plain sentences shown in a box above the guide |
| `tags` | no | A list of words |

Sections, in order: **What It Is**, **When To Use It**, **Installation** (with `###` subsections for Linux, macOS, and Windows as they apply), **Basic Usage** (real commands with their output), **Common Pitfalls**, **References**. The linter warns when one is missing. `content/tools/curl/index.md` is a complete example.

### Add a caution note

Some tools can break the law or university policy when they are pointed at the wrong target: network scanners, password crackers, wireless tools, and Active Directory tools. For those, add a `caution` line to the frontmatter:

```yaml
caution: "Only run this against networks you own or have written permission to test."
```

The tool page shows it in a box above the guide, and the tool card on the Tools page gets a **Caution** marker. Keep it to one or two plain sentences that say what is allowed. The linter checks it like the rest of the frontmatter.

## Add a platform

Practice sites and courses live in `content/platforms.json`. Each entry becomes a card on the Platforms page and a link in the row on the Home page. To add one, copy an entry, paste it at the end of the list, and change the values:

```json
  {
    "name": "Example CTF",
    "url": "https://example.com/",
    "summary": "One sentence that says what members can practice there.",
    "category": "practice",
    "focus": ["web", "crypto"],
    "cost": "free",
    "tags": ["beginner"]
  }
```

| Field | Required | What to put |
| --- | --- | --- |
| `name` | yes | The platform's name as it writes it |
| `url` | yes | The official site, starting with `https://` |
| `summary` | yes | One sentence for the card |
| `category` | yes | One of `learning`, `practice`, `events` |
| `focus` | yes | A list from `web`, `crypto`, `pwn`, `reverse`, `forensics`, `osint`, `network`, `active-directory`, `general` |
| `cost` | no | `free`, `freemium` (free with a paid tier), or `paid`. Leave it out unless the platform's site says so |
| `tags` | no | A list of words that help search |

JSON is strict about punctuation. Put a comma between entries but not after the last one, and wrap every text value in double quotes. If you get it wrong, the build names the line, for example:

```text
content/platforms.json
  41:1     error    content/json
           -> the file is not valid JSON at line 41, column 4: there is a comma after the last item
```

Cards appear in the order of the file, so put the most useful platforms first.

## Add a link

Club links live in `content/links.json`. Each entry shows in the row of links in the footer, in file order. The description is the hover text, and an Instagram URL gets an Instagram icon.

```json
  {
    "name": "Instagram",
    "url": "https://www.instagram.com/bgsu_ctf/",
    "description": "The club's Instagram account, @bgsu_ctf."
  }
```

All three fields are required, and `url` must start with `https://` or `http://`. The same comma rules apply as in `platforms.json`.

## Add handouts and slides

The Resources page has two buttons that open these folders on GitHub:

- `content/resources/handouts/` for handouts such as cheat sheets and worksheets
- `content/resources/slides/` for slide decks

Upload the file to the right folder (on GitHub: **Add file > Upload files**) and open a pull request. Start the file name with the meeting date, such as `2026-11-05-intro-to-steganography.pdf`, and prefer PDF so it opens in the browser. The site never copies these files, so nothing else needs to change. The `README.md` in each folder has the details.

## Writing rules

Write the way you would explain the solve to a teammate: plainly, with the actual commands and output. The linter enforces the rules, and `CLAUDE.md` lists all of them. In short:

- No em dashes or en dashes. Use a period, comma, colon, or parentheses. Use a hyphen in compound words and "to" for ranges.
- A list of banned words and phrases fails the build. The full list, with a suggested replacement for each, is in `scripts/writing-rules.ts`.
- Say what happened ("the server returns a 500"), and show the command instead of describing it.
- Use the same name for the same thing throughout. If it is "the binary" in Recon, it is "the binary" in Takeaways.

The linter skips code blocks, inline code, link addresses, and the quoted prompt under **Challenge Description**, since those are copied text.

A few words have a literal meaning the linter cannot tell apart from the banned use (currently `navigate` and `landscape`). If the literal meaning is what you want, keep the word and add a comment on the same line or the line above:

```markdown
<!-- writing-allow: navigate -->
Navigate the file tree in Ghidra's left panel until you reach `main`.
```

Reviewers see the comment in the pull request. Dashes cannot be allowed this way.

## Run the linter

```bash
npm run lint:content
```

Each problem prints with its file, line, and column, the text it matched, and a suggested fix:

```text
content/challenges/cookie-monster/writeup.md
  42:17    error    banned-word "leverage"
           -> "use"
```

- **Errors** fail the command, the build, and the pull request check. They cover dashes, banned words, frontmatter, the JSON files, required headings, and images.
- **Warnings** print but do not fail. They point at patterns that read as filler, such as three sentences in a row starting with the same word, or a leftover `TODO`.

`npm test` runs the tests for the content checks and the linter.

## Preview

| Command | What it does |
| --- | --- |
| `npm run dev` | Local site with live reload |
| `npm run build` | Linter, type check, then a production build in `dist/` |
| `npm run preview` | Serves the `dist/` build |

To check a build the way GitHub Pages serves it (under `/<repo>/`):

```bash
VITE_BASE=/REPO/ npm run build
VITE_BASE=/REPO/ npm run preview
```

## Deploy

The same code deploys to GitHub Pages and to Vercel. Pages are addressed with `#/` (for example `/#/challenges/cookie-monster`), so neither host needs redirect rules.

### First, point the site at this repository

Edit `src/site.config.ts` and replace `OWNER` and `REPO` with the GitHub account and repository name. Set `branch` if your default branch is not `main`. The Download buttons and file links use these values.

### GitHub Pages (one-time setup)

1. Push the repository to GitHub.
2. Go to **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`. The **Deploy to GitHub Pages** workflow builds the site and publishes it to `https://<owner>.github.io/<repo>/`.

The workflow builds with the base path `/<repo>/`. If the site uses a custom domain, or the repository is named `<owner>.github.io`, go to **Settings > Secrets and variables > Actions > Variables** and add a variable named `VITE_BASE` with the value `/`.

### Vercel (one-time setup)

1. In Vercel, choose **Add New > Project** and import the GitHub repository.
2. Vercel detects Vite. Keep the build command `npm run build` and the output directory `dist`. Do not set `VITE_BASE`; the default `/` is correct.
3. Deploy. Every push to `main` deploys again, and pull requests get preview links.

### Block merges until the check passes

The **Check content** workflow runs on every pull request, but GitHub only blocks a merge if you tell it to:

1. Go to **Settings > Branches** (or **Rules > Rulesets**) and add a rule for `main`.
2. Turn on **Require a pull request before merging** and **Require status checks to pass**.
3. Add **Writing and content check** as a required check. It appears in the list after the workflow has run once.

## Change allowed values

Categories, difficulties, tool categories, operating systems, platform categories, platform focus values, platform costs, and the required headings are in `src/content.config.ts`. To add a category, add it to the list there. The site, the build checks, the linter, and the templates all read from that file.

## Project layout

```text
content/             all site content
  challenges/        one folder per write-up
  tools/             one folder per tool guide
  platforms.json     practice platforms
  links.json         club links
  resources/         handouts/ and slides/ folders linked from the Resources page
  about.md           About page
scripts/             linter, scaffold scripts, Vite content plugin, tests
  writing-rules.ts   banned words and warning patterns (edit this to change the rules)
src/
  site.config.ts     club name, tagline, GitHub owner, repo, and branch
  content.config.ts  allowed categories and required headings
  components/        page building blocks
  pages/             one file per page
  lib/               content loading, search, and helpers
  styles/            colors, fonts, and base styles
public/              logo and icons, copied as-is
.github/workflows/   deploy and pull request checks
```
