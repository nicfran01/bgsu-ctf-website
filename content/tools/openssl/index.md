---
name: OpenSSL
category: crypto
summary: Command-line toolkit for keys, certificates, hashes, and ciphers. Decrypts protected private keys and checks that a key matches a certificate.
platforms: [linux, macos, windows]
officialUrl: https://www.openssl.org/
tags: [tls, rsa, certificates, keys, hashing]
---

## What It Is

OpenSSL is the cryptography library behind much of the internet's TLS, and its `openssl` command exposes that library from the shell. You can inspect and convert keys and certificates, decrypt passphrase-protected keys, hash files, encrypt and decrypt with symmetric ciphers, and open TLS connections to servers.

## When To Use It

- Decrypting a passphrase-protected private key found in a challenge.
- Reading a certificate's subject, issuer, dates, and public key.
- Checking that a private key belongs to a certificate.
- Pulling the modulus and exponent out of an RSA key for a crypto challenge.
- Talking to a TLS service by hand with `s_client`.

## Installation

### Linux

Almost every distribution includes it. Check with `openssl version`. If it is missing: `sudo apt install openssl`.

### macOS

The built-in `/usr/bin/openssl` is LibreSSL, which accepts most of the same commands but differs in some options and messages. Install OpenSSL 3 for behavior that matches guides:

```bash
brew install openssl@3
```

Homebrew does not put it ahead of the system copy. Run `brew info openssl@3` for the line to add to your shell profile.

### Windows

Git for Windows includes `openssl` inside Git Bash. You can also use it from WSL, or install a Windows build from one of the third-party distributions listed on the OpenSSL wiki.

## Basic Usage

Decrypt a passphrase-protected private key:

```console
$ openssl rsa -in receipt-key.pem.enc -out server_dec.key -passin pass:Moonlit-Stacks-1031
writing RSA key
```

`openssl pkey` does the same for any key type. A file starting with `BEGIN ENCRYPTED PRIVATE KEY` is locked. After decrypting it starts with `BEGIN PRIVATE KEY`.

Read a certificate (`-inform DER` for binary certificates, the default is PEM):

```bash
openssl x509 -in cert.pem -noout -subject -issuer -dates
openssl x509 -inform DER -in server.der -noout -text
```

Check that a key and certificate match by comparing their moduli:

```bash
openssl x509 -in cert.pem -noout -modulus | openssl md5
openssl rsa -in server.key -noout -modulus | openssl md5
```

Print an RSA key's numbers (modulus, public exponent, primes):

```bash
openssl rsa -in key.pem -noout -text
openssl rsa -pubin -in public.pem -noout -text
```

Hashes and Base64:

```bash
openssl dgst -sha256 file.bin
openssl base64 -d -in encoded.txt -out decoded.bin
```

Connect to a TLS server and show its certificate chain:

```bash
openssl s_client -connect example.com:443 -servername example.com
```

## Common Pitfalls

- **Wrong passphrase messages vary.** OpenSSL 3 says `Could not find private key`, while older versions say `bad decrypt`. Both mean the passphrase is wrong (or the file is not a key).
- **PEM versus DER.** PEM is Base64 text with `-----BEGIN` lines. DER is the same data in binary. Add `-inform DER` for binary files.
- **Passwords in shell history.** `-passin pass:...` stores the passphrase in your history. Fine for a CTF, not for real keys. Leave it off to be prompted instead.
- **LibreSSL on macOS.** Some flags and output formats differ from OpenSSL 3. If a command from a guide fails on a Mac, try the Homebrew OpenSSL.

## References

- [OpenSSL documentation](https://docs.openssl.org/)
- [openssl-rsa manual](https://docs.openssl.org/3.0/man1/openssl-rsa/)
- [openssl-x509 manual](https://docs.openssl.org/3.0/man1/openssl-x509/)
