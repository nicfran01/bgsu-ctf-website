---
title: "The Impostor Function"
category: reverse
difficulty: medium
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
points: 250
author: Austin Paul Opsomer
tags: [call-graph, cross-references, modular-inverse, decoys, binary-ninja]
summary: Three functions are named like flag printers. The one with the flag in plaintext is never called. Trace the real call chain from main, then solve the PIN check.
---

## Overview

The Impostor Function is a terminal that asks for a callsign and a PIN. Its binary has three functions with flag-like names, and the one whose `BOO{...}` string shows up in `strings` is never called. This challenge teaches you to trust the call graph over function names, then to reverse two small checks: a modular equation on the PIN and a table lookup for the callsign.

## Challenge Description

> The night-watch terminal at Hollow Hill Cemetery keeps a sealed shift log, and the flag is in it. Only the operator on duty tonight, with the right PIN, can open it.
>
> The terminal's developer had a habit of leaving half-finished functions lying around. Several of them *look* like they print a flag. At least one of them really does print something in the `BOO{...}` format. That doesn't mean it's the flag.
>
> **Don't trust a function because of its name. Trust what the program actually calls.**

Provided files: `night_watch` (Linux x86-64, symbols kept) and `night_watch.exe` (Windows, same program). The real flag is printed by the program when you log in correctly.

## Recon

Running the program once:

```console
$ ./night_watch
+------------------------------------------+
|   HOLLOW HILL CEMETERY - NIGHT WATCH     |
|        Operator Access Terminal          |
+------------------------------------------+
Callsign: test
PIN: 1234
Access denied.
```

Every wrong answer prints the same `Access denied.`, so the program will not say which check failed.

`strings` finds exactly one flag-shaped string:

```console
$ strings night_watch | grep 'BOO{'
BOO{1mp0st0r_funct10n_n0t_th3_fl4g}
```

That is the trap the description warned about.

## Walkthrough

### 1. Check who uses the fake flag

In [Binary Ninja](/tools/binary-ninja), open the **Strings** view, select the fake flag, and follow its cross reference. It is used only inside `reveal_flag`. Now check `reveal_flag`'s own cross references: **zero callers**. It is dead code.

### 2. Compare the three look-alike functions

Filter the symbol list on `reveal`:

| Function | Called by | What it does |
| --- | --- | --- |
| `reveal_flag` | nobody | Returns the plaintext fake flag |
| `reveal_flag_admin` | `run_terminal`, when the callsign is `ADMIN` | XOR-decodes `ADMIN CONSOLE OFFLINE SINCE THE INCIDENT`. Not a flag |
| `reveal_flag_night` | `begin_shift` | Decrypts the real flag with a key built from the callsign and PIN |

### 3. Trace the real call chain from `main`

```text
main -> run_terminal -> read_operator          (reads callsign and PIN)
                     -> authorize -> pin_is_valid(pin)
                                  -> on_duty(callsign, pin)
                     -> begin_shift -> reveal_flag_night(callsign, pin)
```

`read_operator` copies the callsign into a 16-byte struct field and parses the PIN with `strtoul(..., 10)` into the next field (offset `0x10`). Renaming the struct fields in Binary Ninja keeps the rest readable.

### 4. Solve `pin_is_valid`

The function makes two range checks and one modular check. In hex, the constants are `0x186a0`, `0xf423f`, `0x1eef`, `0x7a69`, `0xf4243`, and `0xa299d`. In decimal:

```c
pin >= 100000 && pin <= 999999 && (pin * 7919 + 31337) % 1000003 == 666013
```

1000003 is prime and larger than the PIN range, so exactly one PIN works. Brute force or a modular inverse both find it:

```console
$ python3 -c 'print((666013 - 31337) * pow(7919, -1, 1000003) % 1000003)'
421473
```

### 5. Solve `on_duty`

`on_duty` compares the callsign with `DUTY_ROSTER[pin % 5]`. Follow `DUTY_ROSTER` in the data view to its five string pointers:

```text
{ "NIGHTOWL", "GRAVEDIG", "LANTERN7", "MOONWAKE", "HOLLOWAY" }
```

`421473 % 5` is 3, so the callsign is **MOONWAKE**.

### 6. Log in

```console
$ ./night_watch
+------------------------------------------+
|   HOLLOW HILL CEMETERY - NIGHT WATCH     |
|        Operator Access Terminal          |
+------------------------------------------+
Callsign: MOONWAKE
PIN: 421473
Welcome, MOONWAKE. Opening tonight's shift log...
Shift log sealed. Record: BOO{f0ll0w_th3_c4lls_n0t_th3_n4m3s}
```

## Solution

`solve.py` in the challenge files reproduces every check and the decryption in `reveal_flag_night`, which computes `ENC_NIGHT[i] ^ callsign[i % 8] ^ ((pin >> ((i % 3) * 8)) & 0xff)`:

```python
# pin_is_valid: 100000 <= pin <= 999999 and (pin * 7919 + 31337) % 1000003 == 666013
pin = (666013 - 31337) * pow(7919, -1, 1000003) % 1000003
assert 100000 <= pin <= 999999 and (pin * 7919 + 31337) % 1000003 == 666013
print("PIN:", pin)

# on_duty: strcmp(callsign, DUTY_ROSTER[pin % 5]) == 0
DUTY_ROSTER = ["NIGHTOWL", "GRAVEDIG", "LANTERN7", "MOONWAKE", "HOLLOWAY"]
callsign = DUTY_ROSTER[pin % 5]
print("Callsign:", callsign)

# reveal_flag_night: out[i] = ENC_NIGHT[i] ^ callsign[i % 8] ^ ((pin >> ((i % 3) * 8)) & 0xff)
ENC_NIGHT = bytes([
    0x6e, 0x6e, 0x06, 0x54, 0x5f, 0x77, 0x46, 0x47, 0x7b, 0x59, 0x7e, 0x3c,
    0x5e, 0x1c, 0x12, 0x47, 0x17, 0x25, 0x42, 0x53, 0x0e, 0x4e, 0x15, 0x37,
    0x73, 0x55, 0x21, 0x1c, 0x66, 0x29, 0x1e, 0x46, 0x78, 0x5d, 0x5c,
])
cs = callsign.encode()
flag = bytes(b ^ cs[i % 8] ^ ((pin >> ((i % 3) * 8)) & 0xFF) for i, b in enumerate(ENC_NIGHT))
print("Record:", flag.decode())
```

```console
$ python3 solve.py
PIN: 421473
Callsign: MOONWAKE
Record: BOO{f0ll0w_th3_c4lls_n0t_th3_n4m3s}
```

Patching `authorize` to always succeed does not help, because the key depends on the real callsign and PIN. A known-plaintext approach also works: XOR the first bytes of `ENC_NIGHT` with `BOO{` and each roster name, and only MOONWAKE gives PIN bytes (`0x61 0x6e 0x06`, which is 421473) that are consistent.

## Flag

```text
BOO{f0ll0w_th3_c4lls_n0t_th3_n4m3s}
```

## Takeaways

- A function's name tells you what the developer hoped. Its callers tell you what the program does.
- To prove a function is dead code, check for zero call references and also make sure its address is not stored in a table (a data reference).
- Arithmetic checks are equations. With a prime modulus, a modular inverse (`pow(x, -1, m)` in Python) solves them directly.
- An identical error for every failure is good design. It stops an attacker from testing one check at a time.
- In real code, a PIN check compiled into the client can always be reversed. Credentials have to be checked on a server or against a hash with a proper key-derivation function.

## References

- [Binary Ninja documentation](https://docs.binary.ninja/)
- [Python documentation: pow with a negative exponent](https://docs.python.org/3/library/functions.html#pow)
