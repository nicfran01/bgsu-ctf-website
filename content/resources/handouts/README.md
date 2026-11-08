# Handouts

This folder holds the handouts from club meetings, such as cheat sheets and worksheets. The Resources page on the club site links to this folder. The site does not copy or display these files.

## What belongs here

- Handouts given out at a meeting or workshop, one file per handout.
- PDF is the best format, since GitHub shows a PDF in the browser. If other officers will need to edit a handout, add the source file (for example a `.docx`) next to the PDF with the same name.

Challenge files and solve scripts do not go here. Put them in `content/challenges/<slug>/files/` with the write-up.

## File names

Start each name with the meeting date so the folder lists in order. Use lowercase letters, numbers, and hyphens:

```text
2026-11-05-steganography-cheat-sheet.pdf
2026-11-12-linux-commands.pdf
```

## Add a file on GitHub

1. Open this folder in the repository on GitHub.
2. Click **Add file > Upload files** and drag the file in.
3. Choose **Create a new branch** and click **Propose changes**, then open the pull request.

The content check runs on the pull request, and an officer merges it.

## Add a file with git

```bash
git switch -c add-stego-handout
cp ~/Downloads/2026-11-05-steganography-cheat-sheet.pdf content/resources/handouts/
git add content/resources/handouts
git commit -m "Add steganography handout"
git push -u origin add-stego-handout
```

Then open a pull request on GitHub.

## Size limits

GitHub's upload page takes files up to 25 MB. Through git, GitHub warns above 50 MB and rejects files over 100 MB. Handouts are usually far smaller, so a file near those limits probably has large images that should be compressed first.
