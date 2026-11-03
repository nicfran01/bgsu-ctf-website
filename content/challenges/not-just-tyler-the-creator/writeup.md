---
title: "Not Just Tyler, The Creator"
category: forensics
difficulty: hard
date: 2026-09-30
ctf: "BGSU CTF Club meeting: Steganography"
author: Nick Francisco
tags: [steganography, lsb, mp3, xxd, python]
summary: The flag is hidden one bit at a time in the last bit of an MP3's first bytes. A broken file header gives it away, and a few lines of Python read it back.
---

## Overview

Not Just Tyler, The Creator hides the flag with least significant bit (LSB) encoding, written straight into the raw bytes at the start of an MP3. No standard tool extracts a hand-rolled LSB message like this, so you have to notice the damage it caused and write a short script. The challenge teaches reading file headers with `xxd`, recognizing text that is off by one bit, and turning bits back into characters in Python.

## Challenge Description

The written prompt for this challenge was not saved with the meeting files. Players received one file:

- `notjusttylerthecreator.mp3`: a 5.4 MB song file

## Recon

The usual tools come up empty. [Steghide](/tools/steghide) does not support MP3, and binwalk reports only a microcode match deep in the file, which is a false positive:

```console
$ steghide info notjusttylerthecreator.mp3
steghide: the file format of the file "notjusttylerthecreator.mp3" is not supported.
```

The first real clue comes from asking what the file is:

```console
$ file notjusttylerthecreator.mp3
notjusttylerthecreator.mp3: data
```

[`file`](/tools/file) does not recognize it as audio. Something about the start of the file is not what it should be.

## Walkthrough

### 1. Look at the first bytes

```console
$ xxd notjusttylerthecreator.mp3 | head -3
00000000: 4845 3302 0001 0100 0007 5552 434b 0000  HE3.......URCK..
00000010: 0003 0100 0030 5451 4431 0100 0013 0101  .....0TQD1......
00000020: 0055 796d 6572 2d21 5469 6520 4373 6560  .Uymer-!Tie Cse`
```

An MP3 with tags starts with the letters `ID3`. This one starts with `HE3`. Further along, `Uymer-!Tie Cse`` almost reads as "Tyler, The Cre". Each letter is off by exactly one, which is what happens when someone changes the last bit of every byte.

### 2. Test the idea on the first character

Take the last bit of each of the first eight bytes:

```text
48 = 01001000  ->  0
45 = 01000101  ->  1
33 = 00110011  ->  1
02 = 00000010  ->  0
00 = 00000000  ->  0
01 = 00000001  ->  1
01 = 00000001  ->  1
00 = 00000000  ->  0
```

Together those bits are `01100110`, which is `f` in ASCII, the first letter of `flag{`. The theory holds.

### 3. Script the rest

Doing this by hand for every character is slow. In Python, `b & 1` keeps only the last bit of a byte, and `int(bits, 2)` turns a string of eight bits into a number.

## Solution

`solve.py` from the challenge files:

```python
data = open("notjusttylerthecreator.mp3", "rb").read()

# Take the last bit of each of the first 800 bytes (enough for 100 characters)
bits = "".join(str(b & 1) for b in data[:800])

# Group the bits into 8s and turn each group into a character
chars = [chr(int(bits[i:i + 8], 2)) for i in range(0, len(bits), 8)]
text = "".join(chars)

# Print everything up to and including the closing brace
print(text[:text.index("}") + 1])
```

```console
$ python3 solve.py
flag{n0t_ju5t_p34k}
```

## Flag

```text
flag{n0t_ju5t_p34k}
```

## Takeaways

- When `file` gives an unexpected answer, look at the first bytes with [`xxd`](/tools/xxd). A broken header often shows exactly where data was hidden.
- Text that is almost readable, with each letter off by one, is a strong sign that the last bits were changed.
- The least significant bit changes a byte's value by only one, the smallest possible edit. To hide the flag, each character's eight bits went into the last bit of eight bytes, starting at byte 0.
- Starting at byte 0 broke the ID3 tag at the front, which is why `file` stopped recognizing the format. The audio frames later in the file were untouched, so the song still plays.
- Real LSB challenges more often hide data in audio samples or pixel values. The same script idea works there once you read the samples or pixels out first.

## References

- [Wikipedia: Least significant bit](https://en.wikipedia.org/wiki/Bit_numbering#Least_significant_bit)
- [ID3 tag format](https://id3.org/id3v2.3.0)
