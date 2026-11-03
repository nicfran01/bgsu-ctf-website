---
name: Stego Toolkit (Docker)
category: forensics
summary: A Docker image with dozens of steganography tools preinstalled, including Steghide, binwalk, exiftool, zsteg, and stegoveritas.
platforms: [linux, macos, windows]
officialUrl: https://github.com/DominicBreuker/stego-toolkit
tags: [steganography, docker, steghide, binwalk]
---

## What It Is

Stego Toolkit is a Docker image that bundles most common steganography tools in one Linux environment: `file`, `strings`, exiftool, binwalk, foremost, pngcheck, Steghide, zsteg, stegoveritas, outguess, and many more. It also includes screening scripts that run several checks on a file at once. Instead of installing each tool on your own machine (some are hard to install on macOS and Windows), you start the container and everything is already there.

## When To Use It

- Steganography challenges where you need tools that are hard to install locally, such as Steghide on macOS.
- Club meetings, so everyone has the same tools and versions.
- Running a quick automated screen on an image with `check_jpg.sh` or `check_png.sh`.

GUI tools such as [Audacity](/tools/audacity) are easier to run on your own computer.

## Installation

### All platforms

Install Docker Desktop (macOS and Windows) or Docker Engine (Linux) from https://docs.docker.com/get-docker/. Then download the image once:

```bash
docker pull dominicbreuker/stego-toolkit
```

The image is large (a few GB), so pull it before a meeting, not during.

## Basic Usage

Start a container with a folder of challenge files mounted at `/data`.

On macOS or Linux, from the folder that contains `steg-challenges`:

```bash
docker run -it --rm -v "$PWD/steg-challenges":/data dominicbreuker/stego-toolkit /bin/bash
```

On Windows PowerShell:

```powershell
docker run -it --rm -v "${PWD}\steg-challenges:/data" dominicbreuker/stego-toolkit /bin/bash
```

Inside the container, the files are in `/data`. Anything you create or extract there also appears in the folder on your computer, so you can open results with your normal apps. `--rm` deletes the container when you exit, and your files stay safe in the mounted folder.

Once inside:

```bash
cd /data/01
file birthday.jpg
steghide info birthday.jpg
binwalk justalogo.png
exiftool image.png
```

Screening scripts:

| Script | What it does |
| --- | --- |
| `check_jpg.sh image.jpg` | Runs a set of JPEG checks and prints a report |
| `check_png.sh image.png` | Runs a set of PNG checks and prints a report |
| `brute_jpg.sh image.jpg wordlist.txt` | Tries every password in a wordlist with Steghide, outguess, and other tools |

## Common Pitfalls

- **Files missing in `/data`.** The path before the colon in `-v` must point at the real folder on your computer. Run the command from the right folder or use a full path.
- **Running as root.** You are root inside the container. Some tools, such as older binwalk versions, refuse to extract as root unless you add `--run-as=root`.
- **GUI tools.** The image can run GUI tools through VNC (`start_vnc.sh`), but it is simpler to run Audacity and image viewers on your own computer.
- **Apple Silicon Macs.** The image is built for x86-64. Docker Desktop runs it through emulation, which works but is slower.

## References

- [Stego Toolkit on GitHub](https://github.com/DominicBreuker/stego-toolkit)
- [Get Docker](https://docs.docker.com/get-docker/)
