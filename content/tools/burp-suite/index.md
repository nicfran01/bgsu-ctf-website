---
name: Burp Suite
category: web
summary: A proxy that sits between your browser and a web app so you can read, change, and replay every request, including ones the page would never send.
platforms: [linux, macos, windows]
officialUrl: https://portswigger.net/burp
caution: "Proxy and test only web apps from a challenge you are solving, or your own local test apps. Do not point it at BGSU websites, logins, or any site you do not own or have written permission to test."
tags: [web, proxy, http, repeater, intruder]
---

## What It Is

Burp Suite is a web proxy with tools built around it. Your browser sends its traffic through Burp, so every request and response passes through a window where you can read it, stop it, change it, and send it again. The free Community Edition includes the proxy, Repeater (resend one request with edits), and Decoder. The paid Professional Edition adds a fast Intruder and an automated scanner. For most club challenges, Community is enough.

## When To Use It

- A web challenge needs a request the browser will not make: a changed cookie, a tampered form field, a header the site does not expect.
- You want to send the same request many times with one value changed and compare the responses.
- You need to watch the exact requests a page makes, including background API calls, and replay them.
- You are working through the PortSwigger Web Security Academy labs, which are built around Burp.

For a single request from the command line, [curl](/tools/curl) is faster. [Browser DevTools](/tools/browser-devtools) covers reading traffic without a proxy. Burp is the choice when you want to stop a request mid-flight and edit it, or replay it repeatedly.

## Installation

Burp needs Java, but the official installers bundle their own runtime, so you do not install Java separately.

### Linux

Kali ships Burp Suite Community. Otherwise, download the Linux installer (a `.sh` script) from [portswigger.net/burp/communitydownload](https://portswigger.net/burp/communitydownload) and run it:

```bash
chmod +x burpsuite_community_linux_*.sh
./burpsuite_community_linux_*.sh
```

### macOS

Download the macOS installer (`.dmg`) from the same page and drag Burp Suite Community into Applications. A Homebrew cask also exists:

```bash
brew install --cask burp-suite
```

### Windows

Download and run the Windows installer (`.exe`) from the download page. It sets up a Start menu entry.

## Basic Usage

**Set up the proxy.** Burp listens on `127.0.0.1:8080` by default. Point your browser at that proxy. The simplest way is Burp's built-in browser: on the **Proxy** tab, click **Open Browser**, and its traffic already flows through Burp with the certificate trusted.

**Install the CA certificate (for your own browser).** To proxy HTTPS in your normal browser, visit `http://burpsuite` through the proxy, download the certificate, and add it to the browser's trusted authorities. This lets Burp read HTTPS traffic for the sites you test. Without it, HTTPS pages show certificate errors.

**Intercept a request.** On **Proxy > Intercept**, turn **Intercept on**. Load a page or submit a form; Burp pauses on the request so you can edit any part of it, then **Forward** it on or **Drop** it.

**Repeater.** Right-click a request (in the proxy history or intercept view) and choose **Send to Repeater**. In the Repeater tab you can edit the request and click **Send** as many times as you want, reading each response beside it. This is the tool you will use most: change one parameter, resend, compare.

**Proxy history.** The **Proxy > HTTP history** tab logs every request that passed through, including background API calls. Click one to see the full request and response, and send any of them to Repeater.

**Decoder.** The Decoder tab encodes and decodes Base64, URL encoding, and hex, which is handy for reading a cookie or building a tampered value. For longer chains, [CyberChef](/tools/cyberchef) does more.

## Common Pitfalls

- **HTTPS certificate errors.** If pages fail to load over HTTPS, the Burp CA certificate is not trusted in your browser. Use Burp's built-in browser, which trusts it already, or install the certificate as above.
- **Intercept left on.** With Intercept on, every request pauses and the browser looks frozen. Turn it off once you have what you need; the proxy still logs everything to HTTP history.
- **Scope.** Without a scope set, the history fills with noise from other tabs and background traffic. Add the target to **Target > Scope** and filter history to in-scope items.
- **Community has no scanner and a throttled Intruder.** The automated scanner and full-speed Intruder are Professional features. In Community, Intruder runs slowly; a short [Python](/tools/python) or [curl](/tools/curl) loop is often quicker for brute forcing.
- **Proxy still set after you finish.** If you changed your system or browser proxy by hand, pages will not load once Burp is closed. Unset the proxy, or use the built-in browser so your main browser is untouched.

## References

- [Burp Suite documentation](https://portswigger.net/burp/documentation)
- [Getting started with Burp Proxy](https://portswigger.net/burp/documentation/desktop/getting-started)
- [Web Security Academy](https://portswigger.net/web-security)
