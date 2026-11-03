---
title: "Just a Logo"
category: forensics
difficulty: easy
date: 2026-09-30
ctf: "BGSU CTF Club meeting: Steganography"
author: Nick Francisco
tags: [steganography, binwalk, png, zip, appended-data]
summary: The club logo opens as a normal PNG, but a ZIP archive is glued onto the end of it. binwalk finds it and pulls out the flag.
---

## Overview

Just a Logo is a PNG of the club logo with a ZIP file attached after the image ends. Image viewers stop reading at the end of the PNG and never show the extra bytes, but tools that scan for file signatures find them right away. The challenge teaches binwalk, how to read its output (including its false positives), and why one file can be a working image and a working archive at the same time.

## Challenge Description

The written prompt for this challenge was not saved with the meeting files. Players received one file:

- `justalogo.png`: the club logo, 2716 by 2537 pixels

As the name suggests, it is not just a logo.

## Recon

```console
$ file justalogo.png
justalogo.png: PNG image data, 2716 x 2537, 8-bit/color RGBA, non-interlaced
```

`file` only looks at the start of a file, so it reports a normal PNG. The image also opens normally. At about 170 KB the file is not suspicious by size alone, so the next step is a tool that reads every byte.

## Walkthrough

### 1. Scan the file with binwalk

[binwalk](/tools/binwalk) looks for the signatures that mark the start of known file types anywhere in a file. In the meeting's [Stego Toolkit](/tools/stego-toolkit) container (binwalk version 2), the output, trimmed, looks like this:

```text
DECIMAL     DESCRIPTION
0           PNG image, 2716 x 2537, 8-bit/color RGBA
85          Zlib compressed data, best compression
26049       Zlib compressed data, best compression
168585      Intel x86 or x64 microcode ...
173808      Zip archive data, name: super-secret/
173879      Zip archive data, name: super-secret/flag.txt
174154      End of Zip archive
```

binwalk version 3 prints a shorter summary of the same finding:

```console
$ binwalk justalogo.png
DECIMAL                            HEXADECIMAL                        DESCRIPTION
---------------------------------------------------------------------------------------
0                                  0x0                                PNG image, total size: 173808 bytes
173808                             0x2A6F0                            ZIP archive, file count: 2, total size: 368 bytes
```

### 2. Read the results

The left column is the offset, how many bytes into the file each item starts. The right column is what binwalk thinks is there.

- The PNG and zlib lines are expected, because PNG pixel data is compressed with zlib.
- The microcode line is a false positive: a few bytes in the image happened to match a microcode signature.
- The ZIP lines are the real find. A ZIP archive starts at byte 173808, exactly where the PNG ends, and it contains `super-secret/flag.txt`.

### 3. Extract it

```bash
binwalk -e justalogo.png
cat _justalogo.png.extracted/super-secret/flag.txt
```

binwalk version 2 extracts into `_justalogo.png.extracted/`. Version 3 uses an `extractions/` folder instead. Inside the Docker container you run as root, and binwalk 2 may refuse to extract until you add `--run-as=root`.

Because ZIP readers look for their directory at the end of a file, `unzip` works on the PNG directly. It warns about the extra bytes at the beginning, which are the image:

```console
$ unzip justalogo.png
$ cat super-secret/flag.txt
flag{n0t_ju5t_4_l0g0}
```

## Solution

```console
$ unzip -l justalogo.png
  Length      Date    Time    Name
---------  ---------- -----   ----
        0  09-24-2026 12:20   super-secret/
       22  09-24-2026 12:20   super-secret/flag.txt
---------                     -------
       22                     2 files
$ unzip justalogo.png && cat super-secret/flag.txt
flag{n0t_ju5t_4_l0g0}
```

The challenge file was made with one command, `cat justalogo.png super-secret.zip > challenge.png`. A PNG ends with an `IEND` chunk, viewers stop there, and anything after it is ignored.

## Flag

```text
flag{n0t_ju5t_4_l0g0}
```

## Takeaways

- Run binwalk on every image in a forensics challenge. Appended archives are one of the most common tricks.
- Not every binwalk result is real. Check whether a result makes sense for the file before chasing it.
- Every ZIP file starts with the bytes `PK`, which is why binwalk spots the archive no matter what comes before it.
- Whatever you extract might hide something too, so run the same checks on it.

## References

- [binwalk on GitHub](https://github.com/ReFirmLabs/binwalk)
- [PNG specification: IEND chunk](https://www.w3.org/TR/png-3/#11IEND)
