
import React from 'react';
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
    onToggle: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onToggle }) => {
    return (
        <header className="lg:hidden sticky top-0 left-0 right-0 h-16 px-5 flex items-center justify-between bg-[#101923]/95 backdrop-blur-xl border-b border-[#283039] z-[300]">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center shrink-0">
                    <img src="/logo.webp" alt="Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(57,224,121,0.5)]" />
                </div>
                <div className="font-heading font-bold text-lg text-white">
                    MH<span className="text-[#39E079]">Metadata</span>
                </div>
            </div>
            <button
                onClick={onToggle}
                className="w-10 h-10 flex items-center justify-center text-[#39E079] rounded-xl hover:bg-white/5"
            >
                <span className="material-symbols-outlined">menu</span>
            </button>
        </header>
    );
};

export default MobileHeader;
