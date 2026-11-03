---
name: Python 3
category: general
summary: The scripting language behind most CTF solve scripts, from brute force loops to decoding bytes and talking to servers.
platforms: [linux, macos, windows]
officialUrl: https://www.python.org/
tags: [scripting, crypto, pycryptodome, bytes]
---

## What It Is

Python is a general-purpose programming language with a large standard library. In CTFs it is the default tool for anything that needs a loop, math on big integers, or careful handling of bytes. Python integers have no size limit, which makes RSA and Diffie-Hellman challenges easy to script, and modules like `base64`, `hashlib`, and `struct` cover most encodings out of the box.

## When To Use It

- Brute force: trying every key, PIN, or exponent until a check passes.
- Number theory: modular exponentiation, modular inverses, and big-integer math for RSA and Diffie-Hellman.
- Reimplementing logic you reversed from a binary, such as a decryption loop.
- Decoding and reassembling data pulled out of files or packet captures.
- Automating requests to a challenge server.

For a one-off decode, [CyberChef](/tools/cyberchef) is often quicker.

## Installation

### Linux

Most distributions ship Python 3. Check with `python3 --version`. On Debian, Ubuntu, and Kali, add pip and virtual environment support:

```bash
sudo apt update && sudo apt install python3 python3-pip python3-venv
```

### macOS

macOS includes a `python3` command after the Xcode Command Line Tools are installed. For a current version, use Homebrew or the installer from python.org:

```bash
brew install python
```

### Windows

Download the installer from python.org and check **Add python.exe to PATH** on the first screen. Then use `python` (or `py`) in PowerShell. You can also install it from the Microsoft Store.

### Libraries for CTFs

Use a virtual environment so packages stay with the project:

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install pycryptodome requests
```

`pycryptodome` provides `Crypto.Util.number` (`long_to_bytes`, `bytes_to_long`, `isPrime`) and real ciphers. `requests` handles HTTP.

## Basic Usage

Bytes and encodings:

```python
import base64
bytes.fromhex("424f4f7b")                     # b'BOO{'
base64.b64decode("Qk9Pew==")                  # b'BOO{'
int.from_bytes(base64.b64decode("k57F"), "big")   # 9674437
(9674437).to_bytes(3, "big")                  # b'\x93\x9e\xc5'
```

XOR two byte strings:

```python
data = bytes.fromhex("383d292f21")
print(bytes(b ^ 0x5a for b in data))          # b'bgsu{'
```

Modular math (fast even for 2048-bit numbers):

```python
pow(3, 9601566, 12345701)                     # modular exponentiation
pow(7919, -1, 1000003)                        # modular inverse (Python 3.8+)
```

Hashing:

```python
import hashlib
hashlib.sha256(b"10043623").hexdigest()
```

Run a one-liner from the shell:

```console
$ python3 -c 'print(bytes.fromhex("424F4F7B405F483358314E475F43555235457D").decode())'
BOO{@_H3X1NG_CUR5E}
```

## Common Pitfalls

- **`str` versus `bytes`.** `"abc"` is text and `b"abc"` is bytes. Hashing, XOR, and sockets need bytes, so call `.encode()` on text first.
- **`g ** x % p` on big numbers.** This builds the full power before reducing it and can take forever. Use `pow(g, x, p)`.
- **`python` versus `python3`.** On Linux and macOS, `python` may be missing or point to Python 2. Use `python3` unless you are inside a virtual environment.
- **Installing packages globally.** Recent Linux distributions block `pip install` outside a virtual environment. Create one with `python3 -m venv .venv` first.
- **The `Crypto` import name.** pycryptodome installs as `pycryptodome` but imports as `Crypto`. Do not also install the old `pycrypto` package.

## References

- [Python tutorial](https://docs.python.org/3/tutorial/)
- [Python documentation: bytes and bytearray](https://docs.python.org/3/library/stdtypes.html#binary-sequence-types-bytes-bytearray-memoryview)
- [PyCryptodome documentation](https://pycryptodome.readthedocs.io/)
