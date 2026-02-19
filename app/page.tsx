import { EuropeMap } from "@/components/europe-map";

export default function Home() {
  return (
    <main className="bg-[#0a0a0a]">
      <EuropeMap apiUrl="/api/events">
        <span className="inline-block text-xs font-mono font-medium tracking-[0.15em] uppercase text-emerald-500 mb-5">
          Lorem ipsum
        </span>
        <h2 className="text-[clamp(32px,4vw,56px)] font-bold leading-[1.1] text-white mb-6">
          Dolor sit amet
          <br />
          <span className="text-emerald-500">consectetur</span>
        </h2>
        <p className="text-base leading-relaxed text-white/50 max-w-md mb-10 max-md:mx-auto">
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
          enim ad minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
        <div className="w-12 h-px bg-emerald-500/30 mb-10 max-md:mx-auto" />
        <div className="flex gap-10 max-md:justify-center">
          <div>
            <div className="text-[28px] font-bold text-emerald-400 font-mono">
              20+
            </div>
            <div className="text-xs text-white/40 uppercase tracking-wide mt-1">
              Lorem
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-emerald-400 font-mono">
              50+
            </div>
            <div className="text-xs text-white/40 uppercase tracking-wide mt-1">
              Ipsum
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-emerald-400 font-mono">
              24/7
            </div>
            <div className="text-xs text-white/40 uppercase tracking-wide mt-1">
              Dolor
            </div>
          </div>
        </div>
      </EuropeMap>
    </main>
  );
}
