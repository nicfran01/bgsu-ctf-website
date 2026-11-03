---
name: curl
category: web
summary: Send HTTP requests from the command line and see exactly what the server returns, including headers and cookies.
platforms: [linux, macos, windows]
officialUrl: https://curl.se
tags: [http, cookies, cli, example]
---

## What It Is

curl is a command-line program that sends a request to a URL and prints the response. It speaks HTTP, HTTPS, FTP, and many other protocols, but in CTFs you will mostly use it for HTTP. Every header, cookie, and method is something you type, so you can send requests a browser would never send. This guide is the example tool page for the club site, and the commands are real.

## When To Use It

- Checking the raw response from a web challenge, including status code and headers.
- Replaying a request with one value changed, such as a cookie, a header, or a form field.
- Scripting quick checks in a shell loop before writing a full Python script.
- Sending requests through a proxy like Burp Suite so you can inspect them there.

If you need to send many requests with logic between them, a Python script with `requests` is easier to read and change.

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

The examples below run against the Cookie Monster example challenge on `http://localhost:1337`.

Show the response headers along with the body:

```console
$ curl -i http://localhost:1337/
HTTP/1.1 200 OK
Server: Werkzeug/3.1.9 Python/3.14.7
Content-Type: text/html; charset=utf-8
Content-Length: 43
Set-Cookie: session=eyJ1c2VyIjogImd1ZXN0IiwgInJvbGUiOiAiZ3Vlc3QifQ==; Path=/

Hello guest. Only admins can see the flag.
```

Show the request curl sent and the response headers (lines starting with `>` are sent, `<` are received):

```console
$ curl -v http://localhost:1337/
> GET / HTTP/1.1
> Host: localhost:1337
> User-Agent: curl/8.10.1
> Accept: */*
>
< HTTP/1.1 200 OK
< Set-Cookie: session=eyJ1c2VyIjogImd1ZXN0IiwgInJvbGUiOiAiZ3Vlc3QifQ==; Path=/
```

Send a cookie, or save cookies to a file and send them back on the next request:

```bash
curl -b 'session=eyJ1c2VyIjogImd1ZXN0IiwgInJvbGUiOiAiYWRtaW4ifQ==' http://localhost:1337/
curl -c cookies.txt http://localhost:1337/    # save cookies the server sets
curl -b cookies.txt http://localhost:1337/    # send them back
```

Send a form POST, JSON, and custom headers:

```bash
curl -d 'username=admin&password=hunter2' http://localhost:1337/login
curl -H 'Content-Type: application/json' -d '{"username": "admin"}' http://localhost:1337/api/login
curl -H 'X-Forwarded-For: 127.0.0.1' http://localhost:1337/
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

Print only the status code, for example to check whether a path exists:

```console
$ curl -s -o /dev/null -w '%{http_code}\n' http://localhost:1337/nope
404
```

## Common Pitfalls

- **Unquoted URLs in the shell.** `&` in a query string ends the command in bash and zsh. Wrap URLs in single quotes: `curl 'http://host/?a=1&b=2'`.
- **The PowerShell alias.** In Windows PowerShell 5.1, `curl` is `Invoke-WebRequest` and rejects flags like `-i`. Use `curl.exe`.
- **Quotes on Windows.** `cmd.exe` does not treat single quotes as quotes. Use double quotes there and escape inner double quotes with a backslash.
- **`-d` changes the request.** It sets the method to POST and the content type to `application/x-www-form-urlencoded`. Add `-H 'Content-Type: application/json'` when sending JSON.
- **Redirects look like empty pages.** A `302` with no body means the server wants you somewhere else. Add `-L` or read the `Location` header with `-i`.
- **Trailing newlines.** `echo` adds a newline, which changes Base64 output and hashes. Use `printf '%s'` when building values for `-b` or `-d`.

## References

- [curl man page](https://curl.se/docs/manpage.html)
- [Everything curl (free book)](https://everything.curl.dev/)
- [curl on Windows](https://curl.se/windows/)
