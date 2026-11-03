---
title: "Phantom Handshake"
category: crypto
difficulty: medium
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
points: 200
author: Amanda Grace Hayner
tags: [diffie-hellman, discrete-log, xor, sha256, python]
summary: Two ghosts ran a Diffie-Hellman key exchange with a prime small enough to brute-force. Recover a private number, rebuild the shared secret, and unseal the spell.
---

## Overview

Phantom Handshake gives you a captured chat in which two parties run a Diffie-Hellman key exchange and then encrypt a message with the shared secret. The prime is only about twelve million, so the discrete log problem that normally protects Diffie-Hellman can be solved by trying every exponent. The challenge covers reading numbers in different formats (hex and Base64 bytes), modular exponentiation with Python's `pow`, and following a key-derivation recipe exactly.

## Challenge Description

> Two ghosts, Spectra and Banshee, met on the haunted network to set up a secret channel. They agreed on a shared secret out in the open, then Spectra sealed a spell with it.
>
> A nosy poltergeist named Eve captured the entire conversation. Eve only ever saw the public channel, and nobody told her the private numbers. Can you still read the sealed spell?

Provided files: `README.txt`, `haunted_chat_capture.log`, and an optional `discrete_log_starter.py`, a skeleton with `TODO` blanks for each Python step. The README's self-check says the right answer is readable text starting with `BOO{`.

## Recon

The whole challenge is in the chat log. Each line from the two ghosts gives one public value or one rule:

```text
[22:01:31] Banshee: yes! Let's agree on the public numbers first. For p, use the first prime that comes after 12345678.
[22:01:52] Spectra: ok. And g is the number of candles on my cauldron, which is 3.
[22:02:58] Spectra: A = 0xb3533c
[22:03:44] Banshee: got it. Mine is below. I wrote it as Base64 of the raw big-endian bytes, because that is how my spellbook stores big numbers.
[22:03:51] Banshee: B = k57F
[22:05:10] Spectra: write the shared secret in decimal, SHA-256 that text, then XOR the spell with the 32 digest bytes. The spell is shorter than 32 bytes.
[22:05:34] Spectra: sealed spell (hex): cd27f3f948fb7d855513515197fbd580c1b15a54b4d0b7c0d639
```

That is everything Eve saw: p (as a rule), g, A, B, the key recipe, and the ciphertext. The private numbers a and b never appear. In Diffie-Hellman, `A = g^a mod p`, so recovering a from A is the discrete log problem. That problem is hard for 2048-bit primes. This p is about 24 bits.

## Walkthrough

### 1. Turn every value into an integer

A is hex, so `int("b3533c", 16)` gives 11752252. B is Base64 of raw bytes: decode the Base64 to bytes, then read those bytes as one big-endian integer.

```console
$ python3 -c 'import base64; print(0xb3533c, int.from_bytes(base64.b64decode("k57F"), "big"))'
11752252 9674437
```

### 2. Find p

Start at 12345679 and count up until a number is prime. Any primality test works (trial division, `isPrime` from pycryptodome, or `sympy.nextprime`). The first prime after 12345678 is **12345701**.

### 3. Brute-force Spectra's private number

Try every exponent until `pow(g, guess, p)` equals A. The three-argument `pow` reduces as it goes, so each try is fast. Writing `g**guess % p` instead builds the full power first and is far too slow.

```python
a = next(x for x in range(1, p) if pow(3, x, p) == 11752252)
```

This finds **a = 9601566** after about 10 seconds of searching.

### 4. Compute the shared secret

Banshee's public value raised to Spectra's private number gives the secret both ghosts share: `pow(B, a, p)` = **10043623**.

### 5. Build the key exactly as the chat describes

The recipe says: write the secret in decimal, SHA-256 that text, and XOR with the digest bytes. Hashing the string `"10043623"` is different from hashing the integer's bytes, and only the string version works. The spell is 26 bytes, so XOR it with the first 26 bytes of the 32-byte digest.

## Solution

`solve.py` from the challenge files:

```python
import base64
import hashlib


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    i = 2
    while i * i <= n:
        if n % i == 0:
            return False
        i += 1
    return True


# 1. Public values from haunted_chat_capture.log
p = 12345679
while not is_prime(p):          # "the first prime that comes after 12345678"
    p += 1
g = 3
A = 0xb3533c
B = int.from_bytes(base64.b64decode("k57F"), "big")
ct = bytes.fromhex("cd27f3f948fb7d855513515197fbd580c1b15a54b4d0b7c0d639")
print(f"p = {p}, A = {A}, B = {B}")

# 2. Brute-force Spectra's private number: find a with g^a mod p == A
a = next(x for x in range(1, p) if pow(g, x, p) == A)
print(f"a = {a}")

# 3. Shared secret, then the key recipe from the chat: SHA-256 of the secret written in decimal
secret = pow(B, a, p)
key = hashlib.sha256(str(secret).encode()).digest()
print(f"shared secret = {secret}")

# 4. XOR the sealed spell with the key
print(bytes(c ^ k for c, k in zip(ct, key)).decode())
```

```console
$ python3 solve.py
p = 12345701, A = 11752252, B = 9674437
a = 9601566
shared secret = 10043623
BOO{gh0stly_sh4r3d_s3cr3t}
```

A second route also works: skip the private number and brute-force the shared secret directly by hashing every number below p and testing the XOR result for `BOO{`. That is about 12 million SHA-256 hashes and still requires the exact key recipe.

## Flag

```text
BOO{gh0stly_sh4r3d_s3cr3t}
```

## Takeaways

- Diffie-Hellman is only as strong as the discrete log problem behind it, and that depends on the size of p. Real systems use 2048-bit primes or elliptic curves. A 24-bit prime falls to a laptop in seconds.
- Use `pow(base, exp, mod)` for modular exponentiation. Computing `base ** exp % mod` on large numbers is slow.
- Numbers show up in many formats. Use `int(x, 16)` for hex and `int.from_bytes(..., "big")` for raw bytes.
- Follow key-derivation recipes word for word. Hashing a number's decimal text and hashing its bytes give different keys.
- Guessing the `BOO{` prefix does not help here. The key is 32 bytes from SHA-256 and each byte is used once, so knowing 4 plaintext bytes reveals only 4 key bytes.

## References

- [CryptoHack: Diffie-Hellman Starter course](https://cryptohack.org/courses/public-key/)
- [Wikipedia: Diffie-Hellman key exchange](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange)
- [Python documentation: pow](https://docs.python.org/3/library/functions.html#pow)
