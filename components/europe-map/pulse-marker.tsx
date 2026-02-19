"use client";

/** Pulsing dot marker with a label underneath */
export function PulseMarker({ name }: { name: string }) {
    return (
        <div className="relative flex items-center justify-center w-8 h-8">
            <div className="eu-pulse-ring eu-pulse-ring-1 absolute w-1.5 h-1.5 rounded-full border border-emerald-500/50" />
            <div className="eu-pulse-ring eu-pulse-ring-2 absolute w-1.5 h-1.5 rounded-full border border-emerald-500/50" />
            <div className="eu-pulse-ring eu-pulse-ring-3 absolute w-1.5 h-1.5 rounded-full border border-emerald-500/50" />
            <div className="eu-dot absolute w-1.5 h-1.5 rounded-full bg-emerald-500 z-[3]" />
            <span className="eu-label absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono font-medium text-white/50 tracking-wider uppercase pointer-events-none">
                {name}
            </span>
        </div>
    );
}
