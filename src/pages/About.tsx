export default function About() {
  const team = [
    { n: "Dr. Aanya Rao", r: "CEO & Co-founder", b: "Ex-Google Brain · Stanford AI" },
    { n: "Marcus Chen", r: "CTO & Co-founder", b: "Ex-OpenAI infra · MIT CSAIL" },
    { n: "Priya Natarajan", r: "VP Engineering", b: "Ex-Stripe · CMU" },
    { n: "Liam O'Connor", r: "Head of Security", b: "Ex-Cloudflare · OWASP" },
  ];

  const milestones = [
    ["2022", "Neuro Core founded in San Francisco"],
    ["2023", "Series A · $42M led by Sequoia"],
    ["2024", "Launch of foundation model platform"],
    ["2025", "10K+ enterprise customers · global expansion"],
    ["2026", "Multi-modal Reasoning Engine v4 launched"],
  ];

  return (
    <div className="animate-fadein mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="max-w-3xl">
        <div className="text-xs uppercase tracking-[0.3em] text-violet-300">About Neuro Core</div>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-white">We're building the operating system for intelligent software.</h1>
        <p className="mt-5 text-lg text-slate-300">
          Founded in 2022, Neuro Core started as a small team of researchers and engineers who believed AI infrastructure should be as reliable as a database — and as easy to use as a REST API.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {[
          { t: "Mission", d: "Make state-of-the-art AI safe, accessible, and economically transformative for every business." },
          { t: "Vision", d: "A world where any developer can deploy intelligence as easily as they deploy a website." },
          { t: "Values", d: "Customer obsession · Security first · Bias for action · Long-term thinking." },
        ].map((x) => (
          <div key={x.t} className="glass card-hover rounded-2xl p-6">
            <div className="text-xs uppercase tracking-[0.25em] text-violet-300">{x.t}</div>
            <p className="mt-3 text-slate-200">{x.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold text-white">Leadership</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((p) => (
            <div key={p.n} className="glass card-hover rounded-2xl p-5">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 text-2xl font-bold text-white shadow-lg">
                {p.n.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
              <div className="mt-4 text-base font-semibold text-white">{p.n}</div>
              <div className="text-sm text-violet-300">{p.r}</div>
              <div className="mt-1 text-xs text-slate-400">{p.b}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 glass rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white">Milestones</h2>
        <ol className="relative mt-6 border-l border-white/10 pl-6">
          {milestones.map(([y, t], i) => (
            <li key={i} className="mb-6">
              <div className="absolute -left-[7px] grid h-3 w-3 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-400" />
              <div className="text-sm text-violet-300">{y}</div>
              <div className="text-base text-white">{t}</div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
