---
title: "Birthday"
category: forensics
difficulty: easy
date: 2026-09-30
ctf: "BGSU CTF Club meeting: Steganography"
author: Nick Francisco
tags: [steganography, steghide, jpeg, passphrase]
summary: A JPEG hides an encrypted file with Steghide, and the passphrase is sitting in a text file right next to it.
---

## Overview

Birthday is a photo with a file hidden inside it by Steghide. Steghide locks hidden data with a passphrase, and here the passphrase is the only word in a small text file in the same folder. The challenge teaches the Steghide workflow (check with `info`, then `extract`) and the habit of looking at every file a challenge gives you, not only the obvious one.

## Challenge Description

The written prompt for this challenge was not saved with the meeting files. Players received two files:

- `birthday.jpg`: a 1242 by 2208 pixel JPEG photo
- `secret.txt`: a 5-byte text file

The meeting's challenges were run inside the [Stego Toolkit](/tools/stego-toolkit) Docker container, which has Steghide and binwalk installed. Steghide also installs on its own.

## Recon

Start by asking what each file is:

```console
$ file birthday.jpg secret.txt
birthday.jpg: JPEG image data, JFIF standard 1.01, aspect ratio, density 72x72, segment length 16, baseline, precision 8, 1242x2208, components 3
secret.txt:   ASCII text
$ cat secret.txt
kewl
```

A short, random-looking word sitting next to an image is a strong hint that it is a password. JPEG is one of the four formats [Steghide](/tools/steghide) supports (JPEG, BMP, WAV, AU), so Steghide is the first tool to try.

## Walkthrough

### 1. Check the image with Steghide

Run `steghide info birthday.jpg`. Steghide asks whether to look for embedded data and then for a passphrase. Type `kewl`, or pass it with `-p` to skip the prompts:

```console
$ steghide info birthday.jpg -p kewl
"birthday.jpg":
  format: jpeg
  capacity: 17.2 KB
  embedded file "flag.txt":
    size: 19.0 Byte
    encrypted: rijndael-128, cbc
    compressed: yes
```

Steghide reports a hidden file named `flag.txt`, encrypted with Rijndael-128 (AES) and compressed.

### 2. Extract the hidden file

Run `steghide extract -sf birthday.jpg` and enter `kewl` when asked. Steghide writes the hidden file to the current folder:

```console
$ cat flag.txt
flag{h44py_b33d4y}
```

## Solution

Steghide's `-p` option takes the passphrase on the command line, so the whole solve is one command:

```console
$ steghide extract -sf birthday.jpg -p kewl
wrote extracted data to "flag.txt".
$ cat flag.txt
flag{h44py_b33d4y}
```

## Flag

```text
flag{h44py_b33d4y}
```

## Takeaways

- Look at every file in a challenge. Small text files, file names, and metadata are common places to leave a password.
- A JPEG stores compressed numbers that describe blocks of color, not raw pixels. Steghide hides data by making tiny changes to those numbers, so the picture looks the same.
- The passphrase does two jobs: it encrypts the hidden file, and it decides which spots in the image hold the data. Without it you cannot find the data or read it.
- If a challenge gives you no password at all, try an empty passphrase (press Enter). Steghide accepts it.
- When there is no password anywhere, tools such as `stegseek` can try a wordlist against a Steghide file quickly.

## References

- [Steghide home page](https://steghide.sourceforge.net/)
- [Stego Toolkit on GitHub](https://github.com/DominicBreuker/stego-toolkit)
- [stegseek on GitHub](https://github.com/RickdeJager/stegseek)
