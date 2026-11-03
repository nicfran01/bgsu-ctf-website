---
name: Wireshark
category: network
summary: The standard packet analyzer for opening capture files, filtering traffic, following streams, and decrypting TLS when you have the key.
platforms: [linux, macos, windows]
officialUrl: https://www.wireshark.org/
tags: [pcap, network, tshark, tls, protocols]
---

## What It Is

Wireshark opens packet captures (`.pcap` and `.pcapng` files) and decodes every packet into protocol fields you can read and filter: Ethernet, IP, TCP, DNS, HTTP, FTP, SMTP, TLS, SNMP, and hundreds more. It can rebuild whole conversations, export transferred files, and decrypt TLS traffic when given the right key. `tshark` is the command line version that installs with it and accepts the same filters.

## When To Use It

- Any network forensics challenge that gives you a capture file.
- Finding credentials, files, or messages sent over plaintext protocols such as HTTP, FTP, SMTP, and Telnet.
- Spotting data hidden in unusual places, such as DNS query names.
- Decrypting a TLS session with a recovered private key or a key log file.

## Installation

### Linux

```bash
sudo apt install wireshark tshark
```

To capture live traffic as a normal user, answer **Yes** when asked about non-superusers, then run `sudo usermod -aG wireshark $USER` and log out and back in. Opening capture files needs no extra setup.

### macOS

```bash
brew install --cask wireshark
```

Or download the `.dmg` from wireshark.org. The app bundle includes `tshark`. Homebrew's `wireshark` formula (without `--cask`) installs only the command line tools.

### Windows

Download the installer from https://www.wireshark.org/download.html. It offers to install Npcap, which is only needed for live capture.

## Basic Usage

**Get oriented first:**

- **Statistics > Protocol Hierarchy** shows which protocols appear. An unusual one is often the clue.
- **Statistics > Conversations** lists every TCP and UDP conversation. Each TCP conversation is a numbered stream.

**Display filters** go in the bar above the packet list:

| Filter | Shows |
| --- | --- |
| `http.request` | HTTP requests |
| `ftp` | FTP commands and replies |
| `ftp.response.code == 227` | FTP passive mode replies with the data port |
| `dns.flags.response == 0` | DNS queries only |
| `snmp` | SNMP traffic |
| `tcp.stream eq 3` | One TCP conversation |
| `tcp.port == 40137` | Traffic to or from one port |
| `frame contains "password"` | Any packet containing that text |
| `tls.handshake.type == 2` | TLS Server Hello messages |

**Follow a conversation:** right-click a packet, then **Follow > TCP Stream** (or HTTP Stream, or TLS Stream). Set **Show data as** to **Raw** to save binary files.

**Export transferred files:** **File > Export Objects > HTTP** (also FTP-DATA, SMB, IMF, TFTP).

**Decrypt TLS with an RSA private key:** this only works for sessions that use RSA key exchange (a `TLS_RSA_...` cipher suite in the Server Hello). Open **Edit > Preferences > RSA Keys** (**Wireshark > Settings** on macOS) and click **Add new keyfile**. For modern ECDHE sessions you need a key log file instead: set **(Pre)-Master-Secret log filename** under **Protocols > TLS**.

**tshark** for scripting:

```console
$ tshark -r capture.pcap -Y 'dns.flags.response == 0' -T fields -e frame.number -e dns.qry.name
$ tshark -r capture.pcap -q -z follow,tcp,ascii,2
$ tshark -r capture.pcap --export-objects http,outdir
$ tshark -r capture.pcap -o 'uat:rsa_keys:"server.key",""' -Y "http"
```

## Common Pitfalls

- **Counting duplicates.** Retransmissions and DNS retries repeat data. Check sequence numbers or labels before assembling pieces.
- **Following the wrong data connection.** FTP and similar protocols use separate connections for data. Match the port from the control channel to the right stream.
- **Expecting to decrypt every TLS session.** A private key cannot decrypt ECDHE sessions, which is most modern traffic. Read the cipher suite first.
- **Old guides.** Wireshark 2.x called TLS "SSL", and older versions set RSA keys under Protocols > TLS > RSA keys list. Newer versions use the separate RSA Keys page.
- **Display filters versus capture filters.** The filter bar takes display filter syntax (`tcp.port == 80`). Capture filters (`port 80`) are a different language used before capturing.

## References

- [Wireshark User's Guide](https://www.wireshark.org/docs/wsug_html_chunked/)
- [Display filter reference](https://www.wireshark.org/docs/dfref/)
- [Wireshark wiki: TLS decryption](https://wiki.wireshark.org/TLS)
- [tshark manual](https://www.wireshark.org/docs/man-pages/tshark.html)
