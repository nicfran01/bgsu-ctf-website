---
title: "Example Challenge: XOR Marks the Spot"
category: crypto
difficulty: easy
date: 2026-09-15
ctf: Example CTF (not a real event)
points: 50
author: Example Author
tags: [xor, known-plaintext, python, example]
summary: A flag XORed with one repeated byte. The known flag prefix gives away the key in one step.
---

## Overview

The challenge gives a hex string and says it was "encrypted" with XOR. Every byte of the flag was XORed with the same single byte, so there are only 256 possible keys, and the known flag format `bgsu{` gives the key away directly. The challenge covers how XOR works, why a one-byte key is weak, and how a known prefix (known plaintext) recovers a key. This is an example write-up for the club site and is not from a real CTF.

## Challenge Description

> I hid the flag with my own encryption. Nobody will ever read it.
>
> 383d292f21226a28052d6b2e32056a343f0538232e3f056b2905346a2e053f343928232a2e6b6a3427

No files were provided. The ciphertext is in the prompt.

## Recon

The string has 82 hex characters, which is 41 bytes. Flags for this event start with `bgsu{` and end with `}`, so the plaintext is 41 bytes with a known first five characters. The prompt does not mention a key length. A one-byte key is the simplest guess, so I tried that first.

XOR has the property that `a ^ k = c` implies `a ^ c = k`. If one plaintext byte and its ciphertext byte are known, the key byte falls out.

## Walkthrough

### 1. Recover the key from the first byte

The first ciphertext byte is `0x38` and the first plaintext byte is `b` (`0x62`):

```console
$ python3 -c 'print(hex(0x38 ^ ord("b")))'
0x5a
```

### 2. Check the key against the rest of the prefix

If the key is one repeated byte, `0x5a` should also turn `3d 29 2f 21` into `g s u {`:

```console
$ python3 -c 'print(bytes(b ^ 0x5a for b in bytes.fromhex("383d292f21")))'
b'bgsu{'
```

All five bytes match, so the key is a single byte, `0x5a`.

### 3. Why brute force alone is slower

Trying all 256 keys and keeping only results made of printable characters leaves 25 candidates for this ciphertext. You would still have to read through them. Checking for the `bgsu{` prefix cuts it down to one.

## Solution

```python
ct = bytes.fromhex("383d292f21226a28052d6b2e32056a343f0538232e3f056b2905346a2e053f343928232a2e6b6a3427")

key = ct[0] ^ ord("b")
print(f"key: {key:#04x}")
print(bytes(b ^ key for b in ct).decode())
```

```console
$ python3 solve.py
key: 0x5a
bgsu{x0r_w1th_0ne_byte_1s_n0t_encrypt10n}
```

## Flag

```text
bgsu{x0r_w1th_0ne_byte_1s_n0t_encrypt10n}
```

## Takeaways

- XOR with a short repeating key leaks the key wherever you know the plaintext. Flag formats, file headers (`%PDF`, `\x89PNG`), and protocol banners all give you known plaintext.
- A one-byte key has 256 possibilities, so it offers no protection even without known plaintext.
- In real code, use an authenticated cipher from a maintained library, such as AES-GCM or ChaCha20-Poly1305 through Python's `cryptography` package. Do not write your own cipher.

## References

- [CyberChef XOR Brute Force operation](https://gchq.github.io/CyberChef/#recipe=XOR_Brute_Force())
- [Python documentation: bytes.fromhex](https://docs.python.org/3/library/stdtypes.html#bytes.fromhex)
