import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Icon from '@/components/os/Icon';
import type { AnosaAuditEvent, AnosaEvidenceReview, AnosaEvidenceVerification, AnosaReviewState } from '@/lib/anosa/types';
import styles from '@/styles/AnosaMobile.module.css';

export default function EvidenceReviewPanel({ verification }: { verification: AnosaEvidenceVerification | null }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<AnosaEvidenceReview[]>([]);
  const [selected, setSelected] = useState<AnosaAuditEvent | null>(null);
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');
  const [recording, setRecording] = useState(false);
  const [controlledTest, setControlledTest] = useState<AnosaAuditEvent | null>(null);
  const queue = [...(verification?.auditEvents.filter((event) => !event.verified) ?? []), ...(controlledTest ? [controlledTest] : [])];

  const startControlledTest = () => {
    const startedAt = new Date().toISOString();
    setControlledTest({
      id: `controlled-review:${startedAt}`,
      evidenceKind: 'decision',
      evidenceId: `controlled-review-${Date.now()}`,
      type: 'anosa.controlled_review.test',
      occurredAt: startedAt,
      contentHash: '0'.repeat(64),
      schemaVersion: 2,
      signatureVerified: false,
      verified: false,
    });
    setNotice('Controlled evidence exception created. External execution remains disabled.');
  };

  useEffect(() => {
    fetch('/api/anosa/reviews').then((response) => response.ok ? response.json() : null)
      .then((body) => { if (Array.isArray(body?.reviews)) setReviews(body.reviews); })
      .catch(() => undefined);
  }, []);

  const record = async (state: AnosaReviewState) => {
    if (!selected || reason.trim().length < 12 || recording) return;
    setRecording(true);
    try {
      const response = await fetch('/api/anosa/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceKind: selected.evidenceKind, evidenceId: selected.evidenceId, state, reason: reason.trim() }),
      });
      const body = await response.json();
      if (response.status === 428 && body.code === 'STEP_UP_REQUIRED') { void router.push('/login?next=/anosa'); return; }
      if (!response.ok) throw new Error(body.error || 'Evidence review could not be recorded.');
      setReviews((current) => [body.review as AnosaEvidenceReview, ...current].slice(0, 50));
      setNotice(`${state} review recorded. External execution remained disabled.`);
      if (selected.id.startsWith('controlled-review:')) setControlledTest(null);
      setSelected(null); setReason('');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'No review was recorded.'); }
    finally { setRecording(false); }
  };

  return <>
    {notice ? <button className={styles.notice} onClick={() => setNotice('')} type="button">{notice}<Icon name="close" size={14} /></button> : null}
    <section className={styles.history} aria-label="Human evidence review queue">
      <div className={styles.sectionHeading}><div><span>PHASE 3.5 · HUMAN AUTHORITY</span><h2>Evidence review queue</h2></div><small>{queue.length} open</small></div>
      {queue.length ? queue.map((event) => <article key={`review:${event.id}`}><Icon name="lock" size={15} /><div><strong>{event.type.replace('anosa.', '').replace(/\./g, ' ')}</strong><small>{event.evidenceKind.replace('_', ' ')} · {event.contentHash.slice(0, 10)}</small></div><button className={styles.reviewAction} onClick={() => { setSelected(event); setReason(''); }} type="button">Review</button></article>) : <article><Icon name="check" size={15} /><div><strong>No evidence awaiting review</strong><small>Broken or unmatched evidence will appear here.</small></div><em>clear</em></article>}
      {!controlledTest ? <button className={styles.secondaryAction} onClick={startControlledTest} type="button">Run controlled review test</button> : null}
    </section>
    {reviews.length ? <section className={styles.history} aria-label="Human review receipts"><div className={styles.sectionHeading}><div><span>REVIEW RECEIPTS</span><h2>Human review history</h2></div><small>{reviews.length} recorded</small></div>{reviews.slice(0, 10).map((review) => <article key={review.id}><Icon name="check" size={15} /><div><strong>{review.reason}</strong><small>{review.evidenceKind.replace('_', ' ')} · {review.contentHash.slice(0, 10)}</small></div><em data-state={review.state}>{review.state}</em></article>)}</section> : null}
    {selected ? <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setSelected(null)}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="evidence-review-title" onMouseDown={(event) => event.stopPropagation()}><div className={styles.modalHandle} /><span className={styles.modalEyebrow}>PHASE 3.5 · HUMAN REVIEW</span><h2 id="evidence-review-title">Review evidence exception</h2><p>{selected.type.replace('anosa.', '').replace(/\./g, ' ')}</p><div className={styles.proposalMeta}><div><strong>Evidence</strong><small>{selected.evidenceKind.replace('_', ' ')} · {selected.evidenceId}</small></div><div><strong>Integrity</strong><small>{selected.contentHash.slice(0, 20)} · v{selected.schemaVersion}</small></div></div><label className={styles.reviewComposer}><span>Review reason</span><textarea maxLength={2000} minLength={12} onChange={(event) => setReason(event.target.value)} placeholder="Explain the decision (minimum 12 characters)…" value={reason} /></label><div className={styles.impact}><Icon name="lock" size={18} /><span><strong>Simulation-only boundary</strong><small>This review records evidence only. It cannot send, publish, transfer, deploy, or change access.</small></span></div><div className={styles.modalActionsThree}><button disabled={reason.trim().length < 12 || recording} onClick={() => record('rejected')} type="button">Reject</button><button disabled={reason.trim().length < 12 || recording} onClick={() => record('escalated')} type="button">Escalate</button><button disabled={reason.trim().length < 12 || recording} onClick={() => record('approved')} type="button">{recording ? 'Recording…' : 'Approve'}</button></div><button className={styles.closeModal} onClick={() => setSelected(null)} type="button" aria-label="Close"><Icon name="close" /></button></section></div> : null}
  </>;
}
