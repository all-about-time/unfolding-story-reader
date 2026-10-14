import fs from 'node:fs';
import assert from 'node:assert/strict';
const registry = JSON.parse(fs.readFileSync('data/renew/libraries.json', 'utf8'));
assert.equal(registry.schemaVersion, '1.0');
assert.equal(registry.moduleVersion, '0.2');
assert.ok(Array.isArray(registry.libraries));
for (const library of registry.libraries) {
  assert.match(library.id, /^[a-z0-9-]+$/);
  assert.ok(['placeholder', 'active'].includes(library.status));
  if (library.status === 'active') assert.equal(typeof library.file, 'string');
  assert.ok(Array.isArray(library.themes));
  for (const theme of library.themes) {
    assert.match(theme.id, /^[a-z0-9-]+$/);
    assert.ok(theme.name && theme.description);
  }
}
const html = fs.readFileSync('index.html', 'utf8');
const module = fs.readFileSync('renew.js', 'utf8');
for (const marker of ['panel-meditation', 'renew-theme-grid', 'renew-library-status', 'renew-journey']) assert.ok(html.includes(marker));
for (const marker of ['libraries.json', 'initRenew', 'renderThemes', 'loadActiveLibrary', 'resolvePassage', 'renew-stepper', 'renew-progress-line', 'renew-external', 'renew-internal', 'Reflection saved', 'Carry this response quietly']) assert.ok(module.includes(marker));
assert.ok(fs.existsSync('data/renew/libraries/experience-test.json'));
console.log('RENEW experience checks passed: test library, five-step journey, and local reflection markers.');
