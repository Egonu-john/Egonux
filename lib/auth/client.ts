import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseClientApp } from '@/lib/firebase/client';

async function createServerSession() {
  const auth = getAuth(getFirebaseClientApp());
  const user = auth.currentUser;
  if (!user) throw new Error('Firebase authentication did not return a user.');
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: await user.getIdToken(true) }),
  });
  if (!response.ok) throw new Error('Unable to establish an EGONUX session.');
}

export async function signInToEgonux(email: string, password: string) {
  const auth = getAuth(getFirebaseClientApp());
  await signInWithEmailAndPassword(auth, email, password);
  await createServerSession();
}

export async function registerEgonuxMember(
  displayName: string,
  email: string,
  password: string,
) {
  const auth = getAuth(getFirebaseClientApp());
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createServerSession();
  const response = await fetch('/api/profile', {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName }),
  });
  if (!response.ok) throw new Error('Account created, but the member profile could not be initialized.');
}

export async function signOutOfEgonux() {
  await fetch('/api/auth/session', { method: 'DELETE', credentials: 'same-origin' });
  await signOut(getAuth(getFirebaseClientApp()));
}
