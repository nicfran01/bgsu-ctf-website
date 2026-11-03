# Static solve for The Forgotten License Key (BGSU CTF Halloween 2026, reverse, easy)
# Re-implements unlock_features() with the bytes of ENC_FLAG copied from the binary's data section.
# The usual solve is simply running ./license_check and typing the key.
KEY = b"PSFT-8W3N-K2DX-MR7C"   # the string validate_license() passes to strcmp
ENC_FLAG = bytes([
    0x12, 0x1f, 0x0f, 0x26, 0x59, 0x45, 0x76, 0x40, 0x25, 0x69, 0x38, 0x27,
    0x12, 0x14, 0x58, 0x14, 0x0a, 0x37, 0x2a, 0x1a, 0x1f, 0x49, 0x62, 0x15,
])

flag = bytes(b ^ KEY[i % len(KEY)] ^ ((i * 3) & 0xFF) for i, b in enumerate(ENC_FLAG))
print(flag.decode())
