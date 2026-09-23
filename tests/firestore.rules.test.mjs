import { readFile } from 'node:fs/promises';
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

let environment;

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'egonux-sandbox',
    firestore: { rules: await readFile('firestore.rules', 'utf8') },
  });
});

after(async () => {
  await environment.cleanup();
});

test('a member can create and read only their safe profile fields', async () => {
  const db = environment.authenticatedContext('member-1', { roles: ['member'] }).firestore();
  const profile = doc(db, 'users/member-1');
  await assertSucceeds(setDoc(profile, {
    displayName: 'Sandbox Member',
    email: 'member@example.invalid',
    onboardingStatus: 'started',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(getDoc(profile));
});

test('a member cannot assign roles through their profile', async () => {
  const db = environment.authenticatedContext('member-2', { roles: ['member'] }).firestore();
  await assertFails(setDoc(doc(db, 'users/member-2'), {
    displayName: 'Unsafe Member',
    email: 'member@example.invalid',
    onboardingStatus: 'started',
    roles: ['founder'],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
});

test('client applications cannot write audit or consent records', async () => {
  const db = environment.authenticatedContext('member-3', { roles: ['member'] }).firestore();
  await assertFails(setDoc(doc(db, 'auditEvents/event-1'), { type: 'forged' }));
  await assertFails(setDoc(doc(db, 'users/member-3/consents/consent-1'), {
    purpose: 'privacy-policy',
    granted: true,
  }));
});

test('founder can read audit events but members cannot', async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'auditEvents/event-2'), { type: 'test' });
  });
  const founder = environment.authenticatedContext('founder-1', { roles: ['founder'] }).firestore();
  const member = environment.authenticatedContext('member-4', { roles: ['member'] }).firestore();
  await assertSucceeds(getDoc(doc(founder, 'auditEvents/event-2')));
  await assertFails(getDoc(doc(member, 'auditEvents/event-2')));
  assert.ok(true);
});

test('permanent evidence is founder-readable and client-immutable', async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'anosaDecisions/decision-1'), { actorUid: 'founder-1', immutable: true });
    await setDoc(doc(context.firestore(), 'anosaExecutionIntents/intent-1'), { actorUid: 'founder-1', immutable: true });
    await setDoc(doc(context.firestore(), 'anosaEvidenceCanaries/canary-1'), { actorUid: 'founder-1', immutable: true });
    await setDoc(doc(context.firestore(), 'anosaControlledReviewTests/test-1'), { actorUid: 'founder-1', immutable: true });
    await setDoc(doc(context.firestore(), 'anosaEvidenceReviewStates/state-1'), { reviewerUid: 'founder-1', state: 'escalated' });
    await setDoc(doc(context.firestore(), 'anosaIntegrityIncidents/incident-1'), { actorUid: 'founder-1', immutable: true });
    await setDoc(doc(context.firestore(), 'anosaRecoveryDrills/drill-1'), { actorUid: 'founder-1', immutable: true });
    await setDoc(doc(context.firestore(), 'anosaReleaseSimulations/simulation-1'), { actorUid: 'founder-1', immutable: true });
    await setDoc(doc(context.firestore(), 'anosaWorkPackageRegistries/registry-1'), { actorUid: 'founder-1', immutable: true });
  });
  const founder = environment.authenticatedContext('founder-1', { roles: ['founder'] }).firestore();
  const member = environment.authenticatedContext('member-5', { roles: ['member'] }).firestore();
  for (const path of ['anosaDecisions/decision-1', 'anosaExecutionIntents/intent-1', 'anosaEvidenceCanaries/canary-1', 'anosaControlledReviewTests/test-1', 'anosaEvidenceReviewStates/state-1', 'anosaIntegrityIncidents/incident-1', 'anosaRecoveryDrills/drill-1', 'anosaReleaseSimulations/simulation-1', 'anosaWorkPackageRegistries/registry-1']) {
    await assertSucceeds(getDoc(doc(founder, path)));
    await assertFails(getDoc(doc(member, path)));
    await assertFails(setDoc(doc(founder, path), { forged: true }));
  }
});
