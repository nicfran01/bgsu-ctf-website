---
name: CyberChef
category: crypto
summary: A browser tool for chaining encodings, decodings, ciphers, and conversions without writing code.
platforms: [web, linux, macos, windows]
officialUrl: https://gchq.github.io/CyberChef/
tags: [encoding, base64, hex, xor, decoding]
---

## What It Is

CyberChef is a web app from GCHQ that runs entirely in your browser. You build a "recipe" by dragging operations (From Base64, From Hex, XOR, ROT13, and several hundred more) into a list, and it applies them in order to whatever you paste in. Nothing you paste is sent to a server, and the whole app can be downloaded and run offline.

## When To Use It

- Decoding text you do not recognize yet: Base64, hex, binary, URL encoding, Base32, and others.
- Stacking several steps, for example **From Base64** then **XOR** with a known key.
- Trying all keys of a small cipher with **ROT13 Brute Force** or **XOR Brute Force**.
- Quick conversions during web and forensics challenges, such as decoding a cookie value or a string from a packet.

Once a solve needs loops or logic, such as brute-forcing millions of keys, a [Python](/tools/python) script is faster to write and run.

## Installation

### Any platform

Open https://gchq.github.io/CyberChef/ in a browser. There is nothing to install.

### Offline copy

On the CyberChef GitHub releases page, download the latest `CyberChef_vX.Y.Z.zip`, unzip it, and open the `CyberChef_vX.Y.Z.html` file inside. It works with no internet connection, which is useful at events with restricted networks.

## Basic Usage

1. Paste your data into the **Input** box (top right).
2. Search for an operation on the left, such as `From Base64`, and drag it into the **Recipe** column.
3. Read the result in the **Output** box. Add more operations below the first one to chain them.

Recipes used in club write-ups:

| Goal | Recipe |
| --- | --- |
| Decode Base64 | From Base64 |
| Decode wrapped hex | Remove whitespace, then From Hex |
| Decode 8-bit binary groups | From Binary (delimiter: Space) |
| Undo URL encoding | URL Decode |
| Undo a Caesar shift of 3 | ROT13 with Amount set to 23 |
| Try every Caesar shift | ROT13 Brute Force |
| Decode Base32, then a repeating XOR key | From Base32, then XOR (key `witchcraft`, type UTF8) |
| Decimal ASCII codes to text | From Decimal |

The **magic wand** icon that appears on the Output box means CyberChef recognized the output as another encoding. Click it to add the suggested operation. The **Magic** operation tries many decodings automatically and is a good first guess on unknown data.

Recipes are saved in the page URL, so you can copy the URL to share a working recipe with a teammate.

## Common Pitfalls

- **Line breaks in the input.** Strings copied from a file often wrap. Add **Remove whitespace** before decoders like From Hex, or the decode fails partway.
- **Wrong key type in XOR.** The XOR operation's key box has a type selector (Hex, UTF8, Base64, and others). A text key such as `witchcraft` needs UTF8.
- **Trusting Magic blindly.** Magic picks the most likely decoding, which is not always the right one. Check that the output is readable.
- **Pasting sensitive data into a shared recipe link.** The URL contains the input too. Clear the input before sharing.

## References

- [CyberChef](https://gchq.github.io/CyberChef/)
- [CyberChef on GitHub](https://github.com/gchq/CyberChef)
- [CyberChef wiki](https://github.com/gchq/CyberChef/wiki)
