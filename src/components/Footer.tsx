import Logo from "./Logo";
import { useApp } from "../context/AppContext";

export default function Footer() {
  const { navigate } = useApp();
  const groups = [
    {
      title: "Platform",
      items: [
        ["Services", "/services"],
        ["Pricing", "/pricing"],
        ["Security", "/security"],
        ["Dashboard", "/dashboard"],
      ],
    },
    {
      title: "Company",
      items: [
        ["About", "/about"],
        ["Contact", "/contact"],
        ["Careers", "/about"],
        ["Press", "/about"],
      ],
    },
    {
      title: "Resources",
      items: [
        ["Documentation", "/services"],
        ["API Reference", "/services"],
        ["Status", "/security"],
        ["Changelog", "/about"],
      ],
    },
  ];

  return (
    <footer className="relative mt-24 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              Neuro Core builds end-to-end AI infrastructure — models, agents, vision, voice, and analytics — with bank-grade security and zero-trust architecture.
            </p>
            <div className="mt-5 flex gap-3">
              {["X", "Gh", "Li", "Yt"].map((x) => (
                <a key={x} href="#" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-xs text-slate-300 hover:border-violet-400/40 hover:text-white">
                  {x}
                </a>
              ))}
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{g.title}</div>
              <ul className="space-y-2">
                {g.items.map(([label, path]) => (
                  <li key={label}>
                    <button onClick={() => navigate(path)} className="text-sm text-slate-300 hover:text-white">
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-slate-500 sm:flex-row">
          <div>© {new Date().getFullYear()} Neuro Core, Inc. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" /> All systems operational</span>
            <span>SOC 2 · ISO 27001 · HIPAA · GDPR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
