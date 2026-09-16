import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/os/Icon';
import type { AnosaSource } from '@/lib/anosa/sources';
import type { AnosaAnswer, AnosaDecisionRecord, AnosaDecisionState, AnosaProposal } from '@/lib/anosa/types';
import type { AuthenticatedPrincipal } from '@/types/backend';
import styles from '@/styles/AnosaMobile.module.css';

type Tab = 'home' | 'ask' | 'approvals' | 'security';

interface AnosaMobileProps {
  principal: AuthenticatedPrincipal | null;
  previewMode: boolean;
}

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const workspaceStorageKey = 'egonux_anosa_founder_workspace_v2';
const initialApprovals: AnosaProposal[] = [
  {
    id: 'brief-001', title: 'Prepare weekly founder brief',
    purpose: 'Create a concise founder review of the current EGONUX MVP state.',
    detail: 'Compile product, access, security, and delivery signals into a review document.',
    impact: 'Creates a draft only. No distribution.', risk: 'Low',
    executionBoundary: 'Decision recording only. Execution remains locked.',
    sourceIds: ['enterprise-mvp', 'anosa-mobile-v1'], createdAt: '2026-09-16T00:00:00.000Z', state: 'pending',
  },
  {
    id: 'access-002', title: 'Review elevated access',
    purpose: 'Verify that privileged access remains aligned with founder governance.',
    detail: 'Prepare a list of elevated roles for founder and security review.',
    impact: 'No roles or permissions will change.', risk: 'Medium',
    executionBoundary: 'Decision recording only. Execution remains locked.',
    sourceIds: ['security-policy', 'anosa-mobile-v1'], createdAt: '2026-09-16T00:00:00.000Z', state: 'pending',
  },
  {
    id: 'roadmap-003', title: 'Prepare ANOSA intelligence roadmap',
    purpose: 'Sequence the next controlled intelligence capabilities.',
    detail: 'Convert the mobile founder experience into an implementation backlog with acceptance gates.',
    impact: 'Creates planning material only.', risk: 'Low',
    executionBoundary: 'Decision recording only. Execution remains locked.',
    sourceIds: ['anosa-mobile-v1', 'github-main'], createdAt: '2026-09-16T00:00:00.000Z', state: 'pending',
  },
];

const tabs: Array<{ id: Tab; label: string; icon: 'home' | 'ai' | 'check' | 'security' }> = [
  { id: 'home', label: 'Today', icon: 'home' }, { id: 'ask', label: 'Ask', icon: 'ai' },
  { id: 'approvals', label: 'Approve', icon: 'check' }, { id: 'security', label: 'Security', icon: 'security' },
];

function founderName(principal: AuthenticatedPrincipal | null) {
  if (principal?.displayName) return principal.displayName;
  if (!principal?.email) return 'Founder';
  const candidate = principal.email.split('@')[0]?.split(/[._-]/)[0];
  return candidate ? `${candidate.charAt(0).toUpperCase()}${candidate.slice(1)}` : 'Founder';
}

function decisionLabel(state: AnosaProposal['state']) {
  return state === 'changes_requested' ? 'changes requested' : state;
}

export default function AnosaMobile({ principal, previewMode }: AnosaMobileProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [approvals, setApprovals] = useState<AnosaProposal[]>(initialApprovals);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<AnosaAnswer | null>(null);
  const [sources, setSources] = useState<AnosaSource[]>([]);
  const [paused, setPaused] = useState(false);
  const [notice, setNotice] = useState('');
  const [decisionLog, setDecisionLog] = useState<AnosaDecisionRecord[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const pendingCount = approvals.filter((approval) => approval.state === 'pending').length;
  const selected = useMemo(() => approvals.find((approval) => approval.id === selectedId) ?? null, [approvals, selectedId]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(workspaceStorageKey);
        if (stored) {
          const workspace = JSON.parse(stored) as { approvals?: AnosaProposal[]; decisionLog?: AnosaDecisionRecord[]; paused?: boolean };
          if (Array.isArray(workspace.approvals) && workspace.approvals.length) setApprovals(workspace.approvals.slice(0, 30));
          if (Array.isArray(workspace.decisionLog)) setDecisionLog(workspace.decisionLog.slice(0, 50));
          setPaused(workspace.paused === true);
        }
      } catch { setNotice('Saved device state could not be restored. A clean workspace was opened.'); }
      finally { setStorageReady(true); }
    });
    const installHandler = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    window.addEventListener('beforeinstallprompt', installHandler);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/anosa-sw.js').catch(() => undefined);
    Promise.all([
      fetch('/api/anosa/context').then((response) => response.ok ? response.json() : Promise.reject()),
      fetch('/api/anosa/decisions').then((response) => response.ok ? response.json() : Promise.reject()),
    ]).then(([context, decisions]) => {
      if (Array.isArray(context.sources)) setSources(context.sources);
      if (Array.isArray(decisions.decisions) && decisions.decisions.length) setDecisionLog(decisions.decisions);
    }).catch(() => setNotice('ANOSA opened with saved device data. Connected sources will retry on your next request.'));
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('beforeinstallprompt', installHandler); };
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(workspaceStorageKey, JSON.stringify({ approvals, decisionLog, paused }));
  }, [approvals, decisionLog, paused, storageReady]);

  const recordDecision = async (state: AnosaDecisionState) => {
    if (!selected || !confirmed || paused || recording) return;
    setRecording(true);
    try {
      const response = await fetch('/api/anosa/decisions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proposalId: selected.id, title: selected.title, state }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Decision ledger unavailable.');
      setApprovals((current) => current.map((item) => item.id === selected.id ? { ...item, state } : item));
      setDecisionLog((current) => [body.decision as AnosaDecisionRecord, ...current.filter((item) => item.id !== body.decision.id)].slice(0, 50));
      setNotice(state === 'approved' ? 'Founder approval recorded in the tamper-evident ledger. Execution remains locked.' : state === 'changes_requested' ? 'Changes requested. The proposal remains non-executing.' : 'Proposal rejected. No action was taken.');
      setSelectedId(null); setConfirmed(false);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'No decision was recorded.'); }
    finally { setRecording(false); }
  };

  const askAnosa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (paused || thinking) { if (paused) setNotice('ANOSA is paused. Resume the workspace before preparing a response.'); return; }
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    setThinking(true);
    try {
      const response = await fetch('/api/anosa/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: cleanQuestion }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'ANOSA could not prepare a response.');
      const result = body as AnosaAnswer;
      setAnswer(result); setSources(result.sources);
      setApprovals((current) => [...result.proposals, ...current.filter((existing) => !result.proposals.some((proposal) => proposal.id === existing.id))].slice(0, 30));
      setQuestion(''); setNotice(`${result.proposals.length} reviewable proposal${result.proposals.length === 1 ? '' : 's'} prepared. Nothing was executed.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'ANOSA could not prepare a response.'); }
    finally { setThinking(false); }
  };

  const installAnosa = async () => {
    if (!installPrompt) { setNotice('Use your browser menu and choose “Add to Home screen” or “Install app”.'); return; }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setNotice(choice.outcome === 'accepted' ? 'ANOSA installation accepted.' : 'Installation cancelled.');
    setInstallPrompt(null);
  };

  return <main className={styles.page}>
    <div className={styles.ambient} aria-hidden="true" />
    <section className={styles.phone} aria-label="ANOSA Personal Mobile">
      <header className={styles.header}><div className={styles.brand}><Image src="/brand/egonux-primary-logo.png" alt="EGONUX Wealth Central Hub" width={2007} height={784} priority /><div><strong>ANOSA</strong><span>Personal · Founder</span></div></div><button className={styles.avatar} onClick={() => setActiveTab('security')} type="button" aria-label="Open security">{founderName(principal).charAt(0)}</button></header>
      {previewMode ? <div className={styles.previewBanner} role="status"><Icon name="lock" size={14} /> Founder preview · no external execution</div> : null}
      <div className={styles.content}>
        {notice ? <button className={styles.notice} onClick={() => setNotice('')} type="button">{notice}<Icon name="close" size={14} /></button> : null}
        {activeTab === 'home' ? <div className={styles.view}>
          <section className={styles.welcome}><p>WELCOME, {founderName(principal).toUpperCase()}</p><h1>Your intelligence surface is ready.</h1><span><i /> Read · Prepare · Approve</span></section>
          <section className={styles.lockCard}><div><Icon name="lock" size={18} /><span><strong>Execution locked</strong><small>ANOSA cannot act outside your approval boundary.</small></span></div><em>ACTIVE</em></section>
          <div className={styles.sectionHeading}><div><span>FOUNDER BRIEF</span><h2>Today at a glance</h2></div><small>Controlled intelligence</small></div>
          <section className={styles.metrics}><article><span>Decisions</span><strong>{pendingCount}</strong><small>awaiting review</small></article><article><span>Security</span><strong>{paused ? 'Paused' : 'Clear'}</strong><small>execution locked</small></article><article><span>Sources</span><strong>{sources.length || 4}</strong><small>approved only</small></article></section>
          <button className={styles.primaryCard} onClick={() => setActiveTab('approvals')} type="button"><span><Icon name="sparkles" size={20} /></span><div><small>NEXT DECISION</small><strong>Review {pendingCount} prepared proposals</strong><p>Each item shows purpose, sources, impact, risk, and boundary.</p></div><Icon name="chevron-right" /></button>
          <div className={styles.quickGrid}><button onClick={() => setActiveTab('ask')} type="button"><Icon name="ai" /><span>Ask ANOSA</span><small>Grounded intelligence</small></button><button onClick={() => setActiveTab('security')} type="button"><Icon name="security" /><span>Trust center</span><small>Sources and boundaries</small></button></div>
        </div> : null}
        {activeTab === 'ask' ? <div className={styles.view}>
          <div className={styles.viewTitle}><span>CONTROLLED INTELLIGENCE</span><h1>Ask ANOSA</h1><p>Every response is grounded in approved EGONUX sources and converted into bounded proposals for your review.</p></div>
          <div className={styles.assistantCard} aria-live="polite"><div className={styles.orb}><Icon name="sparkles" /></div><p>{thinking ? 'Reading approved sources and preparing your founder response…' : answer?.answer || 'I am ready. Ask for today’s founder briefing or describe a decision you want prepared.'}</p><small>{answer ? `${answer.engine === 'ai-gateway' ? 'AI Gateway' : 'Grounded continuity mode'} · ${answer.confidence} · ${answer.sources.length} sources` : `${sources.length || 4} approved sources available`}</small></div>
          {answer ? <div className={styles.sourceChips}>{answer.sources.map((source) => <span key={source.id}>{source.label}</span>)}</div> : null}
          <div className={styles.prompts}>{['Give me today’s founder briefing and prepare three priority decisions', 'Prepare my weekly brief', 'Show access risks'].map((prompt) => <button key={prompt} onClick={() => setQuestion(prompt)} type="button">{prompt}</button>)}</div>
          <form className={styles.askForm} onSubmit={askAnosa}><label htmlFor="anosa-question">Message ANOSA</label><div><input disabled={paused || thinking} id="anosa-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={paused ? 'ANOSA is paused' : 'Ask a founder question…'} /><button aria-label="Send" disabled={paused || thinking} type="submit"><Icon name="send" /></button></div></form>
        </div> : null}
        {activeTab === 'approvals' ? <div className={styles.view}>
          <div className={styles.viewTitle}><span>HUMAN AUTHORITY</span><h1>Approval inbox</h1><p>Approve, reject, or request changes. Every decision is hashed and written to the founder ledger; execution stays locked.</p></div>
          <div className={styles.approvalList}>{approvals.map((approval) => <button key={approval.id} onClick={() => { setSelectedId(approval.id); setConfirmed(false); }} type="button"><span className={approval.state === 'pending' ? styles.pendingIcon : styles.doneIcon}><Icon name={approval.state === 'pending' ? 'activity' : 'check'} size={16} /></span><div><small>{approval.risk.toUpperCase()} RISK · {approval.sourceIds.length} SOURCES</small><strong>{approval.title}</strong><p>{approval.detail}</p><em data-state={approval.state}>{decisionLabel(approval.state)}</em></div><Icon name="chevron-right" /></button>)}</div>
          {decisionLog.length ? <section className={styles.history} aria-label="Decision history"><div className={styles.sectionHeading}><div><span>TAMPER-EVIDENT RECORD</span><h2>Decision history</h2></div><small>{decisionLog.length} recorded</small></div>{decisionLog.map((record) => <article key={record.id}><Icon name="check" size={15} /><div><strong>{record.title}</strong><small>{new Date(record.recordedAt).toLocaleString()} · {record.contentHash.slice(0, 10)}</small></div><em data-state={record.state}>{decisionLabel(record.state)}</em></article>)}</section> : null}
        </div> : null}
        {activeTab === 'security' ? <div className={styles.view}>
          <div className={styles.viewTitle}><span>TRUST CENTER</span><h1>Founder control</h1><p>Your authority boundary, trusted sources, and mobile installation are visible and reversible.</p></div>
          <section className={styles.securityStatus} data-paused={paused}><span><Icon name={paused ? 'lock' : 'security'} size={28} /></span><div><small>SYSTEM STATE</small><strong>{paused ? 'ANOSA paused' : 'Protected and limited'}</strong><p>{paused ? 'Preparation and approvals are suspended on this device.' : 'Read, Prepare, and Approve are available. Execute is locked.'}</p></div></section>
          <section className={styles.identityCard}><div><span>{founderName(principal).charAt(0)}</span><div><small>{principal?.title ?? 'VERIFIED SESSION'}</small><strong>{founderName(principal)}</strong><p>{principal?.email ?? 'Founder preview'}</p></div></div><em>{principal?.roles.includes('founder') ? 'FOUNDER' : 'PREVIEW'}</em></section>
          <div className={styles.boundaryList}><div><Icon name="check" /><span><strong>Read</strong><small>{sources.length || 4} approved sources</small></span><em>Allowed</em></div><div><Icon name="check" /><span><strong>Prepare</strong><small>Grounded answers and proposals</small></span><em>Allowed</em></div><div><Icon name="check" /><span><strong>Approve</strong><small>Hashed founder decision ledger</small></span><em>Allowed</em></div><div><Icon name="lock" /><span><strong>Execute</strong><small>No external or financial actions</small></span><em className={styles.locked}>Locked</em></div></div>
          <section className={styles.sourceList}><div className={styles.sectionHeading}><div><span>TRUSTED CONTEXT</span><h2>Connected sources</h2></div></div>{sources.map((source) => <article key={source.id}><Icon name="check" size={14} /><div><strong>{source.label}</strong><small>{source.category} · verified {source.verifiedAt}</small></div></article>)}</section>
          <button className={styles.installButton} onClick={installAnosa} type="button"><Icon name="home" /> Install ANOSA on this phone</button>
          <button className={styles.pauseButton} onClick={() => setPaused((value) => !value)} type="button"><Icon name="lock" /> {paused ? 'Resume founder workspace' : 'Pause ANOSA on this device'}</button>
          <Link className={styles.osLink} href="/os">Open EGONUX OS <Icon name="external" size={15} /></Link>
        </div> : null}
      </div>
      <nav className={styles.nav} aria-label="ANOSA sections">{tabs.map((tab) => <button key={tab.id} data-active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} type="button"><span><Icon name={tab.icon} size={20} />{tab.id === 'approvals' && pendingCount ? <i>{pendingCount}</i> : null}</span>{tab.label}</button>)}</nav>
    </section>
    {selected ? <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setSelectedId(null)}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="approval-title" onMouseDown={(event) => event.stopPropagation()}><div className={styles.modalHandle} /><span className={styles.modalEyebrow}>{selected.risk.toUpperCase()} RISK · {selected.sourceIds.length} SOURCES</span><h2 id="approval-title">{selected.title}</h2><p>{selected.detail}</p><div className={styles.proposalMeta}><div><strong>Purpose</strong><small>{selected.purpose}</small></div><div><strong>Impact</strong><small>{selected.impact}</small></div></div><div className={styles.impact}><Icon name="lock" size={18} /><span><strong>Execution boundary</strong><small>{selected.executionBoundary}</small></span></div>{selected.state === 'pending' ? <><label className={styles.confirm}><input checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" /><span>I reviewed the sources, purpose, impact, risk, and locked execution boundary.</span></label><div className={styles.modalActionsThree}><button onClick={() => recordDecision('rejected')} disabled={!confirmed || paused || recording} type="button">Reject</button><button onClick={() => recordDecision('changes_requested')} disabled={!confirmed || paused || recording} type="button">Request changes</button><button onClick={() => recordDecision('approved')} disabled={!confirmed || paused || recording} type="button">{recording ? 'Recording…' : 'Approve'}</button></div></> : <div className={styles.recorded}><Icon name="check" /> Decision recorded: {decisionLabel(selected.state)}</div>}<button className={styles.closeModal} onClick={() => setSelectedId(null)} type="button" aria-label="Close"><Icon name="close" /></button></section></div> : null}
  </main>;
}
