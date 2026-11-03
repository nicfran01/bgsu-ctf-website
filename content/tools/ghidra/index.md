---
name: Ghidra
category: reverse
summary: The NSA's free, open source reverse engineering suite, with a disassembler and a C-like decompiler.
platforms: [linux, macos, windows]
officialUrl: https://ghidra-sre.org/
tags: [disassembler, decompiler, reverse-engineering, java]
---

## What It Is

Ghidra is a reverse engineering tool released as open source by the NSA. It disassembles compiled programs for many processor types and includes a decompiler that turns functions back into C-like code. It is free with no restrictions, scriptable in Java and Python, and runs on any system with a Java runtime.

## When To Use It

- Reverse engineering challenges where you only have a compiled binary.
- When you want a free decompiler with no license limits.
- Comparing decompiler output: when [Binary Ninja](/tools/binary-ninja) output is hard to read for a function, Ghidra's is often different enough to help, and the other way around.

## Installation

Ghidra needs a 64-bit Java Development Kit (JDK). Recent releases (11.2 and later) require JDK 21.

### Linux

On Kali, `sudo apt install ghidra` installs it with its dependencies. On other distributions, install a JDK (for example `sudo apt install openjdk-21-jdk`), download the release zip from GitHub, unzip it, and run `./ghidraRun`.

### macOS

```bash
brew install --cask ghidra
```

Or install a JDK 21 (for example `brew install openjdk@21`), download the release zip, and run `./ghidraRun` from the unzipped folder.

### Windows

Install a JDK 21 (Eclipse Temurin or Microsoft Build of OpenJDK), download the release zip from GitHub, unzip it, and double-click `ghidraRun.bat`.

## Basic Usage

1. **Create a project.** File > New Project > Non-Shared Project, then pick a folder.
2. **Import the binary.** File > Import File, accept the detected format, then double-click the file in the project to open the **CodeBrowser**.
3. **Analyze.** Say yes when asked to analyze, and keep the default analyzers.
4. **Find `main`.** In the **Symbol Tree** on the left, open Functions and filter by name. Clicking a function shows its assembly in the Listing and its C-like version in the **Decompile** window on the right.
5. **Search strings.** Search > For Strings lists every string. Double-click one to jump to it.
6. **Follow references.** Right-click a function or label and choose References > Show References to. The list shows every place that uses it.
7. **Rename and retype.** Click a variable in the Decompile window and press `L` to rename it. Right-click > Retype Variable fixes types, which often makes the output much clearer.
8. **Jump to an address.** Press `G` and type an address or label.

## Common Pitfalls

- **Wrong Java version.** Ghidra refuses to start, or asks for a JDK path, if the installed Java is too old. Install the JDK version listed in the release notes.
- **Skipping analysis.** Without auto-analysis, functions and strings are missing. Run Analysis > Auto Analyze if you skipped it.
- **Undefined data.** Byte arrays sometimes show as single `undefined` bytes. Select the range and press `[` or right-click > Data > Create Array to make them readable.
- **Trusting names.** A function named like a flag printer may never be called. Check its references before spending time on it.

## References

- [Ghidra on GitHub](https://github.com/NationalSecurityAgency/ghidra)
- [Ghidra Cheat Sheet](https://ghidra-sre.org/CheatSheet.html)
- [Ghidra getting started guide](https://github.com/NationalSecurityAgency/ghidra/blob/master/GhidraDocs/GettingStarted.md)
