export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 glow-ring" />
        <svg viewBox="0 0 32 32" className="absolute inset-0 m-auto" width={size * 0.7} height={size * 0.7} fill="none" stroke="white" strokeWidth="1.6">
          <circle cx="16" cy="16" r="3" fill="white" />
          <circle cx="6" cy="8" r="2" />
          <circle cx="26" cy="8" r="2" />
          <circle cx="6" cy="24" r="2" />
          <circle cx="26" cy="24" r="2" />
          <path d="M8 9 L14 15 M24 9 L18 15 M8 23 L14 17 M24 23 L18 17" />
        </svg>
      </div>
      <div className="leading-none">
        <div className="text-[15px] font-semibold tracking-wide text-white">NEURO<span className="text-gradient"> CORE</span></div>
        <div className="text-[9px] tracking-[0.25em] text-slate-400 uppercase">Intelligence Platform</div>
      </div>
    </div>
  );
}
