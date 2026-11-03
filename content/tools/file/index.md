---
name: file
category: general
summary: Identifies what a file actually is from its contents, not its name or extension.
platforms: [linux, macos, windows]
officialUrl: https://www.darwinsys.com/file/
tags: [file-types, magic-bytes, triage]
---

## What It Is

`file` reads the first bytes of a file and compares them against a database of known signatures ("magic bytes") to report what kind of file it is: a PNG and its dimensions, a JPEG, a WAV and its sample rate, an ELF executable, a ZIP archive, and thousands more. It ignores the file name, so a PNG renamed to `.txt` is still reported as a PNG.

## When To Use It

- The first command to run on any file in a challenge.
- Checking whether a file's extension matches its contents.
- Spotting damaged headers. If `file` says `data` for something that should be an MP3 or PNG, the start of the file has been changed.

## Installation

### Linux

Installed by default on nearly every distribution. If not: `sudo apt install file`.

### macOS

Included with macOS.

### Windows

Git for Windows includes `file` inside Git Bash. It is also available in WSL.

## Basic Usage

```console
$ file birthday.jpg secret.txt
birthday.jpg: JPEG image data, JFIF standard 1.01, aspect ratio, density 72x72, segment length 16, baseline, precision 8, 1242x2208, components 3
secret.txt:   ASCII text
$ file whats_my_label.png
whats_my_label.png: PNG image data, 3024 x 3000, 8-bit/color RGBA, non-interlaced
$ file notjusttylerthecreator.mp3
notjusttylerthecreator.mp3: data
```

`data` means `file` did not recognize the contents. For a file that should be audio, that is a clue the header was changed.

Check every file in a folder at once:

```bash
file *
```

## Common Pitfalls

- **It only checks the start of the file.** A PNG with a ZIP glued onto the end still reports as a plain PNG. Use [binwalk](/tools/binwalk) to scan the whole file.
- **Trusting extensions.** Challenge files are often misnamed on purpose. Believe `file`, not the extension.
- **`data` is not an answer.** It means "unknown". Look at the first bytes with [xxd](/tools/xxd) to see what is there.

## References

- [file(1) manual page](https://man7.org/linux/man-pages/man1/file.1.html)
- [Wikipedia: List of file signatures](https://en.wikipedia.org/wiki/List_of_file_signatures)
