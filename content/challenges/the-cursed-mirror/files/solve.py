# Solve script for The Cursed Mirror (BGSU CTF Halloween 2026, crypto, hard)
# Usage: python3 solve.py      (run it next to mirror_log.txt and mirror_log_helper.py)
from mirror_log_helper import as_text, load

n, e, c, entries = load()

# Readable reflections are honest decryptions. Garbled ones came from modified ciphertexts.
for en in entries:
    if en["reflection"] is not None:
        print(f"entry {en['id']:2}: {as_text(en['reflection'])[:60]!r}")

garbled = [en for en in entries if en["status"] == "REFLECTED" and "�" in as_text(en["reflection"])]
print("\ngarbled entries:", [en["id"] for en in garbled])

# Textbook RSA is multiplicative: if held = c * k^e (mod n), the mirror showed k * m.
# Look up held / c among k^e for small k.
table = {pow(k, e, n): k for k in range(2, 100_001)}
c_inv = pow(c, -1, n)
for en in garbled:
    k = table.get(en["held"] * c_inv % n)
    if k is None:
        continue
    m = en["reflection"] // k
    print(f"entry {en['id']} = sealed spell * {k}^e")
    print("flag:", as_text(m))
    print("self-check (m^e == c):", pow(m, e, n) == c)
