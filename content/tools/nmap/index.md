---
name: Nmap
category: network
summary: Scans a host or network to find open ports, the services behind them, and often their versions, so you know what a target is running.
platforms: [linux, macos, windows]
officialUrl: https://nmap.org/
caution: "Scan only hosts you own or have written permission to test, such as a challenge box or your own lab VMs. Never scan any BGSU network, host, or address, including campus Wi-Fi and the residence hall networks."
tags: [recon, ports, scanning, services, network]
---

## What It Is

Nmap sends packets to a host and reports which ports answer, which service is listening on each one, and often the software version. In a CTF with a network box, it is the first thing you run: it turns an IP address into a list of ways in. The default scan checks the 1000 most common TCP ports; flags let you add version detection, scripts, and full port ranges.

## When To Use It

- A challenge gives you an IP address or hostname and nothing else, and you need to find what services it runs.
- You want the version of a service so you can look up known weaknesses in it.
- You set up a lab VM and want to confirm which ports it is actually exposing.
- A later step needs a specific port and you are not sure it is open.

## Installation

### Linux

Kali ships Nmap. On Debian and Ubuntu:

```bash
sudo apt update && sudo apt install nmap
```

```bash
sudo dnf install nmap        # Fedora
sudo pacman -S nmap          # Arch
```

### macOS

```bash
brew install nmap
```

The official site also has a `.dmg` installer if you do not use Homebrew.

### Windows

Download the installer from [nmap.org/download](https://nmap.org/download). It includes the Npcap driver that Nmap needs to send raw packets. The install also offers Zenmap, a graphical front end.

## Basic Usage

A plain scan of the common ports. Use the hostname or IP the challenge gave you:

```console
$ nmap scanme.nmap.org
Starting Nmap 7.98 ( https://nmap.org )
Nmap scan report for scanme.nmap.org (45.33.32.156)
Host is up (0.088s latency).
Not shown: 996 closed tcp ports (conn-refused)
PORT      STATE SERVICE
22/tcp    open  ssh
80/tcp    open  http
9929/tcp  open  nping-echo
31337/tcp open  Elite
```

Add service and version detection with `-sV`, and increase the speed with `-T4`:

```bash
nmap -sV -T4 scanme.nmap.org
```

Scan every TCP port, not just the common 1000, with `-p-`:

```bash
nmap -p- 10.0.2.15
```

Scan one or a few specific ports with `-p`:

```bash
nmap -p 22,80,443 10.0.2.15
```

Run the default script set and version detection together with `-sC -sV`. The scripts probe for common service details such as HTTP titles and anonymous FTP:

```bash
nmap -sC -sV 10.0.2.15
```

Flags you will use often:

| Flag | What it does |
| --- | --- |
| `-sV` | Detect the service version on each open port. |
| `-p-` | Scan all 65535 TCP ports. |
| `-p 80,443` | Scan only the listed ports. |
| `-sC` | Run the default Nmap scripts. |
| `-T4` | Faster timing. Fine for a challenge box; loud on a real network. |
| `-Pn` | Skip the host-up check and scan anyway, for hosts that drop pings. |
| `-oN out.txt` | Save normal output to a file. |
| `-v` | Show progress while the scan runs. |

## Common Pitfalls

- **Scanning the wrong target.** Nmap is active: it sends packets to the host and the host sees it. Scan only a box you are allowed to test. Read the Caution box above.
- **Thinking no results means no services.** A firewall can drop the host-up probe so Nmap reports the host as down. Add `-Pn` to scan anyway before you conclude a port is closed.
- **Default scan misses high ports.** The default checks 1000 ports. CTF services often sit on an odd high port. Run `-p-` when the common ports turn up nothing.
- **Version scans need `-sV`.** A plain scan prints the guessed service name from the port number, not the real software. Add `-sV` to probe the service itself.
- **Slow scans.** A full `-p-` scan over a slow link takes a while. Add `-T4` on a challenge box, and narrow the port range once you know what is open.

## References

- [Nmap reference guide](https://nmap.org/book/man.html)
- [Nmap documentation](https://nmap.org/docs.html)
- [Official download page](https://nmap.org/download)
