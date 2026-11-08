---
name: hashcat
category: password
summary: A fast, GPU-driven password cracker that recovers passwords from hashes using wordlists, rules, and masks.
platforms: [linux, macos, windows]
officialUrl: https://hashcat.net/hashcat/
caution: "Crack only hashes from a challenge you are solving, or ones you made yourself to practice. Do not run it against hashes or passwords that belong to other people or to BGSU accounts and systems."
tags: [password, cracking, hashes, gpu, masks]
---

## What It Is

hashcat guesses passwords and checks each guess against a hash until one matches. Its strength is speed: it runs the hashing on a GPU, so it tries billions of candidates a second for fast hashes like MD5. You tell it the hash type with a mode number (`-m`), the attack style with `-a`, and give it a wordlist or a mask that describes the shape of the password. It works on a CPU too, just slower.

## When To Use It

- You have a large list of hashes and want to crack them as fast as the hardware allows.
- The password follows a pattern you can describe, such as a word plus four digits, which a mask attack handles well.
- A wordlist alone did not work and you want to add rules or brute force a known shape.

For automatic format detection and for cracking protected files (ZIP, PDF, SSH keys), [John the Ripper](/tools/john-the-ripper) is often the easier starting point. hashcat is the choice when raw speed matters.

## Installation

### Linux

Kali ships hashcat. On Debian and Ubuntu:

```bash
sudo apt update && sudo apt install hashcat
```

For GPU cracking you also need the vendor driver (NVIDIA CUDA or the AMD ROCm stack). Without it, hashcat falls back to the CPU.

### macOS

```bash
brew install hashcat
```

hashcat uses the Metal and OpenCL support built into macOS.

### Windows

Download the archive from [hashcat.net](https://hashcat.net/hashcat/), unzip it, and run `hashcat.exe` from a terminal in that folder. The GPU drivers from NVIDIA or AMD provide the OpenCL or CUDA runtime it needs.

## Basic Usage

The two numbers you always set are the hash mode (`-m`) and the attack mode (`-a`). Mode `-m 0` is MD5; `-a 0` is a wordlist attack. Put the hash in a file, one per line:

```bash
hashcat -m 0 -a 0 hashes.txt rockyou.txt
```

Show the cracked passwords after a run (hashcat stores results in its potfile):

```console
$ hashcat -m 0 hashes.txt --show
7511a4ad749a776656b4dede8706c917:falcons2026
```

If you are not sure of the hash type, let hashcat suggest the mode:

```bash
hashcat --identify hashes.txt
```

A mask attack (`-a 3`) brute forces a known shape. Each `?d` is a digit, `?l` a lowercase letter, `?u` uppercase, `?a` any printable. This tries `bgsu` followed by four digits:

```bash
hashcat -m 0 -a 3 hashes.txt 'bgsu?d?d?d?d'
```

Add rules to a wordlist attack to mangle each word. The bundled `best64.rule` is a good first try:

```bash
hashcat -m 0 -a 0 hashes.txt rockyou.txt -r rules/best64.rule
```

Common mode numbers:

| `-m` | Hash type |
| --- | --- |
| `0` | MD5 |
| `100` | SHA1 |
| `1400` | SHA256 |
| `1800` | sha512crypt (`$6$`, Linux shadow) |
| `3200` | bcrypt (`$2*$`) |
| `22000` | WPA/WPA2 handshake |

## Common Pitfalls

- **Wrong mode number.** Each hash type has its own `-m`. A SHA256 hash run as `-m 0` will never crack. Use `--identify` or the [example hashes page](https://hashcat.net/wiki/doku.php?id=example_hashes) to pick the right one.
- **Mask attacks grow fast.** Each extra `?a` multiplies the work by 95. A short, specific mask finishes; a long open one does not. Describe as much of the shape as you know.
- **Results are cached in the potfile.** A re-run says "All hashes found in potfile" and prints nothing new. Use `--show` to see them, or `--potfile-disable` to force a fresh run.
- **No GPU driver means CPU speed.** If hashcat only lists a CPU device, the vendor GPU driver is missing. It still works, just much slower.
- **Salts and formats.** Some modes need the salt bundled with the hash in a specific layout. Check the example hashes page for the exact format before you blame the password.

## References

- [hashcat wiki](https://hashcat.net/wiki/)
- [Example hashes and mode numbers](https://hashcat.net/wiki/doku.php?id=example_hashes)
- [Mask attack reference](https://hashcat.net/wiki/doku.php?id=mask_attack)
