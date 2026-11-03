---
title: "The Cursed Mirror"
category: crypto
difficulty: hard
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
points: 300
author: Amanda Grace Hayner
tags: [rsa, malleability, chosen-ciphertext, python]
summary: A decryption oracle refused to decrypt the flag, but its log shows someone held up a multiplied copy of it. Textbook RSA's malleability turns that entry back into the flag.
---

## Overview

The Cursed Mirror gives you the log of an RSA decryption oracle. The mirror refused to decrypt the sealed flag and refused to show any output containing `BOO{`, but one visitor held up the flag's ciphertext multiplied by `k^e`, and the mirror decrypted it. Because textbook RSA has no padding, that reflection is exactly `k` times the flag. The challenge teaches RSA malleability and how to spot it in a transcript.

## Challenge Description

> A witch sealed her last spell with textbook RSA and hung it in front of an old mirror. The mirror held her private key and would reflect (decrypt) whatever a visitor held up to the glass, but it was cursed, and it had rules.
>
> The witch is gone, and the glass has gone dark, yet the mirror kept a log of everything ever held up to it. Somewhere in that log is a way to read her spell. The spell is the flag.
>
> Read the top of the log carefully. Everything you need is in the files.

Provided files: `README.txt`, `mirror_log.txt`, and an optional `mirror_log_helper.py` that loads the log into Python so you do not copy 600-digit numbers by hand. The README's self-check: encrypting your answer with `(n, e)` must give back the sealed spell `c`.

## Recon

The top of `mirror_log.txt` states the mirror's two rules:

```text
  1. It would NOT reflect the sealed spell itself.
  2. It would NOT show any reflection that contained the spell's opening "BOO{".
```

Then it gives `n` (a 2048-bit modulus), `e = 65537`, and the sealed spell `c`. Twelve entries follow, each with a time, the ciphertext that was held up, a result (`REFLECTED`, `REFUSED`, or `CRACKED`), and a reflection when there is one.

The cube-root trick from the Crypto Night RSA slide does not apply. That trick works only when `e = 3` and `m^3` never wraps around `n`. Here `e` is 65537, so `m^e` wraps many times.

Load the log and print each reflection as text:

```python
from mirror_log_helper import load, as_text
n, e, c, entries = load()
for en in entries:
    if en["reflection"] is not None:
        print(en["id"], as_text(en["reflection"])[:60])
```

## Walkthrough

### 1. Sort the entries

Six reflections are readable spells and three are garbage:

| Entry | Result | What it is |
| --- | --- | --- |
| 1, 2, 3, 7, 10, 12 | REFLECTED | Readable spells, such as "Something wicked this way comes." |
| 4 | REFUSED | Someone held up `c` itself (rule 1) |
| 5, 9 | CRACKED | The output would have contained `BOO{`, so rule 2 hid it |
| 6, 8, 11 | REFLECTED | Garbled bytes |

A readable reflection means someone held up an honest ciphertext of a real message. A garbled reflection means the ciphertext was not a normal encryption, yet the mirror decrypted it anyway. The garbled entries are the lead.

### 2. Use the multiplicative property

In textbook RSA, for any number `k`:

```text
(m * k)^e = m^e * k^e   (mod n)
```

So `c * k^e mod n` is a valid ciphertext of `k * m`. If a garbled entry's ciphertext `c'` was built from `c` this way, then `c' / c` is `k^e (mod n)`, the e-th power of a small number. Dividing mod n means multiplying by the modular inverse, `pow(c, -1, n)`.

### 3. Find the entry and the multiplier

Build a table of `pow(k, e, n)` for small `k`, compute `held * pow(c, -1, n) % n` for each garbled entry, and look the result up:

- **Entry 8** matches with **k = 1031** (Halloween, 10/31). This is the useful one.
- Entry 6 does not match `c`. Comparing it to the other entries shows it is entry 2 multiplied by 7, and dividing its reflection by 7 gives a harmless spell. It is a decoy.
- Entry 11 matches nothing. It is a random ciphertext.

The two CRACKED entries used `k = 256` and `k = 65536`. Multiplying by a power of 256 only appends zero bytes to the message, so `BOO{` was still visible and the filter caught it. Multiplying by 1031 scrambles every byte, so the filter missed it.

### 4. Undo the multiplication and check

Entry 8's reflection is `1031 * m`. The flag is about 30 bytes, much smaller than `n`, so ordinary integer division is exact. Convert the result to text, then confirm `pow(m, e, n) == c`.

## Solution

`solve.py` from the challenge files (run it next to `mirror_log.txt` and `mirror_log_helper.py`):

```python
from mirror_log_helper import as_text, load

n, e, c, entries = load()

# Readable reflections are honest decryptions. Garbled ones came from modified ciphertexts.
for en in entries:
    if en["reflection"] is not None:
        print(f"entry {en['id']:2}: {as_text(en['reflection'])[:60]!r}")

garbled = [en for en in entries if en["status"] == "REFLECTED" and "�" in as_text(en["reflection"])]
print("\ngarbled entries:", [en["id"] for en in garbled])

# Textbook RSA is multiplicative: if held = c * k^e (mod n), the mirror showed k * m.
# Look up held / c among k^e for small k.
table = {pow(k, e, n): k for k in range(2, 100_001)}
c_inv = pow(c, -1, n)
for en in garbled:
    k = table.get(en["held"] * c_inv % n)
    if k is None:
        continue
    m = en["reflection"] // k
    print(f"entry {en['id']} = sealed spell * {k}^e")
    print("flag:", as_text(m))
    print("self-check (m^e == c):", pow(m, e, n) == c)
```

```console
$ python3 solve.py
entry  1: 'Double, double toil and trouble; fire burn and cauldron bubb'
entry  2: 'Eye of newt, and toe of frog, wool of bat, and tongue of dog'
entry  3: 'Something wicked this way comes.'
entry  6: '\x01�Q��\x0b��\x04�D-4�\x04��/\x0b��\x0b���!\x0b�4�D\x0c\x0b��\x0b�Ⱚ-4�\x04��/\x0c\x04�5��\x0b��\x0b�B'
entry  7: 'Under the full moon the graveyard gate swings open at midnig'
entry  8: '\x01\x0b\ri\x1a\x14�#��\x1c�P�#��\x1c�\\\x0c�mϦ�y\x14 ��k'
entry 10: 'A candle in every pumpkin keeps the restless spirits calm.'
entry 11: "�\t\x7f.\x04�.[(e�\\'n�VTt\x08|������$��\r��j�E����N��\x08K[S���.B��I\x1c\x1b1Z\x02�"
entry 12: 'Never answer when the mirror whispers your name.'

garbled entries: [6, 8, 11]
entry 8 = sealed spell * 1031^e
flag: BOO{m1rr0r_m1rr0r_0n_th3_w4ll}
self-check (m^e == c): True
```

Building the table of 100,000 powers takes a few seconds. A second route also works: divide each garbled reflection by 2, 3, 4, and so on until `BOO{` appears. It relies on the same idea (a reflection is a multiple of a plaintext) and finds the same entry.

## Flag

```text
BOO{m1rr0r_m1rr0r_0n_th3_w4ll}
```

## Takeaways

- Textbook RSA is malleable. Multiplying a ciphertext by `k^e` multiplies the hidden message by `k`, without knowing the private key.
- A filter that blocks one exact input rarely blocks the whole family of related inputs. The mirror blocked `c` and outputs containing `BOO{`, and `1031 * m` slipped past both.
- Logs and transcripts are data. When most entries look normal and a few are garbage, the garbage is the clue.
- The fix in real code is padding. RSA-OAEP makes a tampered ciphertext fail the padding check on decryption, so there would be no "1031 times the flag" to find. Libraries such as pycryptodome (`Crypto.Cipher.PKCS1_OAEP`) and Python's `cryptography` package do this for you.
- RSA answers can be checked. If re-encrypting your plaintext gives the ciphertext back, you have it.

## References

- [Wikipedia: Malleability (cryptography)](https://en.wikipedia.org/wiki/Malleability_%28cryptography%29)
- [CryptoHack: RSA course](https://cryptohack.org/courses/public-key/)
- [pycryptodome: PKCS#1 OAEP](https://pycryptodome.readthedocs.io/en/latest/src/cipher/oaep.html)
