# Put the FRAGMENT lines from the decrypted TLS stream back in order.
# Usage: python3 assemble.py   (paste the lines into the string below first)
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
