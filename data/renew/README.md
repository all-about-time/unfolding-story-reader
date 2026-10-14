# RENEW Scripture libraries

`libraries.json` is the runtime registry. The reader fetches it every time the Meditation tab opens, so a library can be added or updated through GitHub without editing `index.html` or `renew.js`.

Static Azure hosting cannot list a folder's contents. Add a new library JSON file and add one entry to `libraries.json`; this registry update is the only required discovery step.

Library entry shape:

```json
{
  "id": "rest-v1",
  "name": "Rest",
  "status": "active",
  "file": "./data/renew/libraries/rest-v1.json",
  "themes": [{ "id": "rest", "name": "Rest", "description": "..." }]
}
```

Future active library files will contain a theme, ordered Scripture references, BSB source reference, and optional RENEW guidance. They must not embed copied Bible text where existing BSB book data can be used.
