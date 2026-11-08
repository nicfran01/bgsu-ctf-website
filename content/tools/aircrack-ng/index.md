---
name: Aircrack-ng
category: wireless
summary: A suite for capturing Wi-Fi traffic and recovering WPA/WPA2 keys from a captured handshake with a wordlist.
platforms: [linux, macos, windows]
officialUrl: https://www.aircrack-ng.org/
caution: "Capture and crack Wi-Fi only on a network you own or have written permission to test, or on capture files a challenge provides. Do not capture, deauthenticate, or crack any BGSU network, campus Wi-Fi, or residence hall network, or any network you do not own."
tags: [wireless, wifi, wpa, handshake, pcap]
---

## What It Is

Aircrack-ng is a set of command-line tools for Wi-Fi security work. The pieces that matter in a CTF are `aircrack-ng`, which takes a captured WPA/WPA2 four-way handshake and a wordlist and recovers the Wi-Fi password, and `airmon-ng` and `airodump-ng`, which put a wireless card into monitor mode and record nearby traffic to a capture file. In club challenges you most often get a `.cap` or `.pcap` file with a handshake already in it and only need the cracking step.

## When To Use It

- A challenge gives you a capture file that contains a WPA/WPA2 handshake and asks for the Wi-Fi password.
- You are running a wireless lab on hardware you own and want to capture a handshake to practice on.
- You need to confirm a capture actually contains a complete handshake before trying to crack it.

For reading the rest of the packets in a capture (HTTP, DNS, and so on), open it in [Wireshark](/tools/wireshark). Aircrack-ng is for the Wi-Fi key step.

## Installation

Capturing traffic needs a wireless card that supports monitor mode, which rules out most built-in laptop and macOS cards. Cracking a capture file you already have works anywhere.

### Linux

Kali ships the suite. On Debian and Ubuntu:

```bash
sudo apt update && sudo apt install aircrack-ng
```

Capturing also needs a card with monitor-mode support and the matching driver.

### macOS

```bash
brew install aircrack-ng
```

The `aircrack-ng` cracking tool works. Monitor-mode capture with `airmon-ng` is not supported on macOS hardware, so use macOS for cracking a capture file, not for capturing.

### Windows

Download the Windows build from [aircrack-ng.org](https://www.aircrack-ng.org/). The `aircrack-ng` cracker runs, but monitor-mode capture support on Windows is limited and driver dependent. A Linux VM with a USB adapter passed through is the usual setup for capturing.

## Basic Usage

**Crack a handshake from a capture file.** This is the common CTF case. Point `aircrack-ng` at the `.cap` file with a wordlist:

```bash
aircrack-ng -w rockyou.txt capture.cap
```

It lists the networks in the file. Pick the one with a handshake, and if the password is in the wordlist it prints:

```text
                           KEY FOUND! [ falcons2026 ]
```

**Target a specific network by name.** If the file has several networks, give the ESSID with `-e`:

```bash
aircrack-ng -w rockyou.txt -e HomeNet capture.cap
```

**Capturing a handshake (on your own lab hardware).** Put the card in monitor mode, watch for the network, and record. These steps need a monitor-mode card and permission to test the network:

```bash
sudo airmon-ng start wlan0            # creates wlan0mon in monitor mode
sudo airodump-ng wlan0mon             # list networks, note the BSSID and channel
sudo airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w out wlan0mon
```

When a client connects, `airodump-ng` captures the handshake and writes `out-01.cap`, which you then crack with the first command.

## Common Pitfalls

- **No handshake in the file.** `aircrack-ng` reports "No valid WPA handshakes found" when the four-way handshake is incomplete. Open the capture in [Wireshark](/tools/wireshark) and filter for `eapol` to confirm all four messages are present.
- **Monitor mode is the hard part.** Most built-in laptop cards and all macOS cards cannot capture in monitor mode. If capture is the point, you need a supported USB adapter on Linux.
- **The password must be in the wordlist.** Aircrack-ng only tries words from the list you give it. If the key is not in `rockyou.txt`, it fails. This is a wordlist attack, not a full brute force.
- **WPA cracking is slow on CPU.** The WPA key derivation is deliberately slow. For large wordlists, convert the handshake to a hashcat format (mode 22000) and use [hashcat](/tools/hashcat) on a GPU.
- **Right network, right channel.** When capturing, lock `airodump-ng` to the target BSSID and channel with `-c` and `--bssid`, or you capture noise from every nearby network.

## References

- [Aircrack-ng documentation](https://www.aircrack-ng.org/documentation.html)
- [Cracking WPA with aircrack-ng (official tutorial)](https://www.aircrack-ng.org/doku.php?id=cracking_wpa)
- [hashcat mode 22000 for WPA](https://hashcat.net/wiki/doku.php?id=example_hashes)
