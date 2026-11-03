---
name: Steghide
category: forensics
summary: Hides an encrypted file inside a JPEG, BMP, WAV, or AU file with a passphrase, and extracts it again when you have the passphrase.
platforms: [linux, macos, windows]
officialUrl: https://steghide.sourceforge.net/
tags: [steganography, jpeg, wav, passphrase]
---

## What It Is

Steghide is a command-line steganography program. It hides one file inside a JPEG, BMP, WAV, or AU file by making small changes to the image or audio data, and it encrypts the hidden file with a passphrase. The passphrase also decides where in the cover file the data goes, so without it you cannot find the data or read it. Steghide is old and simple, and it shows up in CTFs constantly.

## When To Use It

- A challenge gives you a JPEG, BMP, WAV, or AU file, especially alongside a word or phrase that could be a password.
- Checking whether a file holds Steghide data with `steghide info`.
- Ruling Steghide out before moving on to other techniques. It does not support PNG, GIF, or MP3.

## Installation

### Linux

```bash
sudo apt install steghide
```

### macOS

Steghide is not in Homebrew. Use MacPorts (`sudo port install steghide`) or run it inside the [Stego Toolkit](/tools/stego-toolkit) Docker container, which has it preinstalled.

### Windows

Download the Windows build (`steghide-0.5.1-win32.zip`) from the Steghide site, unzip it, and run `steghide.exe` from a terminal in that folder. WSL with the Linux instructions also works.

## Basic Usage

Check a file for embedded data. Steghide asks for the passphrase, or you can pass it with `-p`:

```console
$ steghide info birthday.jpg -p kewl
"birthday.jpg":
  format: jpeg
  capacity: 17.2 KB
  embedded file "flag.txt":
    size: 19.0 Byte
    encrypted: rijndael-128, cbc
    compressed: yes
```

Extract the hidden file into the current folder:

```console
$ steghide extract -sf birthday.jpg -p kewl
wrote extracted data to "flag.txt".
```

A wrong passphrase gives `could not extract any data with that passphrase!`.

Hide a file (useful for making practice challenges):

```bash
steghide embed -cf cover.jpg -ef secret.txt -p mypassword
```

Useful options:

| Option | What it does |
| --- | --- |
| `-sf file` | The stego file to extract from |
| `-cf file` | The cover file to hide data in |
| `-ef file` | The file to hide |
| `-p pass` | Passphrase (use `-p ""` for an empty one) |
| `-xf name` | Name for the extracted file |
| `-f` | Overwrite an existing output file |

### Cracking an unknown passphrase

When no password is anywhere in the challenge, **stegseek** tries a whole wordlist against a Steghide file very quickly:

```bash
stegseek stego.jpg rockyou.txt
```

## Common Pitfalls

- **Unsupported formats.** Steghide only handles JPEG, BMP, WAV, and AU. On a PNG or MP3 it says the format is not supported, which tells you to try something else.
- **Forgetting the empty passphrase.** Steghide accepts an empty passphrase. Try `-p ""` before guessing.
- **Existing output files.** If `flag.txt` already exists, Steghide asks before overwriting. Add `-f` in scripts.
- **No passphrase prompt in scripts.** Without `-p`, Steghide waits for keyboard input, which hangs a script.

## References

- [Steghide home page](https://steghide.sourceforge.net/)
- [stegseek on GitHub](https://github.com/RickdeJager/stegseek)
