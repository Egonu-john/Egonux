import Link from "next/link";
import WalletLedgerView from "@/components/wallet/WalletLedgerView";
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { communityChannels } from '@/lib/os-data';
import type { ActionRequest } from '@/types/egonux';
import Icon from './Icon';
import { EgonuxButton } from '@/components/ui/EgonuxButton';
import styles from '@/styles/OS.module.css';

interface ViewHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

function ViewHeader({ eyebrow, title, description, action }: ViewHeaderProps) {
  return (
    <header className={styles.viewHeader}>
      <div>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action ? <div className={styles.viewHeaderAction}>{action}</div> : null}
    </header>
  );
}

export function IdentityView() {
  const verificationSteps = [
    { id: 'email', label: 'Email & mobile', detail: 'Verified 08 Aug 2026', done: true },
    { id: 'document', label: 'National identity', detail: 'Uganda National ID verified', done: true },
    { id: 'liveness', label: 'Face & liveness', detail: 'Biometric match confirmed', done: true },
    { id: 'address', label: 'Address confirmation', detail: 'Recommended for higher limits', done: false },
  ];

  return (
    <div className={styles.view}>
      
      {/* ANOSA Quick Hub Navigation */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <Link href="/login" style={{ color: "#D4AF37", fontSize: "12px", padding: "6px 12px", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "6px", textDecoration: "none" }}>🔑 Identity Portal</Link>
        <Link href="/docs/sdk" style={{ color: "#D4AF37", fontSize: "12px", padding: "6px 12px", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "6px", textDecoration: "none" }}>🛠️ Developer SDK</Link>
        <Link href="/docs/analytics" style={{ color: "#D4AF37", fontSize: "12px", padding: "6px 12px", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "6px", textDecoration: "none" }}>📈 Financial Intelligence</Link>
      </div>
  
      <ViewHeader
        description="Your trusted passport across every EGONUX service, secured by one policy and one recovery system."
        eyebrow="Core layer 01"
        title="Universal digital identity"
        action={<span className={styles.verifiedPill}><Icon name="check" size={14} /> Identity verified</span>}
      />

      <section className={styles.identityHeroGrid}>
        <article className={styles.identityPassport}>
          <div className={styles.passportGlow} />
          <div className={styles.passportTop}>
            <span className={styles.brand}>EGONU<span>X</span></span>
            <span>UNIVERSAL ID</span>
          </div>
          <div className={styles.passportIdentity}>
            <span className={styles.passportAvatar}>EJ</span>
            <div><small>Legal name</small><strong>Egonu John William</strong><span>Founder &amp; Chief Executive Officer</span></div>
          </div>
          <div className={styles.passportNumber}>
            <div><small>EGONUX ID</small><strong>EGX-UG-000047</strong></div>
            <span className={styles.passportSeal}><Icon name="security" /></span>
          </div>
          <div className={styles.passportFooter}><span>UGANDA · LEVEL 3</span><span>VALID · CONTINUOUS REVIEW</span></div>
        </article>

        <article className={styles.securityScoreCard}>
          <div className={styles.scoreRing} style={{ '--score': '92deg' } as CSSProperties}>
            <div><strong>92</strong><span>/100</span></div>
          </div>
          <div>
            <span className={styles.eyebrow}>Identity health</span>
            <h2>Excellent protection</h2>
            <p>Multi-factor authentication, device trust and recovery controls are active.</p>
            <button className={styles.textButton} type="button">Review recommendations <Icon name="chevron-right" size={15} /></button>
          </div>
        </article>
      </section>

      <section className={styles.threeColumnGrid}>
        <article className={`${styles.panel} ${styles.spanTwo}`}>
          <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>KYC verification</span><h2>Identity assurance</h2></div><strong className={styles.completionText}>80% complete</strong></div>
          <div className={styles.verificationSteps}>
            {verificationSteps.map((step) => (
              <div className={styles.verificationStep} key={step.id}>
                <span className={step.done ? styles.stepDone : styles.stepPending}><Icon name={step.done ? 'check' : 'plus'} size={16} /></span>
                <div><strong>{step.label}</strong><small>{step.detail}</small></div>
                <button type="button">{step.done ? 'View' : 'Complete'} <Icon name="chevron-right" size={14} /></button>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <span className={styles.eyebrow}>Digital reputation</span>
          <div className={styles.reputationValue}><strong>840</strong><span>Trusted</span></div>
          <div className={styles.reputationTrack}><span /></div>
          <p className={styles.mutedText}>Built from verified activity, learning, marketplace and community conduct.</p>
          <div className={styles.miniStats}><div><span>Account age</span><strong>8 months</strong></div><div><span>Good standing</span><strong>100%</strong></div></div>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Device management</span><h2>Trusted sessions</h2></div><button className={styles.outlineButton} type="button"><Icon name="plus" size={16} /> Add device</button></div>
        <div className={styles.deviceGrid}>
          <div className={styles.deviceCard}><span><Icon name="globe" /></span><div><strong>Chrome · Android</strong><small>Kampala, Uganda · Current device</small></div><em>Trusted</em></div>
          <div className={styles.deviceCard}><span><Icon name="developer" /></span><div><strong>Chrome · Windows</strong><small>Kampala, Uganda · 2 days ago</small></div><em>Trusted</em></div>
          <div className={styles.deviceCard}><span><Icon name="lock" /></span><div><strong>Recovery system</strong><small>Codes refreshed 08 Aug 2026</small></div><em>Ready</em></div>
        </div>
      </section>
    </div>
  );
}

interface WalletViewProps {
  onAction: (action: ActionRequest['type']) => void;
}

export function WalletView(__props: WalletViewProps) {
  return (
    <div className="space-y-6">
      <WalletLedgerView />
    </div>
  );
}

interface MarketplaceViewProps {
  onAddToCart: (title: string) => void;

  onToast?: (msg: string) => void;
}

export function MarketplaceView({ onToast, onAddToCart }: MarketplaceViewProps) {
  const [cartCount, setCartCount] = useState(0);
  const [activeTab, setActiveTab] = useState("products");

  const handleAddToCart = (title: string) => {
    setCartCount(prev => prev + 1);
    if (onAddToCart) {
      onAddToCart(title);
    }
    if (onToast) {
      onToast("Added " + title + " to your cart!");
    }
  };

  return (
    <div className={styles.view}>
      <ViewHeader
        description="Explore verified digital goods, cloud capacity, developer utilities, and ecosystem assets."
        eyebrow="Core Layer 03 • Digital Commerce"
        title="EGONUX Marketplace"
        action={<span className={styles.statusPill}>Cart ({cartCount})</span>}
      />
      <div className={styles.tabContainer}>
        <EgonuxButton size="sm" variant={activeTab === "products" ? "primary" : "ghost"} onClick={() => setActiveTab("products")}>Featured Assets</EgonuxButton>
        <EgonuxButton size="sm" variant={activeTab === "orders" ? "primary" : "ghost"} onClick={() => setActiveTab("orders")}>Recent Orders</EgonuxButton>
      </div>
      <section className={styles.threeColumnGrid}>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Developer Kit</span>
          <h3>EGONUX SDK v3.0 License</h3>
          <p className={styles.mutedText}>Full API keys, WebSocket feeds, and sandbox wallet tools.</p>
          <strong>UGX 250,000</strong>
          <EgonuxButton labelStyle="parenthesized" onClick={() => handleAddToCart("EGONUX SDK v3.0")}>ADD TO CART</EgonuxButton>
        </article>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Cloud Resource</span>
          <h3>High-Performance Compute Node</h3>
          <p className={styles.mutedText}>Dedicated virtual container node for high-throughput background tasks.</p>
          <strong>UGX 120,000 / mo</strong>
          <EgonuxButton labelStyle="parenthesized" onClick={() => handleAddToCart("Compute Node")}>ADD TO CART</EgonuxButton>
        </article>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Analytics Suite</span>
          <h3>Real-time Ledger Monitor</h3>
          <p className={styles.mutedText}>Automated transaction monitoring and payout reconciliation tool.</p>
          <strong>UGX 85,000</strong>
          <EgonuxButton labelStyle="parenthesized" onClick={() => handleAddToCart("Ledger Monitor")}>ADD TO CART</EgonuxButton>
        </article>
      </section>
    </div>
  );}

interface AffiliateViewProps { onToast: (message: string) => void; }

export function AffiliateView({ onToast }: AffiliateViewProps) {
  const copyLink = async () => {
    try { await navigator.clipboard.writeText('https://egonux.com/r/EGX000047'); } catch { /* clipboard may be unavailable in preview */ }
    onToast('Your referral link is ready to share.');
  };
  return (
    <div className={styles.view}>
      <ViewHeader description="A transparent growth engine for approved single-tier campaigns, verified rewards and reusable marketing assets." eyebrow="Core layer 06 · Compliance pilot" title="EGONUX Affiliate" action={<span className={styles.statusPill}>Account active</span>} />
      <p className={styles.legalBanner}><Icon name="security" size={17} /> MVP rewards are single-tier and campaign-based. Multi-level rewards remain disabled unless specifically approved under applicable law.</p>
      <section className={styles.affiliateStats}>
        <article className={styles.affiliateEarnings}><span>Available sandbox earnings</span><strong>UGX 178,500</strong><small>Next demo cycle · Schedule pending</small><EgonuxButton labelStyle="parenthesized" variant="secondary" endIcon={<Icon name="chevron-right" size={16} />} onClick={() => onToast('Payout request created in sandbox mode.')}>REQUEST SANDBOX PAYOUT</EgonuxButton></article>
        <div><span>Verified referrals</span><strong>24</strong><small>+6 this month</small></div><div><span>Conversion rate</span><strong>18.4%</strong><small>Top 12% of pilot</small></div><div><span>Link visits</span><strong>1,482</strong><small>+22.8% this month</small></div>
      </section>
      <section className={styles.twoColumnGrid}>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Your verified link</span><h2>Share EGONUX responsibly</h2><p className={styles.mutedText}>Use approved messaging only. Earnings are never guaranteed.</p>
          <div className={styles.referralLink}><span>egonux.com/r/EGX000047</span><button aria-label="Copy referral link" onClick={copyLink} type="button"><Icon name="copy" size={17} /></button></div>
          <div className={styles.shareButtons}><EgonuxButton size="sm" variant="secondary" labelStyle="parenthesized" onClick={copyLink}>WHATSAPP</EgonuxButton><EgonuxButton size="sm" variant="secondary" labelStyle="parenthesized" onClick={copyLink}>TELEGRAM</EgonuxButton><EgonuxButton size="sm" variant="secondary" labelStyle="parenthesized" onClick={copyLink}>FACEBOOK</EgonuxButton></div>
        </article>
        <article className={styles.panel}>
          <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Performance</span><h2>Monthly conversions</h2></div><strong className={styles.positiveText}>+24%</strong></div>
          <div className={styles.affiliateChart}>{[28, 42, 36, 58, 50, 76, 66, 88].map((height, index) => <span key={`affiliate-bar-${index + 1}`} style={{ height: `${height}%` }} />)}</div>
          <div className={styles.chartLegend}><span>January</span><span>August</span></div>
        </article>
      </section>
      <section className={styles.panel}>
        <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Marketing studio</span><h2>Approved campaign assets</h2></div><EgonuxButton labelStyle="parenthesized" variant="secondary" size="sm" endIcon={<Icon name="chevron-right" size={14} />} type="button">VIEW ALL ASSETS</EgonuxButton></div>
        <div className={styles.assetGrid}><button onClick={() => onToast('Money Mindset campaign downloaded.')} type="button"><span>01</span><div><strong>Money Mindset campaign</strong><small>12 social assets · Approved</small></div><Icon name="arrow-down" /></button><button onClick={() => onToast('Learning campaign downloaded.')} type="button"><span>02</span><div><strong>Learning launch campaign</strong><small>8 social assets · Approved</small></div><Icon name="arrow-down" /></button><button onClick={() => onToast('Marketplace campaign downloaded.')} type="button"><span>03</span><div><strong>Marketplace vendor campaign</strong><small>10 social assets · Approved</small></div><Icon name="arrow-down" /></button></div>
      </section>
    </div>
  );
}

interface ChatMessage { id: string; role: 'assistant' | 'user'; text: string; }

const initialMessages: ChatMessage[] = [{ id: 'welcome', role: 'assistant', text: 'Good morning, Egonu. I can help you understand your sandbox wallet, plan a learning path, review business ideas, or navigate EGONUX OS. What would you like to work on?' }];
const suggestions = ['Review my financial momentum', 'Plan my next business milestone', 'Recommend a learning path'];

function createAssistantReply(prompt: string) {
  const normalized = prompt.toLowerCase();
  if (normalized.includes('wallet') || normalized.includes('financial') || normalized.includes('saving')) return 'Your sandbox data shows a stronger savings pattern this month. A sensible next step is to protect the emergency vault target before increasing business spending. This is educational guidance, not financial advice.';
  if (normalized.includes('business') || normalized.includes('milestone')) return 'For the next milestone, define one customer segment, one problem, one paid offer and one weekly measure. In EGONUX, you can validate the offer through Community, package it in Marketplace and build the required skills in Learn.';
  if (normalized.includes('learn') || normalized.includes('course')) return 'The Digital Wealth Builder path is the strongest match: Money Systems first, AI for Digital Business second, then Build Your First Online Store. Your current progress supports completing it in roughly eight focused weeks.';
  return 'I can turn that into a clear action plan using your identity, learning, marketplace and community context. In this MVP, responses use demonstration data; production recommendations will require permissioned, traceable data access.';
}

export function AIView() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [prompt, setPrompt] = useState('');
  const sendPrompt = (text: string) => {
    const clean = text.trim(); if (!clean) return;
    setMessages((current) => {
      const messagePair = current.length;
      return [...current, { id: `user-${messagePair}`, role: 'user', text: clean }, { id: `assistant-${messagePair}`, role: 'assistant', text: createAssistantReply(clean) }];
    });
    setPrompt('');
  };
  const submit = (event: FormEvent) => { event.preventDefault(); sendPrompt(prompt); };
  return (
    <div className={`${styles.view} ${styles.aiView}`}>
      <ViewHeader description="Your permission-aware personal assistant, financial coach, business adviser and learning guide." eyebrow="Core layer 07 · Responsible AI beta" title="EGONUX AI" action={<span className={styles.operationalPill}><span /> AI services online</span>} />
      <section className={styles.aiLayout}>
        <aside className={styles.aiContextPanel}>
          <span className={styles.eyebrow}>Active context</span><h2>What AI can use</h2>
          <div className={styles.contextList}><div><Icon name="identity" /><span><strong>Identity</strong><small>Profile &amp; verification</small></span><em>Allowed</em></div><div><Icon name="wallet" /><span><strong>Wallet</strong><small>Sandbox summaries only</small></span><em>Allowed</em></div><div><Icon name="learn" /><span><strong>Learning</strong><small>Progress &amp; goals</small></span><em>Allowed</em></div><div><Icon name="community" /><span><strong>Private messages</strong><small>Never used by default</small></span><em className={styles.contextBlocked}>Blocked</em></div></div>
          <button className={styles.outlineButton} type="button"><Icon name="security" size={16} /> Manage AI permissions</button>
          <p><Icon name="lock" size={14} /> Every production answer will be logged, traceable and governed by your consent.</p>
        </aside>
        <div className={styles.chatPanel}>
          <div className={styles.chatTop}><div><span className={styles.aiAvatar}><Icon name="sparkles" /></span><div><strong>ANOSA · EGONUX Assistant</strong><small>Enterprise MVP intelligence</small></div></div><EgonuxButton aria-label="Clear chat" size="sm" variant="ghost" labelStyle="parenthesized" onClick={() => setMessages(initialMessages)}>CLEAR</EgonuxButton></div>
          <div aria-live="polite" className={styles.chatMessages}>
            {messages.map((message) => <div className={message.role === 'assistant' ? styles.assistantMessage : styles.userMessage} key={message.id}>{message.role === 'assistant' ? <span><Icon name="sparkles" size={17} /></span> : null}<p>{message.text}</p></div>)}
          </div>
          <div className={styles.suggestionRow}>{suggestions.map((suggestion) => <EgonuxButton key={suggestion} size="sm" variant="secondary" labelStyle="parenthesized" onClick={() => sendPrompt(suggestion)}>{suggestion.toUpperCase()}</EgonuxButton>)}</div>
          <form className={styles.chatForm} onSubmit={submit}><label className={styles.srOnly} htmlFor="ai-prompt">Ask EGONUX AI</label><textarea id="ai-prompt" onChange={(event) => setPrompt(event.target.value)} placeholder="Ask about your goals, learning or business…" rows={2} value={prompt} /><button aria-label="Send message" disabled={!prompt.trim()} type="submit"><Icon name="send" /></button></form>
          <small className={styles.aiDisclaimer}>AI can make mistakes. Verify financial, legal and business decisions with qualified professionals.</small>
        </div>
      </section>
    </div>
  );
}


export function LearnView({ onToast }: { onToast?: (msg: string) => void }) {
  return (
    <div className={styles.view}>
      <ViewHeader
        description="Access multi-volume manuscripts, engineering guides, and strategic leadership frameworks."
        eyebrow="Core Layer 09 • Knowledge Base"
        title="EGONUX Learn Hub"
        action={<span className={styles.statusPill}>Library Active</span>}
      />
      <section className={styles.panel}>
        <h2>EGONUX: Learn. Build. Grow. Lead.</h2>
        <p className={styles.mutedText}>Explore curriculum modules and system documentation.</p>
        <EgonuxButton labelStyle="parenthesized" onClick={() => onToast && onToast("Loaded curriculum module successfully!")}>LOAD CURRICULUM</EgonuxButton>
      </section>
    </div>
  );}


export function CommunityView({ onToast }: { onToast?: (msg: string) => void }) {
  return (
    <div className={styles.view}>
      <ViewHeader
        description="Connect with fellow builders, founders, and community champions."
        eyebrow="Core Layer 07 • Ecosystem Network"
        title="EGONUX Community"
        action={<span className={styles.statusPill}>Active Feed</span>}
      />
      <section className={styles.threeColumnGrid}>
        {communityChannels.map((channel, i) => (
          <article key={i} className={styles.panel}>
            <span className={styles.eyebrow}>Channel</span>
            <h3>{channel.name}</h3>
            <p className={styles.mutedText}>{channel.topic || 'Active community channel'}</p>
            <EgonuxButton labelStyle="parenthesized" onClick={() => onToast && onToast("Joined " + channel.name)}>JOIN CHANNEL</EgonuxButton>
          </article>
        ))}
      </section>
    </div>
  );
}


export function SettingsView({ onToast }: { onToast?: (msg: string) => void }) {
  const [apiKey, setApiKey] = useState("egx_demo_placeholder");
  const [copiedKey, setCopiedKey] = useState(false);
  const [themeAccent, setThemeAccent] = useState("Royal Gold (#D4AF37)");
  const [autoReconcile, setAutoReconcile] = useState(true);

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      if (onToast) onToast("Demo API key copied to clipboard; no server credential was accessed.");
      setTimeout(() => setCopiedKey(false), 2500);
    } catch {
      if (onToast) onToast("Demo API key: " + apiKey);
    }
  };

  const handleRotateKey = () => {
    const newKey = "egx_demo_" + Math.random().toString(36).substring(2, 16);
    setApiKey(newKey);
    if (onToast) onToast("Demo key rotated locally; no server credential was changed.");
  };

  return (
    <div className={styles.view}>
      <ViewHeader
        description="Configure ecosystem parameters, developer API keys, UI theme standards, and security controls."
        eyebrow="Core Layer 10 • System Configuration"
        title="EGONUX System Settings"
        action={<span className={styles.statusPill}>System Status: Optimal</span>}
      />

      <section className={styles.twoColumnGrid}>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Developer & API Security</span>
          <h3>Live Sandbox API Key</h3>
          <p className={styles.mutedText}>Used for authenticating local SDK calls and WebSocket feeds.</p>
          <div className={styles.referralLink}>
            <span>{apiKey}</span>
            <EgonuxButton size="sm" variant="secondary" labelStyle="parenthesized" onClick={copyApiKey}>{copiedKey ? "COPIED!" : "COPY DEMO KEY"}</EgonuxButton>
          </div>
          <EgonuxButton variant="secondary" labelStyle="parenthesized" onClick={handleRotateKey} style={{ marginTop: "12px" }}>ROTATE DEMO KEY</EgonuxButton>
        </article>

        <article className={styles.panel}>
          <span className={styles.eyebrow}>Appearance & Themes</span>
          <h3>Visual Identity Standard</h3>
          <p className={styles.mutedText}>Current Active Accent: <strong>{themeAccent}</strong></p>
          <div className={styles.tabContainer} style={{ marginTop: "16px" }}>
            <EgonuxButton size="sm" variant={themeAccent === "Royal Gold (#D4AF37)" ? "primary" : "ghost"} labelStyle="parenthesized" onClick={() => { setThemeAccent("Royal Gold (#D4AF37)"); if(onToast) onToast("Theme set to Royal Gold!"); }}>ROYAL GOLD</EgonuxButton>
            <EgonuxButton size="sm" variant={themeAccent === "Cyber Emerald (#10B981)" ? "primary" : "ghost"} labelStyle="parenthesized" onClick={() => { setThemeAccent("Cyber Emerald (#10B981)"); if(onToast) onToast("Theme set to Cyber Emerald!"); }}>CYBER EMERALD</EgonuxButton>
          </div>
        </article>
      </section>

      <section className={styles.panel} style={{ marginTop: "20px" }}>
        <div className={styles.sectionTitleRowCompact}>
          <div>
            <span className={styles.eyebrow}>Automated Ledger Rules</span>
            <h2>Auto-Reconciliation Engine</h2>
          </div>
          <EgonuxButton aria-pressed={autoReconcile} variant={autoReconcile ? "primary" : "secondary"} labelStyle="parenthesized" onClick={() => { setAutoReconcile(!autoReconcile); if(onToast) onToast("Auto-reconciliation " + (!autoReconcile ? "enabled" : "disabled")); }}>
            {autoReconcile ? "AUTO-RECONCILIATION: ENABLED" : "AUTO-RECONCILIATION: DISABLED"}
          </EgonuxButton>
        </div>
      </section>
    </div>
  );
}
