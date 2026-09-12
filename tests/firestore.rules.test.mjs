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
