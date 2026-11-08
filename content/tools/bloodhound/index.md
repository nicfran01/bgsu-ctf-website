---
name: BloodHound
category: active-directory
summary: Maps Active Directory as a graph so you can find the shortest path from a user you control to Domain Admin.
platforms: [linux, macos, windows]
officialUrl: https://bloodhound.readthedocs.io/
caution: "Collect and analyze Active Directory data only from a lab domain you own or a target a challenge or engagement explicitly authorizes. Do not run collectors against the BGSU domain or any campus Active Directory you are not given written permission to test."
tags: [active-directory, graph, privilege-escalation, sharphound, neo4j]
---

## What It Is

BloodHound reads the structure of an Active Directory domain (users, groups, computers, sessions, and the permissions between them) and loads it into a graph database. You then ask it questions like "show me a path from this low-privilege user to Domain Admin," and it draws the chain of group memberships and rights that gets there. The work splits in two: a collector (SharpHound, or the Python collector) gathers the data from the domain and writes JSON files, and the BloodHound app ingests those files and lets you query and visualize them. The current Community Edition runs as a web app backed by a Neo4j database, usually started with Docker.

## When To Use It

- An Active Directory challenge or lab gives you a foothold (one set of credentials) and you need to find a route to higher privilege.
- You have already collected domain data and want to see which users can reach sensitive groups.
- You want to spot misconfigurations such as a user who can reset another user's password, or a path through Kerberos delegation.

BloodHound analyzes data someone else collected just as well, so in many challenges you receive the JSON or a database dump and only run the app.

## Installation

BloodHound has two parts. Install the app where you analyze, and run the matching collector against the domain.

### Linux

The Community Edition ships as Docker containers. With Docker installed:

```bash
curl -L https://ghst.ly/getbhce | docker compose -f - up
```

This starts Neo4j and the BloodHound web UI. Open `http://localhost:8080` and sign in with the one-time password printed in the container logs. The older BloodHound Legacy is an Electron app in the Kali repositories (`sudo apt install bloodhound`) paired with a local Neo4j.

### macOS

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), then run the same `docker compose` command as Linux. The web UI opens in your browser.

### Windows

Install Docker Desktop and run the same command in PowerShell. The SharpHound collector is a Windows executable or PowerShell script and runs on a domain-joined Windows host or through a tool like `bloodhound-python` from Linux.

## Basic Usage

**Collect the data.** From a Windows host in the target lab domain, run SharpHound to gather everything into a ZIP of JSON files:

```powershell
SharpHound.exe -c All
```

From Linux, the Python collector does the same with credentials you already have:

```bash
bloodhound-python -u jdoe -p 'Password1' -d lab.local -ns 10.0.0.1 -c All
```

Both write JSON files (SharpHound zips them). These are the files you load into the app.

**Load it.** In the BloodHound web UI, open the upload area and drag in the ZIP or JSON files. The app ingests them into Neo4j.

**Ask questions.** Use the built-in queries to start. Common ones:

- **Shortest Paths to Domain Admins**: the classic "how do I get there" view.
- **Find Shortest Paths to Domain Admins from Owned Principals**: mark the user you control as "owned," then run this to see your route.
- **Find Principals with DCSync Rights**: accounts that can pull password hashes from the domain controller.

Right-click any node to mark it owned, set it as a start or end point, or expand its group memberships. The graph shows each edge (for example `MemberOf`, `AdminTo`, `ForceChangePassword`) that makes the path work, and clicking an edge explains how to use it.

## Common Pitfalls

- **Clock skew breaks collection.** SharpHound and the Python collector talk Kerberos, which fails if your machine's clock is more than a few minutes off the domain controller. Sync the time first.
- **Legacy versus Community Edition.** Guides written for BloodHound Legacy (the Electron app) do not match the Community web UI exactly. Menus and query names moved. Check which one you are running before following a walkthrough.
- **Collector and app versions must match.** A new SharpHound writes a data format an old BloodHound cannot read, and the other way around. Use the collector that ships with your app version.
- **Stale data.** The graph is a snapshot from when you collected. Sessions and group changes after that are not reflected. Re-collect if the domain has changed.
- **Mark your owned nodes.** The most useful queries start from principals you control. If you never mark anything owned, the "from owned" paths return nothing.

## References

- [BloodHound Community Edition docs](https://bloodhound.readthedocs.io/)
- [SharpHound collector](https://github.com/BloodHoundAD/SharpHound)
- [bloodhound-python collector](https://github.com/dirkjanm/BloodHound.py)
