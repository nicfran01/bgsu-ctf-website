---
title: "Exif"
category: osint
difficulty: easy
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
author: Van Lauderback
tags: [exif, gps, metadata, exiftool, maps]
summary: A flower photo still has GPS coordinates in its metadata. Read them with exiftool, drop them on a map, and name the state park.
---

## Overview

Exif gives you a phone photo of some pink flowers and asks which state park it was taken in. The picture itself has nothing to identify the place, but the file's EXIF metadata includes GPS coordinates. The challenge teaches reading metadata with exiftool and turning coordinates into a location, which is the first thing to check on any photo in an OSINT challenge.

## Challenge Description

> Find the state park where this photo was taken. Format your flag as BOO{___} where the blank comes from ___ State Park.

Provided file: `IMG_4126.jpeg`.

![The challenge photo: pale pink flowers with long curved stamens on a shrub, with green leaves and a forest floor behind](./images/photo.jpg)

## Recon

The photo shows a flowering shrub in a forest. There are no signs, buildings, or landmarks, so looking at the picture will not narrow the place down. The file is the original phone image (4032 by 3024 pixels), which means its metadata is probably intact.

## Walkthrough

### 1. Read the metadata

Run [exiftool](/tools/exiftool) on the file. The full output is long, so ask for the camera fields first, then every GPS tag (`-a` keeps tags that exiftool would otherwise hide as duplicates):

```console
$ exiftool -Make -Model -DateTimeOriginal IMG_4126.jpeg
Make                            : Apple
Camera Model Name               : iPhone 12 mini
Date/Time Original              : 2024:04:27 14:55:00
$ exiftool -a -gps:all IMG_4126.jpeg
GPS Latitude Ref                : North
GPS Latitude                    : 38 deg 44' 11.74"
GPS Longitude Ref               : West
GPS Longitude                   : 83 deg 12' 2.07"
GPS Time Stamp                  : 23:19:44
GPS Date Stamp                  : 2026:10:24
GPS Horizontal Positioning Error: 1 m
```

The photo was taken on an iPhone 12 mini, and the GPS tags give **38°44'11.74"N, 83°12'2.07"W**.

The GPS date (2026-10-24) is two and a half years after the photo was taken (2024-04-27). The coordinates were written into the file later, when the challenge was built. On a real investigation, a mismatch like that is a sign that metadata was edited.

### 2. Convert the coordinates

Most map sites accept the degrees-minutes-seconds form directly. To get decimal degrees, use `-n`:

```console
$ exiftool -n -GPSLatitude -GPSLongitude IMG_4126.jpeg
GPS Latitude                    : 38.7365944444444
GPS Longitude                   : -83.200575
```

West longitudes are negative.

### 3. Put them on a map

Paste `38.736594, -83.200575` into Google Maps or OpenStreetMap. The pin lands in Scioto County in southern Ohio, west of Portsmouth, on the Shawnee Backpack Trail inside **Shawnee State Park**. The park sits inside the larger Shawnee State Forest, and the point falls within the park's boundary.

## Solution

```console
$ exiftool -n -GPSPosition IMG_4126.jpeg
GPS Position                    : 38.7365944444444 -83.200575
```

Paste the two numbers into a map and read the park name: Shawnee State Park.

## Flag

```text
BOO{Shawnee}
```

## Takeaways

- Check metadata first on every photo. Phones record GPS coordinates by default unless location access is turned off for the camera.
- `exiftool -n` prints coordinates as decimal degrees that paste straight into any map.
- Compare the dates in a file. A GPS date years after the capture date means someone changed the metadata.
- To protect yourself, strip location data before posting photos (`exiftool -gps:all= photo.jpg`, or turn off location in the camera settings). Many social sites strip it on upload, but direct file transfers and email attachments keep it.

## References

- [ExifTool documentation](https://exiftool.org/exiftool_pod.html)
- [Wikipedia: Shawnee State Park (Ohio)](https://en.wikipedia.org/wiki/Shawnee_State_Park_%28Ohio%29)
