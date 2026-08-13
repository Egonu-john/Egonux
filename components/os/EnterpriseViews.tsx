import { founderMetrics, platformServices, securityControls } from '@/lib/os-data';
import type { ReactNode } from 'react';
import Icon from './Icon';
import styles from '@/styles/OS.module.css';

interface EnterpriseViewProps {
  onToast: (message: string) => void;
}

function EnterpriseHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <header className={styles.viewHeader}>
      <div><span className={styles.eyebrow}>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      {children ? <div className={styles.viewHeaderAction}>{children}</div> : null}
    </header>
  );
}

export function SecurityView({ onToast }: EnterpriseViewProps) {
  return (
    <div className={styles.view}>
      <EnterpriseHeader description="Defense in depth, zero-trust access and continuous evidence across the shared platform foundation." eyebrow="Core layer 09" title="Enterprise Security">
        <span className={styles.operationalPill}><span /> Security monitoring active</span>
      </EnterpriseHeader>

      <section className={styles.securityHero}>
        <div className={styles.securityShield}><Icon name="security" size={58} /><span>92</span></div>
        <div><span className={styles.eyebrow}>Security posture</span><h2>Strong · 92/100</h2><p>All critical MVP controls are active. One identity-hardening recommendation remains.</p><div className={styles.securityTags}><span>Zero Trust</span><span>MFA enforced</span><span>Encryption active</span><span>Audit ready</span></div></div>
        <button className={styles.primaryButtonSmall} onClick={() => onToast('Security assessment queued in sandbox mode.')} type="button">Run assessment <Icon name="activity" size={16} /></button>
      </section>

      <section className={styles.securityGrid}>
        <article className={`${styles.panel} ${styles.spanTwo}`}>
          <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Zero-trust controls</span><h2>Protection layers</h2></div><span className={styles.verifiedPill}><Icon name="check" size={13} /> 5 of 5 active</span></div>
          <div className={styles.controlList}>
            {securityControls.map((control) => <div key={control.name}><span><Icon name="check" size={15} /></span><div><strong>{control.name}</strong><small>{control.detail}</small></div><em>{control.state}</em></div>)}
          </div>
        </article>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Threat activity</span><h2>Last 24 hours</h2>
          <div className={styles.threatStats}><div><strong>12,482</strong><span>Requests screened</span></div><div><strong>48</strong><span>Automated challenges</span></div><div><strong>3</strong><span>Events reviewed</span></div><div><strong>0</strong><span>Confirmed incidents</span></div></div>
          <div className={styles.threatPulse}><span /><span /><span /><span /><span /><span /><span /></div>
        </article>
      </section>

      <section className={styles.threeColumnGrid}>
        <article className={styles.panel}><span className={styles.featureIcon}><Icon name="lock" /></span><span className={styles.eyebrow}>Encryption</span><h2>Data protected</h2><p className={styles.mutedText}>TLS in transit, managed encryption at rest and planned customer-managed key separation.</p><div className={styles.miniStatus}><span>Key rotation</span><strong>Healthy</strong></div></article>
        <article className={styles.panel}><span className={styles.featureIcon}><Icon name="activity" /></span><span className={styles.eyebrow}>Detection</span><h2>Signals correlated</h2><p className={styles.mutedText}>Identity, device, transaction and platform signals feed a shared risk decision layer.</p><div className={styles.miniStatus}><span>Rules active</span><strong>46</strong></div></article>
        <article className={styles.panel}><span className={styles.featureIcon}><Icon name="security" /></span><span className={styles.eyebrow}>Resilience</span><h2>Recovery planned</h2><p className={styles.mutedText}>Backups, failover runbooks and incident command ownership are defined for every critical service.</p><div className={styles.miniStatus}><span>Target RTO</span><strong>&lt; 4 hours</strong></div></article>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Immutable trail</span><h2>Recent security events</h2></div><button className={styles.outlineButton} type="button">Export audit log <Icon name="arrow-down" size={15} /></button></div>
        <div className={styles.auditTable}>
          <div><span>13 Aug · 14:32:18</span><strong>DEVICE_TRUST_GRANTED</strong><span>Chrome · Android</span><em>Success</em></div>
          <div><span>13 Aug · 12:08:43</span><strong>ADMIN_POLICY_READ</strong><span>Founder Command</span><em>Success</em></div>
          <div><span>13 Aug · 09:42:11</span><strong>WALLET_STEP_UP</strong><span>Transaction EGX-894021</span><em>Success</em></div>
          <div><span>12 Aug · 18:15:02</span><strong>RISK_RULE_TRIGGERED</strong><span>Velocity threshold · reviewed</span><em className={styles.auditReview}>Reviewed</em></div>
        </div>
      </section>
      <p className={styles.legalBanner}><Icon name="security" size={17} /> “Military-grade” is treated as an operating mindset, not a certification claim: minimize trust, compartmentalize access, verify continuously, rehearse recovery and retain evidence.</p>
    </div>
  );
}

export function DeveloperView({ onToast }: EnterpriseViewProps) {
  const copyKey = async () => {
    try { await navigator.clipboard.writeText('egx_test_demo_enterprise_mvp'); } catch { /* preview environments may block clipboard */ }
    onToast('Sandbox API key copied.');
  };
  return (
    <div className={styles.view}>
      <EnterpriseHeader description="Stable APIs, SDKs, webhooks and governed OAuth access for every future EGONUX institution." eyebrow="Core layer 10" title="Developer Platform">
        <button className={styles.primaryButtonSmall} onClick={() => onToast('New sandbox application created.')} type="button"><Icon name="plus" size={16} /> New application</button>
      </EnterpriseHeader>
      <section className={styles.developerHero}>
        <div><span className={styles.eyebrow}>Build on one operating system</span><h2>Connect once. Expand everywhere.</h2><p>Identity, wallet, marketplace, learning, community and intelligence services through a consistent enterprise contract.</p><div className={styles.developerHeroActions}><button className={styles.primaryButtonSmall} type="button">Read API documentation <Icon name="external" size={15} /></button><button className={styles.outlineButton} type="button">Explore use cases</button></div></div>
        <pre aria-label="Example EGONUX API request"><code><span>POST</span> /v1/identity/verify{`\n`}Authorization: Bearer egx_test_••••{`\n`}{`\n`}{`{`}{`\n`}  &quot;egonux_id&quot;: &quot;EGX-UG-000047&quot;{`\n`}{`}`}</code></pre>
      </section>
      <section className={styles.developerStats}><div><strong>v1</strong><span>Current API</span></div><div><strong>99.98%</strong><span>Sandbox uptime</span></div><div><strong>104 ms</strong><span>Median latency</span></div><div><strong>5</strong><span>Core services</span></div></section>
      <section className={styles.twoColumnGrid}>
        <article className={styles.panel}>
          <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Credentials</span><h2>Sandbox application</h2></div><span className={styles.statusPill}>Test mode</span></div>
          <label className={styles.apiKeyLabel} htmlFor="sandbox-key">Publishable API key</label><div className={styles.apiKey}><code id="sandbox-key">egx_test_••••••••••••47</code><button aria-label="Copy sandbox API key" onClick={copyKey} type="button"><Icon name="copy" size={17} /></button></div>
          <div className={styles.credentialMeta}><div><span>Created</span><strong>13 Aug 2026</strong></div><div><span>Last used</span><strong>Never</strong></div><div><span>Permissions</span><strong>Read-only</strong></div></div>
          <button className={styles.textButton} type="button">Manage credentials <Icon name="chevron-right" size={14} /></button>
        </article>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Quick start SDKs</span><h2>Use the stack you know</h2>
          <div className={styles.sdkGrid}><button onClick={() => onToast('JavaScript SDK guide opened.')} type="button"><strong>JS</strong><span>JavaScript</span></button><button onClick={() => onToast('Flutter SDK guide opened.')} type="button"><strong>FL</strong><span>Flutter</span></button><button onClick={() => onToast('Python SDK guide opened.')} type="button"><strong>PY</strong><span>Python</span></button><button onClick={() => onToast('REST API guide opened.')} type="button"><strong>API</strong><span>REST</span></button></div>
        </article>
      </section>
      <section className={styles.panel}>
        <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Service catalog</span><h2>Enterprise APIs</h2></div><button className={styles.outlineButton} type="button">Open API reference <Icon name="external" size={14} /></button></div>
        <div className={styles.apiCatalog}>
          <div><span><Icon name="identity" /></span><div><strong>Identity API</strong><small>Profiles, verification, consent and reputation</small></div><code>/v1/identity</code><em>Available</em></div>
          <div><span><Icon name="wallet" /></span><div><strong>Wallet API</strong><small>Balances, ledger entries and transaction intents</small></div><code>/v1/wallet</code><em>Sandbox</em></div>
          <div><span><Icon name="marketplace" /></span><div><strong>Commerce API</strong><small>Products, vendors, carts, orders and reviews</small></div><code>/v1/commerce</code><em>Available</em></div>
          <div><span><Icon name="learn" /></span><div><strong>Learning API</strong><small>Courses, progress, assessments and credentials</small></div><code>/v1/learn</code><em>Available</em></div>
        </div>
      </section>
      <section className={styles.webhookCard}><div><span><Icon name="activity" /></span><div><small>Latest webhook delivery</small><strong>identity.verification.completed</strong><p>HTTP 200 · 184 ms · 13 Aug 2026, 14:32</p></div></div><button className={styles.outlineButton} type="button">Inspect delivery <Icon name="chevron-right" size={14} /></button></section>
    </div>
  );
}

const revenueBars = [42, 47, 45, 55, 52, 64, 61, 72, 76, 79, 88, 96];

export function AdminView({ onToast }: EnterpriseViewProps) {
  return (
    <div className={styles.view}>
      <EnterpriseHeader description="A unified founder-level view of users, revenue, risk, operations, intelligence and platform health." eyebrow="Core layer 08 · Restricted" title="Founder Command Center">
        <button className={styles.outlineButton} onClick={() => onToast('Executive report generated in sandbox mode.')} type="button"><Icon name="arrow-down" size={16} /> Export report</button>
      </EnterpriseHeader>
      <section className={styles.commandBanner}><div><span className={styles.eyebrow}>Enterprise status</span><h2>EGONUX is operating normally.</h2><p>All critical services are available. Three fraud signals require human review.</p></div><div><span className={styles.liveDot} /> LIVE COMMAND VIEW<small>Updated 14:42 UTC</small></div></section>
      <section className={styles.metricGrid}>
        {founderMetrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><em className={metric.tone === 'positive' ? styles.positiveText : metric.tone === 'warning' ? styles.warningText : ''}>{metric.delta}</em></article>)}
      </section>
      <section className={styles.commandGrid}>
        <article className={`${styles.panel} ${styles.spanTwo}`}>
          <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Revenue engine</span><h2>Monthly recurring revenue</h2></div><div className={styles.revenueValue}><strong>UGX 24.8M</strong><span>+8.7%</span></div></div>
          <div className={styles.revenueChart}>
            {revenueBars.map((height, index) => <div key={`revenue-${index + 1}`}><span style={{ height: `${height}%` }} /><small>{['S','O','N','D','J','F','M','A','M','J','J','A'][index]}</small></div>)}
          </div>
          <div className={styles.revenueLegend}><span><i className={styles.legendGold} /> Subscriptions</span><span><i className={styles.legendPurple} /> Marketplace</span><span><i className={styles.legendGreen} /> Learning &amp; affiliate</span></div>
        </article>
        <article className={styles.insightCard}>
          <span className={styles.insightIcon}><Icon name="sparkles" /></span><span className={styles.eyebrow}>AI command insight</span><h2>Learning is driving higher retention.</h2><p>Verified users active in Learn are 2.4× more likely to return to Marketplace within 30 days.</p><button type="button">Open cohort analysis <Icon name="chevron-right" size={15} /></button><small>Demo correlation · validate before acting</small>
        </article>
      </section>
      <section className={styles.twoColumnGrid}>
        <article className={styles.panel}>
          <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Platform health</span><h2>Core services</h2></div><span className={styles.operationalPill}><span /> All healthy</span></div>
          <div className={styles.serviceTable}>{platformServices.map((service) => <div key={service.name}><span className={styles.healthDot} /><strong>{service.name}</strong><span>{service.uptime}</span><span>{service.latency}</span><em>{service.status}</em></div>)}</div>
        </article>
        <article className={styles.panel}>
          <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Risk operations</span><h2>Fraud review queue</h2></div><strong className={styles.warningText}>3 open</strong></div>
          <div className={styles.alertList}><button type="button"><span className={styles.alertHigh}>HIGH</span><div><strong>Rapid device change + transfer intent</strong><small>EGX-UG-001184 · 6 min ago</small></div><Icon name="chevron-right" /></button><button type="button"><span className={styles.alertMedium}>MED</span><div><strong>Marketplace velocity threshold</strong><small>Vendor EGX-V-0041 · 22 min ago</small></div><Icon name="chevron-right" /></button><button type="button"><span className={styles.alertMedium}>MED</span><div><strong>Affiliate attribution conflict</strong><small>Campaign EGX-A-028 · 1 hr ago</small></div><Icon name="chevron-right" /></button></div>
        </article>
      </section>
      <section className={styles.enterpriseFlow}>
        <div><span className={styles.eyebrow}>Shared enterprise flow</span><h2>One platform foundation</h2><p>Every service shares identity, security, analytics and notification infrastructure.</p></div>
        <div className={styles.flowNodes}><span>Identity</span><i /><span>Wallet</span><i /><span>Commerce</span><i /><span>Learning</span><i /><span>AI</span><i /><span>Command</span></div>
      </section>
    </div>
  );
}
