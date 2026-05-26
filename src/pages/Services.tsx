import { useState } from "react";
import { useApp } from "../context/AppContext";

const services = [
  {
    id: "llm",
    name: "Foundation Models",
    tag: "LLM · Multi-modal",
    color: "from-violet-500 to-indigo-500",
    icon: "🧠",
    blurb: "Frontier large language models with up to 1M token context, vision input, function calling and tool use.",
    features: ["1M context window", "Vision + text input", "Function calling", "JSON mode & schemas", "Streaming + batch"],
    metric: "142ms p95",
  },
  {
    id: "vision",
    name: "Computer Vision",
    tag: "Detection · OCR · Video",
    color: "from-cyan-500 to-blue-500",
    icon: "👁",
    blurb: "Production-ready vision: detection, classification, segmentation, OCR, and real-time video analytics.",
    features: ["Object detection (YOLO‑X)", "Semantic segmentation", "Document OCR + tables", "Face / pose estimation", "Edge deployable"],
    metric: "60 FPS",
  },
  {
    id: "voice",
    name: "Voice Intelligence",
    tag: "STT · TTS · Cloning",
    color: "from-emerald-500 to-teal-500",
    icon: "🎙",
    blurb: "Real-time speech-to-text, expressive TTS in 40+ languages, and ethical voice cloning with consent gating.",
    features: ["Real-time STT", "Neural TTS · 40 languages", "Voice cloning with consent", "Speaker diarization", "Emotion detection"],
    metric: "180ms RT",
  },
  {
    id: "agents",
    name: "Autonomous Agents",
    tag: "Planning · Tools · Memory",
    color: "from-fuchsia-500 to-purple-500",
    icon: "🤖",
    blurb: "Goal-directed agents with safe tool execution, persistent memory, and human-in-the-loop guardrails.",
    features: ["Multi-step planning", "Tool sandboxing", "Persistent memory", "HITL approvals", "Cost & action ceilings"],
    metric: "97% task success",
  },
  {
    id: "vector",
    name: "Vector Search",
    tag: "RAG · Embeddings",
    color: "from-amber-500 to-orange-500",
    icon: "🧬",
    blurb: "Hybrid semantic + keyword retrieval over billions of vectors with built-in chunking and reranking.",
    features: ["Hybrid BM25 + ANN", "Auto chunking", "Reranking", "Metadata filters", "Real-time ingest"],
    metric: "<50ms ANN",
  },
  {
    id: "analytics",
    name: "Predictive Analytics",
    tag: "Forecasting · Anomaly",
    color: "from-rose-500 to-pink-500",
    icon: "📈",
    blurb: "Time-series forecasting, anomaly detection and AutoML on your warehouse — no MLOps required.",
    features: ["Forecasting (Prophet++)", "Anomaly detection", "Tabular AutoML", "Causal inference", "Warehouse-native"],
    metric: "AutoML",
  },
];

export default function Services() {
  const { navigate } = useApp();
  const [active, setActive] = useState(services[0].id);
  const cur = services.find((s) => s.id === active)!;

  return (
    <div className="animate-fadein mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="max-w-3xl">
        <div className="text-xs uppercase tracking-[0.3em] text-violet-300">AI Services</div>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-white">A complete AI stack — modular, observable, secure.</h1>
        <p className="mt-4 text-slate-300">Pick a service or compose them. Every endpoint shares the same auth, billing, observability and safety layer.</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`glass card-hover group relative overflow-hidden rounded-2xl p-6 text-left ${
              active === s.id ? "ring-2 ring-violet-400/50" : ""
            }`}
          >
            <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${s.color} opacity-25 blur-2xl`} />
            <div className="relative flex items-start justify-between">
              <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${s.color} text-2xl text-white shadow-lg`}>{s.icon}</div>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-300">{s.tag}</span>
            </div>
            <h3 className="relative mt-4 text-lg font-semibold text-white">{s.name}</h3>
            <p className="relative mt-1.5 text-sm text-slate-400">{s.blurb}</p>
            <div className="relative mt-4 flex items-center justify-between text-xs text-slate-400">
              <span className="text-emerald-300/80">● {s.metric}</span>
              <span className="text-violet-300 group-hover:translate-x-0.5 transition">View details →</span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail viewer */}
      <div className="glass mt-10 grid gap-8 rounded-3xl p-8 lg:grid-cols-2">
        <div>
          <div className={`inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${cur.color} text-3xl text-white shadow-lg`}>{cur.icon}</div>
          <h2 className="mt-4 text-3xl font-bold text-white">{cur.name}</h2>
          <p className="mt-2 text-slate-300">{cur.blurb}</p>
          <ul className="mt-5 grid grid-cols-1 gap-2 text-sm text-slate-200 sm:grid-cols-2">
            {cur.features.map((f) => (
              <li key={f} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 13 4 4L19 7" /></svg>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => navigate("/auth?mode=signup")} className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold">Try free</button>
            <button onClick={() => navigate("/pricing")} className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">Pricing</button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-1">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 text-xs text-slate-400">
            <span className="rounded bg-white/10 px-2 py-0.5">cURL</span>
            <span>POST /v1/{cur.id}</span>
            <span className="ml-auto text-emerald-400">200 OK</span>
          </div>
          <pre className="overflow-x-auto p-5 text-[12.5px] leading-relaxed text-slate-200">
{`curl https://api.neurocore.ai/v1/${cur.id} \\
  -H "Authorization: Bearer $NC_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "core-4-${cur.id}",
    "input": "Hello, Neuro Core!",
    "stream": true
  }'

# response (SSE)
data: { "delta": "Hello", "tokens": 1 }
data: { "delta": ", world", "tokens": 2 }
data: { "done": true, "latency_ms": 142 }`}
          </pre>
        </div>
      </div>

      {/* Integrations */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-white">Integrates with your stack</h3>
        <p className="mt-2 text-slate-400">Native SDKs and one-line connectors for the tools your team already uses.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {["Python","TypeScript","Go","Rust","Postgres","Snowflake","Databricks","Slack","Salesforce","Notion","GitHub","AWS"].map((x) => (
            <div key={x} className="glass card-hover rounded-xl px-4 py-3 text-center text-sm text-slate-200">{x}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
