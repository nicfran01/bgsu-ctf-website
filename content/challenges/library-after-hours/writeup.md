---
title: "Library After Hours"
category: network
difficulty: hard
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
author: Dawson R Pelter
tags: [pcap, wireshark, tls, rsa, openssl, http, smtp]
summary: A server's encrypted private key went out over HTTP and its passphrase went out over email. Put them together and Wireshark can decrypt the TLS session that carries the flag.
---

## Overview

Library After Hours chains three protocols. A staff network served a passphrase-protected private key over plain HTTP, emailed the passphrase over SMTP, and then a client fetched a receipt over HTTPS. Because the TLS session uses RSA key exchange, the server's private key is enough to decrypt the whole recorded session. The challenge teaches exporting files from a capture, decrypting a PKCS#8 key with OpenSSL, checking that a key matches a certificate, and loading a key into Wireshark to decrypt TLS.

## Challenge Description

> The library archive server sent a protected receipt over HTTPS. Someone on the staff network was careless with the key that protects it. Follow the evidence across protocols, then read the receipt.

Provided file: `hard_library_after_hours.pcap`. Tools: [Wireshark](/tools/wireshark), [OpenSSL](/tools/openssl), and optionally [Python 3](/tools/python).

## Recon

**Statistics > Conversations**, TCP tab, shows six conversations:

| Stream | Server | Port | What it is |
| --- | --- | --- | --- |
| 0 | 10.50.0.25 (mail) | 25 | SMTP session with an older email |
| 1, 2, 3 | 10.50.0.10 (intranet) | 8080 | Three HTTP requests |
| 4 | 10.50.0.25 (mail) | 25 | SMTP session with a newer email |
| 5 | 10.50.0.20 (archive) | 443 | TLS session carrying the receipt |

Stream 5 is the goal. Without a key it shows only opaque Application Data records, and the filter `http && tcp.stream eq 5` matches nothing.

## Walkthrough

### 1. Find the TLS cipher suite

Filter `tls.handshake.type == 2` to find the Server Hello (frame 118) and expand **Handshake Protocol: Server Hello**:

```text
Version: TLS 1.2 (0x0303)
Cipher Suite: TLS_RSA_WITH_AES_128_GCM_SHA256 (0x009c)
```

`TLS_RSA_...` means plain RSA key exchange. The client encrypts the session secret with the server's public key, so anyone with the server's private key can decrypt it from the capture and rebuild the session keys. That makes the private key the target.

### 2. Export the encrypted key from HTTP

Filter `http.request`. The three requests are `GET /` (frame 47), `GET /downloads/` (frame 58), and `GET /downloads/receipt-key.pem.enc` (frame 69). Use **File > Export Objects > HTTP** and save `receipt-key.pem.enc` (1878 bytes). From the command line:

```console
$ mkdir keyfiles
$ tshark -r hard_library_after_hours.pcap --export-objects http,keyfiles
$ head -1 keyfiles/receipt-key.pem.enc
-----BEGIN ENCRYPTED PRIVATE KEY-----
```

`ENCRYPTED PRIVATE KEY` is a PKCS#8 key locked with a passphrase.

### 3. Find the passphrase in the emails

Filter `frame contains "assphrase"` (this matches both "Passphrase" and "passphrase"). Two frames match, one in each SMTP stream. Follow each stream:

| Stream | Date | Subject | What it says |
| --- | --- | --- | --- |
| 0 | Fri, 30 Oct 2026 | Reminder: last year's key is retired | The 2025 key's passphrase was `Ravens-Reading-Room-2025`, and the new one will be sent separately |
| 4 | Sat, 31 Oct 2026 | Passphrase for receipt-key.pem.enc | `Passphrase for that file: Moonlit-Stacks-1031` |

The newer email names the file you have. The older passphrase is a decoy.

### 4. Decrypt the key with OpenSSL

```console
$ openssl rsa -in keyfiles/receipt-key.pem.enc -out server_dec.key -passin pass:Moonlit-Stacks-1031
writing RSA key
$ head -1 server_dec.key
-----BEGIN PRIVATE KEY-----
```

With the decoy passphrase, OpenSSL 3 prints `Could not find private key` (older versions say `bad decrypt`). On macOS, the built-in `openssl` is LibreSSL. Installing OpenSSL with Homebrew matches these steps exactly.

### 5. Check the key matches the certificate

Before setting up Wireshark, confirm this is the server's key. Export the certificate from frame 118 and compare the moduli:

```console
$ tshark -r hard_library_after_hours.pcap -Y "tls.handshake.type == 11" \
    -T fields -e tls.handshake.certificate | head -1 | tr -d ':' > cert.hex
$ python3 -c "open('server.der','wb').write(bytes.fromhex(open('cert.hex').read().strip().split(',')[0]))"
$ openssl x509 -inform DER -in server.der -noout -subject
subject=C=US, O=BGSU CTF Club Library Lab, CN=archive.library.bgsu.local
$ openssl x509 -inform DER -in server.der -noout -modulus | md5
30d671c4a0b17e0b00e29004bbc05000
$ openssl rsa -in server_dec.key -noout -modulus | md5
30d671c4a0b17e0b00e29004bbc05000
```

The hashes match. On Linux, use `md5sum` instead of `md5`.

### 6. Give Wireshark the key

In Wireshark 3.0 and later, open **Edit > Preferences > RSA Keys** (on macOS, **Wireshark > Settings > RSA Keys**), click **Add new keyfile...**, and choose `server_dec.key`. Wireshark reloads and tries the key on every RSA session in the capture.

Older guides use **Protocols > TLS > RSA keys list** with an IP address, port, and protocol for each key. Recent versions treat that setting as obsolete, and the RSA Keys page above works without the extra fields.

The command line equivalent:

```console
$ tshark -r hard_library_after_hours.pcap -o 'uat:rsa_keys:"server_dec.key",""' \
    -Y "http && tcp.stream eq 5" -T fields -e frame.number -e http.request.uri -e http.response.code
124   /archive/receipt?id=HW-1031-0042
130   /archive/receipt?id=HW-1031-0042   200
```

### 7. Read the receipt

Right-click a packet in stream 5 and choose **Follow > TLS Stream**. The decrypted response body:

```text
LIBRARY AFTER HOURS - ARCHIVE RECEIPT
Receipt: HW-1031-0042
Item: Special Collections Box 13 (Ghost Stories of Wood County)
Checked out by: night-shift
Status: SEALED FOR HALLOWEEN

Verification fragments (assemble in numeric order):
FRAGMENT 4/5: private_
FRAGMENT 2/5: rsa_decryption_
FRAGMENT 5/5: key}
FRAGMENT 1/5: BOO{tls_
FRAGMENT 3/5: wire_
Please return Box 13 before sunrise.
```

### 8. Put the fragments in order

Sort by the number before the slash: `BOO{tls_` + `rsa_decryption_` + `wire_` + `private_` + `key}`.

## Solution

```console
$ tshark -r hard_library_after_hours.pcap --export-objects http,keyfiles
$ openssl rsa -in keyfiles/receipt-key.pem.enc -out server_dec.key -passin pass:Moonlit-Stacks-1031
$ tshark -r hard_library_after_hours.pcap -o 'uat:rsa_keys:"server_dec.key",""' \
    -q -z follow,http,ascii,5 | grep -a FRAGMENT
FRAGMENT 4/5: private_
FRAGMENT 2/5: rsa_decryption_
FRAGMENT 5/5: key}
FRAGMENT 1/5: BOO{tls_
FRAGMENT 3/5: wire_
```

In tshark 4.6, `follow,tls` counts TLS streams separately from TCP streams, so this session is TLS stream 0. Following the HTTP inside it by TCP stream 5 avoids the mix-up.

`assemble.py` in the challenge files sorts the fragment lines:

```python
lines = """
FRAGMENT 4/5: private_
FRAGMENT 2/5: rsa_decryption_
FRAGMENT 5/5: key}
FRAGMENT 1/5: BOO{tls_
FRAGMENT 3/5: wire_
"""

parts = {}
for line in lines.strip().splitlines():
    head, text = line.split(": ", 1)
    parts[int(head.split()[1].split("/")[0])] = text
print("".join(parts[n] for n in sorted(parts)))
```

```console
$ python3 assemble.py
BOO{tls_rsa_decryption_wire_private_key}
```

If Wireshark still shows only Application Data after adding the key, check that the key file starts with `BEGIN PRIVATE KEY` (not `BEGIN ENCRYPTED`), then use **View > Reload**.

## Flag

```text
BOO{tls_rsa_decryption_wire_private_key}
```

## Takeaways

- Look across protocols. The key came from HTTP, the passphrase from SMTP, and the flag from TLS.
- In any TLS capture, read the Server Hello first. A `TLS_RSA_...` suite can be decrypted with the server's private key. An `ECDHE` suite cannot, because each session uses a fresh temporary key (forward secrecy). TLS 1.3 removed RSA key exchange for this reason.
- Not every email is current. Read all of them and check which one applies to your file.
- Compare a key's modulus with the certificate's before troubleshooting Wireshark settings.
- The real failure was secret handling: the key traveled over plain HTTP and its passphrase over unencrypted email. Keys belong in a secrets manager, and passphrases should never travel through the same network the key does.

## References

- [Wireshark wiki: TLS decryption](https://wiki.wireshark.org/TLS#tls-decryption)
- [OpenSSL documentation: openssl-rsa](https://docs.openssl.org/3.0/man1/openssl-rsa/)
- [RFC 5246: TLS 1.2, RSA key exchange](https://www.rfc-editor.org/rfc/rfc5246#section-7.4.7.1)
