# Slides

This folder holds slide decks from club meetings and workshops. The Resources page on the club site links to this folder. The site does not copy or display these files.

## What belongs here

- One file per deck, from a meeting, workshop, or club event.
- PDF is the best format, since GitHub shows a PDF in the browser and nobody needs PowerPoint to read it. If other officers will need to edit the deck, add the source file (for example a `.pptx`) next to the PDF with the same name.
- For a deck in Google Slides, use **File > Download > PDF Document** and upload the PDF.

Challenge files and solve scripts do not go here. Put them in `content/challenges/<slug>/files/` with the write-up.

## File names

Start each name with the meeting date so the folder lists in order. Use lowercase letters, numbers, and hyphens:

```text
2026-11-05-intro-to-steganography.pdf
2026-11-12-web-exploitation-basics.pdf
```

## Add a file on GitHub

1. Open this folder in the repository on GitHub.
2. Click **Add file > Upload files** and drag the file in.
3. Choose **Create a new branch** and click **Propose changes**, then open the pull request.

The content check runs on the pull request, and an officer merges it.

## Add a file with git

```bash
git switch -c add-stego-slides
cp ~/Downloads/2026-11-05-intro-to-steganography.pdf content/resources/slides/
git add content/resources/slides
git commit -m "Add steganography slides"
git push -u origin add-stego-slides
```

Then open a pull request on GitHub.

## Size limits

GitHub's upload page takes files up to 25 MB. Through git, GitHub warns above 50 MB and rejects files over 100 MB. If a deck is too large, compress its images or export the PDF at a lower image quality.
