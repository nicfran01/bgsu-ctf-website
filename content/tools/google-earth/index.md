---
name: Google Earth Pro
category: recon
summary: Desktop globe with satellite imagery, 3D terrain, and measuring tools, including circles of a set radius for pinning down where a photo was taken.
platforms: [linux, macos, windows, web]
officialUrl: https://www.google.com/earth/about/versions/
tags: [osint, geolocation, maps, trilateration]
---

## What It Is

Google Earth shows satellite imagery on a 3D globe with terrain, so you can look at mountains, buildings, and roads from any angle. The free desktop version, **Google Earth Pro**, has more tools than the web version: placemarks from exact coordinates, a ruler that draws circles of a given radius, historical imagery, and a terrain view that helps match the skyline in a photo. Google Earth on the web runs in a browser with a smaller set of features.

## When To Use It

- Geolocation challenges: working out where a photo was taken from landmarks, terrain, and distances.
- Drawing circles of known radius around landmarks to find where they cross (trilateration).
- Matching a photo's horizon or mountain shapes against 3D terrain.
- Checking older imagery when a place has changed (View > Historical Imagery).

## Installation

### Windows, macOS, and Linux

Download **Google Earth Pro on desktop** from https://www.google.com/earth/about/versions/ and run the installer. On Linux there are `.deb` and `.rpm` packages. It is free.

### Browser

Google Earth on the web works in Chrome and other modern browsers at https://earth.google.com/web/. It has a distance and area measuring tool, but no circle tool.

## Basic Usage

**Go to coordinates:** type them into the search box at the top left. Both formats work:

```text
32°25'38.78"N 110°44'56.14"W
32.427439, -110.748928
```

**Mark a point:** Add > Placemark (or the pushpin button). Type the coordinates into the placemark's latitude and longitude fields to place it exactly.

**Draw a circle with a set radius:**

1. Tools > Ruler, then choose the **Circle** tab.
2. Set the unit (for example **Feet**).
3. Click the center point, then move the mouse outward until **Radius** shows the distance you want, and click again.
4. Click **Save** to keep the circle on the map, and repeat for the next landmark.

Where two circles cross is where something at both distances could be. Two circles cross at up to two points, and what is visible in the photo usually decides between them.

**Measure a distance:** Tools > Ruler, **Line** tab, then click two points.

**Look at the view from a spot:** zoom down close to the ground and tilt (hold Shift and scroll, or use the navigation controls). Comparing the ridgeline with a photo confirms a location.

**Find photospheres:** in Google Maps, drag the Street View pegman onto the map. Blue lines are Street View roads and blue dots are 360-degree photos uploaded by users. The uploader's name appears in the top left corner while viewing one.

## Common Pitfalls

- **Mixing coordinate formats.** `32.42` degrees is not 32°42'. Paste coordinates exactly as given, or convert them carefully.
- **West and South are negative.** In decimal form, a West longitude needs a minus sign.
- **Two crossing points.** Two circles almost always cross twice. Check both against the photo before committing.
- **Rough distances.** Distances in hints may be rounded. Expect the true spot to be near the crossing, not exactly on it.
- **Imagery dates.** Satellite photos can be years old. Use historical imagery when a building or clearing in a photo is missing.

## References

- [Google Earth Pro: measure distances and areas](https://support.google.com/earth/answer/148110)
- [Google Earth versions and downloads](https://www.google.com/earth/about/versions/)
- [Bellingcat: geolocation guides](https://www.bellingcat.com/category/resources/how-tos/)
