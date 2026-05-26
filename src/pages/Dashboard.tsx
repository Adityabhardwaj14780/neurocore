import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";

const limits: Record<string, number> = { Free: 100_000, Pro: 10_000_000, Enterprise: 500_000_000 };

export default function Dashboard() {
  const { user, navigate, setPlan, logout, loading } = useApp();
  const [tab, setTab] = useState<"overview" | "playground" | "keys" | "billing" | "settings">("overview");

  // The AppProvider already redirects unauthenticated users, but this guard
  // handles the brief window before the redirect fires.
  if (loading || !user) return null;

  return (
    <div className="animate-fadein mx-auto max-w-7xl px-5 py-10 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-violet-300">Dashboard</div>
          <h1 className="mt-2 text-3xl font-bold text-white">Welcome back, {user.name.split(" ")[0]} 👋</h1>
          <div className="mt-1 text-sm text-slate-400">{user.email} · Plan: <span className="text-white">{user.plan}</span></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/pricing")} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Manage plan</button>
          <button onClick={logout} className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/20">Sign out</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 text-sm">
        {(["overview","playground","keys","billing","settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3.5 py-2 capitalize ${tab === t ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && <Overview user={user} />}
        {tab === "playground" && <Playground />}
        {tab === "keys" && <Keys />}
        {tab === "billing" && <Billing user={user} setPlan={setPlan} />}
        {tab === "settings" && <Settings />}
      </div>
    </div>
  );
}

function Overview({ user }: { user: any }) {
  const used = useMemo(() => Math.floor(Math.random() * (limits[user.plan] * 0.7)), [user.plan]);
  const pct = (used / limits[user.plan]) * 100;
  const services = [
    { n: "Foundation Models", c: "from-violet-500 to-indigo-500", v: "1.2M calls" },
    { n: "Vision API", c: "from-cyan-500 to-blue-500", v: "84K calls" },
    { n: "Voice", c: "from-emerald-500 to-teal-500", v: "12K min" },
    { n: "Vector Search", c: "from-amber-500 to-orange-500", v: "320K queries" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-400">Tokens used (current cycle)</div>
              <div className="mt-1 text-3xl font-bold text-white">{used.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ {limits[user.plan].toLocaleString()}</span></div>
            </div>
            <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">● Healthy</div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-slate-500"><span>Resets in 14 days</span><span>{pct.toFixed(1)}% used</span></div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-xs uppercase tracking-widest text-slate-400">This month's spend</div>
          <div className="mt-1 text-3xl font-bold text-white">${user.plan === "Free" ? "0.00" : user.plan === "Pro" ? "39.00" : "—"}</div>
          <div className="mt-2 text-xs text-slate-400">Plan: <span className="text-white">{user.plan}</span></div>
          <div className="mt-3 h-px w-full bg-white/10" />
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-400">Next invoice</span>
            <span className="text-white">Dec 14, 2026</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <div key={s.n} className="glass card-hover rounded-2xl p-5">
            <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${s.c}`} />
            <div className="mt-3 text-sm text-slate-400">{s.n}</div>
            <div className="mt-1 text-xl font-semibold text-white">{s.v}</div>
            <div className="mt-2 text-xs text-emerald-300">▲ +12.4% vs last week</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold text-white">Activity</div>
          <span className="text-xs text-slate-400">Last 24 hours</span>
        </div>
        <div className="mt-4 grid grid-cols-24 items-end gap-1 h-32">
          {Array.from({ length: 24 }).map((_, i) => {
            const h = 20 + Math.floor(Math.random() * 80);
            return <div key={i} className="rounded-t bg-gradient-to-t from-violet-500/40 to-cyan-400/80" style={{ height: `${h}%` }} />;
          })}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-500"><span>00:00</span><span>12:00</span><span>23:59</span></div>
      </div>
    </div>
  );
}

function Playground() {
  const [prompt, setPrompt] = useState("Explain quantum entanglement to a 10-year-old.");
  const [model, setModel] = useState("core-4-turbo");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const run = () => {
    setLoading(true); setOut("");
    const responses: Record<string, string> = {
      "core-4-turbo": "Imagine two magic coins. When you flip one, the other instantly knows what came up — even if it's on the moon! That's entanglement: two particles that share a hidden link. ✨",
      "core-4-mini": "Two particles can be linked so that what happens to one affects the other instantly, no matter the distance.",
      "core-vision": "[Image input expected]",
    };
    const target = responses[model] || responses["core-4-turbo"];
    let i = 0;
    const t = setInterval(() => {
      i++; setOut(target.slice(0, i));
      if (i >= target.length) { clearInterval(t); setLoading(false); }
    }, 18);
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          <label className="text-xs uppercase tracking-widest text-slate-400">Prompt</label>
          <textarea rows={6} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-slate-100 outline-none focus:border-violet-400/50" />
          <div className="flex flex-wrap items-center gap-3">
            <select value={model} onChange={(e) => setModel(e.target.value)} className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm">
              <option>core-4-turbo</option><option>core-4-mini</option><option>core-vision</option>
            </select>
            <button onClick={run} disabled={loading} className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60">
              {loading ? "Generating…" : "Run"}
            </button>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-[13px] text-emerald-200/90 min-h-[180px] whitespace-pre-wrap">
          {out || <span className="text-slate-500">Output streams here…</span>}
          {loading && <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-emerald-300 animate-blink" />}
        </div>
      </div>
    </div>
  );
}

function Keys() {
  const [keys, setKeys] = useState<{ id: string; name: string; key: string; created: number }[]>(() => {
    try { return JSON.parse(localStorage.getItem("nc_keys") || "[]"); } catch { return []; }
  });
  const [newName, setNewName] = useState("");

  const save = (k: typeof keys) => { setKeys(k); localStorage.setItem("nc_keys", JSON.stringify(k)); };

  const create = () => {
    if (!newName.trim()) return;
    const k = "nc_sk_" + crypto.getRandomValues(new Uint32Array(4)).reduce((a, n) => a + n.toString(36), "");
    save([{ id: crypto.randomUUID(), name: newName, key: k, created: Date.now() }, ...keys]);
    setNewName("");
  };
  const revoke = (id: string) => save(keys.filter((x) => x.id !== id));

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-xs uppercase tracking-widest text-slate-400">New API key name</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm" placeholder="prod-backend" />
        </div>
        <button onClick={create} className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold">Generate key</button>
      </div>
      <div className="mt-6 space-y-2">
        {keys.length === 0 && <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">No keys yet. Generate one to get started.</div>}
        {keys.map((k) => (
          <div key={k.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
            <div>
              <div className="text-sm font-semibold text-white">{k.name}</div>
              <div className="font-mono text-xs text-slate-400">{k.key.slice(0, 12)}••••••••{k.key.slice(-4)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigator.clipboard?.writeText(k.key)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">Copy</button>
              <button onClick={() => revoke(k.id)} className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-500/20">Revoke</button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">🔒 Keys are stored client-side for this demo. In production, they live in our hardened KMS vault and are shown only once.</p>
    </div>
  );
}

function Billing({ user, setPlan }: { user: any; setPlan: (p: any) => void }) {
  const invoices = [
    ["INV-2026-011", "Nov 14, 2026", "$39.00", "Paid"],
    ["INV-2026-010", "Oct 14, 2026", "$39.00", "Paid"],
    ["INV-2026-009", "Sep 14, 2026", "$39.00", "Paid"],
  ];
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400">Current plan</div>
            <div className="mt-1 text-2xl font-bold text-white">{user.plan}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Free","Pro","Enterprise"] as const).map((p) => (
              <button key={p} onClick={() => setPlan(p)} className={`rounded-lg px-3.5 py-2 text-sm font-semibold ${user.plan === p ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}>
                {user.plan === p ? `✓ ${p}` : `Switch to ${p}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="mb-3 text-base font-semibold text-white">Payment method</div>
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-14 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold">VISA</div>
            <div>
              <div className="text-sm text-white">•••• •••• •••• 4242</div>
              <div className="text-xs text-slate-400">Expires 12/28</div>
            </div>
          </div>
          <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">Update</button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="mb-3 text-base font-semibold text-white">Invoices</div>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-widest text-slate-400">
              <tr><th className="px-4 py-2.5">Number</th><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Amount</th><th className="px-4 py-2.5">Status</th><th /></tr>
            </thead>
            <tbody>
              {invoices.map(([n,d,a,s]) => (
                <tr key={n} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white">{n}</td>
                  <td className="px-4 py-3 text-slate-300">{d}</td>
                  <td className="px-4 py-3 text-slate-300">{a}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs text-emerald-300">{s}</span></td>
                  <td className="px-4 py-3 text-right"><a className="text-xs text-violet-300 hover:underline" href="#">Download</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Settings() {
  const [mfa, setMfa] = useState(true);
  const [emails, setEmails] = useState(true);
  const [retain, setRetain] = useState(false);
  return (
    <div className="space-y-4">
      {[
        { t: "Two-factor authentication", d: "Require a second factor on every sign-in.", v: mfa, set: setMfa },
        { t: "Product emails", d: "Updates, security alerts and weekly usage digests.", v: emails, set: setEmails },
        { t: "Allow data retention", d: "Store inputs/outputs for 30 days for debugging (off by default).", v: retain, set: setRetain },
      ].map((row) => (
        <div key={row.t} className="glass flex items-center justify-between rounded-2xl p-5">
          <div>
            <div className="text-sm font-semibold text-white">{row.t}</div>
            <div className="text-xs text-slate-400">{row.d}</div>
          </div>
          <button onClick={() => row.set(!row.v)} className={`relative h-6 w-11 rounded-full transition ${row.v ? "bg-emerald-500/70" : "bg-white/10"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${row.v ? "left-5" : "left-0.5"}`} />
          </button>
        </div>
      ))}
      <div className="glass rounded-2xl p-5">
        <div className="text-sm font-semibold text-white">Danger zone</div>
        <p className="mt-1 text-xs text-slate-400">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-500/20">Delete account</button>
      </div>
    </div>
  );
}
