
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
    const openAddon = (port: number) => {
        const { protocol, hostname } = window.location;
        window.open(`${protocol}//${hostname}:${port}`, "_blank", "noopener,noreferrer");
    };

    return (
        <aside className={cn(`
      fixed inset-y-0 left-0 z-[500] w-[290px] bg-[#101923] border-r border-[#283039]
      flex flex-col transform transition-transform duration-300 ease-in-out
      lg:relative lg:translate-x-0
    `, isOpen ? "translate-x-0" : "-translate-x-full")}>

            {/* Sidebar Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center shrink-0">
                        <img src="/logo.webp" alt="Logo" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(57,224,121,0.5)]" />
                    </div>
                    <div className="font-heading font-bold text-xl tracking-tight text-white">
                        MH<span className="text-[#39E079]">Metadata</span>
                    </div>
                </div>
                <button onClick={onClose} className="lg:hidden text-[#39E079] p-2">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6 flex flex-col gap-2 overflow-y-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={cn(`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left
            `, currentPage === item.id
                            ? 'bg-[#39E079] text-black font-semibold'
                            : 'text-white hover:bg-white/5 hover:text-white')}
                    >
                        <span className={cn(`material-symbols-outlined`,
                            currentPage === item.id ? 'text-black' : 'text-[#39E079]'
                        )}>
                            {item.icon}
                        </span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Buy Me a Coffee */}
            <div className="px-6 pb-4">
                <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#B0C4DE]">
                        Other Addons
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5"
                            onClick={() => openAddon(3000)}
                        >
                            MHStreams
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5"
                            onClick={() => openAddon(7000)}
                        >
                            MHTV
                        </Button>
                    </div>
                </div>

                <button
                    onClick={() => {
                        window.open("https://buymeacoffee.com/cedya", "_blank");
                    }}
                    className="w-full h-12 rounded-xl flex items-center justify-center gap-2 bg-[#39E079] text-black font-semibold hover:bg-[#39E079]/90 transition-colors shadow-lg overflow-hidden whitespace-nowrap p-2"
                >
                    <span className="material-symbols-outlined text-xl shrink-0">favorite</span>
                    <span className="text-[13.5px] font-bold">Donate to AIOMetadata Dev</span>
                </button>
            </div>

            {/* Login / Logout */}
            <div className="px-6 pb-6">
                {isLoggedIn ? (
                    <button
                        onClick={onLogoutClick}
                        className="w-full h-12 rounded-xl flex items-center justify-center gap-2 bg-white/5 text-white font-semibold hover:bg-white/10 border border-white/10 transition-colors shadow-lg"
                    >
                        <span className="material-symbols-outlined text-xl shrink-0">logout</span>
                        <span className="text-sm truncate">Sign Out</span>
                    </button>
                ) : (
                    <button
                        onClick={onLoginClick}
                        className="w-full h-12 rounded-xl flex items-center justify-center gap-2 bg-white/5 text-white font-semibold hover:bg-white/10 border border-white/10 transition-colors shadow-lg"
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
