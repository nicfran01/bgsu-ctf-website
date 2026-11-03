---
title: "Whispers in the Wire"
category: forensics
difficulty: medium
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
author: Dawson R Pelter
tags: [pcap, wireshark, dns-exfiltration, snmp, base32, xor]
summary: A laptop leaks a message through out-of-order DNS lookups. The XOR key is sitting in an SNMP reply. Sort the chunks, fix the Base32, and undo the XOR.
---

## Overview

Whispers in the Wire is a capture where a laptop sends a secret out through DNS queries, a technique called DNS exfiltration. Each query name carries a slice of Base32 text, the slices arrive out of order (one is sent twice), and the joined message is XOR-encrypted. The key is not in the DNS traffic: it is in an SNMP reply from a network switch. The challenge teaches you to look for the protocol that does not belong and to use a clue from one protocol to decode data in another.

## Challenge Description

> Something on the network is leaking a message through DNS lookups, and the pieces do not arrive in the order they were meant to be read. Another protocol in the capture holds the clue to unscrambling it.

Provided file: `medium_whispers_in_the_wire.pcap`. Tools: [Wireshark](/tools/wireshark) and [Python 3](/tools/python) (standard library only).

## Recon

Open **Statistics > Protocol Hierarchy**. Apart from ARP, the capture has only two protocols: DNS and SNMP (8 frames). Every network has DNS, so SNMP is the unusual one, and the description said another protocol holds the clue.

## Walkthrough

### 1. Read the SNMP replies

Filter `snmp`. A management station (10.13.37.5) sends SNMPv2c `get-request` messages with community string `public` to a switch (10.13.37.2). Expand each `get-response` under **variable-bindings**:

| Frame | OID | Value |
| --- | --- | --- |
| 12 | 1.3.6.1.2.1.1.5.0 (sysName) | `falcon-sw-02` |
| 14 | 1.3.6.1.2.1.1.1.0 (sysDescr) | `Falcon-SW24 managed switch, FW 4.2.1; xor-key=witchcraft; build 2026-10-12` |
| 16 | sysContact and sysLocation | `noc@bgsu-ctf.example` and `Hallway closet B, Hayes Hall` |
| 18 | 1.3.6.1.2.1.2.2.1.2.1 (ifDescr) | `GigabitEthernet1/0/1` |

The key is **`witchcraft`**. The filter `snmp.value.octets contains "xor-key"` jumps straight to frame 14.

### 2. List the suspicious DNS queries

Filter queries only (not the replies) for the odd domain:

```console
$ tshark -r medium_whispers_in_the_wire.pcap \
    -Y 'dns.flags.response == 0 && dns.qry.name contains "whisper"' \
    -T fields -e frame.number -e frame.time_relative -e dns.qry.name
23   15.707867000   c04.abq2hqjq6arl.whisper.bgsu-ctf.example
25   17.432051000   c02.4bi4aidr6ebx.whisper.bgsu-ctf.example
29   19.507738000   c06.coi7ciias.whisper.bgsu-ctf.example
31   21.024021000   c01.gutdwgambuat.whisper.bgsu-ctf.example
35   23.731416000   c05.amarcpa3bupr.whisper.bgsu-ctf.example
36   24.733245000   c05.amarcpa3bupr.whisper.bgsu-ctf.example
38   26.135166000   c03.bulqiarldanr.whisper.bgsu-ctf.example
```

All seven come from 10.13.37.66, and the resolver answers each with `No such name`. That does not matter to an attacker: the query itself reaches whoever runs the domain's name server. Frame 35 got no answer, so the laptop retried it in frame 36. It is the same chunk, so keep one copy.

### 3. Put the chunks in order

The first label (`c01` to `c06`) is a sequence number. Sort by it:

| Label | Chunk | Note |
| --- | --- | --- |
| c01 | `gutdwgambuat` | arrived fourth |
| c02 | `4bi4aidr6ebx` | arrived second |
| c03 | `bulqiarldanr` | arrived last |
| c04 | `abq2hqjq6arl` | arrived first |
| c05 | `amarcpa3bupr` | sent twice |
| c06 | `coi7ciias` | shorter, because it is the last piece |

Joined and uppercased, that is 69 characters:

```text
GUTDWGAMBUAT4BI4AIDR6EBXBULQIARLDANRABQ2HQJQ6ARLAMARCPA3BUPRCOI7CIIAS
```

### 4. Restore the Base32 padding and decode

The characters A to Z and 2 to 7 are Base32. Base32 text must be a multiple of 8 characters, padded with `=`, but `=` is not allowed in a DNS name, so the sender dropped it. 69 mod 8 is 5, so add 3 `=` signs. Decoding gives 43 bytes of unreadable data, which is expected because the XOR is still on it.

### 5. Undo the repeating-key XOR

Each byte was XORed with the next letter of `witchcraft`, wrapping around. XOR undoes itself, so the same operation restores the message.

## Solution

`solve.py` from the challenge files:

```python
import base64

key = b"witchcraft"   # SNMP sysDescr, frame 14: "xor-key=witchcraft"

names = [
    "c04.abq2hqjq6arl.whisper.bgsu-ctf.example",
    "c02.4bi4aidr6ebx.whisper.bgsu-ctf.example",
    "c06.coi7ciias.whisper.bgsu-ctf.example",
    "c01.gutdwgambuat.whisper.bgsu-ctf.example",
    "c05.amarcpa3bupr.whisper.bgsu-ctf.example",
    "c05.amarcpa3bupr.whisper.bgsu-ctf.example",   # DNS retry of c05
    "c03.bulqiarldanr.whisper.bgsu-ctf.example",
]

# Sequence number -> chunk. The dict drops the duplicate c05.
chunks = {}
for name in names:
    label, data = name.split(".")[:2]
    chunks[int(label[1:])] = data

b32 = "".join(chunks[n] for n in sorted(chunks)).upper()
b32 += "=" * (-len(b32) % 8)             # DNS names cannot carry "=", so restore the padding
encrypted = base64.b32decode(b32)

flag = bytes(b ^ key[i % len(key)] for i, b in enumerate(encrypted))
print(flag.decode())
```

```console
$ python3 solve.py
BOO{dns_chunks_need_order_and_the_snmp_key}
```

In [CyberChef](/tools/cyberchef), the same steps are **From Base32** followed by **XOR** with the key `witchcraft` (UTF8).

## Flag

```text
BOO{dns_chunks_need_order_and_the_snmp_key}
```

## Takeaways

- Look for the protocol that does not belong. A capture full of DNS with a few SNMP packets means the SNMP is worth reading.
- Query names that look random, carry a counter, and share one unusual domain are a classic sign of DNS exfiltration.
- Filter with `dns.flags.response == 0` to see only queries, and expect retries. Do not count a duplicate twice.
- When Base32 or Base64 fails to decode, check the padding first.
- SNMPv1 and v2c send the community string and every value in plain text. Networks that use SNMP should run SNMPv3 with authentication and encryption, and defenders can catch DNS exfiltration by alerting on long, random-looking names under one domain.

## References

- [Palo Alto Networks: What is DNS tunneling?](https://www.paloaltonetworks.com/cyberpedia/what-is-dns-tunneling)
- [RFC 4648: Base32 encoding](https://www.rfc-editor.org/rfc/rfc4648#section-6)
- [Wireshark display filter reference: DNS](https://www.wireshark.org/docs/dfref/d/dns.html)
