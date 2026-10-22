import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const component = read('components/ui/EgonuxButton.tsx');
const css = read('styles/EgonuxButton.module.css');
const preview = read('pages/design-system/buttons.tsx');
const spec = read('docs/EGONUX_BUTTON_SYSTEM_V1.md');

assert.match(component, /export function EgonuxButton/);
assert.match(component, /export function EgonuxActionFeedback/);
assert.match(component, /type = 'button'/, 'Buttons must default to non-submit behavior');
assert.match(component, /disabled=\{disabled \|\| loading\}/, 'Loading must prevent repeat activation');
assert.match(css, /border-radius:\\s*999px/);
assert.match(css, /min-height:\\s*44px/);
assert.match(css, /:focus-visible/);
assert.match(css, /prefers-reduced-motion/);
assert.match(preview, /No wallet, identity, account or financial operation was performed/);
assert.match(spec, /success only after the actual workflow has succeeded/i);

const adoptedFiles = [
  'components/os/ActionModal.tsx',
  'components/os/DashboardView.tsx',
  'components/os/UserModuleViews.tsx',
  'components/os/EnterpriseViews.tsx',
  'components/anosa/AnosaMobile.tsx',
  'components/anosa/EvidenceReviewPanel.tsx',
  'pages/login.tsx',
];
for (const file of adoptedFiles) {
  const source = read(file);
  assert.match(source, /@\\/components\\/ui\\/EgonuxButton/, `${file} must import the shared button`);
  assert.match(source, /<EgonuxButton/, `${file} must use the shared button`);
  assert.doesNotMatch(source, /EgonUXButton/, `${file} contains an invalid component name`);
}

console.log(`EGONUX button-system contract passed: component, accessibility, safety, preview, and ${adoptedFiles.length} integrated screens.`);
