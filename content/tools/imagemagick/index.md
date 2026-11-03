---
name: ImageMagick
category: forensics
summary: Command-line image toolkit for inspecting image properties, splitting GIF frames, and pulling apart color channels.
platforms: [linux, macos, windows]
officialUrl: https://imagemagick.org/
tags: [images, gif, metadata, channels, steganography]
---

## What It Is

ImageMagick is a set of command-line programs for reading, converting, and editing images in more than 200 formats. For CTFs the two most useful parts are `identify`, which prints an image's properties (size, color depth, frame count, frame delays, comments), and `magick` (called `convert` in version 6), which can split animations into frames and separate color channels.

## When To Use It

- Inspecting a GIF: how many frames, how long each one shows, and what each frame looks like.
- Reading image properties and comments with `identify -verbose`.
- Splitting an image into its red, green, and blue channels.
- Batch conversions, resizing, and cropping while preparing evidence.

## Installation

### Linux

```bash
sudo apt install imagemagick
```

Debian and Ubuntu often package version 6, where the commands are `identify` and `convert`. Version 7 uses `magick` (with `magick identify` also available).

### macOS

```bash
brew install imagemagick
```

Homebrew installs version 7, which includes both `magick` and `identify`.

### Windows

Download the installer from https://imagemagick.org/script/download.php. During setup, check **Install legacy utilities (e.g. convert)** if you want the separate `identify` and `convert` commands.

## Basic Usage

Basic properties:

```bash
identify image.png
identify -verbose image.png | less
```

GIF frame delays, in hundredths of a second (`%T`):

```console
$ identify -format "%T " nest_cam.gif
84 69 82 67 69 76
```

Uneven delays in the 65 to 122 range are worth trying as ASCII codes.

Split a GIF into individual frames:

```bash
magick nest_cam.gif -coalesce frame_%02d.png
```

Separate the color channels (one grayscale image per channel):

```bash
magick image.png -separate channel_%d.png
```

Print any text comments stored in the file:

```bash
identify -format "%c\n" image.png
```

ImageMagick's `-format` escapes are documented on the "Format and Print Image Properties" page. `%w` and `%h` are width and height, `%n` is the frame count, and `%T` is the delay.

## Common Pitfalls

- **Version 6 versus 7 commands.** Tutorials mix `convert` (version 6) and `magick` (version 7). If one is not found, try the other.
- **Partial GIF frames.** Many GIFs store each frame as only the part that changed. Use `-coalesce` when splitting so every saved frame is complete.
- **Delay units.** `%T` is in hundredths of a second, so 84 means 0.84 seconds.
- **Bit-plane extraction.** ImageMagick can isolate single bits, but [Stegsolve](/tools/stegsolve) or a few lines of [Python](/tools/python) with Pillow make bit planes much easier to browse.

## References

- [ImageMagick command-line tools](https://imagemagick.org/script/command-line-tools.php)
- [Format and print image properties](https://imagemagick.org/script/escape.php)
- [ImageMagick download](https://imagemagick.org/script/download.php)
