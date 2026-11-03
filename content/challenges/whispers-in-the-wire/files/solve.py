# Solve script for Whispers in the Wire (BGSU CTF Halloween 2026, forensics, medium)
# Usage: python3 solve.py
# Query names copied from:  tshark -r medium_whispers_in_the_wire.pcap
#   -Y 'dns.flags.response == 0 && dns.qry.name contains "whisper"' -T fields -e dns.qry.name
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
