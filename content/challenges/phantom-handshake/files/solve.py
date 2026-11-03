# Solve script for Phantom Handshake (BGSU CTF Halloween 2026, crypto, medium)
# Usage: python3 solve.py      (takes about 10 seconds)
import base64
import hashlib


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    i = 2
    while i * i <= n:
        if n % i == 0:
            return False
        i += 1
    return True


# 1. Public values from haunted_chat_capture.log
p = 12345679
while not is_prime(p):          # "the first prime that comes after 12345678"
    p += 1
g = 3
A = 0xb3533c
B = int.from_bytes(base64.b64decode("k57F"), "big")
ct = bytes.fromhex("cd27f3f948fb7d855513515197fbd580c1b15a54b4d0b7c0d639")
print(f"p = {p}, A = {A}, B = {B}")

# 2. Brute-force Spectra's private number: find a with g^a mod p == A
a = next(x for x in range(1, p) if pow(g, x, p) == A)
print(f"a = {a}")

# 3. Shared secret, then the key recipe from the chat: SHA-256 of the secret written in decimal
secret = pow(B, a, p)
key = hashlib.sha256(str(secret).encode()).digest()
print(f"shared secret = {secret}")

# 4. XOR the sealed spell with the key
print(bytes(c ^ k for c, k in zip(ct, key)).decode())
