# The Unfolding Story — Scripture Reader

Minimal static reader to embed in Notion. Session 001 is implemented using exact verse text extracted from the user's official Berean Standard Bible USJ archive.

Files: `index.html` user interface, `sessions.json` session metadata, `bible.json` selected verse text.

Deploy all three files to the root of `all-about-time/unfolding-story-reader` on branch `main`. Azure Static Web Apps workflow currently uses `app_location: /` and `output_location: ""`.

Launch at `https://YOUR-AZURE-URL/?session=001` and embed this URL in the Session 001 Notion page using `/embed`.

For new sessions, extend `sessions.json` with structured reference ranges and generate relevant USJ verses into `bible.json`. Do not merely add references without the matching Bible text. Note that this prototype holds only the Session 001 verses.

Text attribution: Berean Standard Bible (BSB), public domain. https://berean.bible/
