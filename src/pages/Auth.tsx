import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";

export default function Auth() {
  const { route, login, signup, navigate, user, loading } = useApp();
  const initialMode = route.includes("signup") ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If a user is already authenticated (e.g. session restored via refresh),
  // redirect to dashboard immediately.
  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (mode === "signup" && !agree) {
      setErr("Please agree to the Terms & Privacy Policy.");
      return;
    }

    setSubmitting(true);
    try {
      const result = mode === "login"
        ? await login(email, password)
        : await signup(name, email, password);

      if (!result.ok) {
        setErr(result.error || (mode === "login" ? "Login failed" : "Sign up failed"));
      }
      // On success the context already navigated to /dashboard.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fadein mx-auto flex min-h-[80vh] max-w-7xl items-center px-5 py-16 lg:px-8">
      <div className="grid w-full gap-10 lg:grid-cols-2">
        {/* Left brand */}
        <div className="hidden lg:block">
          <div className="text-xs uppercase tracking-[0.3em] text-violet-300">Welcome</div>
          <h1 className="mt-3 text-5xl font-bold tracking-tight text-white">{mode === "login" ? "Sign in to Neuro Core." : "Create your Neuro Core account."}</h1>
          <p className="mt-4 max-w-md text-slate-300">Access foundation models, agents, vision, voice and analytics — all behind one secure key.</p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {[
              "Free Starter tier — 100K tokens / month forever",
              "Bank-grade security · SOC 2 · GDPR · HIPAA",
              "Switch plans anytime · cancel in one click",
            ].map((x) => (
              <li key={x} className="flex gap-2"><span className="text-emerald-400">✓</span>{x}</li>
            ))}
          </ul>
          <div className="mt-10 glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-widest text-slate-400">Pro tip</div>
            <p className="mt-1 text-sm text-slate-200">Use a unique password and enable MFA from your dashboard the moment you sign in.</p>
          </div>
        </div>

        {/* Right form */}
        <div className="glass relative mx-auto w-full max-w-md rounded-3xl p-7">
          <div className="mb-6 inline-flex w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-1 text-sm">
            <button onClick={() => setMode("login")} className={`flex-1 rounded-lg px-3 py-2 ${mode === "login" ? "bg-white/10 text-white" : "text-slate-400"}`}>Sign in</button>
            <button onClick={() => setMode("signup")} className={`flex-1 rounded-lg px-3 py-2 ${mode === "signup" ? "bg-white/10 text-white" : "text-slate-400"}`}>Create account</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <Field label="Full name">
                <input value={name} onChange={(e) => setName(e.target.value)} className="ainput" placeholder="Ada Lovelace" autoComplete="name" required />
              </Field>
            )}
            <Field label="Email">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="ainput" placeholder="you@company.com" autoComplete="email" required />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  type={show ? "text" : "password"} className="ainput pr-12"
                  placeholder={mode === "signup" ? "Min 8 chars · 1 number · 1 uppercase" : "Your password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-slate-400 hover:text-white">
                  {show ? "Hide" : "Show"}
                </button>
              </div>
              {mode === "signup" && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0,1,2,3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded ${i < strength ? ["bg-rose-500","bg-amber-400","bg-cyan-400","bg-emerald-400"][strength-1] : "bg-white/10"}`} />
                    ))}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    Strength: {["Very weak","Weak","Okay","Good","Strong"][strength]}
                  </div>
                </div>
              )}
            </Field>

            {mode === "signup" && (
              <label className="flex items-start gap-2 text-xs text-slate-400">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-violet-500" />
                I agree to the <span className="text-violet-300 cursor-pointer hover:underline">Terms</span> and <span className="text-violet-300 cursor-pointer hover:underline">Privacy Policy</span>.
              </label>
            )}

            {err && <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{err}</div>}

            <button disabled={submitting} className="btn-primary w-full rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-60">
              {submitting
                ? (mode === "login" ? "Signing in…" : "Creating account…")
                : (mode === "login" ? "Sign in →" : "Create account →")
              }
            </button>

            <div className="relative my-3 text-center text-xs text-slate-500">
              <span className="bg-[#0a0e1a] px-2 relative z-10">or continue with</span>
              <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-white/10" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["Google","GitHub","SSO"].map((p) => (
                <button key={p} type="button" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-200 hover:bg-white/10">{p}</button>
              ))}
            </div>

            <p className="mt-1 text-center text-[11px] text-slate-500">🔒 Encrypted in transit · zero password leaks · MFA available</p>
          </form>
        </div>
      </div>
      <style>{`
        .ainput { width:100%; background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.1); border-radius:.6rem; padding:.7rem .85rem; color:#e6e9f2; font-size:.9rem; outline:none; transition:border-color 200ms; }
        .ainput:focus { border-color: rgba(167,139,250,0.55); }
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
