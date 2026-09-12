import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { hasAnyRole } from '@/lib/auth/roles';
import { enterpriseNavigation } from '@/lib/os-data';
import type { AuthenticatedPrincipal, EgonuxRole } from '@/types/backend';
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

interface EgonuxOSProps {
  principal: AuthenticatedPrincipal | null;
}

const enterpriseAccess: Partial<Record<ModuleId, readonly EgonuxRole[]>> = {
  security: ['support', 'compliance', 'admin', 'founder'],
  developer: ['admin', 'founder'],
  admin: ['admin', 'founder'],
};

export default function EgonuxOS({ principal }: EgonuxOSProps) {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<ActionRequest['type'] | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState('');

  const requestedModule = Array.isArray(router.query.module)
    ? router.query.module[0]
    : router.query.module;
  const visibleEnterpriseNavigation = principal
    ? enterpriseNavigation.filter((item) => {
        const required = enterpriseAccess[item.id] ?? [];
        return required.length === 0 || hasAnyRole(principal.roles, required);
      })
    : enterpriseNavigation;
  const visibleModuleIds = new Set<ModuleId>([
    ...moduleIds,
    ...visibleEnterpriseNavigation.map((item) => item.id),
  ]);
  for (const moduleId of Object.keys(enterpriseAccess) as ModuleId[]) {
    if (!visibleEnterpriseNavigation.some((item) => item.id === moduleId)) visibleModuleIds.delete(moduleId);
  }
  const activeModule =
    router.isReady && requestedModule && visibleModuleIds.has(requestedModule as ModuleId)
      ? (requestedModule as ModuleId)
      : 'home';

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const showToast = useCallback((message: string) => setToast(message), []);

  const selectModule = useCallback((module: ModuleId) => {
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

  const signOut = async () => {
    const { signOutOfEgonux } = await import('@/lib/auth/client');
    await signOutOfEgonux();
    await router.push('/login');
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
      onSignOut={principal ? signOut : undefined}
      principal={principal}
      toast={toast}
      visibleEnterpriseNavigation={visibleEnterpriseNavigation}
    >
      {renderActiveView()}
      <ActionModal action={activeAction} onClose={() => setActiveAction(null)} onSubmit={submitAction} />
    </AppShell>
  );
}
