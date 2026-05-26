import { useState } from "react";
import { useApp } from "../context/AppContext";
import Logo from "./Logo";

const links = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Pricing", path: "/pricing" },
  { label: "Security", path: "/security" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const { route, navigate, user, logout, loading } = useApp();
  const [open, setOpen] = useState(false);

  const go = (p: string) => {
    setOpen(false);
    navigate(p);
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="glass-strong border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
          <button onClick={() => go("/")} className="flex items-center">
            <Logo />
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => {
              const active = route === l.path;
              return (
                <button
                  key={l.path}
                  onClick={() => go(l.path)}
                  className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                    active ? "text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {l.label}
                  {active && (
                    <span className="absolute -bottom-0.5 left-3 right-3 h-px bg-gradient-to-r from-violet-400 via-cyan-300 to-transparent" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {loading ? (
              // During auth restoration, show a minimal state.
              <div className="h-9 w-9 rounded-full bg-white/10 animate-pulse" />
            ) : user ? (
              <>
                <button
                  onClick={() => go("/dashboard")}
                  className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white hover:bg-white/10"
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white"
                >
                  Sign out
                </button>
                <div className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => go("/auth?mode=login")}
                  className="rounded-lg border border-white/10 px-3.5 py-2 text-sm text-slate-200 hover:bg-white/5"
                >
                  Sign in
                </button>
                <button
                  onClick={() => go("/auth?mode=signup")}
                  className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold text-white"
                >
                  Get Started →
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((s) => !s)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 lg:hidden"
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>

        {open && (
          <div className="border-t border-white/5 px-5 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <button
                  key={l.path}
                  onClick={() => go(l.path)}
                  className={`rounded-lg px-3 py-2 text-left text-sm ${
                    route === l.path ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </button>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {loading ? (
                  <div className="h-9 rounded-lg bg-white/10 animate-pulse" />
                ) : user ? (
                  <>
                    <button onClick={() => go("/dashboard")} className="rounded-lg border border-white/10 px-3 py-2 text-sm">Dashboard</button>
                    <button onClick={logout} className="rounded-lg bg-white/5 px-3 py-2 text-sm">Sign out</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => go("/auth?mode=login")} className="rounded-lg border border-white/10 px-3 py-2 text-sm">Sign in</button>
                    <button onClick={() => go("/auth?mode=signup")} className="btn-primary rounded-lg px-3 py-2 text-sm font-semibold">Get Started</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
