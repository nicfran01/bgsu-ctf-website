---
name: Browser DevTools
category: web
summary: The developer tools built into Chrome, Edge, and Firefox. Read page source, edit cookies, watch API calls, and run JavaScript against a site.
platforms: [web, linux, macos, windows]
officialUrl: https://developer.chrome.com/docs/devtools
tags: [browser, cookies, network, javascript, web]
---

## What It Is

Every major browser has developer tools built in. They show the HTML the server actually sent, every request the page makes, every cookie and local storage value, and the JavaScript running on the page, and they let you change all of it. For most web challenges they are the only tool you need.

## When To Use It

- First look at any web challenge: page source, comments, hidden fields, and script files.
- Reading and editing cookies and local storage.
- Watching which API endpoints a page calls, with what parameters.
- Running JavaScript against the site: decoding values, calling `fetch`, or poking at the page's own functions.

## Installation

### Any platform

Nothing to install. Chrome, Edge, Firefox, Brave, and other Chromium browsers all include developer tools. Safari needs one setting: Safari > Settings > Advanced > **Show features for web developers**.

Ways to open them:

| Action | Windows and Linux | macOS |
| --- | --- | --- |
| Open DevTools | F12 or Ctrl+Shift+I | Cmd+Option+I |
| View page source | Ctrl+U | Cmd+Option+U |
| Open the Console directly | Ctrl+Shift+J (Chrome) or Ctrl+Shift+K (Firefox) | Cmd+Option+J (Chrome) or Cmd+Option+K (Firefox) |

Right-clicking any element and choosing **Inspect** opens DevTools with that element selected.

## Basic Usage

**View Source** shows the raw HTML exactly as the server sent it, including comments. Press Ctrl+F (Cmd+F) and search for the flag format.

**Elements** (Firefox: **Inspector**) shows the live page. You can edit text and attributes, remove `disabled` from a button, or reveal elements hidden with `display: none`. Changes affect only your copy of the page.

**Console** runs JavaScript in the page:

```javascript
atob("eyJyb2xlIjoiZ3Vlc3QifQ==")          // '{"role":"guest"}'  (Base64 decode)
btoa('{"role":"reaper"}')                // 'eyJyb2xlIjoicmVhcGVyIn0='  (Base64 encode)
document.cookie                          // cookies the page's scripts can see
fetch('/api/record?id=1052').then(r => r.json()).then(console.log)
```

**Network** lists every request the page makes. Reload with the panel open to capture them. Click a request to see its URL, parameters, request and response headers, cookies, and the response body. Filter by **Fetch/XHR** to see only API calls. Right-click a request and choose **Copy > Copy as cURL** to replay it in a terminal with [curl](/tools/curl).

**Application** (Chrome and Edge) or **Storage** (Firefox) shows cookies, local storage, and session storage. Double-click a cookie value to edit it, then reload the page.

**Sources** (Firefox: **Debugger**) shows the page's JavaScript files. Use the `{}` button to pretty-print minified code, and set breakpoints by clicking a line number.

## Common Pitfalls

- **Editing the page is not the same as convincing the server.** Removing `disabled` from a button only helps if the button has a working click handler. Find the request the button would send and make it yourself.
- **HttpOnly cookies.** `document.cookie` cannot read cookies marked HttpOnly. They still show in the Application or Storage panel, where you can edit them.
- **Network panel was closed during load.** Requests made before the panel opened are not listed. Open the panel, then reload.
- **Cached responses.** If a change does not seem to take effect, check **Disable cache** in the Network panel and reload.

## References

- [Chrome DevTools documentation](https://developer.chrome.com/docs/devtools)
- [Firefox DevTools user docs](https://firefox-source-docs.mozilla.org/devtools-user/)
- [MDN: What are browser developer tools?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/What_are_browser_developer_tools)
