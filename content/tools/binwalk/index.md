---
name: binwalk
category: forensics
summary: Scans a file for other files hidden inside it, such as a ZIP appended to a PNG, and extracts them.
platforms: [linux, macos]
officialUrl: https://github.com/ReFirmLabs/binwalk
tags: [carving, file-signatures, appended-data, firmware, steganography]
---

## What It Is

binwalk scans a file byte by byte for known file signatures (the "magic bytes" at the start of PNGs, ZIPs, gzip streams, filesystems, and many more) and reports the offset of each one. It was built for firmware images, which pack many files together, and it is just as useful for CTF files that hide an archive behind an image. With `-e` it also extracts what it finds. Version 3 is a rewrite in Rust and is much faster than the older Python version.

## When To Use It

- Any image or file that seems larger than its visible content needs.
- Checking whether data was appended after the end of a PNG, JPEG, or GIF.
- Pulling files out of firmware images or disk blobs.
- Measuring entropy (`-E`) to spot compressed or encrypted regions.

## Installation

### Linux

```bash
sudo apt install binwalk      # Debian, Ubuntu, Kali
```

Distribution packages may still be the older Python version 2, which works the same for scanning. Version 3 can be installed with Rust's package manager: `cargo install binwalk`.

### macOS

```bash
brew install binwalk
```

### Windows

binwalk does not run natively on Windows. Use it inside WSL (Windows Subsystem for Linux) with the Linux instructions, or in a Kali virtual machine.

## Basic Usage

Scan a file:

```console
$ binwalk the_perch_flyer.png
DECIMAL                            HEXADECIMAL                        DESCRIPTION
---------------------------------------------------------------------------------------
0                                  0x0                                PNG image, total size: 48228 bytes
48228                              0xBC64                             ZIP archive, file count: 1, total size: 172 bytes
```

The PNG ends at byte 48228 and a ZIP starts there, so something was glued on after the image.

Extract everything it finds:

```bash
binwalk -e the_perch_flyer.png
```

Version 3 writes the results to an `extractions/` folder (change it with `-C`). Version 2 writes to a folder named `_the_perch_flyer.png.extracted/`.

Recursively extract files found inside extracted files:

```bash
binwalk -Me firmware.bin
```

Carve one region by hand with `dd`, using the offset from the scan:

```bash
dd if=the_perch_flyer.png of=hidden.zip bs=1 skip=48228
```

For an appended ZIP, `unzip` often works directly on the original file, because ZIP readers look for their directory at the end of the file. It prints a harmless "extra bytes at beginning" warning.

## Common Pitfalls

- **False positives.** Short signatures match random data. A "found" JPEG in the middle of compressed data is often noise. Trust results that line up with the end of a real file.
- **Encrypted archives.** binwalk finds and extracts a password-protected ZIP, but the files inside stay locked. Look for the password elsewhere in the challenge.
- **Different output folders between versions.** Check which version you have (`binwalk --version`) before looking for extracted files.
- **Data hidden inside the image itself.** binwalk only finds embedded files. Text hidden in pixel bit planes needs [Stegsolve](/tools/stegsolve) or similar.

## References

- [binwalk on GitHub](https://github.com/ReFirmLabs/binwalk)
- [binwalk wiki](https://github.com/ReFirmLabs/binwalk/wiki)
