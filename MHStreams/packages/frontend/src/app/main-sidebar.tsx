'use client';

import React from 'react';
import { AppSidebar, useAppSidebarContext } from '@/components/ui/app-layout';
import { cn } from '@/components/ui/core/styling';
import { VerticalMenu, VerticalMenuItem } from '@/components/ui/vertical-menu';
import { Button } from '@/components/ui/button';
import { useStatus } from '@/context/status';
import { useMenu, MenuId } from '@/context/menu';
import { useUserData } from '@/context/userData';
import { ConfigModal } from '@/components/config-modal';
import {
  BiPen,
  BiInfoCircle,
  BiCloud,
  BiExtension,
  BiFilterAlt,
  BiSave,
  BiSort,
  BiCog,
  BiServer,
  BiSmile,
  BiHeart,
  BiLogOutCircle,
  BiLogInCircle,
  BiLinkExternal,
} from 'react-icons/bi';
import { useRouter, usePathname } from 'next/navigation';
import { useDisclosure } from '@/hooks/disclosure';
import {
  ConfirmationDialog,
  useConfirmationDialog,
} from '@/components/shared/confirmation-dialog';
import { Modal } from '@/components/ui/modal';
import { TextInput } from '@/components/ui/text-input';
import { toast } from 'sonner';
import { Tooltip } from '@/components/ui/tooltip';
import { useOptions } from '@/context/options';
import { useMode } from '@/context/mode';
import { DonationModal } from '@/components/shared/donation-modal';

type MenuItem = VerticalMenuItem & {
  id: MenuId;
};

const DEV_ADDON_LINKS = [
  { name: 'MHMetadata', port: 5173 },
  { name: 'MHTV', port: 7000 },
];

export function MainSidebar() {
  const ctx = useAppSidebarContext();
  const [expandedSidebar, setExpandSidebar] = React.useState(false);
  const isCollapsed = false;
  const { selectedMenu, setSelectedMenu } = useMenu();
  const pathname = usePathname();
  const { isOptionsEnabled, enableOptions } = useOptions();
  const donationModal = useDisclosure(false);

  const user = useUserData();
  const signInModal = useDisclosure(false);
  const [initialUuid, setInitialUuid] = React.useState<string | null>(null);

  const clickHistory = React.useRef<number[]>([]);

  React.useEffect(() => {
    const uuidMatch = pathname.match(
      /stremio\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/.*\/configure/
    );
    if (uuidMatch) {
      const extractedUuid = uuidMatch[1];
      setInitialUuid(extractedUuid);
      signInModal.open();
    }
    // check for menu query param
    // const params = new URLSearchParams(window.location.search);
    // const menu = params.get('menu');
    // if (menu && VALID_MENUS.includes(menu)) {
    //   setSelectedMenu(menu);
    // }
  }, [pathname]);

  const { status, error, loading } = useStatus();
  const { mode } = useMode();

  const confirmClearConfig = useConfirmationDialog({
    title: 'Sign Out',
    description: 'Are you sure you want to sign out?',
    onConfirm: () => {
      user.setUserData(null);
      user.setUuid(null);
      user.setPassword(null);
    },
  });

  const topMenuItems: MenuItem[] = [
    {
      name: 'About',
      iconType: BiInfoCircle,
      isCurrent: selectedMenu === 'about',
      id: 'about',
    },
    {
      name: 'Services',
      iconType: BiCloud,
      isCurrent: selectedMenu === 'services',
      id: 'services',
    },
    {
      name: 'Addons',
      iconType: BiExtension,
      isCurrent: selectedMenu === 'addons',
      id: 'addons',
    },
    {
      name: 'Filters',
      iconType: BiFilterAlt,
      isCurrent: selectedMenu === 'filters',
      id: 'filters',
    },
    ...(mode === 'pro'
      ? [
        {
          name: 'Sorting',
          iconType: BiSort,
          isCurrent: selectedMenu === 'sorting',
          id: 'sorting',
        },
      ]
      : []),
    {
      name: 'Formatter',
      iconType: BiPen,
      isCurrent: selectedMenu === 'formatter',
      id: 'formatter',
    },
    {
      name: 'Proxy',
      iconType: BiServer,
      isCurrent: selectedMenu === 'proxy',
      id: 'proxy',
    },
    {
      name: 'Miscellaneous',
      iconType: BiCog,
      isCurrent: selectedMenu === 'miscellaneous',
      id: 'miscellaneous',
    },
    ...(isOptionsEnabled
      ? [
        {
          name: 'Fun',
          iconType: BiSmile,
          isCurrent: selectedMenu === 'fun',
          id: 'fun',
        },
      ]
      : []),
    {
      name: 'Save & Install',
      iconType: BiSave,
      isCurrent: selectedMenu === 'save-install',
      id: 'save-install',
    },
  ];

  const handleExpandSidebar = () => {
    if (!ctx.isBelowBreakpoint && ts.expandSidebarOnHover) {
      setExpandSidebar(true);
    }
  };
  const handleUnexpandedSidebar = () => {
    if (expandedSidebar && ts.expandSidebarOnHover) {
      setExpandSidebar(false);
    }
  };

  const ts = {
    expandSidebarOnHover: false,
    disableSidebarTransparency: true,
  };

  const openAddon = React.useCallback((port: number) => {
    const { protocol, hostname } = window.location;
    window.open(`${protocol}//${hostname}:${port}`, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <>
      <AppSidebar
        className={cn(
          'group/main-sidebar h-full flex flex-col justify-between transition-gpu w-full transition-[width] duration-300',
          !ctx.isBelowBreakpoint && expandedSidebar && 'w-[260px]',
          !ctx.isBelowBreakpoint &&
          !ts.disableSidebarTransparency &&
          'bg-transparent',
          !ctx.isBelowBreakpoint &&
          !ts.disableSidebarTransparency &&
          ts.expandSidebarOnHover &&
          'hover:bg-[--background]'
        )}
        onMouseEnter={handleExpandSidebar}
        onMouseLeave={handleUnexpandedSidebar}
      >
        {!ctx.isBelowBreakpoint &&
          ts.expandSidebarOnHover &&
          ts.disableSidebarTransparency && (
            <div
              className={cn(
                'fixed h-full translate-x-0 w-[50px] bg-gradient bg-gradient-to-r via-[--background] from-[--background] to-transparent',
                'group-hover/main-sidebar:translate-x-[250px] transition opacity-0 duration-300 group-hover/main-sidebar:opacity-100'
              )}
            ></div>
          )}

        <div className="flex flex-col w-full h-full">
          <div className="h-20 flex items-center px-6 border-b border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center shrink-0">
                <img
                  src="/logo.webp"
                  alt="Logo"
                  className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(57,224,121,0.5)]"
                />
              </div>
              <div className="font-heading font-bold text-xl tracking-tight text-white">
                MH<span className="text-[#39E079]">Streams</span>
              </div>
            </div>
          </div>
          <VerticalMenu
            className="px-4"
            collapsed={isCollapsed}
            itemClass="relative rounded-xl transition-all duration-200"
            items={topMenuItems}
            onItemSelect={(item) => {
              setSelectedMenu((item as MenuItem).id);
              ctx.setOpen(false);
            }}
          />
        </div>

        <div className="p-6 gap-3 flex flex-col border-t border-white/10 mt-auto">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#B0C4DE]">
              Other Addons
            </div>
            <div className="flex flex-col gap-2">
              {DEV_ADDON_LINKS.map((link) => (
                <Button
                  key={link.name}
                  intent="gray"
                  size="md"
                  className="w-full rounded-xl bg-white/5 border border-white/10 text-[#B0C4DE] hover:bg-white/10 hover:text-white"
                  leftIcon={<BiLinkExternal className="text-xl" />}
                  onClick={() => {
                    openAddon(link.port);
                  }}
                >
                  {link.name}
                </Button>
              ))}
            </div>
          </div>

          <Tooltip
            side="right"
            trigger={
              <Button
                intent="primary"
                size="md"
                className="w-full rounded-xl bg-[#39E079] text-black hover:bg-[#39E079]/90 shadow-lg"
                leftIcon={<BiHeart className="text-xl text-black" />}
                onClick={() => {
                  donationModal.open();
                }}
              >
                Donate to AIOStreams Developer
              </Button>
            }
          >
            Donate to AIOStreams Developer
          </Tooltip>


          <Tooltip
            side="right"
            trigger={
              <Button
                intent="gray"
                size="md"
                className="w-full rounded-xl bg-white/5 border border-white/10 text-[#B0C4DE] hover:bg-white/10 hover:text-white"
                leftIcon={
                  user.uuid && user.password ? (
                    <BiLogOutCircle className="text-xl" />
                  ) : (
                    <BiLogInCircle className="text-xl" />
                  )
                }
                onClick={() => {
                  if (user.uuid && user.password) {
                    confirmClearConfig.open();
                  } else {
                    signInModal.open();
                  }
                }}
              >
                {user.uuid && user.password ? 'Sign Out' : 'Sign In'}
              </Button>
            }
          >
            {user.uuid && user.password ? 'Sign Out' : 'Sign In'}
          </Tooltip>
        </div>
      </AppSidebar>

      <ConfigModal
        open={signInModal.isOpen}
        onSuccess={() => {
          signInModal.close();
          toast.success('Signed in successfully');
        }}
        onOpenChange={(v) => {
          if (!v) {
            signInModal.close();
          }
        }}
        initialUuid={initialUuid || undefined}
      />

      <ConfirmationDialog {...confirmClearConfig} />
      <DonationModal
        open={donationModal.isOpen}
        onOpenChange={donationModal.toggle}
      />
    </>
  );
}
