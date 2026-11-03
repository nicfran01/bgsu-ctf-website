---
name: strings
category: general
summary: Prints every run of readable text inside a binary file, such as flags, passwords, URLs, and metadata.
platforms: [linux, macos, windows]
officialUrl: https://www.gnu.org/software/binutils/
tags: [triage, text, binaries, metadata]
---

## What It Is

`strings` scans any file, including images, executables, and packet captures, and prints every sequence of printable characters at least four characters long. Most of a binary file is unreadable, but names, messages, URLs, embedded metadata, and sometimes flags sit inside it as plain text. `strings` pulls all of that out in one pass.

## When To Use It

- An early check on any challenge file, piped into `grep` for the flag format.
- Finding hardcoded strings in a program before opening a disassembler.
- Reading metadata or comments when a dedicated tool is not available.

## Installation

### Linux

Part of GNU binutils, installed by default on most distributions. If not: `sudo apt install binutils`.

### macOS

Included with the Xcode Command Line Tools (`xcode-select --install`). Homebrew's `binutils` package installs the GNU version if you want its extra options.

### Windows

Microsoft's Sysinternals suite has a `strings.exe`. Git Bash and WSL include the GNU version.

## Basic Usage

Search a file for the flag format:

```bash
strings challenge.bin | grep -i 'flag{'
```

Find a value inside image metadata:

```console
$ strings whats_my_label.png | grep PixelYDimension
         <exif:PixelYDimension>4032</exif:PixelYDimension>
```

Useful options:

| Option | What it does |
| --- | --- |
| `-n 8` | Only print runs of at least 8 characters, which cuts noise |
| `-t x` | Print the offset (in hex) of each string |
| `-e l` | GNU only: read 16-bit little-endian text, common in Windows programs |

## Common Pitfalls

- **Encoded or encrypted text.** `strings` only finds plain text. A Base64 flag shows up as Base64, and an encrypted one does not show up at all.
- **Too much output.** Large files produce thousands of lines. Pipe into `grep` or raise `-n`.
- **Wide strings.** Windows programs often store text as UTF-16, which `strings` misses by default. Use `-e l` with GNU strings.
- **Decoys.** A string in a binary may never be used. In reverse engineering, check which code references it.

## References

- [strings(1) manual page](https://man7.org/linux/man-pages/man1/strings.1.html)
- [Sysinternals Strings for Windows](https://learn.microsoft.com/en-us/sysinternals/downloads/strings)
