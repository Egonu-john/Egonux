import { useState } from 'react';
import type { NextPage } from 'next';
import { EgonuxActionLink } from '@/components/ui/EgonuxActionLink';
import { EgonuxActionFeedback, EgonuxButton } from '@/components/ui/EgonuxButton';
import styles from '@/styles/ButtonSystem.module.css';

const ButtonSystemPage: NextPage = () => {
  const [previewMessage, setPreviewMessage] = useState(false);
  const previewOnly = () => setPreviewMessage(true);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>EGONUX WEALTH CENTRAL HUB · DESIGN FOUNDATION</p>
            <h1 className={styles.title}>The button <span>standard.</span></h1>
            <p className={styles.intro}>One consistent action language for EGONUX OS and the wider ecosystem. Gold communicates primary intent; outlined controls support secondary actions; feedback describes outcomes only when the calling workflow can confirm them.</p>
          </div>
          <span className={styles.version}>PROPOSED V1.0</span>
        </header>

        <section className={styles.section} aria-labelledby="shape-heading">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="shape-heading">01 / Shape and label</h2>
            <p className={styles.sectionCopy}>Pill geometry is the default. Parenthesized labels are an optional branded treatment.</p>
          </div>
          <div className={styles.row}>
            <EgonuxButton onClick={previewOnly}>OPEN WALLET</EgonuxButton>
            <EgonuxButton variant="secondary" labelStyle="parenthesized" onClick={previewOnly}>VIEW PROFILE</EgonuxButton>
            <EgonuxButton variant="ghost" labelStyle="parenthesized" onClick={previewOnly}>LEARN MORE</EgonuxButton>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="variants-heading">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="variants-heading">02 / Action hierarchy</h2>
            <p className={styles.sectionCopy}>Use one primary action per local decision area. Reserve danger styling for destructive or security-sensitive actions.</p>
          </div>
          <div className={styles.row}>
            <EgonuxButton endIcon={<span aria-hidden="true">↗</span>} onClick={previewOnly}>CONTINUE</EgonuxButton>
            <EgonuxButton variant="secondary" onClick={previewOnly}>REVIEW DETAILS</EgonuxButton>
            <EgonuxButton variant="ghost" onClick={previewOnly}>CANCEL</EgonuxButton>
            <EgonuxButton variant="danger" onClick={previewOnly}>REVOKE SESSION</EgonuxButton>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="sizes-heading">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="sizes-heading">03 / Responsive sizing</h2>
            <p className={styles.sectionCopy}>Small controls are for dense secondary UI; medium is the default; large is for prominent page-level actions.</p>
          </div>
          <div className={styles.row}>
            <EgonuxButton size="sm" variant="secondary">COMPACT</EgonuxButton>
            <EgonuxButton size="md">STANDARD</EgonuxButton>
            <EgonuxButton size="lg">PRIMARY ACTION</EgonuxButton>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="states-heading">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="states-heading">04 / Interaction states</h2>
            <p className={styles.sectionCopy}>Focus is keyboard-visible, disabled controls are inert, and loading blocks duplicate submissions.</p>
          </div>
          <div className={styles.row}>
            <EgonuxButton loading>PROCESSING</EgonuxButton>
            <EgonuxButton disabled variant="secondary">UNAVAILABLE</EgonuxButton>
            <EgonuxButton onClick={previewOnly}>PREVIEW INTERACTION</EgonuxButton>
          </div>
          <div aria-live="polite" className={styles.feedbackArea} style={{ marginTop: '1rem' }}>
            {previewMessage ? <EgonuxActionFeedback status="info">Preview interaction registered. No wallet, identity, account or financial operation was performed.</EgonuxActionFeedback> : null}
          </div>
          <div className={styles.note}><strong>Outcome integrity:</strong> success feedback must be shown only after the actual workflow confirms success. Loading is not success. A visual control does not replace authentication, authorization, server-side validation, audit logging, or transaction safeguards.</div>
        </section>

        <section className={styles.section} aria-labelledby="feedback-heading">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="feedback-heading">05 / Result language</h2>
            <p className={styles.sectionCopy}>Examples demonstrate the feedback component. Production screens must connect them to observed outcomes.</p>
          </div>
          <div className={styles.resultNumbers} aria-label="Example resulting language: 0, 9, 10, 11, 12, 13, 14">
            {['0', '9', '10', '11', '12', '13', '14'].map((number) => (
              <span className={styles.resultNumber} key={number}>( {number} )</span>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="links-heading">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="links-heading">06 / Navigation CTAs</h2>
            <p className={styles.sectionCopy}>Navigation remains a semantic link while sharing the same pill geometry, gold palette, and optional parenthesized label.</p>
          </div>
          <div className={styles.row}>
            <EgonuxActionLink href="/os" size="lg" labelStyle="parenthesized">OPEN EGONUX OS</EgonuxActionLink>
            <EgonuxActionLink href="#shape-heading" size="lg" variant="secondary" labelStyle="parenthesized">RETURN TO BUTTONS</EgonuxActionLink>
          </div>
        </section>

        <footer className={styles.footer}>LEARN. BUILD. GROW. LEAD. · EGONUX Ecosystem Button System · Shared component foundation; rollout to existing modules follows review and validation.</footer>
      </div>
    </main>
  );
};

export default ButtonSystemPage;
