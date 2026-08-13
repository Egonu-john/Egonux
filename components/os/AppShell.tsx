import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { enterpriseNavigation, notifications, primaryNavigation } from '@/lib/os-data';
import type { ModuleId } from '@/types/egonux';
import Icon from './Icon';
import styles from '@/styles/OS.module.css';

interface AppShellProps {
  activeModule: ModuleId;
  cartCount: number;
  children: ReactNode;
  onSelect: (module: ModuleId) => void;
  onDismissToast: () => void;
  toast: string;
}

const allNavigation = [...primaryNavigation, ...enterpriseNavigation];

export default function AppShell({
  activeModule,
  cartCount,
  children,
  onSelect,
  onDismissToast,
  toast,
}: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const currentTitle = allNavigation.find((item) => item.id === activeModule)?.label ?? 'Command Home';
  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) return [];
    return allNavigation.filter((item) => item.label.toLowerCase().includes(normalized)).slice(0, 5);
  }, [query]);

  const selectModule = (module: ModuleId) => {
    onSelect(module);
    setIsMenuOpen(false);
    setQuery('');
  };

  const renderNavigation = (items: typeof allNavigation) =>
    items.map((item) => (
      <button
        aria-current={activeModule === item.id ? 'page' : undefined}
        className={`${styles.navItem} ${activeModule === item.id ? styles.navItemActive : ''}`}
        key={item.id}
        onClick={() => selectModule(item.id)}
        type="button"
      >
        <Icon name={item.icon} size={19} />
        <span>{item.label}</span>
        {item.badge ? <span className={styles.navBadge}>{item.badge}</span> : null}
      </button>
    ));

  return (
    <div className={styles.appShell}>
      <button
        aria-label="Close navigation"
        className={`${styles.mobileBackdrop} ${isMenuOpen ? styles.mobileBackdropVisible : ''}`}
        onClick={() => setIsMenuOpen(false)}
        type="button"
      />

      <aside className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brandRow}>
          <Link aria-label="EGONUX home" className={styles.brand} href="/">
            EGONU<span>X</span>
            <small>OS v3.0</small>
          </Link>
          <button
            aria-label="Close menu"
            className={styles.mobileClose}
            onClick={() => setIsMenuOpen(false)}
            type="button"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className={styles.sandboxBadge}>
          <span className={styles.liveDot} />
          Enterprise MVP · Sandbox
        </div>

        <nav aria-label="EGONUX platform navigation" className={styles.sidebarNav}>
          <span className={styles.navLabel}>Ecosystem</span>
          {renderNavigation(primaryNavigation)}
          <span className={styles.navLabel}>Enterprise</span>
          {renderNavigation(enterpriseNavigation)}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.securityMini}>
            <Icon name="security" size={18} />
            <div>
              <strong>Security score 92%</strong>
              <span>All critical controls active</span>
            </div>
          </div>
          <Link className={styles.backToSite} href="/">
            <Icon name="logout" size={17} />
            Back to egonux.com
          </Link>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.topbarTitle}>
            <button
              aria-label="Open menu"
              className={styles.menuButton}
              onClick={() => setIsMenuOpen(true)}
              type="button"
            >
              <Icon name="menu" />
            </button>
            <div>
              <span>EGONUX OS</span>
              <strong>{currentTitle}</strong>
            </div>
          </div>

          <div className={styles.topbarActions}>
            <div className={styles.searchWrap}>
              <Icon name="search" size={18} />
              <label className={styles.srOnly} htmlFor="os-search">Search modules</label>
              <input
                autoComplete="off"
                id="os-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the ecosystem"
                type="search"
                value={query}
              />
              {searchResults.length > 0 ? (
                <div className={styles.searchResults}>
                  {searchResults.map((item) => (
                    <button key={item.id} onClick={() => selectModule(item.id)} type="button">
                      <Icon name={item.icon} size={17} />
                      <span>{item.label}</span>
                      <Icon name="chevron-right" size={15} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              aria-label={`Shopping cart with ${cartCount} items`}
              className={styles.iconButton}
              onClick={() => selectModule('marketplace')}
              type="button"
            >
              <Icon name="cart" />
              {cartCount > 0 ? <span className={styles.countBadge}>{cartCount}</span> : null}
            </button>

            <div className={styles.notificationWrap}>
              <button
                aria-expanded={isNotificationsOpen}
                aria-label="Open notifications"
                className={styles.iconButton}
                onClick={() => setIsNotificationsOpen((current) => !current)}
                type="button"
              >
                <Icon name="bell" />
                <span className={styles.countBadge}>2</span>
              </button>
              {isNotificationsOpen ? (
                <div className={styles.notificationPanel}>
                  <div className={styles.panelHeader}>
                    <strong>Notifications</strong>
                    <span>2 unread</span>
                  </div>
                  {notifications.map((notification) => (
                    <button
                      className={styles.notificationItem}
                      key={notification.id}
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        selectModule(notification.kind === 'learn' ? 'learn' : notification.kind === 'wallet' ? 'wallet' : 'security');
                      }}
                      type="button"
                    >
                      <span className={`${styles.notificationIcon} ${notification.unread ? styles.notificationUnread : ''}`}>
                        <Icon name={notification.kind === 'learn' ? 'learn' : notification.kind === 'wallet' ? 'wallet' : 'security'} size={17} />
                      </span>
                      <span>
                        <strong>{notification.title}</strong>
                        <small>{notification.body}</small>
                        <time>{notification.time}</time>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button className={styles.profileButton} onClick={() => selectModule('identity')} type="button">
              <span className={styles.avatar}>EJ</span>
              <span className={styles.profileCopy}>
                <strong>Egonu John</strong>
                <small>Founder access</small>
              </span>
              <Icon name="chevron-right" size={15} />
            </button>
          </div>
        </header>

        <main className={styles.main}>{children}</main>
      </div>

      <nav aria-label="Mobile primary navigation" className={styles.mobileNav}>
        {primaryNavigation.slice(0, 5).map((item) => (
          <button
            aria-current={activeModule === item.id ? 'page' : undefined}
            className={activeModule === item.id ? styles.mobileNavActive : ''}
            key={item.id}
            onClick={() => selectModule(item.id)}
            type="button"
          >
            <Icon name={item.icon} size={19} />
            <span>{item.id === 'home' ? 'Home' : item.label.replace('EGONUX ', '')}</span>
          </button>
        ))}
      </nav>

      {toast ? (
        <div aria-live="polite" className={styles.toast} role="status">
          <span><Icon name="check" size={18} /></span>
          <p>{toast}</p>
          <button aria-label="Dismiss message" onClick={onDismissToast} type="button"><Icon name="close" size={16} /></button>
        </div>
      ) : null}
    </div>
  );
}
