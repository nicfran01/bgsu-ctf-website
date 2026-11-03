---
title: "Trick or Treat?"
category: crypto
difficulty: easy
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
points: 100
author: Amanda Grace Hayner
tags: [base64, hex, url-encoding, binary, caesar, decoys]
summary: Seven notes, each hidden under a different encoding. Decode them all, figure out which houses lied, and rebuild the real flag from the honest ones.
---

## Overview

Trick or Treat? is a scavenger hunt through common encodings: Base64, hex, binary, URL encoding, and one Caesar cipher. Each of the seven notes decodes to either a TREAT (a real piece of the flag) or a TRICK (a fake flag that looks finished). The challenge teaches you to identify an encoding by how it looks, and to decode everything before you trust the first flag-shaped string you find.

## Challenge Description

> It is Halloween night, and you have come home with a treat bag from seven houses on Elm Street. Every house left you a note, but every note is wearing a costume. Some of the houses were generous. Others played tricks.
>
> Take the costumes off, work out which houses you can trust, and rebuild the real flag.

Provided files: `README.txt` (the story and rules) and `trail.txt` (the seven notes). Both are in the Download files folder. The README warns that "not every BOO{...} you find is the real one."

## Recon

`trail.txt` lists seven houses, each followed by one encoded string. Before decoding anything, look at what characters each string uses. The encoding examples from Crypto Night are enough to tell them apart:

| House | What the string looks like | Encoding |
| --- | --- | --- |
| 1 | Letters and digits, ends in `=` | Base64 |
| 2 | `%` before every pair of hex digits | URL encoding |
| 3 | Only `0-9` and `a-f` | Hex |
| 4 | Only `0` and `1`, in groups of 8 | Binary |
| 5 | `%` before every pair of hex digits | URL encoding |
| 6 | Only `0-9` and `a-f` | Hex |
| 7 | Letters and digits, ends in `=` | Base64, plus something underneath |

Houses 3, 4, and 6 wrap across several lines, so the line breaks have to be removed before decoding (or replaced with spaces for the binary house, so each group of 8 stays separate).

## Walkthrough

### 1. Decode House 1 first

House 1 is Base64. In [CyberChef](/tools/cyberchef), paste it in and add **From Base64**. It decodes to the rules for the whole street:

```text
WELCOME TO ELM STREET! There are 7 houses on this trail, and this is house 1.
Every house hides its note under a different costume. Some houses are TREATS:
their notes hold one piece of the real flag. Some houses are TRICKS: their notes
lie and hold fake flags. Join the TREAT pieces in house order to build the real
flag. Careful: house 7 wears two costumes, Base64 on the outside and a Caesar
mask underneath. The Caesar shift is the number of TRICK houses on this street.
```

### 2. Decode houses 2 to 6

Use **URL Decode**, **From Hex**, or **From Binary** depending on the house. For the wrapped hex houses, put **Remove whitespace** before **From Hex**. The results:

| House | Type | Decoded note |
| --- | --- | --- |
| 2 | TREAT | `TREAT! Here is a piece of the flag: BOO{c4ndy_` |
| 3 | TRICK | `TRICK! Full-size candy bars for everyone! BOO{fu11_s1z3_b4rs_4_3v3ry0n3}` |
| 4 | TREAT | `TREAT! Here is a piece of the flag: c0rn_gh0sts_` |
| 5 | TRICK | `TRICK! A rubber spider drops on your head. BOO{sp1d3rs_4r3_n0t_c4ndy}` |
| 6 | TRICK | `TRICK! Only raisins in this bowl. BOO{r41s1ns_1n_th3_b0wl}` |

Houses 3, 5, and 6 each contain a complete-looking flag. All three are decoys.

### 3. Decode House 7 in two layers

**From Base64** on House 7 gives text that is not English yet:

```text
WUHDW! Khuh lv d slhfh ri wkh iodj: 4iw3u_g4un}
```

House 1 said the Caesar shift is the number of TRICK houses. Houses 3, 5, and 6 are tricks, so the shift is 3. Shift every letter back by 3. In CyberChef, use **ROT13** with the amount set to 23 (23 forward is the same as 3 back), or run **ROT13 Brute Force** and look for the line that reads as English. Digits and punctuation do not change.

```console
$ python3 -c 'print("".join(chr((ord(c)-65-3)%26+65) if c.isupper() else chr((ord(c)-97-3)%26+97) if c.islower() else c for c in "WUHDW! Khuh lv d slhfh ri wkh iodj: 4iw3u_g4un}"))'
TREAT! Here is a piece of the flag: 4ft3r_d4rk}
```

If you skipped counting, there are only 25 possible shifts, and exactly one of them gives English.

### 4. Join the TREAT pieces in house order

The TREAT houses are 2, 4, and 7:

| House | Piece |
| --- | --- |
| 2 | `BOO{c4ndy_` |
| 4 | `c0rn_gh0sts_` |
| 7 | `4ft3r_d4rk}` |

Joined in order, they make the flag.

## Solution

`solve.py` in the challenge files decodes every house, counts the tricks, removes the Caesar mask, and joins the treats. Run it next to `trail.txt`:

```python
import base64
import re
import sys
from urllib.parse import unquote

path = sys.argv[1] if len(sys.argv) > 1 else "trail.txt"
text = open(path, encoding="utf-8").read()

houses = {}
for number, body in re.findall(r"HOUSE (\d+)[^\n]*\n(.*?)(?=\n\s*\n|\n-{5,})", text, re.S):
    houses[int(number)] = body.strip()


def decode(note: str) -> str:
    joined = "".join(note.split())
    if note.startswith("%"):
        return unquote(joined)
    if set(joined) <= set("01"):
        return bytes(int(b, 2) for b in note.split()).decode()
    if re.fullmatch(r"[0-9a-f]+", joined):
        return bytes.fromhex(joined).decode()
    return base64.b64decode(joined).decode()


def caesar(s: str, shift: int) -> str:
    out = []
    for ch in s:
        if ch.isalpha():
            base = 65 if ch.isupper() else 97
            out.append(chr((ord(ch) - base + shift) % 26 + base))
        else:
            out.append(ch)
    return "".join(out)


notes = {n: decode(body) for n, body in sorted(houses.items())}
tricks = sum(1 for n, note in notes.items() if note.startswith("TRICK"))
notes[7] = caesar(notes[7], -tricks)  # house 7 hides under a Caesar mask: shift = number of TRICK houses

for n, note in notes.items():
    print(f"house {n}: {note[:90]}")

pieces = [note.split(": ", 1)[1] for n, note in notes.items() if note.startswith("TREAT")]
print("\nflag:", "".join(pieces))
```

```console
$ python3 solve.py
house 1: WELCOME TO ELM STREET! There are 7 houses on this trail, and this is house 1. Every house
house 2: TREAT! Here is a piece of the flag: BOO{c4ndy_
house 3: TRICK! Full-size candy bars for everyone! BOO{fu11_s1z3_b4rs_4_3v3ry0n3}
house 4: TREAT! Here is a piece of the flag: c0rn_gh0sts_
house 5: TRICK! A rubber spider drops on your head. BOO{sp1d3rs_4r3_n0t_c4ndy}
house 6: TRICK! Only raisins in this bowl. BOO{r41s1ns_1n_th3_b0wl}
house 7: TREAT! Here is a piece of the flag: 4ft3r_d4rk}

flag: BOO{c4ndy_c0rn_gh0sts_4ft3r_d4rk}
```

## Flag

```text
BOO{c4ndy_c0rn_gh0sts_4ft3r_d4rk}
```

## Takeaways

- Identify an encoding by its character set before reaching for a tool. A trailing `=` suggests Base64, only `0-9a-f` suggests hex, and `%` followed by two hex digits is URL encoding.
- Encoding is not encryption. Base64, hex, binary, and URL encoding can all be undone by anyone without a key, so stacking them adds steps and no secrecy.
- Decode everything before submitting. Three of the seven houses held flags that looked complete and were wrong.
- A Caesar cipher has only 25 keys. When you are not sure of the shift, try all of them.

## References

- [CyberChef](https://gchq.github.io/CyberChef/)
- [Python documentation: base64](https://docs.python.org/3/library/base64.html)
- [Python documentation: urllib.parse.unquote](https://docs.python.org/3/library/urllib.parse.html#urllib.parse.unquote)
