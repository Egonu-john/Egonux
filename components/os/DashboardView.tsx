import { coreModules, courses, transactions } from '@/lib/os-data';
import type { ActionRequest, ModuleId } from '@/types/egonux';
import Icon from './Icon';
import styles from '@/styles/OS.module.css';

interface DashboardViewProps {
  onAction: (action: ActionRequest['type']) => void;
  onSelect: (module: ModuleId) => void;
}

const quickActions: Array<{
  action?: ActionRequest['type'];
  icon: 'arrow-down' | 'send' | 'arrow-up' | 'qr';
  label: string;
  module?: ModuleId;
}> = [
  { action: 'Deposit', icon: 'arrow-down', label: 'Deposit' },
  { action: 'Transfer', icon: 'send', label: 'Transfer' },
  { action: 'Withdraw', icon: 'arrow-up', label: 'Withdraw' },
  { icon: 'qr', label: 'Pay by QR', module: 'wallet' },
];

const activityBars = [34, 48, 42, 62, 54, 78, 69, 86, 72, 94, 82, 100];

export default function DashboardView({ onAction, onSelect }: DashboardViewProps) {
  const activeCourse = courses[0];

  return (
    <div className={styles.view}>
      <section className={styles.welcomeRow}>
        <div>
          <span className={styles.eyebrow}>Thursday · 13 August 2026</span>
          <h1>Good morning, Egonu.</h1>
          <p>One identity. One ecosystem. Everything you need to learn, build, grow and lead.</p>
        </div>
        <button className={styles.aiPromptButton} onClick={() => onSelect('ai')} type="button">
          <span><Icon name="sparkles" size={18} /></span>
          Ask EGONUX AI
        </button>
      </section>

      <section className={styles.dashboardHeroGrid}>
        <article className={styles.balanceCard}>
          <div className={styles.balanceTopline}>
            <div>
              <span>Available balance</span>
              <button aria-label="Show wallet information" type="button">Sandbox wallet</button>
            </div>
            <span className={styles.cardMark}>EGX</span>
          </div>
          <strong className={styles.balanceAmount}>UGX 1,250,000</strong>
          <span className={styles.balanceEquivalent}>≈ USD 338.42 · indicative only</span>
          <div className={styles.balanceTrend}>
            <Icon name="activity" size={17} />
            <span>UGX 428,500 moved this month</span>
            <strong>+14.8%</strong>
          </div>
          <div className={styles.quickActions}>
            {quickActions.map((item) => (
              <button
                key={item.label}
                onClick={() => item.action ? onAction(item.action) : item.module ? onSelect(item.module) : undefined}
                type="button"
              >
                <span><Icon name={item.icon} size={18} /></span>
                {item.label}
              </button>
            ))}
          </div>
        </article>

        <article className={styles.identityCard}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.eyebrow}>Universal identity</span>
              <h2>EGONUX ID</h2>
            </div>
            <span className={styles.verifiedPill}><Icon name="check" size={14} /> Verified</span>
          </div>
          <div className={styles.identityProfile}>
            <span className={styles.largeAvatar}>EJ</span>
            <div>
              <strong>Egonu John William</strong>
              <span>EGX-UG-000047</span>
            </div>
          </div>
          <div className={styles.identityStats}>
            <div><span>Trust level</span><strong>Level 3</strong></div>
            <div><span>Security</span><strong>92%</strong></div>
            <div><span>Reputation</span><strong>840</strong></div>
          </div>
          <button className={styles.textButton} onClick={() => onSelect('identity')} type="button">
            Open identity center <Icon name="chevron-right" size={16} />
          </button>
        </article>
      </section>

      <section className={styles.contentGrid}>
        <article className={`${styles.panel} ${styles.activityPanel}`}>
          <div className={styles.panelHeaderLarge}>
            <div>
              <span className={styles.eyebrow}>Ecosystem activity</span>
              <h2>Your momentum</h2>
            </div>
            <div className={styles.activityTotal}><strong>72</strong><span>actions</span></div>
          </div>
          <div aria-label="Activity increased through the month" className={styles.activityChart} role="img">
            {activityBars.map((height, index) => (
              <span key={`bar-${index + 1}`} style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className={styles.chartLegend}>
            <span>1 Aug</span><span>Today</span>
          </div>
        </article>

        <article className={`${styles.panel} ${styles.coursePanel}`}>
          <div className={styles.panelHeaderLarge}>
            <div>
              <span className={styles.eyebrow}>Continue learning</span>
              <h2>{activeCourse.title}</h2>
            </div>
            <span className={styles.coursePercent}>{activeCourse.progress}%</span>
          </div>
          <p>Next: Building a resilient personal cash-flow system.</p>
          <div className={styles.progressTrack}><span style={{ width: `${activeCourse.progress}%` }} /></div>
          <div className={styles.courseMeta}>
            <span>{activeCourse.lessons} lessons</span>
            <span>{activeCourse.duration}</span>
            <span>{activeCourse.level}</span>
          </div>
          <button className={styles.primaryButtonSmall} onClick={() => onSelect('learn')} type="button">
            <Icon name="play" size={16} /> Resume course
          </button>
        </article>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionTitleRow}>
          <div><span className={styles.eyebrow}>Shared foundations</span><h2>Your EGONUX ecosystem</h2></div>
          <span className={styles.operationalPill}><span /> 8 core services online</span>
        </div>
        <div className={styles.moduleGrid}>
          {coreModules.map((module) => (
            <button className={styles.moduleCard} key={module.id} onClick={() => onSelect(module.id)} type="button">
              <span className={styles.moduleIcon}><Icon name={module.id === 'admin' ? 'admin' : module.id} /></span>
              <span className={styles.moduleCardCopy}>
                <strong>{module.label}</strong>
                <small>{module.detail}</small>
              </span>
              <span className={styles.moduleState}>{module.state}</span>
              <Icon name="chevron-right" size={16} />
            </button>
          ))}
        </div>
      </section>

      <section className={styles.bottomGrid}>
        <article className={styles.panel}>
          <div className={styles.sectionTitleRowCompact}>
            <div><span className={styles.eyebrow}>Wallet</span><h2>Recent activity</h2></div>
            <button className={styles.textButton} onClick={() => onSelect('wallet')} type="button">View all <Icon name="chevron-right" size={15} /></button>
          </div>
          <div className={styles.transactionList}>
            {transactions.slice(0, 3).map((transaction) => (
              <div className={styles.transactionRow} key={transaction.id}>
                <span className={`${styles.transactionIcon} ${transaction.direction === 'in' ? styles.transactionIn : ''}`}>
                  <Icon name={transaction.direction === 'in' ? 'arrow-down' : 'arrow-up'} size={17} />
                </span>
                <div className={styles.transactionName}><strong>{transaction.merchant}</strong><span>{transaction.detail}</span></div>
                <div className={styles.transactionAmount}><strong className={transaction.direction === 'in' ? styles.positiveText : ''}>{transaction.direction === 'in' ? '+' : '-'}{transaction.amount}</strong><span>{transaction.date}</span></div>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.insightCard}>
          <span className={styles.insightIcon}><Icon name="sparkles" /></span>
          <span className={styles.eyebrow}>EGONUX AI insight</span>
          <h2>Your savings rate improved by 11%.</h2>
          <p>If you maintain this pattern, your emergency vault reaches its next target three weeks earlier.</p>
          <button onClick={() => onSelect('ai')} type="button">Explore the insight <Icon name="chevron-right" size={16} /></button>
          <small>Educational guidance only · not financial advice</small>
        </article>
      </section>
    </div>
  );
}
