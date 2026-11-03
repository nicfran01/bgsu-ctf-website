import struct
import zlib

data = bytearray(open("whats_my_label.png", "rb").read())

# Bytes 20-23 hold the height. Write the real height there.
data[20:24] = struct.pack(">I", 4032)

# Bytes 29-32 hold the CRC of bytes 12-28 (the chunk type and data).
data[29:33] = struct.pack(">I", zlib.crc32(data[12:29]))

open("fixed.png", "wb").write(data)
print("Saved fixed.png")
