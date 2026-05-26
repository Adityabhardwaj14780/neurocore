import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "", topic: "Sales" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!form.name.trim()) return setErr("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setErr("Enter a valid email.");
    if (form.message.trim().length < 10) return setErr("Tell us a bit more (10+ chars).");
    // Persist locally (no real backend)
    const all = JSON.parse(localStorage.getItem("nc_messages") || "[]");
    all.push({ ...form, ts: Date.now() });
    localStorage.setItem("nc_messages", JSON.stringify(all));
    setSent(true);
  };

  return (
    <div className="animate-fadein mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-300">Contact</div>
          <h1 className="mt-3 text-5xl font-bold tracking-tight text-white">Let's talk.</h1>
          <p className="mt-4 max-w-md text-slate-300">
            Whether you need a custom deployment, security review or just want to chat AI — we usually reply within 4 business hours.
          </p>

          <div className="mt-8 space-y-4">
            {[
              { i: "📧", t: "sales@neurocore.ai", s: "Sales inquiries" },
              { i: "🛟", t: "support@neurocore.ai", s: "Technical support" },
              { i: "🛡", t: "security@neurocore.ai", s: "Security disclosures" },
              { i: "🏢", t: "548 Market St, San Francisco, CA", s: "Headquarters" },
            ].map((c) => (
              <div key={c.t} className="glass flex items-center gap-4 rounded-xl p-4">
                <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/5 text-xl">{c.i}</div>
                <div>
                  <div className="text-sm text-slate-400">{c.s}</div>
                  <div className="text-white">{c.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-8">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-400 text-3xl">✓</div>
              <h3 className="mt-5 text-2xl font-bold text-white">Message received</h3>
              <p className="mt-2 max-w-sm text-slate-300">Thanks {form.name.split(" ")[0]} — our team will get back to you at <span className="text-cyan-300">{form.email}</span> shortly.</p>
              <button onClick={() => { setSent(false); setForm({ name: "", email: "", company: "", message: "", topic: "Sales" }); }} className="mt-6 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm">Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h3 className="text-xl font-bold text-white">Send us a message</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Ada Lovelace" />
                </Field>
                <Field label="Work email">
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="ada@company.com" />
                </Field>
                <Field label="Company">
                  <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" placeholder="Optional" />
                </Field>
                <Field label="Topic">
                  <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="input">
                    {["Sales", "Support", "Security", "Partnerships", "Press"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="How can we help?">
                <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input resize-none" placeholder="Tell us about your project…" />
              </Field>
              {err && <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{err}</div>}
              <button className="btn-primary w-full rounded-xl px-5 py-3 text-sm font-semibold">Send message →</button>
              <p className="text-center text-xs text-slate-500">By submitting you agree to our privacy policy. Encrypted in transit · zero spam.</p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.6rem;
          padding: 0.65rem 0.85rem;
          color: #e6e9f2;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 200ms;
        }
        .input:focus { border-color: rgba(167,139,250,0.5); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs uppercase tracking-widest text-slate-400">{label}</div>
      {children}
    </label>
  );
}
