---
name: curl
category: web
summary: Send HTTP requests from the command line and see exactly what the server returns, including headers and cookies.
platforms: [linux, macos, windows]
officialUrl: https://curl.se
tags: [http, cookies, cli]
---

## What It Is

curl is a command-line program that sends a request to a URL and prints the response. It speaks HTTP, HTTPS, FTP, and many other protocols, but in CTFs you will mostly use it for HTTP. Every header, cookie, and method is something you type, so you can send requests a browser would never send.

## When To Use It

- Checking the raw response from a web challenge, including status code and headers.
- Replaying a request with one value changed, such as a cookie, a header, or a form field.
- Scripting quick checks in a shell loop before writing a full Python script.
- Sending requests through a proxy like Burp Suite so you can inspect them there.

If you need to send many requests with logic between them, a [Python](/tools/python) script with `requests` is easier to read and change.

## Installation

### Linux

Most distributions ship curl. Kali has it installed by default. If `curl --version` fails:

```bash
# Debian, Ubuntu, Kali
sudo apt update && sudo apt install curl

# Fedora
sudo dnf install curl

# Arch
sudo pacman -S curl
```

### macOS

macOS includes curl at `/usr/bin/curl`. For a newer version, install it with Homebrew:

```bash
brew install curl
```

Homebrew does not link this curl over the system one. Run `brew info curl` to see the line to add to your shell profile if you want the Homebrew version first in your `PATH`.

### Windows

Windows 10 (version 1803 and later) and Windows 11 include `curl.exe`. In Windows PowerShell 5.1, typing `curl` runs `Invoke-WebRequest` instead, because `curl` is a built-in alias there. Type `curl.exe` to get the real program:

```powershell
curl.exe --version
```

PowerShell 7 removed that alias, so `curl` works there. Using `curl.exe` works in both.

## Basic Usage

The examples below use the web challenges from the BGSU CTF Halloween 2026 event, which are still online.

Fetch a page and search the HTML (this solves [Trick or Source](/challenges/trick-or-source)):

```console
$ curl -s https://happy-halloween-easy-challenge.vercel.app | grep 'BOO{'
    <!-- 👻 Boo! The ghost's secret message: BOO{v13w_s0urc3_1f_y0u_d4r3} -->
```

Show the response headers, including any cookie the server sets (`-i`):

```console
$ curl -s -i "https://happy-halloween-medium-challenge.vercel.app/api/enter?name=Ichabod"
HTTP/2 302
cache-control: no-store, max-age=0
content-type: text/html; charset=utf-8
location: /crypt
set-cookie: guestlist_session=eyJuYW1lIjoiSWNoYWJvZCIsInJvbGUiOiJndWVzdCIs...; Path=/; Max-Age=86400; SameSite=Lax
```

Show the request curl sends (`-v`). Lines starting with `>` are sent, and `<` are received:

```console
$ curl -s -v -o /dev/null https://happy-halloween-medium-challenge.vercel.app/crypt
> GET /crypt HTTP/2
> Host: happy-halloween-medium-challenge.vercel.app
> User-Agent: curl/8.10.1
> Accept: */*
```

Send a cookie you built yourself (`-b`). This is the solve for [The Haunted Guestlist](/challenges/the-haunted-guestlist):

```console
$ curl -s -b "guestlist_session=$(printf '%s' '{"name":"Ichabod","role":"reaper"}' | base64)" \
    https://happy-halloween-medium-challenge.vercel.app/crypt | grep -o 'BOO{[^}]*}'
BOO{gr4v3_r0bb1ng_th3_c00k13_j4r}
```

Save the cookies a server sets and send them back on the next request:

```bash
curl -c cookies.txt "https://happy-halloween-medium-challenge.vercel.app/api/enter?name=Ichabod"
curl -b cookies.txt https://happy-halloween-medium-challenge.vercel.app/crypt
```

Print only the status code, for example to check which IDs exist on an API:

```console
$ curl -s -o /dev/null -w '%{http_code}\n' "https://happy-halloween-hard-challenge.vercel.app/api/record?id=1051"
404
$ curl -s -o /dev/null -w '%{http_code}\n' "https://happy-halloween-hard-challenge.vercel.app/api/record?id=1052"
200
```

Send form data, JSON, and custom headers:

```bash
curl -d 'username=admin&password=hunter2' https://target.example/login
curl -H 'Content-Type: application/json' -d '{"username": "admin"}' https://target.example/api/login
curl -H 'X-Forwarded-For: 127.0.0.1' https://target.example/
```

Other flags you will use often:

| Flag | What it does |
| --- | --- |
| `-X PUT` | Use a different method. `-d` already switches to POST. |
| `-L` | Follow redirects. curl does not follow them by default. |
| `-o out.bin` | Save the body to a file instead of printing it. |
| `-s` | Hide the progress meter, useful in scripts. |
| `-w '%{http_code}\n'` | Print the status code after the transfer. |
| `-x http://127.0.0.1:8080` | Send the request through a proxy such as Burp Suite. |
| `-k` | Skip TLS certificate checks. Only use it on challenge servers. |

## Common Pitfalls

- **Unquoted URLs in the shell.** `&` in a query string ends the command in bash and zsh, and `?` can be treated as a wildcard. Wrap URLs in single quotes: `curl 'http://host/?a=1&b=2'`.
- **The PowerShell alias.** In Windows PowerShell 5.1, `curl` is `Invoke-WebRequest` and rejects flags like `-i`. Use `curl.exe`.
- **Quotes on Windows.** `cmd.exe` does not treat single quotes as quotes. Use double quotes there and escape inner double quotes with a backslash.
- **`-d` changes the request.** It sets the method to POST and the content type to `application/x-www-form-urlencoded`. Add `-H 'Content-Type: application/json'` when sending JSON.
- **Redirects look like empty pages.** A `302` with no body means the server wants you somewhere else. Add `-L` or read the `location` header with `-i`.
- **Trailing newlines.** `echo` adds a newline, which changes Base64 output and hashes. Use `printf '%s'` when building values for `-b` or `-d`.

## References

- [curl man page](https://curl.se/docs/manpage.html)
- [Everything curl (free book)](https://everything.curl.dev/)
- [curl on Windows](https://curl.se/windows/)
