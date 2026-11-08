---
name: PyCryptodome
category: crypto
summary: A Python crypto library with real ciphers and the number helpers RSA and Diffie-Hellman challenges need, such as long_to_bytes and inverse.
platforms: [linux, macos, windows]
officialUrl: https://pycryptodome.readthedocs.io/
tags: [crypto, rsa, aes, python, number-theory]
---

## What It Is

PyCryptodome is a Python library of cryptographic building blocks: block ciphers like AES, hash functions, RSA key handling, and a `Crypto.Util.number` module with the integer helpers that crypto challenges use again and again. It installs under the name `pycryptodome` but imports as `Crypto`. For CTFs it does two jobs: it runs the standard ciphers correctly when a challenge hands you a key, and it converts between big integers and bytes so you can do RSA math in plain [Python](/tools/python).

## When To Use It

- RSA challenges: turning the recovered plaintext integer back into bytes with `long_to_bytes`, finding `d` with `inverse`, and testing primes with `isPrime`.
- Decrypting AES when the challenge gives you the key, the mode, and the IV.
- Any time you need `bytes_to_long` and `long_to_bytes` to move between a number and the text it encodes.
- Building a key object from a `.pem` file to read its modulus and exponent.

For chaining encodings with no key, [CyberChef](/tools/cyberchef) is quicker. PyCryptodome is for when you are doing the math or running a real cipher.

## Installation

Install it in a virtual environment. See the [Python guide](/tools/python) for setting one up.

### Linux

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install pycryptodome
```

### macOS

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install pycryptodome
```

### Windows

In PowerShell, after installing Python from python.org:

```powershell
py -m venv .venv
.venv\Scripts\activate
pip install pycryptodome
```

## Basic Usage

The number helpers are the ones you will use most:

```python
from Crypto.Util.number import long_to_bytes, bytes_to_long, inverse, isPrime, getPrime, GCD

bytes_to_long(b"BOO{")              # 1112493947
long_to_bytes(1112493947)           # b'BOO{'
isPrime(12345701)                   # True
inverse(7919, 1000003)              # 658671  (modular inverse)
```

A textbook RSA decryption, once you have `n`, `e`, and the factors `p` and `q`:

```python
from Crypto.Util.number import long_to_bytes, inverse

phi = (p - 1) * (q - 1)
d = inverse(e, phi)
m = pow(c, d, n)                    # c is the ciphertext integer
print(long_to_bytes(m))            # the flag as bytes
```

Decrypt AES when the challenge gives you the key, mode, and IV. The mode decides whether you need an IV:

```python
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

# ECB: no IV
pt = AES.new(key, AES.MODE_ECB).decrypt(ct)

# CBC: needs the IV the challenge gave you
pt = AES.new(key, AES.MODE_CBC, iv=iv).decrypt(ct)
print(unpad(pt, 16))               # strip PKCS#7 padding
```

Read a public key file to pull out its modulus and exponent:

```python
from Crypto.PublicKey import RSA

key = RSA.import_key(open("key.pem", "rb").read())
print(key.n.bit_length(), key.e)   # 2048 65537
```

Hashing works through the `Crypto.Hash` modules, though Python's built-in `hashlib` covers the common ones too:

```python
from Crypto.Hash import SHA256
SHA256.new(b"bgsu").hexdigest()
```

## Common Pitfalls

- **The install name and import name differ.** You run `pip install pycryptodome` but write `import Crypto`. There is no module called `pycryptodome` to import.
- **Do not install `pycrypto`.** The old `pycrypto` package is unmaintained and conflicts with this one, because both provide the `Crypto` namespace. If a `Crypto` import behaves oddly, uninstall both and reinstall only `pycryptodome`. There is also `pycryptodomex`, which imports as `Cryptodome` and can sit beside a system `Crypto`.
- **AES wants bytes of the right length.** The key must be 16, 24, or 32 bytes, and the ciphertext length must be a multiple of 16 for ECB and CBC. Convert hex or Base64 to bytes first.
- **`unpad` raises on wrong padding.** If the key or mode is wrong, the decrypted bytes will not end in valid PKCS#7 padding and `unpad` throws a `ValueError`. That error usually means the key or IV is wrong, not that your code is.
- **Textbook RSA has no padding.** `pow(c, d, n)` is fine for challenges, but real code uses `Crypto.Cipher.PKCS1_OAEP`. The [Cursed Mirror write-up](/challenges/the-cursed-mirror) shows why the padding matters.

## References

- [PyCryptodome documentation](https://pycryptodome.readthedocs.io/)
- [Crypto.Util.number reference](https://pycryptodome.readthedocs.io/en/latest/src/util/util.html)
- [PKCS#1 OAEP](https://pycryptodome.readthedocs.io/en/latest/src/cipher/oaep.html)
