# The Unfolding Story

A standalone progressive Bible reader built from The Unfolding Story v0.7 plan and the public-domain Berean Standard Bible.

Version 0.9 includes all 266 sessions, an expandable searchable overview, light/dark themes, text-size preferences, and completion controls at the top and bottom of each session. Progress is saved in this browser with no account or calendar schedule.

Opening the reader's home URL resumes at the session after the highest completed session. Explicit session links still open the selected reading. After Session 266 is complete, the reader stays on Session 266. Completion can be toggled off to correct a mistake. Clearing browser data clears progress; it does not sync between devices.

Public reader: https://red-glacier-017a86210.1.azurestaticapps.net/

## Data build

`node scripts/build-data.mjs` reads the v0.7 plan and BSB USJ source paths from `UNFOLDING_PLAN` and `BSB_USJ_DIR`, or from the adjacent Codex workspace defaults used for this release.

`node scripts/validate-data.mjs` confirms all 266 sessions, 66 book files, sequence identity, and every referenced verse.

Text attribution: Berean Standard Bible (BSB), public domain. https://berean.bible/
