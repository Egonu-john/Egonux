import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Icon from '@/components/os/Icon';
import type { AnosaAuditEvent, AnosaEvidenceReview, AnosaEvidenceVerification, AnosaIntegrityIncident, AnosaRecoveryDrill, AnosaReleaseSimulation, AnosaReleaseWorkstream, AnosaReviewIntegrity, AnosaReviewState } from '@/lib/anosa/types';
import styles from '@/styles/AnosaMobile.module.css';

export default function EvidenceReviewPanel({ verification }: { verification: AnosaEvidenceVerification | null }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<AnosaEvidenceReview[]>([]);
  const [selected, setSelected] = useState<AnosaAuditEvent | null>(null);
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');
  const [recording, setRecording] = useState(false);
  const [controlledTest, setControlledTest] = useState<AnosaAuditEvent | null>(null);
  const [integrity, setIntegrity] = useState<AnosaReviewIntegrity | null>(null);
  const [incidents, setIncidents] = useState<AnosaIntegrityIncident[]>([]);
  const [recoveryDrills, setRecoveryDrills] = useState<AnosaRecoveryDrill[]>([]);
  const [releaseManifest, setReleaseManifest] = useState<{ version: string; manifestHash: string; workstreams: AnosaReleaseWorkstream[] } | null>(null);
  const [releaseSimulations, setReleaseSimulations] = useState<AnosaReleaseSimulation[]>([]);
  const [monitoring, setMonitoring] = useState(false);
  const [drilling, setDrilling] = useState(false);
  const [simulatingRelease, setSimulatingRelease] = useState(false);
  const queue = [...(verification?.auditEvents.filter((event) => !event.verified) ?? []), ...(controlledTest ? [controlledTest] : [])];

  const startControlledTest = async () => {
    if (recording) return;
    setRecording(true);
    try {
      const response = await fetch('/api/anosa/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ operation: 'create_controlled_test' }) });
      const body = await response.json();
      if (response.status === 428 && body.code === 'STEP_UP_REQUIRED') { void router.push('/login?next=/anosa'); return; }
      if (!response.ok) throw new Error(body.error || 'Controlled review test could not be created.');
      setControlledTest(body.event as AnosaAuditEvent);
      setNotice('Server-controlled evidence exception created. External execution remains disabled.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Controlled review test could not be created.'); }
    finally { setRecording(false); }
  };

  useEffect(() => {
    fetch('/api/anosa/reviews').then((response) => response.ok ? response.json() : null)
      .then((body) => { if (Array.isArray(body?.reviews)) setReviews(body.reviews); })
      .catch(() => undefined);
    fetch('/api/anosa/review-integrity').then((response) => response.ok ? response.json() : null)
      .then((body) => { if (body?.integrity) setIntegrity(body.integrity); })
      .catch(() => undefined);
    fetch('/api/anosa/integrity-incidents').then((response) => response.ok ? response.json() : null)
      .then((body) => { if (Array.isArray(body?.incidents)) setIncidents(body.incidents); })
      .catch(() => undefined);
    fetch('/api/anosa/recovery-drills').then((response) => response.ok ? response.json() : null)
      .then((body) => { if (Array.isArray(body?.drills)) setRecoveryDrills(body.drills); })
      .catch(() => undefined);
    fetch('/api/anosa/release-command').then((response) => response.ok ? response.json() : null)
      .then((body) => {
        if (body?.manifest) setReleaseManifest(body.manifest);
        if (Array.isArray(body?.simulations)) setReleaseSimulations(body.simulations);
      }).catch(() => undefined);
  }, []);

  const runIntegrityCheck = async () => {
    if (monitoring) return;
    setMonitoring(true);
    try {
      const response = await fetch('/api/anosa/integrity-incidents', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'run_integrity_check' }),
      });
      const body = await response.json();
      if (response.status === 428 && body.code === 'STEP_UP_REQUIRED') { void router.push('/login?next=/anosa'); return; }
      if (!response.ok) throw new Error(body.error || 'Integrity incident check could not be completed.');
      if (body.integrity) setIntegrity(body.integrity as AnosaReviewIntegrity);
      if (body.incident) setIncidents((current) => [body.incident as AnosaIntegrityIncident, ...current.filter((incident) => incident.id !== body.incident.id)].slice(0, 25));
      setNotice(body.status === 'healthy' ? 'Integrity check passed. No incident was created.' : 'Integrity incident recorded. External execution remained disabled.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Integrity monitoring failed closed.'); }
    finally { setMonitoring(false); }
  };

  const downloadIntegrityReport = async () => {
    try {
      const response = await fetch('/api/anosa/integrity-report');
      const body = response.ok ? null : await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || 'Integrity report could not be downloaded.');
      const url = URL.createObjectURL(await response.blob());
      const download = document.createElement('a');
      download.href = url;
      download.download = 'anosa-integrity-report.json';
      document.body.appendChild(download);
      download.click();
      download.remove();
      URL.revokeObjectURL(url);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Integrity report could not be downloaded.'); }
  };

  const runContainmentRecoveryDrill = async () => {
    if (drilling) return;
    setDrilling(true);
    try {
      const response = await fetch('/api/anosa/recovery-drills', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'run_containment_recovery_drill', requestId: crypto.randomUUID() }),
      });
      const body = await response.json();
      if (response.status === 428 && body.code === 'STEP_UP_REQUIRED') { void router.push('/login?next=/anosa'); return; }
      if (!response.ok) throw new Error(body.error || 'Containment and recovery drill could not be completed.');
      if (body.drill) setRecoveryDrills((current) => [body.drill as AnosaRecoveryDrill, ...current.filter((drill) => drill.id !== body.drill.id)].slice(0, 25));
      setNotice('Containment and recovery drill passed. External execution remained disabled.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Recovery drill failed closed.'); }
    finally { setDrilling(false); }
  };

  const runReleaseReadinessSimulation = async () => {
    if (simulatingRelease) return;
    setSimulatingRelease(true);
    try {
      const response = await fetch('/api/anosa/release-command', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'run_release_readiness_simulation', requestId: crypto.randomUUID() }),
      });
      const body = await response.json();
      if (response.status === 428 && body.code === 'STEP_UP_REQUIRED') { void router.push('/login?next=/anosa'); return; }
      if (!response.ok) throw new Error(body.error || 'Release readiness simulation could not be completed.');
      if (body.manifest) setReleaseManifest(body.manifest);
      if (body.simulation) setReleaseSimulations((current) => [body.simulation as AnosaReleaseSimulation, ...current.filter((item) => item.id !== body.simulation.id)].slice(0, 25));
      setNotice('Release readiness simulation passed. No deployment or external effect occurred.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Release simulation failed closed.'); }
    finally { setSimulatingRelease(false); }
  };

  const record = async (state: AnosaReviewState) => {
    if (!selected || reason.trim().length < 12 || recording) return;
    setRecording(true);
    try {
      const response = await fetch('/api/anosa/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'review', evidenceKind: selected.evidenceKind, evidenceId: selected.evidenceId, state, reason: reason.trim(), requestId: crypto.randomUUID() }),
      });
      const body = await response.json();
      if (response.status === 428 && body.code === 'STEP_UP_REQUIRED') { void router.push('/login?next=/anosa'); return; }
      if (!response.ok) throw new Error(body.error || 'Evidence review could not be recorded.');
      setReviews((current) => [body.review as AnosaEvidenceReview, ...current].slice(0, 50));
      fetch('/api/anosa/review-integrity').then((integrityResponse) => integrityResponse.ok ? integrityResponse.json() : null)
        .then((integrityBody) => { if (integrityBody?.integrity) setIntegrity(integrityBody.integrity); })
        .catch(() => undefined);
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
      {!controlledTest ? <button className={styles.secondaryAction} disabled={recording} onClick={() => void startControlledTest()} type="button">{recording ? 'Creating controlled test…' : 'Run controlled review test'}</button> : null}
    </section>
    {reviews.length ? <section className={styles.history} aria-label="Human review receipts"><div className={styles.sectionHeading}><div><span>REVIEW RECEIPTS</span><h2>Human review history</h2></div><small>{reviews.length} recorded</small></div>{reviews.slice(0, 10).map((review) => <article key={review.id}><Icon name="check" size={15} /><div><strong>{review.reason}</strong><small>{review.evidenceKind.replace('_', ' ')} · {review.contentHash.slice(0, 10)}</small></div><em data-state={review.state}>{review.state}</em></article>)}</section> : null}
    {integrity ? <><section className={styles.verificationCard} data-status={integrity.status} aria-label="Review audit integrity"><div><Icon name={integrity.status === 'verified' ? 'check' : 'lock'} size={18} /><span><small>PHASE 3.7 · ADMINISTRATIVE OVERSIGHT</small><strong>{integrity.status === 'verified' ? 'Review ledger integrity verified' : integrity.status === 'attention' ? 'Review ledger needs attention' : 'Cloud review verification pending'}</strong></span></div><p>{integrity.verifiedReceipts} of {integrity.checkedReceipts} receipts verified · {integrity.verifiedStates} of {integrity.currentStates} current states verified · {integrity.brokenReceipts} broken receipts</p><em>EXTERNAL EXECUTION DISABLED</em></section><button className={styles.secondaryAction} disabled={monitoring || integrity.status === 'unavailable'} onClick={() => void runIntegrityCheck()} type="button">{monitoring ? 'Running integrity check…' : 'Run integrity incident check'}</button></> : null}
    <section className={styles.history} aria-label="Integrity incident history"><div className={styles.sectionHeading}><div><span>PHASE 3.8 · INCIDENT RESPONSE</span><h2>Integrity incidents</h2></div><small>{incidents.length} recorded</small></div>{incidents.length ? incidents.map((incident) => <article key={incident.id}><Icon name="lock" size={15} /><div><strong>{incident.severity} integrity incident</strong><small>{incident.brokenReceipts} broken receipts · {incident.mismatchedStates} state mismatches</small></div><em data-state={incident.severity === 'high' ? 'rejected' : 'escalated'}>{incident.status}</em></article>) : <article><Icon name="check" size={15} /><div><strong>No integrity incidents detected</strong><small>Server checks remain fail-closed and read-only when healthy.</small></div><em>clear</em></article>}<button className={styles.secondaryAction} onClick={() => void downloadIntegrityReport()} type="button">Download integrity report</button></section>
    <section className={styles.history} aria-label="Containment and recovery drill history"><div className={styles.sectionHeading}><div><span>PHASE 3.9 · RESILIENCE CONTROL</span><h2>Containment &amp; recovery</h2></div><small>{recoveryDrills.length} verified</small></div>{recoveryDrills.length ? recoveryDrills.map((drill) => <article key={drill.id}><Icon name="check" size={15} /><div><strong>Controlled recovery verified</strong><small>containment {drill.containment} · recovery {drill.recovery}</small></div><em data-state="approved">{drill.status}</em></article>) : <article><Icon name="lock" size={15} /><div><strong>No recovery drills recorded</strong><small>Runs remain isolated, simulated, and append-only.</small></div><em>ready</em></article>}<button className={styles.secondaryAction} disabled={drilling || integrity?.status !== 'verified'} onClick={() => void runContainmentRecoveryDrill()} type="button">{drilling ? 'Running recovery drill…' : 'Run containment recovery drill'}</button></section>
    <section className={styles.history} aria-label="MVP release command center">
      <div className={styles.sectionHeading}><div><span>PHASE 4.0 · DELIVERY CONTROL</span><h2>MVP release command</h2></div><small>{releaseSimulations.length} verified</small></div>
      {releaseManifest ? <>
        <article><Icon name="check" size={15} /><div><strong>Release manifest v{releaseManifest.version}</strong><small>{releaseManifest.workstreams.filter((item) => item.status === 'ready').length} ready · {releaseManifest.workstreams.filter((item) => item.status === 'blocked').length} dependency-gated · {releaseManifest.manifestHash.slice(0, 10)}</small></div><em>controlled</em></article>
        {releaseManifest.workstreams.slice(0, 6).map((workstream) => <article key={workstream.id}><Icon name={workstream.status === 'ready' ? 'check' : 'lock'} size={15} /><div><strong>{workstream.sequence}. {workstream.name}</strong><small>{workstream.dependencies.length ? `requires ${workstream.dependencies.join(', ')}` : 'foundation workstream'}</small></div><em data-state={workstream.status === 'ready' ? 'approved' : undefined}>{workstream.status}</em></article>)}
      </> : <article><Icon name="lock" size={15} /><div><strong>Release manifest loading</strong><small>Dependency gates remain closed until verified.</small></div><em>locked</em></article>}
      {releaseSimulations.slice(0, 3).map((simulation) => <article key={simulation.id}><Icon name="check" size={15} /><div><strong>Release readiness simulated</strong><small>{simulation.readyWorkstreams} ready · {simulation.blockedWorkstreams} gated · no deployment</small></div><em data-state="approved">{simulation.status}</em></article>)}
      <button className={styles.secondaryAction} disabled={simulatingRelease || integrity?.status !== 'verified' || recoveryDrills.length === 0} onClick={() => void runReleaseReadinessSimulation()} type="button">{simulatingRelease ? 'Simulating release readiness…' : 'Run release readiness simulation'}</button>
    </section>
    {selected ? <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setSelected(null)}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="evidence-review-title" onMouseDown={(event) => event.stopPropagation()}><div className={styles.modalHandle} /><span className={styles.modalEyebrow}>PHASE 3.5 · HUMAN REVIEW</span><h2 id="evidence-review-title">Review evidence exception</h2><p>{selected.type.replace('anosa.', '').replace(/\./g, ' ')}</p><div className={styles.proposalMeta}><div><strong>Evidence</strong><small>{selected.evidenceKind.replace('_', ' ')} · {selected.evidenceId}</small></div><div><strong>Integrity</strong><small>{selected.contentHash.slice(0, 20)} · v{selected.schemaVersion}</small></div></div><label className={styles.reviewComposer}><span>Review reason</span><textarea maxLength={2000} minLength={12} onChange={(event) => setReason(event.target.value)} placeholder="Explain the decision (minimum 12 characters)…" value={reason} /></label><div className={styles.impact}><Icon name="lock" size={18} /><span><strong>Simulation-only boundary</strong><small>This review records evidence only. It cannot send, publish, transfer, deploy, or change access.</small></span></div><div className={styles.modalActionsThree}><button disabled={reason.trim().length < 12 || recording} onClick={() => record('rejected')} type="button">Reject</button><button disabled={reason.trim().length < 12 || recording} onClick={() => record('escalated')} type="button">Escalate</button><button disabled={reason.trim().length < 12 || recording} onClick={() => record('approved')} type="button">{recording ? 'Recording…' : 'Approve'}</button></div><button className={styles.closeModal} onClick={() => setSelected(null)} type="button" aria-label="Close"><Icon name="close" /></button></section></div> : null}
  </>;
}
