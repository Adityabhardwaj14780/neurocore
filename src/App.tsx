import { AppProvider, useApp } from './context/AppContext';
import Background from './components/Background';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import Security from './pages/Security';
import About from './pages/About';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function NotFound() {
  const { navigate } = useApp();
  return (
    <div className="animate-fadein mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl font-black shimmer-text">404</div>
      <h1 className="mt-3 text-3xl font-bold text-white">This neuron isn&apos;t connected.</h1>
      <p className="mt-2 text-slate-400">The page you were looking for doesn&apos;t exist or has been moved.</p>
      <button onClick={() => navigate('/')} className="btn-primary mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold">Back to home</button>
    </div>
  );
}

function Router() {
  const { route, loading } = useApp();
  const path = route.split('?')[0];

  // Show a minimal loading screen while auth is being initialized.
  // This prevents flicker: the user sees a spinner for ~200ms instead of
  // briefly seeing an unauthenticated state before the refresh kicks in.
  if (loading) {
    return (
      <div className="animate-fadein mx-auto flex min-h-[80vh] items-center justify-center px-5">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 animate-spin-slow">
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="white" strokeWidth="2">
              <circle cx="16" cy="16" r="3" fill="white" />
              <circle cx="6" cy="8" r="2" />
              <circle cx="26" cy="8" r="2" />
              <circle cx="6" cy="24" r="2" />
              <circle cx="26" cy="24" r="2" />
            </svg>
          </div>
          <div className="text-sm text-slate-400">Restoring session…</div>
        </div>
      </div>
    );
  }

  let page;
  switch (path) {
    case '/': page = <Home />; break;
    case '/services': page = <Services />; break;
    case '/pricing': page = <Pricing />; break;
    case '/security': page = <Security />; break;
    case '/about': page = <About />; break;
    case '/contact': page = <Contact />; break;
    case '/auth': page = <Auth />; break;
    case '/dashboard': page = <Dashboard />; break;
    default: page = <NotFound />;
  }
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{page}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Background />
      <Router />
    </AppProvider>
  );
}
