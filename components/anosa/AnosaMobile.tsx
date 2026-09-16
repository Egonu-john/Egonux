import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/os/Icon';
import type { AuthenticatedPrincipal } from '@/types/backend';
import styles from '@/styles/AnosaMobile.module.css';

type Tab = 'home' | 'ask' | 'approvals' | 'security';
type ApprovalState = 'pending' | 'approved' | 'declined';

interface AnosaMobileProps {
  principal: AuthenticatedPrincipal | null;
  previewMode: boolean;
}

interface Approval {
  id: string;
  title: string;
  detail: string;
  impact: string;
  risk: 'Low' | 'Medium';
  state: ApprovalState;
}

interface DecisionRecord {
  approvalId: string;
  title: string;
  state: Exclude<ApprovalState, 'pending'>;
  recordedAt: string;
}

const workspaceStorageKey = 'egonux_anosa_founder_workspace_v1';

const initialApprovals: Approval[] = [
  {
    id: 'brief-001',
    title: 'Prepare weekly founder brief',
    detail: 'Compile product, access, security, and delivery signals into a review document.',
    impact: 'Creates a draft only. No distribution.',
    risk: 'Low',
    state: 'pending',
  },
  {
    id: 'access-002',
    title: 'Recommend access review',
    detail: 'Prepare a list of elevated accounts for the founder to verify with the security team.',
    impact: 'No roles or permissions will change.',
    risk: 'Medium',
    state: 'pending',
  },
  {
    id: 'roadmap-003',
    title: 'Prepare ANOSA v1 roadmap',
    detail: 'Turn the current mobile prototype into an implementation backlog with acceptance gates.',
    impact: 'Creates planning material only.',
    risk: 'Low',
    state: 'pending',
  },
];

const tabs: Array<{ id: Tab; label: string; icon: 'home' | 'ai' | 'check' | 'security' }> = [
  { id: 'home', label: 'Today', icon: 'home' },
  { id: 'ask', label: 'Ask', icon: 'ai' },
  { id: 'approvals', label: 'Approve', icon: 'check' },
  { id: 'security', label: 'Security', icon: 'security' },
];

function founderName(principal: AuthenticatedPrincipal | null) {
  if (principal?.displayName) return principal.displayName;
  if (!principal?.email) return 'Founder';
  const candidate = principal.email.split('@')[0]?.split(/[._-]/)[0];
  return candidate ? `${candidate.charAt(0).toUpperCase()}${candidate.slice(1)}` : 'Founder';
}

export default function AnosaMobile({ principal, previewMode }: AnosaMobileProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [approvals, setApprovals] = useState(initialApprovals);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [paused, setPaused] = useState(false);
  const [notice, setNotice] = useState('');
  const [decisionLog, setDecisionLog] = useState<DecisionRecord[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const pendingCount = approvals.filter((approval) => approval.state === 'pending').length;
  const selected = useMemo(
    () => approvals.find((approval) => approval.id === selectedId) ?? null,
    [approvals, selectedId],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(workspaceStorageKey);
        if (stored) {
          const workspace = JSON.parse(stored) as {
            approvals?: Array<{ id?: unknown; state?: unknown }>;
            decisionLog?: DecisionRecord[];
            paused?: boolean;
          };
          const savedStates = new Map(
            (workspace.approvals ?? [])
              .filter((item) => typeof item.id === 'string' && ['pending', 'approved', 'declined'].includes(String(item.state)))
              .map((item) => [String(item.id), item.state as ApprovalState]),
          );
          setApprovals((current) => current.map((item) => ({
            ...item,
            state: savedStates.get(item.id) ?? item.state,
          })));
          setDecisionLog(Array.isArray(workspace.decisionLog) ? workspace.decisionLog.slice(0, 20) : []);
          setPaused(workspace.paused === true);
        }
      } catch {
        setNotice('Saved device state could not be restored. A clean workspace was opened.');
      } finally {
        setStorageReady(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(
      workspaceStorageKey,
      JSON.stringify({
        approvals: approvals.map(({ id, state }) => ({ id, state })),
        decisionLog,
        paused,
      }),
    );
  }, [approvals, decisionLog, paused, storageReady]);

  const recordDecision = (state: Exclude<ApprovalState, 'pending'>) => {
    if (!selected || !confirmed || paused) return;
    setApprovals((current) => current.map((item) => (
      item.id === selected.id ? { ...item, state } : item
    )));
    setDecisionLog((current) => [{
      approvalId: selected.id,
      title: selected.title,
      state,
      recordedAt: new Date().toISOString(),
    }, ...current].slice(0, 20));
    setNotice(
      state === 'approved'
        ? 'Approval recorded. Execution remains locked.'
        : 'Proposal declined. No action was taken.',
    );
    setSelectedId(null);
    setConfirmed(false);
  };

  const askAnosa = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (paused) {
      setNotice('ANOSA is paused. Resume the workspace before preparing a response.');
      return;
    }
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    setAnswer(
      `ANOSA prepared a read-only response to “${cleanQuestion}”. In v1, answers use approved EGONUX workspace sources only. Connect the source adapters before treating this as live intelligence.`,
    );
    setQuestion('');
  };

  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />
      <section className={styles.phone} aria-label="ANOSA Personal Mobile">
        <header className={styles.header}>
          <div className={styles.brand}>
            <Image
              src="/brand/egonux-primary-logo.png"
              alt="EGONUX Wealth Central Hub"
              width={2007}
              height={784}
              priority
            />
            <div><strong>ANOSA</strong><span>Personal · Founder</span></div>
          </div>
          <button className={styles.avatar} onClick={() => setActiveTab('security')} type="button" aria-label="Open security">
            {founderName(principal).charAt(0)}
          </button>
        </header>

        {previewMode ? (
          <div className={styles.previewBanner} role="status">
            <Icon name="lock" size={14} /> Founder preview · no live data or execution
          </div>
        ) : null}

        <div className={styles.content}>
          {notice ? <button className={styles.notice} onClick={() => setNotice('')} type="button">{notice}<Icon name="close" size={14} /></button> : null}

          {activeTab === 'home' ? (
            <div className={styles.view}>
              <section className={styles.welcome}>
                <p>WELCOME, {founderName(principal).toUpperCase()}</p>
                <h1>Your command surface is ready.</h1>
                <span><i /> Read · Prepare · Approve</span>
              </section>

              <section className={styles.lockCard}>
                <div><Icon name="lock" size={18} /><span><strong>Execution locked</strong><small>ANOSA cannot act outside your approval boundary.</small></span></div>
                <em>ACTIVE</em>
              </section>

              <div className={styles.sectionHeading}><div><span>FOUNDER BRIEF</span><h2>Today at a glance</h2></div><small>Prototype data</small></div>
              <section className={styles.metrics}>
                <article><span>Decisions</span><strong>{pendingCount}</strong><small>awaiting review</small></article>
                <article><span>Security</span><strong>Clear</strong><small>no live alerts</small></article>
                <article><span>Sources</span><strong>0</strong><small>connect next</small></article>
              </section>

              <button className={styles.primaryCard} onClick={() => setActiveTab('approvals')} type="button">
                <span><Icon name="sparkles" size={20} /></span>
                <div><small>NEXT DECISION</small><strong>Review {pendingCount} prepared proposals</strong><p>Each item shows scope, impact, and execution boundary.</p></div>
                <Icon name="chevron-right" />
              </button>

              <div className={styles.quickGrid}>
                <button onClick={() => setActiveTab('ask')} type="button"><Icon name="ai" /><span>Ask ANOSA</span><small>Read and synthesize</small></button>
                <button onClick={() => setActiveTab('security')} type="button"><Icon name="security" /><span>Trust center</span><small>Review boundaries</small></button>
              </div>
            </div>
          ) : null}

          {activeTab === 'ask' ? (
            <div className={styles.view}>
              <div className={styles.viewTitle}><span>READ MODE</span><h1>Ask ANOSA</h1><p>Ask about connected EGONUX information. Every answer must identify its sources and uncertainty.</p></div>
              <div className={styles.assistantCard}>
                <div className={styles.orb}><Icon name="sparkles" /></div>
                <p>{answer || 'I am ready to prepare a founder brief. Source connectors are intentionally offline in this first build.'}</p>
                <small>{answer ? 'Prototype response · not live intelligence' : 'No workspace sources connected'}</small>
              </div>
              <div className={styles.prompts}>
                {['What needs my attention?', 'Prepare my weekly brief', 'Show access risks'].map((prompt) => (
                  <button key={prompt} onClick={() => setQuestion(prompt)} type="button">{prompt}</button>
                ))}
              </div>
              <form className={styles.askForm} onSubmit={askAnosa}>
                <label htmlFor="anosa-question">Message ANOSA</label>
                <div><input disabled={paused} id="anosa-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={paused ? 'ANOSA is paused' : 'Ask a founder question…'} /><button aria-label="Send" disabled={paused} type="submit"><Icon name="send" /></button></div>
              </form>
            </div>
          ) : null}

          {activeTab === 'approvals' ? (
            <div className={styles.view}>
              <div className={styles.viewTitle}><span>HUMAN AUTHORITY</span><h1>Approval inbox</h1><p>Review prepared work. An approval records intent only; execution stays locked in v1.</p></div>
              <div className={styles.approvalList}>
                {approvals.map((approval) => (
                  <button key={approval.id} onClick={() => { setSelectedId(approval.id); setConfirmed(false); }} type="button">
                    <span className={approval.state === 'pending' ? styles.pendingIcon : styles.doneIcon}><Icon name={approval.state === 'pending' ? 'activity' : 'check'} size={16} /></span>
                    <div><small>{approval.risk.toUpperCase()} RISK · {approval.id}</small><strong>{approval.title}</strong><p>{approval.detail}</p><em data-state={approval.state}>{approval.state}</em></div>
                    <Icon name="chevron-right" />
                  </button>
                ))}
              </div>
              {decisionLog.length ? (
                <section className={styles.history} aria-label="Decision history">
                  <div className={styles.sectionHeading}><div><span>DEVICE RECORD</span><h2>Decision history</h2></div><small>{decisionLog.length} recorded</small></div>
                  {decisionLog.map((record) => (
                    <article key={`${record.approvalId}-${record.recordedAt}`}>
                      <Icon name="check" size={15} />
                      <div><strong>{record.title}</strong><small>{new Date(record.recordedAt).toLocaleString()}</small></div>
                      <em data-state={record.state}>{record.state}</em>
                    </article>
                  ))}
                </section>
              ) : null}
            </div>
          ) : null}

          {activeTab === 'security' ? (
            <div className={styles.view}>
              <div className={styles.viewTitle}><span>TRUST CENTER</span><h1>Founder control</h1><p>Your authority boundary is visible, reversible, and deliberately narrow.</p></div>
              <section className={styles.securityStatus} data-paused={paused}>
                <span><Icon name={paused ? 'lock' : 'security'} size={28} /></span>
                <div><small>SYSTEM STATE</small><strong>{paused ? 'ANOSA paused' : 'Protected and limited'}</strong><p>{paused ? 'All preparation and approvals are suspended on this device.' : 'Read, Prepare, and Approve are available. Execute is locked.'}</p></div>
              </section>
              <section className={styles.identityCard}>
                <div><span>{founderName(principal).charAt(0)}</span><div><small>{principal?.title ?? 'VERIFIED SESSION'}</small><strong>{founderName(principal)}</strong><p>{principal?.email ?? 'Founder preview'}</p></div></div>
                <em>{principal?.roles.includes('founder') ? 'FOUNDER' : 'PREVIEW'}</em>
              </section>
              <div className={styles.boundaryList}>
                <div><Icon name="check" /><span><strong>Read</strong><small>Approved sources only</small></span><em>Allowed</em></div>
                <div><Icon name="check" /><span><strong>Prepare</strong><small>Drafts and recommendations</small></span><em>Allowed</em></div>
                <div><Icon name="check" /><span><strong>Approve</strong><small>Explicit founder confirmation</small></span><em>Allowed</em></div>
                <div><Icon name="lock" /><span><strong>Execute</strong><small>No external or financial actions</small></span><em className={styles.locked}>Locked</em></div>
              </div>
              <button className={styles.pauseButton} onClick={() => setPaused((value) => !value)} type="button">
                <Icon name="lock" /> {paused ? 'Resume founder workspace' : 'Pause ANOSA on this device'}
              </button>
              <Link className={styles.osLink} href="/os">Open EGONUX OS <Icon name="external" size={15} /></Link>
            </div>
          ) : null}
        </div>

        <nav className={styles.nav} aria-label="ANOSA sections">
          {tabs.map((tab) => (
            <button key={tab.id} data-active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} type="button">
              <span><Icon name={tab.icon} size={20} />{tab.id === 'approvals' && pendingCount ? <i>{pendingCount}</i> : null}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      {selected ? (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setSelectedId(null)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="approval-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.modalHandle} />
            <span className={styles.modalEyebrow}>{selected.risk.toUpperCase()} RISK · PREPARED ACTION</span>
            <h2 id="approval-title">{selected.title}</h2>
            <p>{selected.detail}</p>
            <div className={styles.impact}><Icon name="lock" size={18} /><span><strong>Execution boundary</strong><small>{selected.impact}</small></span></div>
            {selected.state === 'pending' ? (
              <>
                <label className={styles.confirm}><input checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" /><span>I reviewed the scope and understand this records a decision only.</span></label>
                <div className={styles.modalActions}>
                  <button onClick={() => recordDecision('declined')} disabled={!confirmed || paused} type="button">Decline</button>
                  <button onClick={() => recordDecision('approved')} disabled={!confirmed || paused} type="button">Approve preparation</button>
                </div>
              </>
            ) : <div className={styles.recorded}><Icon name="check" /> Decision recorded: {selected.state}</div>}
            <button className={styles.closeModal} onClick={() => setSelectedId(null)} type="button" aria-label="Close"><Icon name="close" /></button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
