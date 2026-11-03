---
name: Stegsolve
category: forensics
summary: A small Java tool for flipping through an image's color planes and bit planes to find hidden text or pictures.
platforms: [linux, macos, windows]
officialUrl: https://github.com/Giotino/stegsolve
tags: [steganography, bit-planes, lsb, images, gif]
---

## What It Is

Stegsolve is a single Java `.jar` file that opens an image and lets you step through views of it: each color channel, each of the eight bit planes in each channel, inverted colors, and more. Low bit planes change a pixel's value by only 1 or 2 out of 255, so text drawn into them is invisible in the normal image and obvious when you view that plane alone. It also includes a frame browser for animated GIFs and a data extractor for least significant bit (LSB) steganography.

## When To Use It

- An image challenge mentions "layers", "planes", "bits", or a "quieter" part of the picture.
- You have checked metadata and appended data and found nothing.
- Stepping through the frames of a GIF one at a time.
- Pulling raw LSB data out of an image to look for hidden bytes.

## Installation

Stegsolve needs Java. Check with `java -version`, and install a JDK or JRE if it is missing.

### Linux

```bash
sudo apt install default-jre
wget https://github.com/Giotino/stegsolve/releases/download/v1.4/StegSolve-1.4.jar -O stegsolve.jar
java -jar stegsolve.jar
```

### macOS

```bash
brew install openjdk
curl -L https://github.com/Giotino/stegsolve/releases/download/v1.4/StegSolve-1.4.jar -o stegsolve.jar
java -jar stegsolve.jar
```

If `java` is not found after installing with Homebrew, follow the `brew info openjdk` note about linking it.

### Windows

Install a Java runtime (for example Eclipse Temurin), download `StegSolve-1.4.jar` from the releases page linked below, and double-click it or run `java -jar Stegsolve.jar`.

## Basic Usage

1. **File > Open** and choose the image.
2. **Click the arrow buttons** at the bottom to cycle views: Red plane 7 down to 0, then Green, then Blue, then Alpha, plus color inversions and random color maps. Watch for shapes or text in any plane.
3. **Analyse > Data Extract** pulls bits from chosen planes in a chosen order and shows them as hex and text. Start with bit 0 of Red, Green, and Blue, row order, MSB first.
4. **Analyse > Frame Browser** steps through the frames of an animated GIF.
5. **Analyse > Stereogram Solver** and **Image Combiner** handle two other common image puzzles.

Stegsolve numbers bit planes from 0 (the least significant bit) to 7, so "Blue plane 1" is the second-lowest bit of the blue channel.

### Alternatives

- **zsteg** (`gem install zsteg`) checks PNG and BMP files for LSB data from the command line.
- **stegoveritas** (`pip install stegoveritas`, then `stegoveritas_install_deps`) writes every plane of an image out as separate files.
- A few lines of Python with Pillow extract one plane: `Image.open(f).getchannel("B").point(lambda v: 255 if (v >> 1) & 1 else 0).save("plane.png")`.

## Common Pitfalls

- **Lossy formats.** JPEG compression destroys bit-plane data. Bit-plane tricks almost always use PNG, BMP, or GIF.
- **Looking only at plane 0.** Hidden text can sit in any low plane. Check planes 0 to 2 of every channel.
- **The image is too large for the window.** Stegsolve does not scroll well. Resize the window or save the plane (File > Save As) and open it in an image viewer.
- **No Java.** Stegsolve gives no helpful error if Java is missing. Run `java -version` first.

## References

- [Stegsolve releases on GitHub](https://github.com/Giotino/stegsolve/releases)
- [zsteg on GitHub](https://github.com/zed-0xff/zsteg)
- [Wikipedia: Bit plane](https://en.wikipedia.org/wiki/Bit_plane)
