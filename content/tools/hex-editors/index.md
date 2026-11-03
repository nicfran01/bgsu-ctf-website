---
name: Hex Editors (Hex Fiend, HxD, ImHex)
category: general
summary: Graphical editors for viewing and changing the raw bytes of a file, with search, offsets, and data interpretation.
platforms: [linux, macos, windows]
officialUrl: https://hexfiend.com/
tags: [hex, bytes, headers, file-repair]
---

## What It Is

A hex editor opens any file as raw bytes, shown as hexadecimal with a text column beside it, and lets you change, insert, or delete individual bytes. Good ones also show what the selected bytes mean as numbers (for example a 4-byte big-endian integer), search for byte patterns, and handle files of any size. Three free ones cover every platform:

- **Hex Fiend:** macOS, fast and simple.
- **HxD:** Windows, the long-standing standard there.
- **ImHex:** Linux, macOS, and Windows, with a pattern language that can label every field of a file format.

## When To Use It

- Fixing a damaged or edited file header, such as a PNG whose height was changed or a file with the wrong magic bytes.
- Reading the exact value of a field at a known offset.
- Carving or deleting a section of a file by hand.
- Comparing two versions of a file byte by byte.

For a quick look without editing, [xxd](/tools/xxd) in a terminal is often enough.

## Installation

### macOS

Download Hex Fiend from https://hexfiend.com/ or the Mac App Store, or `brew install --cask hex-fiend`.

### Windows

Download HxD from https://mh-nexus.de/en/hxd/ (installer or portable version).

### Linux

Install ImHex from its GitHub releases page (AppImage, Flatpak, and distribution packages are available).

## Basic Usage

These steps work the same way in all three editors:

1. **Open the file.** The left column is the offset, the middle is the bytes, and the right is the text view.
2. **Go to an offset.** Use the editor's Go To command (Cmd+L in Hex Fiend, Ctrl+G in HxD and ImHex) and type the offset.
3. **Read a value.** Select bytes and check the data inspector panel, which shows them as integers in both byte orders. PNG and most network formats use big-endian.
4. **Edit.** Click a hex digit and type over it. Overwrite mode keeps the file the same size, which is what you want for header fixes.
5. **Save a copy.** Use Save As so you keep the original.

Example: a PNG's height is the 4 bytes at offset 20 (`0x14`). To restore a height of 4032, overwrite `00 00 0B B8` with `00 00 0F C0`. Then fix the chunk's CRC (offset 29 to 32), or some viewers will refuse the file. A short Python script with `zlib.crc32` computes it.

## Common Pitfalls

- **Insert versus overwrite.** Typing in insert mode shifts every later byte and breaks the file. Header fixes need overwrite mode.
- **Decimal versus hex offsets.** Most editors show offsets in hex. Byte 20 is `0x14`.
- **Byte order.** The same 4 bytes mean different numbers in big-endian and little-endian. Check the format's specification.
- **Forgetting checksums.** Many formats (PNG, ZIP, gzip) store a CRC next to the data. Edit the data and the CRC no longer matches.

## References

- [Hex Fiend](https://hexfiend.com/)
- [HxD](https://mh-nexus.de/en/hxd/)
- [ImHex on GitHub](https://github.com/WerWolv/ImHex)
