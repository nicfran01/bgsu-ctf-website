# Solve for The Impostor Function (BGSU CTF Halloween 2026, reverse, medium)
# Re-implements the checks read out of pin_is_valid(), on_duty() and reveal_flag_night().

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
