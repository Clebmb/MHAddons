
import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface NavItem {
    id: string;
    label: string;
    icon: string;
}

interface SidebarProps {
    navItems: NavItem[];
    currentPage: string;
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (id: string) => void;
    addonVersion?: string;
    isLoggedIn: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    navItems,
    currentPage,
    isOpen,
    onClose,
    onNavigate,
    addonVersion,
    isLoggedIn,
    onLoginClick,
    onLogoutClick
}) => {
    const navRef = React.useRef<HTMLElement | null>(null);
    const [showScrollCue, setShowScrollCue] = React.useState(false);

    React.useEffect(() => {
        const node = navRef.current;
        if (!node) return;

        const updateScrollCue = () => {
            const canScroll = node.scrollHeight > node.clientHeight + 8;
            const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 8;
            setShowScrollCue(canScroll && !atBottom);
        };

        updateScrollCue();
        node.addEventListener("scroll", updateScrollCue);
        window.addEventListener("resize", updateScrollCue);

        return () => {
            node.removeEventListener("scroll", updateScrollCue);
            window.removeEventListener("resize", updateScrollCue);
        };
    }, [navItems.length, isOpen]);

    const openAddon = (port: number) => {
        const { protocol, hostname } = window.location;
        window.open(`${protocol}//${hostname}:${port}`, "_blank", "noopener,noreferrer");
    };

    return (
        <aside className={cn(`
      fixed inset-y-0 left-0 z-[500] w-[300px] border-r border-white/10 bg-[rgba(8,17,26,0.92)] backdrop-blur-[20px]
      flex flex-col transform transition-transform duration-300 ease-in-out
      lg:relative lg:translate-x-0
    `, isOpen ? "translate-x-0" : "-translate-x-full")}>

            {/* Sidebar Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#3ce58a,#1f8f63)] shadow-[0_16px_30px_rgba(60,229,138,0.25)]">
                        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M7 5.5L18 12L7 18.5V5.5Z" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="font-heading text-[1.15rem] font-bold tracking-[-0.03em] text-white">
                        MH<span className="text-[#3ce58a]">Metadata</span>
                    </div>
                </div>
                <button onClick={onClose} className="rounded-xl p-2 text-[#3ce58a] hover:bg-white/5 lg:hidden">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Navigation */}
            <div className="relative min-h-0 flex-1">
                <nav ref={navRef} className="h-full overflow-y-auto px-4 py-3 pb-12">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(`
              mb-1.5 flex w-full items-center gap-3 rounded-[14px] border border-transparent px-3.5 py-2.5 text-left text-[0.95rem] transition-all
            `, currentPage === item.id
                                ? 'bg-[#3ce58a] font-semibold text-[#08111a]'
                                : 'text-[#99a8bc] hover:bg-white/5 hover:text-white')}
                        >
                            <span className={cn(`material-symbols-outlined`,
                                currentPage === item.id ? 'text-[#08111a]' : 'text-[#3ce58a]'
                            )}>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                {showScrollCue && (
                    <div className="pointer-events-none absolute inset-x-4 bottom-2 flex flex-col items-center gap-1 rounded-[14px] bg-[linear-gradient(180deg,rgba(8,17,26,0),rgba(8,17,26,0.96)_55%)] pb-1 pt-8">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#99a8bc]/70">Scroll</span>
                        <span className="material-symbols-outlined text-[#3ce58a]">keyboard_arrow_down</span>
                    </div>
                )}
            </div>

            {/* Footer Links */}
            <div className="border-t border-white/10 px-5 pb-3 pt-4">
                <div className="mb-3 grid gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#99a8bc]">
                        Other Addons
                    </p>
                    <Button
                        variant="outline"
                        className="h-10 w-full justify-start rounded-[16px] border-white/10 bg-transparent px-3.5 text-sm font-bold text-[#f4f7fb] hover:bg-white/5 hover:text-white"
                        onClick={() => openAddon(3000)}
                    >
                        <span className="material-symbols-outlined text-[20px] text-[#3ce58a]">open_in_new</span>
                        MHStreams
                    </Button>
                    <Button
                        variant="outline"
                        className="h-10 w-full justify-start rounded-[16px] border-white/10 bg-transparent px-3.5 text-sm font-bold text-[#f4f7fb] hover:bg-white/5 hover:text-white"
                        onClick={() => openAddon(7000)}
                    >
                        <span className="material-symbols-outlined text-[20px] text-[#3ce58a]">open_in_new</span>
                        MHTV
                    </Button>
                </div>

                <button
                    onClick={() => {
                        window.open("https://buymeacoffee.com/cedya", "_blank");
                    }}
                    className="flex h-10 w-full items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-[14px] bg-[#3ce58a] px-3.5 text-sm font-semibold text-[#08111a] shadow-[0_16px_30px_rgba(60,229,138,0.25)] transition-colors hover:bg-[#5ae78f]"
                >
                    <span className="material-symbols-outlined text-xl shrink-0">favorite</span>
                    <span className="font-bold">Donate to AIOMetadata Dev</span>
                </button>
            </div>

            {/* Login / Logout */}
            <div className="px-5 pb-5">
                {isLoggedIn ? (
                    <button
                        onClick={onLogoutClick}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-transparent text-sm font-semibold text-[#99a8bc] transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <span className="material-symbols-outlined text-xl shrink-0">logout</span>
                        <span className="text-sm truncate">Sign Out</span>
                    </button>
                ) : (
                    <button
                        onClick={onLoginClick}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-transparent text-sm font-semibold text-[#99a8bc] transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <span className="material-symbols-outlined text-xl shrink-0">login</span>
                        <span className="text-sm truncate">Sign In</span>
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
