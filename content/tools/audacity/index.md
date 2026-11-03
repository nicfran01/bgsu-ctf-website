---
name: Audacity
category: forensics
summary: Free audio editor whose spectrogram view reveals text and images hidden in the frequencies of a recording.
platforms: [linux, macos, windows]
officialUrl: https://www.audacityteam.org/
tags: [audio, spectrogram, steganography, wav]
---

## What It Is

Audacity is a free, open source audio editor. Besides recording and editing, it can draw any track as a spectrogram: time from left to right, frequency from bottom to top, and loudness as brightness. A message drawn into the frequencies of a sound is invisible to the ear and plain to see in that view, which makes Audacity a standard tool for audio steganography challenges.

## When To Use It

- An audio file sounds like noise, static, or tones with no words.
- A challenge mentions signals, frequencies, or "seeing" sound.
- Slowing down, reversing, or isolating part of a recording to hear it better.
- Checking for Morse code or tones you can read visually.

## Installation

### Linux

```bash
sudo apt install audacity
```

Audacity also publishes an AppImage on its download page, which is usually newer than distribution packages.

### macOS

```bash
brew install --cask audacity
```

Or download the `.dmg` from audacityteam.org.

### Windows

Download the installer from https://www.audacityteam.org/download/ and run it.

## Basic Usage

1. **Open the file:** File > Open (or drag the file into the window).
2. **Switch to spectrogram:** click the track name dropdown on the left side of the track and choose **Spectrogram**. **Multi-view** shows the waveform and spectrogram together.
3. **Make the track taller:** drag the bottom edge of the track down so text in the spectrogram is large enough to read.
4. **Tune the view:** open the same dropdown and choose **Spectrogram Settings**. Raise the **Max Frequency** if the image looks cut off at the top, and try larger **Window size** values for sharper lines.
5. **Zoom in on time:** View > Zoom > Zoom In, or Ctrl+1 (Cmd+1 on macOS).

Other useful tricks:

- **Effect > Special > Reverse** plays the audio backwards.
- **Effect > Pitch and Tempo > Change Speed** slows a fast message down.
- **Select a region and press Space** to play just that part.

**Sonic Visualiser** is another free tool built for analysis: open the file and use **Layer > Add Spectrogram**. From the command line, `ffmpeg -i file.wav -lavfi showspectrumpic=s=1400x500 out.png` writes a spectrogram image without any GUI.

## Common Pitfalls

- **Only listening.** Many audio challenges are silent or meaningless to the ear. Look at the spectrogram before spending time listening.
- **Text above the default range.** Messages drawn at high frequencies can sit above the visible area. Raise **Max Frequency** in Spectrogram Settings.
- **Stereo files.** Each channel can hold something different. Check both, or use the track dropdown to split stereo to mono.
- **Lossy conversion.** Exporting a WAV to MP3 can smear fine spectrogram detail. Work on the original file.

## References

- [Audacity manual: Spectrogram view](https://manual.audacityteam.org/man/spectrogram_view.html)
- [Audacity manual: Spectrogram settings](https://manual.audacityteam.org/man/spectrogram_settings.html)
- [Sonic Visualiser](https://www.sonicvisualiser.org/)
