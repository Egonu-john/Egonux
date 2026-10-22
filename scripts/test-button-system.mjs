import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const component = read('components/ui/EgonuxButton.tsx');
const css = read('styles/EgonuxButton.module.css');
const preview = read('pages/design-system/buttons.tsx');
const spec = read('docs/EGONUX_BUTTON_SYSTEM_V1.md');

assert.ok(component.includes('export function EgonuxButton'));
assert.ok(component.includes('export function EgonuxActionFeedback'));
assert.ok(component.includes("type = 'button'"), 'Buttons must default to non-submit behavior');
assert.ok(component.includes('disabled={disabled || loading}'), 'Loading must prevent repeat activation');
assert.ok(css.includes('border-radius: 999px'));
assert.ok(css.includes('min-height: 44px'));
assert.ok(css.includes(':focus-visible'));
assert.ok(css.includes('prefers-reduced-motion'));
assert.ok(preview.includes('No wallet, identity, account or financial operation was performed'));
assert.ok(spec.includes('only display success after the operation has actually succeeded'));
const userModules = read('components/os/UserModuleViews.tsx');
assert.ok(!userModules.includes('egx_live_'), 'Demo settings must not contain a live-looking hard-coded API key');
assert.ok(userModules.includes('COPY DEMO KEY') && userModules.includes('ROTATE DEMO KEY'), 'Local-only credential controls must be labeled as demo actions');
assert.ok(!/const newKey = .*Math\\.random/.test(userModules), 'Demo key rotation must not use a weak random number generator');

const adoptedFiles = [
  'components/os/AppShell.tsx',
  'components/wallet/WalletLedgerView.tsx',
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
  assert.ok(source.includes('@/components/ui/EgonuxButton'), `${file} must import the shared button`);
  assert.ok(source.includes('<EgonuxButton'), `${file} must use the shared button`);
  assert.ok(!source.includes('EgonUXButton'), `${file} contains an invalid component name`);
}

console.log(`EGONUX button-system contract passed: component, accessibility, safety, preview, and ${adoptedFiles.length} integrated screens.`);
