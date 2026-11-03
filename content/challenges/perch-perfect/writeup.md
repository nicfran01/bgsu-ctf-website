---
title: "Perch Perfect"
category: forensics
difficulty: medium
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
author: Brock M Rowe
tags: [steganography, png, metadata, appended-data, zip]
summary: A club flyer has a password-protected ZIP glued on after the end of the PNG. The password comes from the poster text plus a hint in the metadata.
---

## Overview

Perch Perfect is a PNG flyer for the club with a ZIP archive attached after the image ends. Image viewers ignore the extra bytes, and ZIP tools find them. The archive is password protected, and you build the password from two clues: the meeting place printed on the poster and a rule hidden in the PNG metadata. The challenge covers reading metadata, finding appended data, and combining clues from two places.

## Challenge Description

The written prompt for this challenge was not saved with the event files. Players received one file:

- `the_perch_flyer.png`: a 900 by 560 pixel flyer

![The challenge flyer: BGSU CTF CLUB, Weekly Meeting, New Members Welcome, Wednesdays 7:00 PM, Bring a laptop, Snacks provided, Meet at THE PERCH, and a small line reading Hint: this flyer says more than it shows](./images/flyer.png)

The flyer's last line, "Hint: this flyer says more than it shows," is the only nudge.

## Recon

The poster text is worth writing down before anything else: **Meet at THE PERCH**. Then run the standard first checks on any image file.

Metadata, with [exiftool](/tools/exiftool):

```console
$ exiftool the_perch_flyer.png | grep -E 'Comment|Image Size'
Comment                         : Vault key = the name of the place where we meet, lowercase, no spaces.
Image Size                      : 900x560
```

The file also has an `AI-Notice` text field, which is not part of the puzzle.

Appended data, with [binwalk](/tools/binwalk):

```console
$ binwalk the_perch_flyer.png
DECIMAL                            HEXADECIMAL                        DESCRIPTION
---------------------------------------------------------------------------------------
0                                  0x0                                PNG image, total size: 48228 bytes
48228                              0xBC64                             ZIP archive, file count: 1, total size: 172 bytes
```

The PNG ends at byte 48228, and a ZIP archive starts at exactly that offset.

## Walkthrough

### 1. Notice the archive

A PNG file ends with an `IEND` chunk, and viewers stop reading there. Nothing stops someone from writing more bytes after it. ZIP readers look for their directory at the end of a file, so the same file can be a working image and a working archive at once. `binwalk` showed the ZIP, and `unzip -l` confirms it:

```console
$ unzip -l the_perch_flyer.png
Archive:  the_perch_flyer.png
warning [the_perch_flyer.png]:  48228 extra bytes at beginning or within zipfile
  (attempting to process anyway)
  Length      Date    Time    Name
---------  ---------- -----   ----
       30  10-25-2026 11:04   flag.txt
---------                     -------
       30                     1 file
```

The warning about extra bytes is the PNG in front of the ZIP. It is harmless.

### 2. Build the password

The archive is encrypted, and the password is not written anywhere. Combine the two clues:

| Source | What it gives you |
| --- | --- |
| Poster text | The place where we meet: THE PERCH |
| `Comment` metadata | Lowercase, no spaces |
| Result | `theperch` |

### 3. Open the archive

```console
$ unzip -P theperch the_perch_flyer.png
Archive:  the_perch_flyer.png
warning [the_perch_flyer.png]:  48228 extra bytes at beginning or within zipfile
  (attempting to process anyway)
 extracting: flag.txt
$ cat flag.txt
BOO{WH@T_1S_TH3_P3RCH_@NYW@Y5}
```

A wrong password gives `incorrect password`, so each attempt tells you whether you have it.

## Solution

```console
$ exiftool -Comment the_perch_flyer.png
Comment                         : Vault key = the name of the place where we meet, lowercase, no spaces.
$ binwalk the_perch_flyer.png
$ unzip -P theperch the_perch_flyer.png
$ cat flag.txt
BOO{WH@T_1S_TH3_P3RCH_@NYW@Y5}
```

`binwalk -e the_perch_flyer.png` also extracts the archive, and `dd if=the_perch_flyer.png of=hidden.zip bs=1 skip=48228` carves it out by hand using the offset from binwalk.

## Flag

```text
BOO{WH@T_1S_TH3_P3RCH_@NYW@Y5}
```

## Takeaways

- Run `exiftool` on every image. A single `Comment` field held the whole password rule here.
- Run `binwalk` on every image too. A file larger than its picture needs is a sign something is attached.
- Clues combine. The password needed both the visible poster and the hidden metadata.
- An image upload filter that only checks that a file opens as a picture will accept a picture with an archive glued on. Services that need clean images re-encode them, which drops anything after the image data.

## References

- [PNG specification: IEND chunk](https://www.w3.org/TR/png-3/#11IEND)
- [ExifTool documentation](https://exiftool.org/exiftool_pod.html)
- [binwalk on GitHub](https://github.com/ReFirmLabs/binwalk)
