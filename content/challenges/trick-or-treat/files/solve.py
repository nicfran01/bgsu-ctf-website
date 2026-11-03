# Solve script for Trick or Treat? (BGSU CTF Halloween 2026, crypto, easy)
# Usage: python3 solve.py [path/to/trail.txt]
import base64
import re
import sys
from urllib.parse import unquote

path = sys.argv[1] if len(sys.argv) > 1 else "trail.txt"
text = open(path, encoding="utf-8").read()

# Each house is a "HOUSE n" header followed by its encoded note (possibly wrapped over several lines).
houses = {}
for number, body in re.findall(r"HOUSE (\d+)[^\n]*\n(.*?)(?=\n\s*\n|\n-{5,})", text, re.S):
    houses[int(number)] = body.strip()


def decode(note: str) -> str:
    joined = "".join(note.split())
    if note.startswith("%"):
        return unquote(joined)
    if set(joined) <= set("01"):
        return bytes(int(b, 2) for b in note.split()).decode()
    if re.fullmatch(r"[0-9a-f]+", joined):
        return bytes.fromhex(joined).decode()
    return base64.b64decode(joined).decode()


def caesar(s: str, shift: int) -> str:
    out = []
    for ch in s:
        if ch.isalpha():
            base = 65 if ch.isupper() else 97
            out.append(chr((ord(ch) - base + shift) % 26 + base))
        else:
            out.append(ch)
    return "".join(out)


notes = {n: decode(body) for n, body in sorted(houses.items())}
tricks = sum(1 for n, note in notes.items() if note.startswith("TRICK"))
notes[7] = caesar(notes[7], -tricks)  # house 7 hides under a Caesar mask: shift = number of TRICK houses

for n, note in notes.items():
    print(f"house {n}: {note[:90]}")

pieces = [note.split(": ", 1)[1] for n, note in notes.items() if note.startswith("TREAT")]
print("\nflag:", "".join(pieces))
