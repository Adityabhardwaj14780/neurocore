export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0b1430_0%,#05060a_55%,#02030a_100%)]" />

      {/* Animated grid */}
      <div className="absolute inset-0 grid-bg opacity-60 animate-gridmove [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* Floating glows */}
      <div className="absolute -top-32 -left-24 h-[480px] w-[480px] rounded-full bg-violet-600/25 blur-3xl animate-float-slow" />
      <div className="absolute top-1/3 -right-32 h-[520px] w-[520px] rounded-full bg-cyan-500/20 blur-3xl animate-float-fast" />
      <div className="absolute bottom-0 left-1/4 h-[420px] w-[420px] rounded-full bg-fuchsia-600/15 blur-3xl animate-float-slow" />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}
