---
name: Binary Ninja
category: reverse
summary: A disassembler and decompiler with a free edition, used to read compiled programs as readable pseudo-code.
platforms: [linux, macos, windows, web]
officialUrl: https://binary.ninja/
tags: [disassembler, decompiler, reverse-engineering, xrefs]
---

## What It Is

Binary Ninja opens a compiled program (an ELF, a Windows `.exe`, a Mach-O, or raw firmware) and turns its machine code into views you can read: a disassembly, and higher-level views called Medium Level IL and High Level IL (HLIL). HLIL reads close to C. It also lists every function, string, and symbol, and shows where each one is used. A free edition runs locally, and Binary Ninja Cloud runs in the browser.

## When To Use It

- Reverse engineering challenges where you get a binary instead of source code.
- Finding which function uses a string, and which functions call that function.
- Reading the logic of a check (a password compare, a math condition, a decryption loop) so you can reproduce or satisfy it.
- Copying constants and data tables out of a binary into a solve script.

[Ghidra](/tools/ghidra) does the same job for free with no limits on commercial use. Many people keep both and use whichever decompiler output reads better for a given function.

## Installation

### Linux, macOS, and Windows

Go to https://binary.ninja/free/, enter an email address, and download the installer for your platform from the link you receive. The free edition is for non-commercial use, which covers club work and CTFs.

- **Windows:** run the installer.
- **macOS:** open the `.dmg` and drag Binary Ninja into Applications.
- **Linux:** unzip the archive and run `binaryninja/binaryninja`. The included `scripts/linux-setup.sh` adds a desktop entry.

### Browser

Binary Ninja Cloud at https://cloud.binary.ninja/ needs only an account. Uploaded files go to Vector 35's servers, so do not use it for anything you are not allowed to share.

## Basic Usage

1. **Open the file** with File > Open and let analysis finish (the progress bar in the bottom right).
2. **Pick a view.** The view selector at the top of the main pane switches between Linear, Graph, and the IL levels. **High Level IL** is the easiest to read.
3. **Start at `main`.** Find it in the **Symbols** list on the left (filter by name) and double-click it.
4. **Search strings.** Open the **Strings** view from the sidebar and filter, for example on `BOO{` or `PSFT`.
5. **Follow cross references.** Select a function, string, or data label and open the **Cross References** panel to see everything that uses it. Zero references to a function means nothing calls it.
6. **Rename as you go.** Select a variable or function and press `N` to give it a meaningful name. The rename appears everywhere it is used.
7. **Read data.** Double-click a data label (such as a byte array) to jump to it in the linear view and copy its bytes.

A typical reversing loop: run the program to see its prompts and errors, find those strings in the Strings view, follow them to the function that prints them, and read that function's checks in HLIL.

## Common Pitfalls

- **Opening the stripped build.** If a challenge ships a Linux build "with symbols kept" and a Windows build, open the one with symbols. Function names like `validate_license` save a lot of time.
- **Trusting function names.** A function called `reveal_flag` may never run. Check its cross references.
- **Hex constants.** Decompilers show constants in hex, such as `0x1eef`. Hover over them or convert them (7919) before writing your solve script.
- **Patching instead of understanding.** If the flag is decrypted with your input as the key, jumping past a check prints garbage. Solve the check instead.

## References

- [Binary Ninja user guide](https://docs.binary.ninja/guide/index.html)
- [Binary Ninja free edition](https://binary.ninja/free/)
- [Binary Ninja Cloud](https://cloud.binary.ninja/)
