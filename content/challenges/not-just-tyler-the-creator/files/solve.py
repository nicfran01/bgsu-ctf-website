# Solve script for Not Just Tyler, The Creator (BGSU CTF Club steganography meeting)
# Usage: python3 solve.py   (run it next to notjusttylerthecreator.mp3)
data = open("notjusttylerthecreator.mp3", "rb").read()

# Take the last bit of each of the first 800 bytes (enough for 100 characters)
bits = "".join(str(b & 1) for b in data[:800])

# Group the bits into 8s and turn each group into a character
chars = [chr(int(bits[i:i + 8], 2)) for i in range(0, len(bits), 8)]
text = "".join(chars)

# Print everything up to and including the closing brace
print(text[:text.index("}") + 1])
