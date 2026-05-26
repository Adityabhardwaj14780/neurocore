import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";

type Plan = {
  id: "Free" | "Pro" | "Enterprise";
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  highlight?: boolean;
  features: string[];
  cta: string;
};

const plans: Plan[] = [
  {
    id: "Free",
    name: "Starter",
    tagline: "Explore the platform.",
    monthly: 0, yearly: 0,
    features: ["100K tokens / month", "Access to core‑4‑mini", "Community support", "Basic dashboard", "1 project"],
    cta: "Start free",
  },
  {
    id: "Pro",
    name: "Pro",
    tagline: "Build & ship to production.",
    monthly: 49, yearly: 39,
    highlight: true,
    features: ["10M tokens / month included", "All foundation models", "Vision · Voice · Vector", "99.95% SLA", "Email support · 24h", "Up to 25 projects"],
    cta: "Upgrade to Pro",
  },
  {
    id: "Enterprise",
    name: "Enterprise",
    tagline: "Scale with confidence.",
    monthly: 0, yearly: 0,
    features: ["Custom volume pricing", "Private deployments / VPC", "Customer-managed keys", "99.99% SLA · 24/7 support", "SOC2 / HIPAA / FedRAMP", "Dedicated solutions team"],
    cta: "Contact sales",
  },
];

export default function Pricing() {
  const { user, setPlan, navigate } = useApp();
  const [yearly, setYearly] = useState(true);
  const [tokens, setTokens] = useState(2_500_000);

  const proCost = useMemo(() => {
    const base = yearly ? 39 : 49;
    const overage = Math.max(0, tokens - 10_000_000) * 0.0000015;
    return (base + overage).toFixed(2);
  }, [yearly, tokens]);

  const choose = (p: Plan) => {
    if (!user) { navigate("/auth?mode=signup"); return; }
    if (p.id === "Enterprise") { navigate("/contact"); return; }
    setPlan(p.id);
    navigate("/dashboard");
  };

  return (
    <div className="animate-fadein mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-violet-300">Pricing</div>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-white">Simple, predictable. Scale with you.</h1>
        <p className="mt-4 text-slate-300">Pay only for what you use. Free tier forever. Cancel anytime.</p>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="glass inline-flex items-center gap-1 rounded-full p-1 text-sm">
          <button onClick={() => setYearly(false)} className={`rounded-full px-4 py-1.5 ${!yearly ? "bg-white/10 text-white" : "text-slate-400"}`}>Monthly</button>
          <button onClick={() => setYearly(true)} className={`rounded-full px-4 py-1.5 ${yearly ? "bg-white/10 text-white" : "text-slate-400"}`}>
            Yearly <span className="ml-1 text-emerald-300">−20%</span>
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = user?.plan === p.id;
          const price = p.id === "Enterprise" ? "Custom" : p.id === "Free" ? "$0" : `$${yearly ? p.yearly : p.monthly}`;
          return (
            <div
              key={p.id}
              className={`glass relative overflow-hidden rounded-3xl p-7 ${p.highlight ? "ring-2 ring-violet-400/50" : ""}`}
            >
              {p.highlight && (
                <div className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  Most popular
                </div>
              )}
              <div className="text-sm font-semibold text-violet-300">{p.name}</div>
              <div className="mt-1 text-slate-400 text-sm">{p.tagline}</div>
              <div className="mt-5 flex items-baseline gap-1">
                <div className="text-5xl font-bold text-white">{price}</div>
                {p.id === "Pro" && <div className="text-sm text-slate-400">/ mo</div>}
              </div>
              {p.id === "Pro" && yearly && <div className="mt-1 text-xs text-emerald-300">billed annually · save $120</div>}

              <ul className="mt-6 space-y-2.5 text-sm text-slate-200">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 13 4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => choose(p)}
                disabled={isCurrent}
                className={`mt-7 w-full rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  isCurrent
                    ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 cursor-default"
                    : p.highlight
                    ? "btn-primary text-white"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {isCurrent ? "✓ Current plan" : p.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Calculator */}
      <div className="glass mt-14 rounded-3xl p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold text-white">Usage calculator</h3>
            <p className="mt-2 text-slate-400">Estimate your monthly bill on the Pro plan based on tokens consumed.</p>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Tokens / month</span>
                <span className="font-mono text-white">{tokens.toLocaleString()}</span>
              </div>
              <input
                type="range" min={100000} max={50000000} step={100000}
                value={tokens} onChange={(e) => setTokens(Number(e.target.value))}
                className="mt-3 w-full accent-violet-500"
              />
              <div className="mt-1 flex justify-between text-[11px] text-slate-500"><span>100K</span><span>50M</span></div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-6">
            <div className="text-xs uppercase tracking-widest text-slate-400">Estimated monthly</div>
            <div className="mt-2 text-5xl font-bold text-white">${proCost}</div>
            <div className="mt-1 text-sm text-slate-400">{yearly ? "billed annually" : "billed monthly"}</div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                <div className="text-slate-400 text-xs">Included</div>
                <div className="text-white">10,000,000 tok</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-black/20 p-3">
                <div className="text-slate-400 text-xs">Overage</div>
                <div className="text-white">$1.50 / 1M tok</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-white">Frequently asked</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Do you offer a free tier?", "Yes — Starter is free forever and includes 100K tokens / month with full platform access."],
            ["Can I switch plans?", "Anytime. Upgrades are prorated, downgrades take effect at the next billing cycle."],
            ["Where is my data stored?", "In the region you select (US, EU, APAC). Encrypted at rest with per-tenant KMS keys."],
            ["Do you train on my data?", "Never. Zero retention by default. Inputs and outputs are not used to train models."],
          ].map(([q, a]) => (
            <details key={q} className="glass group rounded-2xl p-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-white flex items-center justify-between">
                {q}
                <span className="text-violet-300 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-300">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
