import { Card, CardContent } from "@/components/ui/card";
import { Header } from './components/layout/Header';
import { SettingsLayout } from './components/SettingsLayout';
import { ChangelogModal } from './components/ChangelogBox';
import { ConfigProvider } from './contexts/ConfigContext';
import { AdminProvider } from './contexts/AdminContext';
import { Toaster } from "@/components/ui/sonner";
import { useConfig } from './contexts/ConfigContext';

import { useState, useCallback, useEffect } from 'react';
import Sidebar, { NavItem } from './components/layout/Sidebar';
import MobileHeader from './components/layout/MobileHeader';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const navItems: NavItem[] = [
  { id: 'presets', label: 'About/Presets', icon: 'auto_awesome' },
  { id: 'general', label: 'General', icon: 'settings' },
  { id: 'integrations', label: 'Integrations', icon: 'extension' },
  { id: 'providers', label: 'Meta Providers', icon: 'database' },
  { id: 'art-providers', label: 'Art Providers', icon: 'image' },
  { id: 'filters', label: 'Filters', icon: 'filter_list' },
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'catalogs', label: 'Catalogs', icon: 'library_books' },
  { id: 'configuration', label: 'Configuration', icon: 'save' },
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
];

function AppContent() {
  const { config, setConfig, auth, setAuth, addonVersion } = useConfig();
  const isLoggedIn = auth.authenticated;
  const [currentPage, setCurrentPage] = useState('presets');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [uuidInput, setUuidInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [uuidFromUrl, setUuidFromUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [requireAddonPassword, setRequireAddonPassword] = useState(false);
  const [addonPasswordInput, setAddonPasswordInput] = useState("");
  const [isUUIDTrusted, setIsUUIDTrusted] = useState<boolean | null>(null);
  const [authTransitioning, setAuthTransitioning] = useState(false);

  useEffect(() => {
    try {
      const pathParts = window.location.pathname.split('/');
      const stremioIndex = pathParts.findIndex(p => p === 'stremio');
      if (stremioIndex !== -1 && pathParts[stremioIndex + 1]) {
        const potentialUUID = pathParts[stremioIndex + 1];
        if (potentialUUID.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          setUuidFromUrl(potentialUUID);
          setUuidInput(potentialUUID);
        }
      }
    } catch { }
  }, []);

  useEffect(() => {
    try {
      const isFromStremio = window.location.pathname.includes('/stremio/') ||
        sessionStorage.getItem('fromStremioSettings') === 'true';

      // Don't prompt for login on dashboard route
      const isDashboardRoute = window.location.pathname === '/dashboard' || window.location.pathname === '/dashboard/';

      if (!auth.authenticated && isFromStremio && !isDashboardRoute) {
        sessionStorage.removeItem('fromStremioSettings');
        setTimeout(() => setIsLoginOpen(true), 100);
      }
    } catch { }
  }, [auth.authenticated]);

  useEffect(() => {
    if (window.location.pathname.includes('/stremio/')) {
      sessionStorage.setItem('fromStremioSettings', 'true');
    }
  }, []);

  useEffect(() => {
    fetch("/api/config/addon-info")
      .then(res => res.json())
      .then(data => setRequireAddonPassword(!!data.requiresAddonPassword))
      .catch(() => setRequireAddonPassword(false));
  }, []);

  useEffect(() => {
    if (uuidInput && uuidInput.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      fetch(`/api/config/is-trusted/${encodeURIComponent(uuidInput)}`)
        .then(res => res.json())
        .then(data => {
          setIsUUIDTrusted(!!data.trusted);
          setRequireAddonPassword(!!data.requiresAddonPassword);
        })
        .catch(() => {
          setIsUUIDTrusted(null);
          setRequireAddonPassword(false);
        });
    } else {
      setIsUUIDTrusted(null);
      setRequireAddonPassword(false);
    }
  }, [uuidInput]);

  const handleLogin = async () => {
    setIsLoading(true);
    setLoginError('');
    try {
      if (!uuidInput || !passwordInput) {
        setLoginError('UUID and password are required');
        setIsLoading(false);
        return;
      }
      const response = await fetch(`/api/config/load/${encodeURIComponent(uuidInput)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput, addonPassword: addonPasswordInput })
      });
      if (!response.ok) {
        let message = 'Failed to load configuration';
        try {
          const err = await response.json();
          message = err?.error || message;
        } catch { }
        throw new Error(message);
      }
      const result = await response.json();
      if (!result?.success || !result?.config) {
        throw new Error('Invalid response from server');
      }
      setConfig({ ...result.config, catalogSetupComplete: true });
      setAuth({ authenticated: true, userUUID: uuidInput, password: passwordInput });
      toast.success('Configuration loaded');
      setIsLoginOpen(false);
      setUuidInput('');
      setPasswordInput('');
      setAddonPasswordInput('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load configuration';
      setLoginError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth({ authenticated: false });
    toast.success('Signed out successfully');
  };

  const navigateTo = useCallback((id: string) => {
    setCurrentPage(id);
    setIsSidebarOpen(false);
    // Disabled programmatic scrolling when selecting a new tab to keep Header visible

    // Also trigger the legacy navigation event for components that might listen to it
    window.dispatchEvent(new CustomEvent('settings-layout:navigate', {
      detail: { tab: id, scrollToTop: true }
    }));
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#0b141f] overflow-hidden font-sans dark text-foreground">
      {/* Sidebar for Desktop / Drawer for Mobile */}
      <Sidebar
        navItems={navItems}
        currentPage={currentPage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={navigateTo}
        addonVersion={addonVersion}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogoutClick={handleLogout}
      />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header (Sticky) */}
        <MobileHeader onToggle={() => setIsSidebarOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth bg-[#0b141f]">
          {/* Background Decorations */}
          <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-[#3ce58a]/10 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none z-0"></div>
          <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-[#1a4e76]/10 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none z-0"></div>

          <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-6xl mx-auto w-full">
            <Header currentPage={currentPage} />

            {/* Custom Description Blurb */}
            {config.apiKeys.customDescriptionBlurb && (
              <div
                className="mb-6 p-4 bg-[#101923] border border-[#283039] rounded-lg w-full"
                dangerouslySetInnerHTML={{ __html: config.apiKeys.customDescriptionBlurb }}
              />
            )}

            <Card className="mb-32 w-full rounded-[24px] border-white/10 bg-[rgba(22,35,52,0.8)] shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-[16px]">
              <CardContent className="p-4 md:p-8">
                <SettingsLayout forcedTab={currentPage} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[400] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Toaster />
      <Dialog
        open={isLoginOpen}
        onOpenChange={(next) => {
          if (authTransitioning) return;
          setIsLoginOpen(next);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-[24px] border-white/10 bg-[rgba(22,35,52,0.92)] text-white backdrop-blur-[16px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Load Saved Configuration</DialogTitle>
            <DialogDescription className="text-white/60">
              Enter your UUID and password{requireAddonPassword ? ' and addon password' : ''} to load your saved configuration.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                  {loginError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="uuid" className="text-sm font-medium text-[#B0C4DE]">UUID</Label>
                <Input
                  id="uuid"
                  value={uuidInput}
                  onChange={(e) => setUuidInput(e.target.value)}
                  placeholder="Your UUID"
                  disabled={!!uuidFromUrl}
                  className={cn(
                    "rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-[#39E079]/50",
                    uuidFromUrl ? "opacity-50 cursor-not-allowed" : ""
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#B0C4DE]">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Your password"
                    className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-[#39E079]/50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#B0C4DE] hover:text-white hover:bg-white/5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {requireAddonPassword && isUUIDTrusted === false && (
                <div className="space-y-2">
                  <Label htmlFor="addonPassword" className="text-sm font-medium text-[#B0C4DE]">Addon Password</Label>
                  <Input
                    id="addonPassword"
                    type="password"
                    value={addonPasswordInput}
                    onChange={e => setAddonPasswordInput(e.target.value)}
                    placeholder="Enter the addon password"
                    minLength={6}
                    className="rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-[#39E079]/50"
                  />
                  <p className="text-xs text-[#B0C4DE]/60 mt-1">Required by the addon administrator.</p>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLoginOpen(false)}
                  className="rounded-xl border-white/10 hover:bg-white/5 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-[#39E079] text-black hover:bg-[#39E079]/90 font-semibold px-6 shadow-[0_4px_15px_rgba(57,224,121,0.2)]"
                >
                  {isLoading ? 'Loading…' : 'Load'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function App() {
  return (
    <ConfigProvider>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </ConfigProvider>
  );
}

export default App;
