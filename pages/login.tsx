import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { registerEgonuxMember, signInToEgonux } from '@/lib/auth/client';
import { firebaseClientConfigurationStatus } from '@/lib/firebase/client';
import styles from '@/styles/Auth.module.css';

type Mode = 'signin' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const configuration = firebaseClientConfigurationStatus();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'register') {
        await registerEgonuxMember(displayName, email, password);
      } else {
        await signInToEgonux(email, password);
      }
      await router.push('/os');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Head>
        <title>Secure access — EGONUX OS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className={styles.page}>
        <section className={styles.panel} aria-labelledby="auth-title">
          <Link href="/" aria-label="Return to EGONUX home">
            <Image
              className={styles.logo}
              src="/brand/egonux-primary-logo.png"
              alt="EGONUX Wealth Central Hub"
              width={2007}
              height={784}
              priority
            />
          </Link>
          <p className={styles.eyebrow}>EGONUX ID · SANDBOX ACCESS</p>
          <h1 id="auth-title">{mode === 'signin' ? 'Welcome back' : 'Create your EGONUX ID'}</h1>
          <p className={styles.intro}>One secure identity for the EGONUX digital-wealth ecosystem.</p>

          <div className={styles.tabs} aria-label="Authentication options">
            <button type="button" data-active={mode === 'signin'} onClick={() => setMode('signin')}>Sign in</button>
            <button type="button" data-active={mode === 'register'} onClick={() => setMode('register')}>Register</button>
          </div>

          {!configuration.configured ? (
            <div className={styles.notice} role="status">
              Firebase sandbox configuration is not connected in this deployment yet. No account data will be submitted.
            </div>
          ) : null}

          <form className={styles.form} onSubmit={submit}>
            {mode === 'register' ? (
              <label>
                Full name
                <input autoComplete="name" minLength={2} required value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              </label>
            ) : null}
            <label>
              Email address
              <input autoComplete="email" inputMode="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              Password
              <input autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={12} required type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <button className={styles.submit} disabled={busy || !configuration.configured} type="submit">
              {busy ? 'Securing session…' : mode === 'signin' ? 'Enter EGONUX OS' : 'Create secure account'}
            </button>
          </form>
          <p className={styles.boundary}>Sandbox only. Do not submit identity documents or financial information.</p>
        </section>
      </main>
    </>
  );
}
