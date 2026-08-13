import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { communityChannels, courses, products, transactions } from '@/lib/os-data';
import type { ActionRequest } from '@/types/egonux';
import Icon from './Icon';
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

export function WalletView({ onAction }: WalletViewProps) {
  return (
    <div className={styles.view}>
      <ViewHeader
        description="One protected ledger for deposits, transfers, withdrawals, QR payments and savings vaults."
        eyebrow="Core layer 02 · Sandbox"
        title="EGONUX Wallet"
        action={<button className={styles.outlineButton} type="button"><Icon name="qr" size={17} /> Show payment QR</button>}
      />

      <section className={styles.walletHeroGrid}>
        <article className={styles.balanceCardLarge}>
          <div className={styles.balanceTopline}><div><span>Total portfolio</span><button type="button">All accounts</button></div><span className={styles.verifiedPill}><Icon name="lock" size={13} /> Protected</span></div>
          <strong>UGX 1,250,000</strong>
          <small>Indicative equivalent · USD 338.42</small>
          <div className={styles.walletActionRow}>
            <button onClick={() => onAction('Deposit')} type="button"><Icon name="arrow-down" /> Deposit</button>
            <button onClick={() => onAction('Transfer')} type="button"><Icon name="send" /> Transfer</button>
            <button onClick={() => onAction('Withdraw')} type="button"><Icon name="arrow-up" /> Withdraw</button>
          </div>
        </article>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Multi-currency accounts</span>
          <div className={styles.currencyList}>
            <div><span className={styles.currencyFlag}>UG</span><div><strong>Ugandan Shilling</strong><small>Primary account</small></div><strong>1,250,000 <small>UGX</small></strong></div>
            <div><span className={styles.currencyFlag}>US</span><div><strong>US Dollar</strong><small>Available in Phase 2</small></div><strong>0.00 <small>USD</small></strong></div>
            <div><span className={styles.currencyFlag}>EU</span><div><strong>Euro</strong><small>Available in Phase 2</small></div><strong>0.00 <small>EUR</small></strong></div>
          </div>
        </article>
      </section>

      <section className={styles.vaultGrid}>
        <article className={styles.vaultCard}><span><Icon name="security" /></span><div><small>Emergency vault</small><strong>UGX 420,000</strong><div className={styles.progressTrack}><span style={{ width: '56%' }} /></div><em>56% of UGX 750,000 target</em></div></article>
        <article className={styles.vaultCard}><span><Icon name="marketplace" /></span><div><small>Business growth</small><strong>UGX 285,000</strong><div className={styles.progressTrack}><span style={{ width: '38%' }} /></div><em>38% of UGX 750,000 target</em></div></article>
        <button className={styles.addVaultCard} type="button"><span><Icon name="plus" /></span><strong>Create savings vault</strong><small>Automate a new goal</small></button>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Ledger</span><h2>Transaction history</h2></div><button className={styles.outlineButton} type="button">Export statement <Icon name="arrow-down" size={15} /></button></div>
        <div className={styles.transactionListFull}>
          {transactions.map((transaction) => (
            <div className={styles.transactionRow} key={transaction.id}>
              <span className={`${styles.transactionIcon} ${transaction.direction === 'in' ? styles.transactionIn : ''}`}><Icon name={transaction.direction === 'in' ? 'arrow-down' : 'arrow-up'} size={17} /></span>
              <div className={styles.transactionName}><strong>{transaction.merchant}</strong><span>{transaction.detail} · {transaction.id}</span></div>
              <span className={`${styles.statusPill} ${transaction.status === 'Review' ? styles.statusWarning : ''}`}>{transaction.status}</span>
              <div className={styles.transactionAmount}><strong className={transaction.direction === 'in' ? styles.positiveText : ''}>{transaction.direction === 'in' ? '+' : '-'}{transaction.amount}</strong><span>{transaction.date}</span></div>
            </div>
          ))}
        </div>
      </section>

      <p className={styles.legalBanner}><Icon name="security" size={17} /> Sandbox only. Real deposits, withdrawals, transfers, custody and currency services remain disabled until applicable licences and regulated partners are in place.</p>
    </div>
  );
}

interface MarketplaceViewProps {
  onAddToCart: (title: string) => void;
}

export function MarketplaceView({ onAddToCart }: MarketplaceViewProps) {
  const [category, setCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(products.map((product) => product.category)))];
  const visibleProducts = useMemo(
    () => category === 'All' ? products : products.filter((product) => product.category === category),
    [category]
  );

  return (
    <div className={styles.view}>
      <ViewHeader
        description="Discover verified digital products, business services and selected physical goods from trusted vendors."
        eyebrow="Core layer 03"
        title="EGONUX Marketplace"
        action={<button className={styles.primaryButtonSmall} type="button"><Icon name="plus" size={16} /> Become a vendor</button>}
      />
      <section className={styles.marketBanner}>
        <div><span className={styles.eyebrow}>Built for digital builders</span><h2>Turn knowledge into an asset.</h2><p>Premium tools, services and resources curated for your next move.</p><button type="button">Explore featured collection <Icon name="chevron-right" size={16} /></button></div>
        <div className={styles.marketOrb}><span>EGX</span><small>CURATED</small></div>
      </section>
      <div className={styles.filterRow}>
        <div className={styles.filterTabs}>
          {categories.map((item) => <button className={category === item ? styles.filterActive : ''} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}
        </div>
        <span>{visibleProducts.length} verified listings</span>
      </div>
      <section className={styles.productGrid}>
        {visibleProducts.map((product) => (
          <article className={styles.productCard} key={product.id}>
            <div className={styles.productArtwork} style={{ '--product-accent': product.accent } as CSSProperties}>
              <span>{product.icon}</span><small>{product.type}</small>
            </div>
            <div className={styles.productBody}>
              <span>{product.category}<em>★ {product.rating}</em></span>
              <h2>{product.title}</h2>
              <p>by {product.vendor}</p>
              <div><strong>{product.price}</strong><button aria-label={`Add ${product.title} to cart`} onClick={() => onAddToCart(product.title)} type="button"><Icon name="cart" size={17} /> Add</button></div>
            </div>
          </article>
        ))}
      </section>
      <section className={styles.vendorCallout}><span><Icon name="marketplace" /></span><div><small>Vendor program</small><h2>Build your storefront on shared EGONUX infrastructure.</h2><p>Identity verification, orders, reviews, analytics and payouts—one operational foundation.</p></div><button className={styles.outlineButton} type="button">Read vendor standards <Icon name="external" size={15} /></button></section>
    </div>
  );
}

interface LearnViewProps { onToast: (message: string) => void; }

export function LearnView({ onToast }: LearnViewProps) {
  return (
    <div className={styles.view}>
      <ViewHeader
        description="Structured learning paths, practical assessments, progress tracking and verifiable credentials."
        eyebrow="Core layer 04"
        title="EGONUX Learn"
        action={<button className={styles.outlineButton} type="button"><Icon name="identity" size={17} /> My certificates</button>}
      />
      <section className={styles.learningStats}>
        <div><span><Icon name="learn" /></span><strong>3</strong><small>Active courses</small></div>
        <div><span><Icon name="play" /></span><strong>14.2h</strong><small>Time invested</small></div>
        <div><span><Icon name="check" /></span><strong>28</strong><small>Lessons completed</small></div>
        <div><span><Icon name="identity" /></span><strong>2</strong><small>Certificates earned</small></div>
      </section>
      <section className={styles.sectionBlock}>
        <div className={styles.sectionTitleRow}><div><span className={styles.eyebrow}>Your learning</span><h2>Continue building</h2></div><button className={styles.textButton} type="button">View full catalog <Icon name="chevron-right" size={15} /></button></div>
        <div className={styles.courseGrid}>
          {courses.map((course) => (
            <article className={styles.courseCard} key={course.id}>
              <div className={styles.courseArtwork} style={{ '--course-accent': course.accent } as CSSProperties}><span>{course.track}</span><Icon name="learn" size={34} /></div>
              <div className={styles.courseBody}>
                <span>{course.level}<em>{course.duration}</em></span><h2>{course.title}</h2><p>{course.lessons} practical lessons · assessment included</p>
                <div className={styles.progressTrack}><span style={{ width: `${course.progress}%` }} /></div>
                <div><small>{course.progress > 0 ? `${course.progress}% complete` : 'Ready to start'}</small><button onClick={() => onToast(`${course.title} opened in sandbox learning mode.`)} type="button"><Icon name={course.progress > 0 ? 'play' : 'plus'} size={15} /> {course.progress > 0 ? 'Resume' : 'Start'}</button></div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.learningPath}>
        <div><span className={styles.eyebrow}>Recommended path</span><h2>Digital Wealth Builder</h2><p>A 12-week path from financial foundations through AI-enabled digital enterprise.</p><div className={styles.pathMeta}><span>6 courses</span><span>4 projects</span><span>1 verified credential</span></div><button className={styles.primaryButtonSmall} onClick={() => onToast('Digital Wealth Builder path saved to your plan.')} type="button">Add path to my plan <Icon name="plus" size={16} /></button></div>
        <div className={styles.pathSteps}><span className={styles.pathStepDone}><Icon name="check" size={15} /> Money foundations</span><span className={styles.pathStepActive}>02 · AI fluency</span><span>03 · Digital business</span><span>04 · Market launch</span></div>
      </section>
    </div>
  );
}

interface CommunityViewProps { onToast: (message: string) => void; }

export function CommunityView({ onToast }: CommunityViewProps) {
  const [joined, setJoined] = useState<Record<string, boolean>>(() => Object.fromEntries(communityChannels.map((channel) => [channel.id, channel.joined])));
  return (
    <div className={styles.view}>
      <ViewHeader description="Trusted groups, channels, announcements and events connected to your universal identity." eyebrow="Core layer 05" title="EGONUX Community" action={<button className={styles.primaryButtonSmall} type="button"><Icon name="plus" size={16} /> Create a group</button>} />
      <section className={styles.communityBanner}><div><span className={styles.eyebrow}>Founder announcement</span><h2>Execution is the bridge between vision and impact.</h2><p>Join this week&apos;s EGONUX OS v3.0 builder briefing and product walkthrough.</p><button onClick={() => onToast('Builder briefing added to your sandbox calendar.')} type="button">Reserve my place <Icon name="chevron-right" size={16} /></button></div><div><strong>16</strong><span>AUG</span><small>18:00 EAT · Live</small></div></section>
      <section className={styles.twoColumnGrid}>
        <article className={styles.panel}>
          <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Discover</span><h2>Channels for your goals</h2></div></div>
          <div className={styles.channelList}>
            {communityChannels.map((channel) => (
              <div className={styles.channelRow} key={channel.id}><span>{channel.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</span><div><strong>{channel.name}</strong><small>{channel.topic} · {channel.members} members</small></div><button className={joined[channel.id] ? styles.joinedButton : ''} onClick={() => { setJoined((current) => ({ ...current, [channel.id]: !current[channel.id] })); onToast(joined[channel.id] ? `You left ${channel.name}.` : `You joined ${channel.name}.`); }} type="button">{joined[channel.id] ? <><Icon name="check" size={14} /> Joined</> : 'Join'}</button></div>
            ))}
          </div>
        </article>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Community pulse</span><h2>What builders are discussing</h2>
          <div className={styles.discussionList}>
            <button type="button"><span>EW</span><div><strong>How should a founder structure the first 90 days?</strong><small>Wealth Builders Uganda · 42 replies</small></div></button>
            <button type="button"><span>AI</span><div><strong>Five AI workflows saving our team 12 hours a week</strong><small>AI Builders Lab · 31 replies</small></div></button>
            <button type="button"><span>CC</span><div><strong>Marketplace launch checklist for Ugandan creators</strong><small>Creator Commerce · 18 replies</small></div></button>
          </div>
        </article>
      </section>
      <section className={styles.communitySafety}><Icon name="security" /><div><strong>Trust is designed into the community.</strong><span>Verified identities, reporting, moderation tools and an auditable community code protect every member.</span></div><button className={styles.textButton} type="button">Read community code <Icon name="external" size={14} /></button></section>
    </div>
  );
}

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
        <article className={styles.affiliateEarnings}><span>Available earnings</span><strong>UGX 178,500</strong><small>Next eligible payout · 31 Aug 2026</small><button onClick={() => onToast('Payout request created in sandbox mode.')} type="button">Request payout <Icon name="chevron-right" size={16} /></button></article>
        <div><span>Verified referrals</span><strong>24</strong><small>+6 this month</small></div><div><span>Conversion rate</span><strong>18.4%</strong><small>Top 12% of pilot</small></div><div><span>Link visits</span><strong>1,482</strong><small>+22.8% this month</small></div>
      </section>
      <section className={styles.twoColumnGrid}>
        <article className={styles.panel}>
          <span className={styles.eyebrow}>Your verified link</span><h2>Share EGONUX responsibly</h2><p className={styles.mutedText}>Use approved messaging only. Earnings are never guaranteed.</p>
          <div className={styles.referralLink}><span>egonux.com/r/EGX000047</span><button aria-label="Copy referral link" onClick={copyLink} type="button"><Icon name="copy" size={17} /></button></div>
          <div className={styles.shareButtons}><button onClick={copyLink} type="button">WhatsApp</button><button onClick={copyLink} type="button">Telegram</button><button onClick={copyLink} type="button">Facebook</button></div>
        </article>
        <article className={styles.panel}>
          <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Performance</span><h2>Monthly conversions</h2></div><strong className={styles.positiveText}>+24%</strong></div>
          <div className={styles.affiliateChart}>{[28, 42, 36, 58, 50, 76, 66, 88].map((height, index) => <span key={`affiliate-bar-${index + 1}`} style={{ height: `${height}%` }} />)}</div>
          <div className={styles.chartLegend}><span>January</span><span>August</span></div>
        </article>
      </section>
      <section className={styles.panel}>
        <div className={styles.sectionTitleRowCompact}><div><span className={styles.eyebrow}>Marketing studio</span><h2>Approved campaign assets</h2></div><button className={styles.textButton} type="button">View all assets <Icon name="chevron-right" size={14} /></button></div>
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
    const timestamp = Date.now();
    setMessages((current) => [...current, { id: `user-${timestamp}`, role: 'user', text: clean }, { id: `assistant-${timestamp}`, role: 'assistant', text: createAssistantReply(clean) }]);
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
          <div className={styles.chatTop}><div><span className={styles.aiAvatar}><Icon name="sparkles" /></span><div><strong>ANOSA · EGONUX Assistant</strong><small>Enterprise MVP intelligence</small></div></div><button aria-label="Clear chat" onClick={() => setMessages(initialMessages)} type="button">Clear</button></div>
          <div aria-live="polite" className={styles.chatMessages}>
            {messages.map((message) => <div className={message.role === 'assistant' ? styles.assistantMessage : styles.userMessage} key={message.id}>{message.role === 'assistant' ? <span><Icon name="sparkles" size={17} /></span> : null}<p>{message.text}</p></div>)}
          </div>
          <div className={styles.suggestionRow}>{suggestions.map((suggestion) => <button key={suggestion} onClick={() => sendPrompt(suggestion)} type="button">{suggestion}</button>)}</div>
          <form className={styles.chatForm} onSubmit={submit}><label className={styles.srOnly} htmlFor="ai-prompt">Ask EGONUX AI</label><textarea id="ai-prompt" onChange={(event) => setPrompt(event.target.value)} placeholder="Ask about your goals, learning or business…" rows={2} value={prompt} /><button aria-label="Send message" disabled={!prompt.trim()} type="submit"><Icon name="send" /></button></form>
          <small className={styles.aiDisclaimer}>AI can make mistakes. Verify financial, legal and business decisions with qualified professionals.</small>
        </div>
      </section>
    </div>
  );
}
