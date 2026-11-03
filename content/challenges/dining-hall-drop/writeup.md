---
title: "Dining Hall Drop"
category: forensics
difficulty: easy
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
author: Dawson R Pelter
tags: [pcap, wireshark, ftp, passive-mode, tcp-stream]
summary: A kiosk downloaded a voucher over FTP. FTP sends files on a separate connection, so find the right passive-mode port and follow that stream.
---

## Overview

Dining Hall Drop is a packet capture of a kiosk logging in to an FTP server and downloading a voucher. FTP keeps commands and file data on separate TCP connections, and in passive mode the server announces the data port inside a `227` reply. The capture has two data connections, one for a directory listing and one for the download, so you have to match the right port to the right command. The challenge covers Wireshark filters, decoding a PASV reply, and Follow TCP Stream.

## Challenge Description

> A dining hall kiosk grabbed a voucher from an FTP server. Find the voucher and read what is inside. Points to think about: FTP uses more than one connection.

Provided file: `easy_dining_hall_drop.pcap`. Tools: [Wireshark](/tools/wireshark) 4.x (tshark, the command line version, is optional).

## Recon

Open the capture and check **Statistics > Conversations**, TCP tab. There are three conversations between the kiosk (192.168.10.44) and the FTP server (192.168.10.5):

| Stream | Client | Server port | Role (worked out below) |
| --- | --- | --- | --- |
| 0 | 192.168.10.44:49872 | 21 | FTP control connection |
| 1 | 192.168.10.44:49873 | 40021 | Data connection (directory listing) |
| 2 | 192.168.10.44:49874 | 40137 | Data connection (file download) |

Apply the display filter `ftp` to see the control connection:

```console
$ tshark -r easy_dining_hall_drop.pcap -Y 'ftp.request.command || ftp.response.code == 227' \
    -T fields -e frame.number -e ftp.request.command -e ftp.request.arg -e ftp.response.arg
12   USER   dininguser
16   PASS   Pumpkin2026
20   SYST
24   FEAT
28   PWD
32   TYPE   A
36   PASV
38                   Entering Passive Mode (192,168,10,5,156,85).
40   LIST
55   TYPE   I
59   PASV
61                   Entering Passive Mode (192,168,10,5,156,201).
63   RETR   voucher.bin
79   QUIT
```

The username and password travel in plain text. `TYPE I` switches to binary mode, so the voucher is a binary file. The flag is not in any command or reply.

## Walkthrough

### 1. Decode the PASV replies

Filter `ftp.response.code == 227`. The six numbers in each reply are the server's IP address (four numbers) and the data port (two numbers). The port is `p1 * 256 + p2`:

```text
(192,168,10,5,156,85)   ->  156 * 256 + 85  = 40021
(192,168,10,5,156,201)  ->  156 * 256 + 201 = 40137
```

Wireshark also does this for you: expand the FTP layer of the reply and read **Passive FTP server port**.

### 2. Match each port to its command

The PASV in frame 36 (port 40021) comes right before `LIST` in frame 40, and the one in frame 59 (port 40137) comes right before `RETR voucher.bin` in frame 63. A listing only carries file names (here `voucher.bin` and `menu_week44.txt`), so port **40137** is the one with the file.

### 3. Follow the data stream

Filter `tcp.port == 40137`, right-click any packet, and choose **Follow > TCP Stream** (stream 2). The file is 2014 bytes, mostly binary, with readable text near the top:

```text
BGSUVCH1..
---BEGIN VOUCHER---
HALL: Falcon's Nest Dining Hall
VALUE: 1 free pumpkin spice latte
VALID-THRU: 2026-10-31
CODE: BOO{passive_ftp_reveals_the_voucher}
---END VOUCHER---
```

### 4. Optional: export the file

In the Follow window, set **Show data as** to **Raw** and click **Save as**, or use **File > Export Objects > FTP-DATA**, which lists `voucher.bin`. Then:

```console
$ strings voucher.bin | grep BOO
CODE: BOO{passive_ftp_reveals_the_voucher}
```

## Solution

```console
$ tshark -r easy_dining_hall_drop.pcap -q -z follow,tcp,ascii,2 | grep -a BOO
CODE: BOO{passive_ftp_reveals_the_voucher}
```

Or export every FTP data transfer and search the files:

```console
$ mkdir out
$ tshark -r easy_dining_hall_drop.pcap --export-objects ftp-data,out
$ strings out/* | grep BOO
```

## Flag

```text
BOO{passive_ftp_reveals_the_voucher}
```

## Takeaways

- The PASV reply is a map to the data connection. Decode the port with `p1 * 256 + p2` and find the conversation that uses it.
- Check which command each data connection belongs to. A decoy listing connection only shows file names.
- Follow TCP Stream is the most useful Wireshark feature for plaintext protocols. Switch to Raw when saving a binary file.
- FTP sends everything unencrypted, including the login. Anyone who can capture the traffic can rebuild every file. Use SFTP or FTPS for anything that matters.

## References

- [RFC 959: File Transfer Protocol](https://www.rfc-editor.org/rfc/rfc959)
- [Wireshark User's Guide: Following protocol streams](https://www.wireshark.org/docs/wsug_html_chunked/ChAdvFollowStreamSection.html)
- [Wireshark wiki: FTP](https://wiki.wireshark.org/FTP)
