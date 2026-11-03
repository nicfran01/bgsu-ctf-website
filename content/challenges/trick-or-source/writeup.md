---
title: "Trick or Source"
category: web
difficulty: easy
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
points: 100
author: Nick Francisco
tags: [view-source, html-comments]
summary: A ghost hid a message on a Halloween page where you cannot see it. View the page source and search for the flag format.
challengeUrl: https://happy-halloween-easy-challenge.vercel.app
---

## Overview

Trick or Source is a one-page Halloween site with a flag hidden in an HTML comment. Browsers skip comments when drawing a page, yet comments are still part of the HTML the server sends, so anyone can read them in the page source. The challenge teaches the first check on every web challenge: look at what the server actually sent, not only what the browser draws.

## Challenge Description

> Happy Halloween! A mischievous ghost has hidden a secret message somewhere on this spooky little web page. You won't find it just by looking... but it's definitely there. Flag format: BOO{...}

Challenge site: https://happy-halloween-easy-challenge.vercel.app (use the **Open live challenge** button). Only a web browser is needed.

## Recon

The page shows a few short Halloween facts (Samhain, the jack-o'-lantern, trick-or-treating) and a callout from the ghost. Nothing on screen looks like a flag. The description says you "won't find it just by looking", which points away from the rendered page and toward its source.

## Walkthrough

### 1. View the page source

Press **Ctrl+U** on Windows or Linux, or **Cmd+Option+U** on macOS. You can also right-click the page and choose **View Page Source**.

### 2. Search for the flag format

Press **Ctrl+F** (or **Cmd+F**) in the source view and search for `BOO{`. It lands on an HTML comment between the fact cards and the ghost callout:

```html
<!-- 👻 Boo! The ghost's secret message: BOO{v13w_s0urc3_1f_y0u_d4r3} -->
```

The **Elements** panel in [browser DevTools](/tools/browser-devtools) shows comments too.

## Solution

From a terminal, [curl](/tools/curl) fetches the same HTML the browser gets:

```console
$ curl -s https://happy-halloween-easy-challenge.vercel.app | grep 'BOO{'
    <!-- 👻 Boo! The ghost's secret message: BOO{v13w_s0urc3_1f_y0u_d4r3} -->
```

## Flag

```text
BOO{v13w_s0urc3_1f_y0u_d4r3}
```

## Takeaways

- Check the page source on every web challenge. It takes seconds and often turns up comments, hidden form fields, and script names.
- Hidden on the page is not hidden from the user. Comments, `display:none` elements, and hidden inputs all show up in the source.
- Search for the flag format instead of reading line by line.
- Real sites have leaked API keys, internal hostnames, and debug notes in HTML comments. Anything secret must stay on the server, and build tools should strip comments from production HTML.

## References

- [MDN: What are browser developer tools?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/What_are_browser_developer_tools)
- [OWASP: Review webpage content for information leakage](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/05-Review_Web_Page_Content_for_Information_Leakage)
