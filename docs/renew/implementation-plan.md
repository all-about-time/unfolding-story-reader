# RENEW Scripture Meditation — implementation plan

## Assessment

- The reader is a static, dependency-free HTML/CSS/ES-module application deployed by Azure Static Web Apps from the repository root.
- Navigation is controlled by `app.js`; Reading already lazy-loads BSB book JSON from `data/books/` and the plan from `data/sessions.json`.
- Browser `localStorage` is the sole persistence layer. It holds reader progress and display preferences. No accounts, server APIs, or OneDrive integration exist.
- `staticwebapp.config.json` excludes `/data/*` from navigation fallback and supplies JSON MIME support. This supports independently maintained RENEW library JSON.
- GitHub Actions deploys every `main` push with `app_location: /` and no build output. The public Azure URL is `https://red-glacier-017a86210.1.azurestaticapps.net/`.

## Content and scope basis

The supplied RENEW design decisions specify: begin at theme selection; request another Scripture only from that screen; guide Read, Emphasise, Notice, Explore, Respond; move manually through words; use six selectable exploration cards; retain a large Scripture focus with brief step guidance; save optional reflections locally with export/import; provide a quiet closing screen and optional save; show My Reflections on theme selection. The six needs are a reflection aid, not biblical doctrine. Scripture libraries and theme examples are placeholders at this stage.

The three named original methodology documents were not present in the accessible repository or attached-thread file list during Version 0.1 assessment. No substantive meditation prompts or Scripture collection has been invented. When supplied, their wording and content will replace only the data and guidance layers.

## Version checkpoints and acceptance criteria

| Version | Deliverable | Acceptance criteria |
| --- | --- | --- |
| 0.1 | Data-driven theme-selection shell | Meditation opens independently; placeholder themes load from JSON; a theme can be selected; Reading and Prayer retain their behavior; no Scripture or methodology content is invented. |
| 0.2 | Scripture library adapter | Active libraries load through the registry; selected references resolve from existing BSB book data; error and empty states are accessible. |
| 0.3 | READ and EMPHASISE | Large central verse; manual tap/arrow word emphasis; keyboard operation; step guidance and optional Learn More. |
| 0.4 | NOTICE | Optional short reflection field; draft state is local only and remains separate from the reading-plan progress. |
| 0.5 | EXPLORE | Six selectable need cards, short explanations, and the External → Internal → Eternal prompts with the reflection-aid clarification. |
| 0.6 | RESPOND and closing | Response prompt, quiet closing screen, optional reflection save. |
| 0.7 | My Reflections | Local reflection list, detail/reopen, optional export and import with schema validation. |
| 0.8 | Library authoring and resilience | Documented library schema, malformed-library recovery, library version metadata, and no-index.html content updates. |
| 0.9 | Accessibility and responsive review | Keyboard flow, focus management, labels, contrast, motion preferences, narrow and wide layouts. |
| 1.0 | Release validation | Full RENEW journey, storage/export/import checks, existing Reading regression checks, Git commit, Azure deployment, and published-reader validation. |

## Deliberate boundary

All RENEW data remains local in Version 1.0. The data layer uses namespaced keys and portable JSON so a later OneDrive sync implementation can map saved reflections without changing the meditation flow. OneDrive sync is not part of this implementation.
