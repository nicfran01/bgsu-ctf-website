---
name: John the Ripper
category: password
summary: Cracks password hashes and recovers passwords from protected files such as ZIP and PDF archives, using wordlists and rules.
platforms: [linux, macos, windows]
officialUrl: https://www.openwall.com/john/
caution: "Crack only hashes and files from a challenge you are solving, or ones you created yourself to practice. Do not run it against passwords, hashes, or files that belong to other people or to BGSU accounts and systems."
tags: [password, cracking, hashes, wordlist, zip2john]
---

## What It Is

John the Ripper takes a password hash and tries to find the password that produces it. It guesses candidates from a wordlist, optionally mangles them with rules (adding digits, swapping letters), hashes each one, and stops when a guess matches. The jumbo build also ships a set of `*2john` helpers that pull a crackable hash out of a protected file, so you can recover the password on an encrypted ZIP, RAR, PDF, or SSH key. Most clubs use the community jumbo build, which supports far more formats than the core version.

## When To Use It

- A challenge gives you a hash (for example from `/etc/shadow`, a database dump, or a `.htpasswd` file) and you need the password.
- You have a password-protected ZIP, RAR, PDF, or SSH private key and need the passphrase.
- You want a tool that detects the hash format for you and picks a sensible attack.

For raw GPU speed on large hash lists, [hashcat](/tools/hashcat) is usually faster. John is strong on file formats and when you want it to pick the format automatically.

## Installation

Install the jumbo build. The core packages in some repositories are missing the `*2john` helpers.

### Linux

Kali ships `john` jumbo. On Debian and Ubuntu:

```bash
sudo apt update && sudo apt install john
```

For the newest formats, build jumbo from source:

```bash
git clone https://github.com/openwall/john
cd john/src && ./configure && make -s
```

The `run/` folder then holds `john` and the `*2john` scripts.

### macOS

```bash
brew install john-jumbo
```

### Windows

Download the Windows jumbo build from [openwall.com/john](https://www.openwall.com/john/). Unzip it and run `john.exe` from the `run` folder in a terminal. WSL with the Linux steps also works well.

## Basic Usage

Crack a hash file with a wordlist. Put each hash on its own line, then point John at it with a wordlist such as rockyou:

```bash
john --wordlist=rockyou.txt hashes.txt
```

Show the passwords John has already found for a file:

```console
$ john --show hashes.txt
admin:falcons2026

1 password hash cracked, 0 left
```

Tell John the format when autodetection guesses wrong. List the formats it knows with `--list=formats`:

```bash
john --format=raw-md5 --wordlist=rockyou.txt hashes.txt
```

Add rules to mangle each word (append digits, capitalize, and so on):

```bash
john --wordlist=rockyou.txt --rules hashes.txt
```

Recover the password on a protected ZIP. First turn the archive into a hash with `zip2john`, then crack that hash:

```bash
zip2john secret.zip > zip.hash
john --wordlist=rockyou.txt zip.hash
john --show zip.hash
```

The same pattern works for other files: `rar2john`, `pdf2john`, `ssh2john`, `office2john`.

## Common Pitfalls

- **Missing `*2john` helpers.** If `zip2john` is not found, you have the core build, not jumbo. Install `john` jumbo or build from source.
- **Where to find rockyou.** On Kali it is at `/usr/share/wordlists/rockyou.txt`, sometimes gzipped as `rockyou.txt.gz`. Run `gunzip` on it once before use.
- **John stops when it finds the password, not when you re-run it.** A second run says "No password hashes left to crack" because the result is cached in `john.pot`. Use `--show` to print it, or delete `~/.john/john.pot` to start over.
- **Autodetection can pick the wrong format.** If cracking fails and the format looks odd, set `--format=` yourself. `--list=formats` shows the choices.
- **One hash per line, no extra text.** Stray labels or blank lines make John skip or misread a hash. Keep the file clean.

## References

- [John the Ripper documentation](https://www.openwall.com/john/doc/)
- [Community jumbo on GitHub](https://github.com/openwall/john)
- [Example hash formats (openwall wiki)](https://openwall.info/wiki/john)
