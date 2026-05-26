export default function Security() {
  const pillars = [
    { t: "Zero-Trust Networking", d: "Mutual TLS between every service. No implicit trust, ever — even inside our VPC.", i: "🛡" },
    { t: "Customer-Managed Keys", d: "Bring your own KMS key. We can't decrypt your data without your active grant.", i: "🗝" },
    { t: "Tenant Isolation", d: "Strict per-tenant database, cache and inference isolation. No noisy-neighbor risk.", i: "🧱" },
    { t: "Zero Retention", d: "By default, your inputs and outputs are not stored, logged, or used for training.", i: "🚫" },
    { t: "Continuous Auditing", d: "Every API call is signed and recorded with tamper-evident audit logs.", i: "📜" },
    { t: "Adversarial Testing", d: "Internal red-team plus public bug bounty up to $50,000 per critical finding.", i: "🎯" },
  ];

  const certs = [
    { name: "SOC 2 Type II", desc: "Annually audited" },
    { name: "ISO 27001 / 27017", desc: "Information security" },
    { name: "HIPAA", desc: "BAAs available" },
    { name: "GDPR / CCPA", desc: "Privacy compliant" },
    { name: "PCI DSS L1", desc: "Payment grade" },
    { name: "FedRAMP Moderate", desc: "In progress" },
  ];

  return (
    <div className="animate-fadein mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-300">Security & Compliance</div>
          <h1 className="mt-3 text-5xl font-bold tracking-tight text-white">Trust, by architecture.</h1>
          <p className="mt-4 max-w-xl text-slate-300">
            Neuro Core is engineered to the standards of the world's most regulated industries — finance, healthcare, defense and government.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Download whitepaper ↓</a>
            <a href="#" className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20">Trust portal →</a>
          </div>
        </div>
        <div className="glass relative overflow-hidden rounded-3xl p-6">
          <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500/20 via-transparent to-cyan-500/20" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-2xl">🔒</div>
              <div>
                <div className="text-sm text-slate-400">Live security posture</div>
                <div className="text-xl font-semibold text-white">All controls passing</div>
              </div>
              <span className="ml-auto rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">● 100% / 248</span>
            </div>
            <div className="mt-5 space-y-2.5">
              {[
                ["TLS 1.3 enforced", 100],
                ["Encryption at rest (AES-256)", 100],
                ["MFA enforcement", 100],
                ["SSO / SAML coverage", 98],
                ["Vulnerability scan freshness", 100],
                ["Audit log integrity", 100],
              ].map(([label, val]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>{label}</span><span className="text-emerald-300">{val}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.t} className="glass card-hover rounded-2xl p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-xl">{p.i}</div>
            <h3 className="mt-4 text-lg font-semibold text-white">{p.t}</h3>
            <p className="mt-2 text-sm text-slate-400">{p.d}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-12 rounded-3xl p-8">
        <h3 className="text-xl font-bold text-white">Certifications & frameworks</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((c) => (
            <div key={c.name} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 text-emerald-300">✓</div>
              <div>
                <div className="text-sm font-semibold text-white">{c.name}</div>
                <div className="text-xs text-slate-400">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
