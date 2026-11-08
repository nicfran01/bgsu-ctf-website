---
name: pwntools
category: pwn
summary: A Python library for exploitation challenges that connects to a service, converts addresses to and from bytes, and builds payloads without boilerplate.
platforms: [linux, macos]
officialUrl: https://docs.pwntools.com/
tags: [pwn, exploitation, python, sockets, binary]
---

## What It Is

pwntools is a Python library for writing exploit scripts. It wraps the parts of a pwn challenge that are the same every time: opening a connection to a remote service or a local binary, reading until a prompt appears, sending a line, and converting numbers to and from the little-endian bytes a program expects. One import gives you `remote`, `process`, `p64`, `u64`, `cyclic`, and the rest, so a solve script stays short and reads like the steps you would do by hand.

It is built for Linux. On macOS the networking and byte-packing helpers work, but running and debugging local ELF binaries needs a Linux machine or a container.

## When To Use It

- Talking to a pwn or crypto service over TCP, especially when you send and receive many times in a loop.
- Building payloads for a buffer overflow: a cyclic pattern to find the offset, then packed addresses for the return address.
- Running a local binary and attaching a debugger to it while you work out the exploit.
- Any challenge where you would otherwise write raw `socket` code and `struct.pack` calls by hand.

For a single HTTP request, [curl](/tools/curl) is faster. For math-only crypto with no network, plain [Python](/tools/python) and [pycryptodome](/tools/pycryptodome) are enough.

## Installation

pwntools needs Python 3. Install it in a virtual environment so it stays with the project.

### Linux

Kali ships pwntools. On Debian and Ubuntu, install the build dependencies first, then the package:

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv build-essential
python3 -m venv .venv && source .venv/bin/activate
pip install pwntools
```

### macOS

The library installs with pip, and the `remote`, packing, and encoding helpers all work:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install pwntools
```

Running local ELF binaries (`process`) and `gdb` integration do not work on macOS. Use a Linux VM, WSL, or a container such as the [Stego Toolkit](/tools/stego-toolkit) approach with a pwn image for that part.

### Windows

Use WSL2 with an Ubuntu install and follow the Linux steps inside it. pwntools is not supported on native Windows.

## Basic Usage

A script usually starts with one import that pulls in everything:

```python
from pwn import *
```

Connect to a remote service, read a prompt, and send an answer. This loop solves a "answer three math questions" service:

```python
io = remote("chal.example.com", 31337)
io.recvline()                       # banner
for _ in range(3):
    q = io.recvuntil(b"> ").decode()
    a, b = re.findall(r"\d+", q)    # pull the two numbers out of the prompt
    io.sendline(str(int(a) + int(b)).encode())
print(io.recvline().decode().strip())
```

Convert addresses to and from bytes. `p64` turns a number into 8 little-endian bytes, and `u64` turns bytes back into a number:

```python
p64(0x401136)                       # b'6\x11@\x00\x00\x00\x00\x00'
u64(b"\x36\x11\x40\x00\x00\x00\x00\x00")   # 0x401136
p32(0xdeadbeef)                     # b'\xef\xbe\xad\xde'
```

Find the offset to the return address with a cyclic pattern. Send `cyclic(200)`, read the four bytes that landed in the crashed instruction pointer, and ask where they came from:

```python
cyclic(20)                          # b'aaaabaaacaaadaaaeaaa'
cyclic_find(b"faaa")                # 20
```

Other helpers you will reach for:

```python
xor(b"bgsu", 0x20)                  # b'BGSU'  (xor each byte with a key)
enhex(b"BOO{")                      # '424f4f7b'
unhex("424f4f7b")                   # b'BOO{'
io.interactive()                    # hand the connection to your keyboard
```

Run the same script against a local copy before pointing it at the server by switching `remote(...)` for `process("./chal")` on Linux.

## Common Pitfalls

- **Text versus bytes.** `send`, `recv`, and the packing helpers work on bytes. Call `.encode()` on strings before sending and `.decode()` on what you receive, or the script raises a `TypeError`.
- **`recv` versus `recvuntil`.** Plain `recv()` returns whatever has arrived so far, which may be half a line. Use `recvuntil(b"> ")` or `recvline()` so you read a full, known chunk before replying.
- **`sendline` adds a newline, `send` does not.** Most services read a line at a time and will hang if you forget the newline. Use `sendline` for line-based prompts.
- **macOS and local binaries.** `process("./chal")` and `gdb.attach` need Linux. On macOS they fail, so test the exploit over the network or inside a Linux VM.
- **The update check prints on import.** The banner about checking for new versions is normal. Set `interval=never` in `~/.config/pwn.conf` to silence it.

## References

- [pwntools documentation](https://docs.pwntools.com/)
- [pwntools tutorials](https://github.com/Gallopsled/pwntools-tutorial)
- [Installation guide](https://docs.pwntools.com/en/stable/install.html)
