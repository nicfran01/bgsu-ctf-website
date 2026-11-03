---
title: "The Forgotten License Key"
category: reverse
difficulty: easy
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
points: 100
author: Austin Paul Opsomer
tags: [cross-references, strings, strcmp, binary-ninja, decoys]
summary: A license checker is full of key-shaped strings, and only one of them is ever compared against your input. Follow the cross-references to find it.
---

## Overview

The Forgotten License Key is a small license checker with about eight key-shaped strings in it. Only one is ever compared against what you type. The others are revoked keys, a debug key, and a "backup activation key" that lives in a function nothing calls. The challenge teaches the core reverse engineering habit: a string is a clue, so trace it to the code that uses it before you trust it.

## Challenge Description

> A dusty CD-ROM labeled *"PumpkinSoft Licensing Manager v2.3 — DO NOT LOSE"* turned up in a box of old club equipment. The program still runs, but nobody remembers the license key, and the "premium features" stay locked without it.
>
> The developer clearly left a few things behind in the binary. Some of them are useful, and some are going to waste your time. Find the license key the program actually accepts, and it will hand over the flag.

Provided files:

| File | Platform |
| --- | --- |
| `license_check` | Linux x86-64, statically linked, function names kept |
| `license_check.exe` | Windows x86-64, same program |

The Linux build keeps its symbol names, so it is the better one to open in a disassembler. Run it with `chmod +x license_check && ./license_check`. Suggested tools: [Binary Ninja](/tools/binary-ninja) (the free edition works) or [Ghidra](/tools/ghidra).

## Recon

Running the program once shows what it wants:

```console
$ ./license_check
==============================================
  PumpkinSoft Licensing Manager v2.3
  (c) 1998 PumpkinSoft Ltd. All rights reserved
==============================================
Enter license key: AAAA
Malformed key. Expected format: PSFT-XXXX-XXXX-XXXX
```

Searching for the flag directly finds nothing, because the flag is not stored in plaintext:

```console
$ strings license_check | grep 'BOO{'
$
```

Searching for key-shaped strings turns up far too many to guess from:

```console
$ strings -n 8 license_check | grep -E 'PSFT|TRIAL'
[debug] backup activation key: PSFT-B4CK-UP00-K3Y5
PSFT-7G2K-PL9Q-4XWM
PSFT-Q1ZA-9LDK-5UJF
Malformed key. Expected format: PSFT-XXXX-XXXX-XXXX
PSFT-8W3N-K2DX-MR7C
PSFT-H8VE-2RTN-C6YB
PSFT-ZK4T-W0MB-8DRE
TRIAL-30DAY-EVAL-KEY
PSFT-0000-DEMO-0000
```

Open `license_check` in Binary Ninja and let analysis finish. The same strings are in the **Strings** view (filter on `PSFT`), and from there you can see which code uses each one.

## Walkthrough

### 1. Follow each string to the function that uses it

Click a string, then open the **Cross References** panel (or press `X` on the string in linear view) to see which function reads it.

| String | Used by | What happens if you enter it |
| --- | --- | --- |
| `PSFT-7G2K-...`, `PSFT-H8VE-...`, `PSFT-Q1ZA-...`, `PSFT-ZK4T-...` | `REVOKED_KEYS` table, read by `is_revoked` | "This license key has been revoked." |
| `TRIAL-30DAY-EVAL-KEY` | `is_trial_key` | "Trial period expired on 1999-10-31. Please purchase a full license." |
| `PSFT-0000-DEMO-0000` | `is_debug_key` | "Debug keys are disabled in release builds." |
| `PSFT-B4CK-UP00-K3Y5` | `dump_debug_info` | "Invalid license key." |
| `PSFT-8W3N-K2DX-MR7C` | `validate_license` | Unlocks the program |
| `PSFT-XXXX-XXXX-XXXX` | the malformed-key error message | Only a format hint |

### 2. Rule out the "backup activation key"

`PSFT-B4CK-UP00-K3Y5` is the most tempting string, because it is labeled as a backup activation key. Check the cross references of the function that uses it, `dump_debug_info`: **nothing calls it**. A function with no callers is dead code, so its key can never unlock anything.

### 3. Read `validate_license`

In High Level IL, `validate_license` is one line:

```c
return strcmp(arg1, "PSFT-8W3N-K2DX-MR7C") == 0;
```

### 4. Confirm the path from `main`

`main` reads a line and runs it through checks in this order: `is_trial_key`, `check_format` (19 characters with `-` at positions 4, 9, and 14), `is_debug_key`, `is_revoked`, and finally `validate_license`. When `validate_license` returns nonzero, `main` calls `unlock_features`, which prints the flag.

### 5. Run it with the key

```console
$ ./license_check
==============================================
  PumpkinSoft Licensing Manager v2.3
  (c) 1998 PumpkinSoft Ltd. All rights reserved
==============================================
Enter license key: PSFT-8W3N-K2DX-MR7C
License accepted. Premium features unlocked!
Activation token: BOO{xr3fs_m4rk_th3_sp0t}
```

## Solution

The key is `PSFT-8W3N-K2DX-MR7C`. Typing it into the program prints the flag.

If you cannot run the binary, you can decrypt the flag without it. `unlock_features` builds the flag as `ENC_FLAG[i] ^ key[i % 19] ^ (i * 3)`, so copy the 24 bytes of `ENC_FLAG` out of the data view. `solve.py` in the challenge files does this:

```python
KEY = b"PSFT-8W3N-K2DX-MR7C"   # the string validate_license() passes to strcmp
ENC_FLAG = bytes([
    0x12, 0x1f, 0x0f, 0x26, 0x59, 0x45, 0x76, 0x40, 0x25, 0x69, 0x38, 0x27,
    0x12, 0x14, 0x58, 0x14, 0x0a, 0x37, 0x2a, 0x1a, 0x1f, 0x49, 0x62, 0x15,
])

flag = bytes(b ^ KEY[i % len(KEY)] ^ ((i * 3) & 0xFF) for i, b in enumerate(ENC_FLAG))
print(flag.decode())
```

```console
$ python3 solve.py
BOO{xr3fs_m4rk_th3_sp0t}
```

Two shortcuts behave differently. Trying every key-shaped string works within eight tries, and you still learn something when the backup key fails. Patching the jump in `main` to skip the checks prints garbage, because the decryption uses the key you typed.

## Flag

```text
BOO{xr3fs_m4rk_th3_sp0t}
```

## Takeaways

- Strings are clues, not answers. Trace every interesting string to the function that reads it.
- Cross references answer "who uses this?" A function with zero callers is dead code, no matter how useful its name sounds.
- Read what the program does with your input. Here a single `strcmp` held the answer.
- In real software, comparing a license against a hardcoded string means anyone with a disassembler can read the key. Real license checks verify a signature with a public key, so the binary never contains a valid key.

## References

- [Binary Ninja user guide](https://docs.binary.ninja/guide/index.html)
- [Ghidra Cheat Sheet](https://ghidra-sre.org/CheatSheet.html)
