# Solve for The Compiler's Maze (BGSU CTF Halloween 2026, reverse, hard)
# Decodes g_map the way is_wall() does, finds the route with a breadth-first search,
# then re-implements emit_flag() to print the flag.
from collections import deque

W = 7
START, GOAL = 42, 6                                  # from walk_route() and main()
G_MAP = [0x52, 0x70, 0x78, 0x64, 0x72, 0x71, 0x52]   # the table is_wall() reads
G_SEALED = bytes([
    0x18, 0x9a, 0x0e, 0x49, 0xba, 0xf3, 0xc4, 0x1e, 0xbb, 0xba, 0x6e, 0xe9,
    0xea, 0x2e, 0x8d, 0xe3, 0x9e, 0x16, 0xe1, 0x1d, 0x1c, 0xf6, 0xa3, 0x45,
    0x20, 0x3e, 0x6b, 0x7e, 0x16,
])


def is_wall(pos: int) -> bool:
    # ((g_map[row] ^ 0x5A) >> col) & 1, so bit 0 is the LEFTMOST column
    return ((G_MAP[pos // W] ^ 0x5A) >> (pos % W)) & 1 == 1


for r in range(W):
    print(" ".join("S" if r * W + c == START else "G" if r * W + c == GOAL else "#" if is_wall(r * W + c) else "."
                   for c in range(W)))

MOVES = {"N": -W, "E": 1, "S": W, "W": -1}   # g_delta = {-7, +1, +7, -1}


def step(pos: int, d: str) -> int | None:
    col = pos % W
    if (d == "N" and pos < W) or (d == "S" and pos >= W * W - W) or (d == "E" and col == W - 1) or (d == "W" and col == 0):
        return None
    return pos + MOVES[d]


queue, seen = deque([(START, "")]), {START}
while queue:
    pos, route = queue.popleft()
    if pos == GOAL:
        break
    for d in "NESW":
        nxt = step(pos, d)
        if nxt is not None and not is_wall(nxt) and nxt not in seen:
            seen.add(nxt)
            queue.append((nxt, route + d))
print("\nroute:", route)

# emit_flag: FNV-1a-64 of the route seeds a SplitMix64 keystream
M = (1 << 64) - 1
h = 0xCBF29CE484222325
for ch in route.encode():
    h = ((h ^ ch) * 0x100000001B3) & M
out = bytearray()
for b in G_SEALED:
    h = (h + 0x9E3779B97F4A7C15) & M
    z = h
    z = ((z ^ (z >> 30)) * 0xBF58476D1CE4E5B9) & M
    z = ((z ^ (z >> 27)) * 0x94D049BB133111EB) & M
    z ^= z >> 31
    out.append(b ^ (z & 0xFF))
print("flag:", out.decode())
