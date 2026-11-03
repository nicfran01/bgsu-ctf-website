---
title: "The Compiler's Maze"
category: reverse
difficulty: hard
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
points: 400
author: Austin Paul Opsomer
tags: [maze, bit-packing, simulation, decoys, binary-ninja]
summary: A machine walks your N/S/E/W route through a maze stored as seven bytes. Decode the map the way the wall check does, solve the maze, and the route decrypts the flag.
---

## Overview

The Compiler's Maze takes a route made of `N`, `S`, `E`, and `W` and walks it through a 7 by 7 maze that exists only as seven bit-packed bytes in the binary. Its flag is decrypted with a key derived from the route, so the only way to get it is to rebuild the maze and solve it. This challenge teaches you to recognize a familiar algorithm (a grid walk) in compiled code: find the state, the moves, the walls, the start, and the goal. Two decoy checks and a decoy map are there to waste your time.

## Challenge Description

> Deep in the basement of an abandoned observatory sits an ancient machine. Legend says that if you feed it the right route through its maze, it prints a secret.
>
> The map of the maze was lost long ago, but the machine's instructions survive: it's all in the binary. You'll need to work out how the machine represents its maze, where you start, where it wants you to end up, and what it considers a legal move. Then solve the maze.
>
> The machine is stubborn. It won't tell you *where* your route went wrong, only that it did. Guessing won't get you far.
>
> Routes are written as a string of `N`, `S`, `E` and `W` characters, for example `NNESW`.

Provided files: `maze_machine` (Linux x86-64, symbols kept) and `maze_machine.exe` (Windows, same program). The flag cannot be recovered without the route, so patching the checks does not work.

## Recon

Run it with a junk route:

```console
$ ./maze_machine
~~~ THE ANCIENT MACHINE ~~~
Its map is lost, but its instructions remain.
Enter a route (N/S/E/W): NNN
[diag] route checksum 63c3 (expected beef) - continuing
The machine shudders and goes dark. Route rejected.
```

Every failure prints the same rejection, so you cannot test a route one step at a time. Open `maze_machine` in [Binary Ninja](/tools/binary-ninja) and start at `main`. The call order is:

```text
main -> legacy_route_check -> route_checksum -> translate_route -> walk_route -> emit_flag
```

## Walkthrough

### 1. Rule out the decoys

- **`route_checksum`** prints the `[diag] ... (expected beef)` line, but its result only feeds a `printf`. It never rejects anything, so making the checksum equal `0xbeef` is pointless.
- **`legacy_route_check`** matches one exact string, `NNNNNNEEEEEE`, and prints "That route was sealed when the machine was rebuilt."
- **`print_backup_map`** reads a second table, `g_map_backup`, and has **zero callers**. Solving the backup map gives `NNENNEENNEEE`, which the machine rejects.

The question to ask of every check is what its result flows into. A `return` or an exit matters. A `printf` does not.

### 2. Decode the moves

`translate_route` calls `decode_dir`, a switch on `'N'` (0x4e), `'E'` (0x45), `'S'` (0x53), and `'W'` (0x57) that returns 0, 1, 2, and 3. The order is N, E, S, W. Any other character, or more than 24 moves, rejects the route.

### 3. Work out what a position is

`step` does four bounds checks before moving:

```c
if (dir == 0 && pos < 7)          return -1;   // N off the top
if (dir == 2 && pos >= 42)        return -1;   // S off the bottom
if (dir == 1 && pos % 7 == 6)     return -1;   // E off the right
if (dir == 3 && pos % 7 == 0)     return -1;   // W off the left
return pos + g_delta[dir];
```

`g_delta` in the data view is `{0xfffffff9, 1, 7, 0xffffffff}`, which is `{-7, +1, +7, -1}`. So the grid is 7 wide and 7 tall, and `pos = row * 7 + col`. Moving N subtracts 7, so row 0 is the top.

### 4. Find the start, the goal, and the rules

`walk_route` starts at `0x2a` = **42** (row 6, column 0, the bottom left). It rejects a move that goes out of bounds, hits a wall, or **revisits a cell**, using a 49-byte `visited` array on the stack. Back in `main`, the final position must equal **6** (row 0, column 6, the top right).

### 5. Decode the map

`is_wall` is:

```c
return ((g_map[pos / 7] ^ 0x5A) >> (pos % 7)) & 1;
```

`g_map` holds one byte per row: `52 70 78 64 72 71 52`. XOR each byte with `0x5A`, and bit `c` set means a wall in column `c`. **Bit 0 is column 0, the leftmost column.**

| Row | Byte | XOR 0x5A | Bits 6..0 | Grid (col 0 to 6) |
| --- | --- | --- | --- | --- |
| 0 | 0x52 | 0x08 | 0001000 | `. . . # . . G` |
| 1 | 0x70 | 0x2A | 0101010 | `. # . # . # .` |
| 2 | 0x78 | 0x22 | 0100010 | `. # . . . # .` |
| 3 | 0x64 | 0x3E | 0111110 | `. # # # # # .` |
| 4 | 0x72 | 0x28 | 0101000 | `. . . # . # .` |
| 5 | 0x71 | 0x2B | 0101011 | `# # . # . # .` |
| 6 | 0x52 | 0x08 | 0001000 | `S . . # . . .` |

The common mistake is reading the bits left to right (most significant bit first). That mirrors the maze left to right and gives a route the machine rejects.

### 6. Solve the maze

The right-hand column looks like an open road straight up to the goal, but columns 4 to 6 are a dead-end branch that hangs off the goal. Column 3 is a wall in row 6, so the only way from the start is the long detour across the top:

```text
Maze                 Route (*)
. . . # . . G        * * * # * * G
. # . # . # .        * # * # * # .
. # . . . # .        * # * * * # .
. # # # # # .        * # # # # # .
. . . # . # .        * * * # . # .
# # . # . # .        # # * # . # .
S . . # . . .        S * * # . . .
```

`EENNWWNNNNEESSEENNEE`: E, E to (6,2); N, N to (4,2); W, W to (4,0); N four times to (0,0); E, E to (0,2); S, S to (2,2); E, E to (2,4); N, N to (0,4); E, E to (0,6), the goal. The open cells form a tree with no loops, and revisiting is forbidden, so this is the only accepted route.

### 7. Run it

```console
$ ./maze_machine
~~~ THE ANCIENT MACHINE ~~~
Its map is lost, but its instructions remain.
Enter a route (N/S/E/W): EENNWWNNNNEESSEENNEE
[diag] route checksum ce58 (expected beef) - continuing
The machine hums. A slip of paper falls out: BOO{m4pp3d_th3_m4ch1n3s_m4z3}
```

## Solution

`solve.py` in the challenge files decodes `g_map`, finds the route with a breadth-first search, and reproduces `emit_flag` (an FNV-1a-64 hash of the route seeds a SplitMix64 keystream that decrypts `g_sealed`):

```python
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
```

```console
$ python3 solve.py
. . . # . . G
. # . # . # .
. # . . . # .
. # # # # # .
. . . # . # .
# # . # . # .
S . . # . . .

route: EENNWWNNNNEESSEENNEE
flag: BOO{m4pp3d_th3_m4ch1n3s_m4z3}
```

Brute-forcing routes is not practical: 4^20 is about 10^12 strings, and the keystream state is 64 bits with a nonlinear mixer, so knowing the `BOO{` prefix does not reveal the key.

## Flag

```text
BOO{m4pp3d_th3_m4ch1n3s_m4z3}
```

## Takeaways

- Compiled code is often a familiar algorithm in disguise. Identify the state (the position), the transitions (`step` and `g_delta`), the constraints (`is_wall` and `visited`), and the goal.
- Decide which checks matter by following their results. A value that only reaches a `printf` is decoration.
- Bit order matters. Check which bit maps to which column before drawing anything, or the maze comes out mirrored.
- Check every data table's cross references. A second map that nothing reads is a decoy.
- Deriving a key from the correct input defeats patching. A program that only checks a condition and then prints a stored secret can be patched in one byte.

## References

- [Binary Ninja documentation](https://docs.binary.ninja/)
- [Wikipedia: Fowler-Noll-Vo hash function](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function)
- [Wikipedia: Breadth-first search](https://en.wikipedia.org/wiki/Breadth-first_search)
