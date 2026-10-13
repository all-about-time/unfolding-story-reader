# The Unfolding Story

A standalone progressive Bible reader built from The Unfolding Story v0.7 plan and the public-domain Berean Standard Bible.

Version 0.8 publishes all 266 sessions and lazy-loads Bible text by book. There is no account or calendar schedule.

## Data build

`node scripts/build-data.mjs` reads the v0.7 plan and BSB USJ source paths from `UNFOLDING_PLAN` and `BSB_USJ_DIR`, or from the adjacent Codex workspace defaults used for this release.

`node scripts/validate-data.mjs` confirms all 266 sessions, 66 book files, sequence identity, and every referenced verse.

Text attribution: Berean Standard Bible (BSB), public domain. https://berean.bible/
