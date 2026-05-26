import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

const rotating = ["Generative AI.", "Computer Vision.", "Voice Intelligence.", "Autonomous Agents.", "Predictive Analytics."];

export default function Home() {
  const { navigate } = useApp();
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [demoIn, setDemoIn] = useState("Summarize Q3 revenue trends in 3 bullets.");
  const [demoOut, setDemoOut] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const target = rotating[idx];
    let i = 0;
    setTyped("");
    const t = setInterval(() => {
      i++;
      setTyped(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(t);
        setTimeout(() => setIdx((p) => (p + 1) % rotating.length), 1800);
      }
    }, 55);
    return () => clearInterval(t);
  }, [idx]);

  const runDemo = () => {
    setRunning(true);
    setDemoOut("");
    const lines = [
      "• Q3 revenue grew 28% YoY, driven by enterprise plan upgrades.",
      "• North America contributed 62% of net-new ARR; APAC accelerated 41%.",
      "• Gross margin expanded to 81% due to lower inference compute costs.",
    ];
    let line = 0, char = 0;
    const t = setInterval(() => {
      if (line >= lines.length) { clearInterval(t); setRunning(false); return; }
      char++;
      const built = lines.slice(0, line).join("\n") + (line === 0 ? "" : "\n") + lines[line].slice(0, char);
      setDemoOut(built);
      if (char >= lines[line].length) { line++; char = 0; }
    }, 18);
  };

  return (
    <div className="animate-fadein">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-5 pt-16 pb-24 lg:px-8 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse-glow" />
              v4.0 — Multi-modal Reasoning Engine is live
            </div>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Enterprise AI for <br />
              <span className="shimmer-text">{typed}</span>
              <span className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-1 bg-cyan-300 animate-blink" />
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300/90">
              One platform for every AI workload — from foundation models to production agents. Deploy in minutes with zero-trust security, observability, and predictable billing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate("/auth?mode=signup")} className="btn-primary rounded-xl px-6 py-3 text-sm font-semibold text-white">
                Start free — no card required
              </button>
              <button onClick={() => navigate("/services")} className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Explore Services →
              </button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-slate-400">
              {["SOC 2 Type II", "ISO 27001", "HIPAA", "GDPR", "99.99% SLA"].map((b) => (
                <div key={b} className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 13 4 4L19 7" /></svg>
                  {b}
                </div>
              ))}
            </div>
          </div>

          {/* Demo panel */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-violet-500/30 via-cyan-500/20 to-fuchsia-500/30 blur-2xl" />
            <div className="glass relative rounded-2xl p-1 shadow-2xl">
              <div className="rounded-2xl bg-[#0a0e1a]">
                <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  <div className="ml-3 text-xs text-slate-400">neuro-core › playground</div>
                  <div className="ml-auto rounded-md border border-white/10 px-2 py-0.5 text-[10px] text-slate-300">core-4-turbo</div>
                </div>
                <div className="space-y-3 p-5">
                  <label className="block text-xs uppercase tracking-widest text-slate-500">Prompt</label>
                  <textarea
                    value={demoIn}
                    onChange={(e) => setDemoIn(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-slate-100 outline-none focus:border-violet-400/50"
                  />
                  <button
                    onClick={runDemo}
                    disabled={running}
                    className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {running ? "Generating…" : "Run inference"}
                    <span className="text-xs opacity-80">⌘ ↵</span>
                  </button>
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-emerald-200/90 min-h-[140px] whitespace-pre-wrap">
                    {demoOut || <span className="text-slate-500">Output will stream here…</span>}
                    {running && <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-emerald-300 animate-blink" />}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Latency: 142ms · 312 tokens</span>
                    <span className="text-emerald-300/80">● Encrypted · zero-retention</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo strip */}
      <section className="border-y border-white/5 bg-white/[0.015] py-8">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center text-xs uppercase tracking-[0.3em] text-slate-500">Trusted by 4,200+ teams worldwide</div>
          <div className="mt-6 grid grid-cols-3 items-center gap-6 opacity-70 sm:grid-cols-6">
            {["NEXARA", "QUANTUM", "VERTEX", "STELLAR", "NIMBUS", "ORBIT"].map((b) => (
              <div key={b} className="text-center text-base font-semibold tracking-[0.25em] text-slate-300/80">{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <div className="text-xs uppercase tracking-[0.3em] text-violet-300">Capabilities</div>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">Every AI primitive, one platform.</h2>
          <p className="mt-3 text-slate-400">Compose models, vision, speech, embeddings, and autonomous agents into production workflows in minutes — not quarters.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Foundation Models", d: "Frontier LLMs with 1M context, multi-modal inputs and tool-use.", i: "🧠", c: "from-violet-500/30 to-indigo-500/10" },
            { t: "Vision & OCR", d: "Detect, segment, classify and extract structured data from any image or video.", i: "👁", c: "from-cyan-500/30 to-blue-500/10" },
            { t: "Voice & Speech", d: "Real-time STT, TTS and voice cloning with sub-200ms latency.", i: "🎙", c: "from-emerald-500/30 to-teal-500/10" },
            { t: "Autonomous Agents", d: "Goal-directed agents with memory, planning and safe tool execution.", i: "🤖", c: "from-fuchsia-500/30 to-purple-500/10" },
            { t: "Vector Search", d: "Sub-50ms semantic retrieval over billions of embeddings.", i: "🧬", c: "from-amber-500/30 to-orange-500/10" },
            { t: "Predictive Analytics", d: "Forecasting, anomaly detection and tabular ML on your warehouse.", i: "📈", c: "from-rose-500/30 to-pink-500/10" },
          ].map((f) => (
            <div key={f.t} className={`glass card-hover relative overflow-hidden rounded-2xl p-6`}>
              <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${f.c} blur-2xl`} />
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-xl">{f.i}</div>
                <h3 className="mt-4 text-lg font-semibold text-white">{f.t}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="glass rounded-3xl p-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              ["99.99%", "Uptime SLA"],
              ["142 ms", "p95 latency"],
              ["4.2K+", "Customers"],
              ["28 PB", "Indexed daily"],
            ].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="text-3xl font-bold text-white sm:text-4xl shimmer-text">{n}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-slate-400">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture diagram */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-300">Architecture</div>
            <h2 className="mt-3 text-4xl font-bold text-white">Built for scale, designed for trust.</h2>
            <p className="mt-3 text-slate-400">Zero-trust networking, customer-managed keys, isolated tenants and full audit trails — by default.</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {[
                "End-to-end AES-256 encryption in transit and at rest",
                "Per-tenant KMS with bring-your-own-key support",
                "PII detection and automated redaction pipelines",
                "Role-based access, SSO/SAML, SCIM provisioning",
              ].map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass relative overflow-hidden rounded-2xl p-6">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="relative grid grid-cols-3 gap-3 text-center text-xs">
              {["Edge CDN", "API Gateway", "WAF / DDoS", "Auth & Tokens", "Inference Mesh", "Vector DB", "Observability", "KMS Vault", "Audit Log"].map((b, i) => (
                <div key={b} className={`rounded-xl border border-white/10 bg-white/[0.04] p-4 ${i === 4 ? "ring-2 ring-violet-400/40" : ""}`}>
                  <div className="text-base">{["🌐","🛡","🚧","🔐","🧠","🧬","📡","🗝","📜"][i]}</div>
                  <div className="mt-2 text-slate-300">{b}</div>
                </div>
              ))}
            </div>
            <div className="relative mt-5 flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
              <span>● Health: nominal across 12 regions</span>
              <span className="font-mono">142ms / 99.998%</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="glass relative overflow-hidden rounded-3xl p-12 text-center">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-4xl font-bold text-white sm:text-5xl">Ship intelligent products this week.</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">Join thousands of teams building on Neuro Core. Free tier includes 100K tokens and full platform access.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate("/auth?mode=signup")} className="btn-primary rounded-xl px-6 py-3 text-sm font-semibold">Create account</button>
              <button onClick={() => navigate("/pricing")} className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold hover:bg-white/10">View pricing</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
