---
name: xxd
category: general
summary: Shows the raw bytes of a file as hex next to their text form, and converts hex back into a file.
platforms: [linux, macos, windows]
officialUrl: https://github.com/vim/vim/tree/master/src/xxd
tags: [hex, hexdump, headers, bytes]
---

## What It Is

`xxd` prints a hex dump: each line shows an offset, sixteen bytes in hexadecimal, and the same bytes as text (with unprintable bytes shown as dots). It comes with Vim. It can also run in reverse, turning a hex dump back into a binary file, which makes small byte edits possible without a hex editor.

## When To Use It

- Reading a file's header to check its magic bytes, dimensions, or flags.
- Seeing exactly what changed when `file` reports `data` for a file that should be something else.
- Finding readable text mixed in with binary data.
- Quick byte edits: dump, edit the hex in a text editor, convert back.

## Installation

### Linux

Usually installed with Vim. If not: `sudo apt install xxd` (or `vim-common` on older systems).

### macOS

Included with macOS.

### Windows

Included with Git for Windows (in Git Bash) and with Vim for Windows. Also available in WSL.

## Basic Usage

Show the first lines of a file:

```console
$ xxd whats_my_label.png | head -2
00000000: 8950 4e47 0d0a 1a0a 0000 000d 4948 4452  .PNG........IHDR
00000010: 0000 0bd0 0000 0bb8 0806 0000 00b3 25b1  ..............%.
```

The left column is the offset in hex, the middle is the bytes, and the right is the text view. Here the bytes after `IHDR` are the image width (`0bd0` = 3024) and height (`0bb8` = 3000).

Useful options:

| Option | What it does |
| --- | --- |
| `-l 64` | Stop after 64 bytes |
| `-s 0x100` | Start at offset 0x100 |
| `-c 8` | Show 8 bytes per line instead of 16 |
| `-b` | Show bits instead of hex |
| `-p` | Plain hex with no offsets or text |
| `-r` | Reverse: turn a hex dump back into binary |

Edit bytes without a hex editor:

```bash
xxd file.png > file.hex
# change the bytes you want in file.hex with any text editor
xxd -r file.hex > fixed.png
```

Turn a hex string into a file:

```bash
echo 424f4f7b | xxd -r -p
```

## Common Pitfalls

- **Offsets are in hex.** `00000010` is byte 16, not byte 10.
- **Editing the text column does nothing.** `xxd -r` reads only the hex columns. Change the hex digits.
- **Checksums.** Changing header bytes in formats such as PNG breaks the stored CRC. Recalculate it after editing.

## References

- [xxd manual page](https://manpages.debian.org/unstable/xxd/xxd.1.en.html)
- [Wikipedia: Hex dump](https://en.wikipedia.org/wiki/Hex_dump)
