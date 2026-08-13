import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import type { ActionRequest, ModuleId } from '@/types/egonux';
import ActionModal from './ActionModal';
import AppShell from './AppShell';
import DashboardView from './DashboardView';
import { AdminView, DeveloperView, SecurityView } from './EnterpriseViews';
import {
  AffiliateView,
  AIView,
  CommunityView,
  IdentityView,
  LearnView,
  MarketplaceView,
  WalletView,
} from './UserModuleViews';

const moduleIds = new Set<ModuleId>([
  'home', 'identity', 'wallet', 'marketplace', 'learn', 'community',
  'affiliate', 'ai', 'security', 'developer', 'admin',
]);

export default function EgonuxOS() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [activeAction, setActiveAction] = useState<ActionRequest['type'] | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const requestedModule = Array.isArray(router.query.module) ? router.query.module[0] : router.query.module;
    setActiveModule(requestedModule && moduleIds.has(requestedModule as ModuleId) ? requestedModule as ModuleId : 'home');
  }, [router.isReady, router.query.module]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const showToast = useCallback((message: string) => setToast(message), []);

  const selectModule = useCallback((module: ModuleId) => {
    setActiveModule(module);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const query = module === 'home' ? {} : { module };
    void router.replace({ pathname: '/os', query }, undefined, { shallow: true, scroll: false });
  }, [router]);

  const submitAction = (request: ActionRequest) => {
    setActiveAction(null);
    showToast(`${request.type} request for UGX ${request.amount} created in sandbox mode. No funds moved.`);
  };

  const addToCart = (title: string) => {
    setCartCount((count) => count + 1);
    showToast(`${title} added to your sandbox cart.`);
  };

  const renderActiveView = () => {
    switch (activeModule) {
      case 'identity': return <IdentityView />;
      case 'wallet': return <WalletView onAction={setActiveAction} />;
      case 'marketplace': return <MarketplaceView onAddToCart={addToCart} />;
      case 'learn': return <LearnView onToast={showToast} />;
      case 'community': return <CommunityView onToast={showToast} />;
      case 'affiliate': return <AffiliateView onToast={showToast} />;
      case 'ai': return <AIView />;
      case 'security': return <SecurityView onToast={showToast} />;
      case 'developer': return <DeveloperView onToast={showToast} />;
      case 'admin': return <AdminView onToast={showToast} />;
      default: return <DashboardView onAction={setActiveAction} onSelect={selectModule} />;
    }
  };

  return (
    <AppShell
      activeModule={activeModule}
      cartCount={cartCount}
      onDismissToast={() => setToast('')}
      onSelect={selectModule}
      toast={toast}
    >
      {renderActiveView()}
      <ActionModal action={activeAction} onClose={() => setActiveAction(null)} onSubmit={submitAction} />
    </AppShell>
  );
}
