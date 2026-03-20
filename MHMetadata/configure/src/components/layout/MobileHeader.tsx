
import React from 'react';
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
    onToggle: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onToggle }) => {
    return (
        <header className="sticky left-0 right-0 top-0 z-[300] flex h-16 items-center justify-between border-b border-white/10 bg-[rgba(8,17,26,0.92)] px-5 backdrop-blur-[20px] lg:hidden">
            <div className="flex items-center gap-2">
                <div className="font-heading text-lg font-bold text-white">
                    MH<span className="text-[#39E079]">Metadata</span>
                </div>
            </div>
            <button
                onClick={onToggle}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#39E079] hover:bg-white/5"
            >
                <span className="material-symbols-outlined">menu</span>
            </button>
        </header>
    );
};

export default MobileHeader;
