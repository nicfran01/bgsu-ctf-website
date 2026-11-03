---
name: ExifTool
category: forensics
summary: Reads and writes metadata in images, audio, video, and documents, including GPS coordinates and hidden comments.
platforms: [linux, macos, windows]
officialUrl: https://exiftool.org/
tags: [metadata, exif, gps, images, osint]
---

## What It Is

ExifTool is a command-line program by Phil Harvey that reads, writes, and removes metadata from almost any file type: JPEG and PNG images, GIFs, WAV and MP3 audio, PDFs, Office documents, and more. Metadata includes camera details, timestamps, GPS coordinates, software versions, and free-text comment fields, all of which are favorite hiding places in CTFs.

## When To Use It

- First look at any image, audio, or document file in a forensics or OSINT challenge.
- Finding GPS coordinates in a photo.
- Reading comment fields that hold hints or passwords.
- Checking whether metadata was edited, for example a GPS date that does not match the capture date.
- Removing metadata from your own files before sharing them.

## Installation

### Linux

```bash
sudo apt install libimage-exiftool-perl     # Debian, Ubuntu, Kali
sudo dnf install perl-Image-ExifTool        # Fedora
```

### macOS

```bash
brew install exiftool
```

### Windows

Download the Windows executable zip from https://exiftool.org/, unzip it, and rename `exiftool(-k).exe` to `exiftool.exe` so it runs from the command line without pausing. Put it in a folder on your PATH.

## Basic Usage

Everything in a file:

```bash
exiftool photo.jpg
```

Specific tags, by name:

```console
$ exiftool -Make -Model -DateTimeOriginal IMG_4126.jpeg
Make                            : Apple
Camera Model Name               : iPhone 12 mini
Date/Time Original              : 2024:04:27 14:55:00
```

GPS tags, and coordinates as decimal degrees ready for a map:

```console
$ exiftool -a -gps:all IMG_4126.jpeg
GPS Latitude Ref                : North
GPS Latitude                    : 38 deg 44' 11.74"
GPS Longitude Ref               : West
GPS Longitude                   : 83 deg 12' 2.07"
...
$ exiftool -n -GPSPosition IMG_4126.jpeg
GPS Position                    : 38.7365944444444 -83.200575
```

Comment fields in PNGs and GIFs, printed raw with `-b`:

```console
$ exiftool -Comment the_perch_flyer.png
Comment                         : Vault key = the name of the place where we meet, lowercase, no spaces.
$ exiftool -b -Comment nest_cam.gif
```

Show which group each tag comes from (EXIF, GPS, XMP, PNG text, and so on), including duplicates:

```bash
exiftool -G1 -a photo.jpg
```

Remove all metadata (writes a copy and keeps the original as `photo.jpg_original`):

```bash
exiftool -all= photo.jpg
```

## Common Pitfalls

- **Hidden duplicate tags.** Without `-a`, exiftool shows only one tag when the same name appears in several groups. Add `-a` (and `-G1` to see the group) when looking for anything unusual.
- **Coordinates without a direction.** `GPS Longitude: 83 deg 12' 2.07"` has no sign. Check `GPS Longitude Ref` (West means negative) or use `-n -GPSPosition`.
- **Screenshots and re-saved images.** Many apps and websites strip metadata. If a social media image has no GPS, the original file might.
- **Trusting metadata as truth.** Anyone can edit it. Compare dates and look for fields that do not fit.

## References

- [ExifTool home page](https://exiftool.org/)
- [ExifTool command documentation](https://exiftool.org/exiftool_pod.html)
- [ExifTool tag names](https://exiftool.org/TagNames/)
