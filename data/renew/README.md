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

`status` is either `placeholder` or `active`. An active library must have a `file` value. The adapter fetches that file and merges its themes at runtime.

Future active library files use this shape:

```json
{
  "schemaVersion": "1.0",
  "libraryVersion": "1.0",
  "themes": [
    {
      "id": "rest",
      "name": "Rest",
      "description": "A short, reader-facing description.",
      "scriptures": [{
        "id": "psalm-23-1",
        "reference": {
          "book": "PSA",
          "label": "Psalm 23:1",
          "startChapter": 23,
          "startVerse": 1,
          "endChapter": 23,
          "endVerse": 1
        }
      }]
    }
  ]
}
```

The reference points to the existing BSB book files. Do not put Scripture quotation text in a RENEW library. The library may contain only references and optional meditation metadata approved for publication.
