---
name: Sherlock
category: recon
summary: Checks a username against hundreds of websites at once to find every account that uses it.
platforms: [linux, macos, windows]
officialUrl: https://github.com/sherlock-project/sherlock
tags: [osint, usernames, social-media]
---

## What It Is

Sherlock is a command-line tool that takes a username and checks whether an account with that name exists on several hundred sites: social networks, forums, code hosts, gaming platforms, and more. It prints the profile URL for every match. People often reuse one handle everywhere, so a single username from a screenshot or a forum post can lead to a whole set of accounts.

## When To Use It

- An OSINT challenge gives you a username (from a screenshot, a kill feed, a commit, an email address) and asks you to find the person's other accounts.
- Pivoting: one account's bio mentions another handle, and you want to check it everywhere.
- Checking which of your own usernames are exposed across sites.

**WhatsMyName** (https://whatsmyname.app/) does the same job in the browser with no install, and is a good second opinion because the two tools check different site lists.

## Installation

Sherlock needs Python 3.9 or newer.

### Linux

```bash
pipx install sherlock-project
```

If you do not have pipx: `sudo apt install pipx && pipx ensurepath`, then open a new terminal. Kali, Debian 13, and Ubuntu also package it (`sudo apt install sherlock`), and Fedora has `sudo dnf install sherlock-project`.

### macOS

```bash
brew install sherlock
```

Or use `pipx install sherlock-project` as on Linux.

### Windows

Install Python from python.org, then:

```powershell
python -m pip install --user pipx
python -m pipx ensurepath
pipx install sherlock-project
```

### Docker

```bash
docker run -it --rm sherlock/sherlock user123
```

## Basic Usage

Search one or more usernames:

```bash
sherlock LemonBurglarer
sherlock user1 user2 user3
```

Each found account prints as a line with `[+]`, the site name, and the profile URL.

Useful options:

| Option | What it does |
| --- | --- |
| `--site Instagram --site Twitter` | Check only the listed sites |
| `--timeout 10` | Give up on slow sites after 10 seconds (default 60) |
| `--print-all` | Also list sites where the name was not found |
| `--txt` | Save results to `<username>.txt` |
| `--csv` | Save results as a CSV file |
| `--browse` | Open every found profile in your browser |

## Common Pitfalls

- **False positives.** Some sites return a normal page for every username, so Sherlock reports a match that is not real. Open each result and check that the profile exists and fits.
- **False negatives.** Sites change their pages and block automated checks, and some (Instagram among them) often need a logged-in browser to show a profile. Missing from the results does not prove an account does not exist. Check the important sites by hand.
- **Same name, different person.** A common username belongs to many people. Look for details that connect accounts: the same profile picture, bio, links, or posting times.
- **Ethics.** Use username searches on challenge accounts and on yourself. Collecting information about real private people without a reason can cause real harm.

## References

- [Sherlock on GitHub](https://github.com/sherlock-project/sherlock)
- [Sherlock on PyPI](https://pypi.org/project/sherlock-project/)
- [WhatsMyName](https://whatsmyname.app/)
