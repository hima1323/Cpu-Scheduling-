import { useState } from 'react'
import { useSimulation } from './hooks/useSimulation'
import ProcessForm from './components/ProcessForm'
import GanttChart from './components/GanttChart'
import StatsPanel from './components/StatsPanel'
import ArenaView from './components/ArenaView'
import QuantumAnalyzer from './components/QuantumAnalyzer'
import { Cpu, Zap, BarChart3, Globe, Code2, ExternalLink } from 'lucide-react'

const TABS = [
  { id: 'simulate', label: 'Simulate',         icon: Cpu },
  { id: 'arena',    label: 'Arena',             icon: Zap },
  { id: 'quantum',  label: 'Quantum Analyzer',  icon: BarChart3 },
]

/* ──────────────── Aurora Background ──────────────── */
function AuroraBackground() {
  return (
    <>
      <div className="aurora-bg">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
        <div className="aurora-orb aurora-orb-4" />
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
      <div className="noise-overlay" />
    </>
  )
}

/* ──────────────── Header / Navigation ──────────────── */
function Header({ activeTab, setActiveTab }) {
  return (
    <header className="glass sticky top-0 z-50" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #27272a, #18181b)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Cpu size={17} className="text-zinc-300" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none tracking-tight">SchedSim</h1>
            <p className="text-zinc-600 text-[10px] mt-0.5 tracking-wide uppercase">CPU Scheduling Suite</p>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id}
                className={`nav-link flex items-center gap-2 ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}>
                <Icon size={14} /> {t.label}
              </button>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Removed Engine Live pill */}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex gap-1 px-4 pb-3">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id}
              className={`tab-btn flex-1 flex items-center justify-center gap-2 text-xs ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}>
              <Icon size={12} /> {t.label}
            </button>
          )
        })}
      </div>
    </header>
  )
}

/* ──────────────── Footer ──────────────── */
function Footer() {
  return (
    <footer className="footer relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <span>© 2025 SchedSim</span>
          <a href="#">Support</a>
          <a href="#">Docs</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://github.com/hima1323/Cpu-Scheduling-" target="_blank" rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors">
            <Code2 size={15} />
          </a>
          <a href="#" className="hover:text-zinc-300 transition-colors">
            <Globe size={15} />
          </a>
          <a href="#" className="hover:text-zinc-300 transition-colors">
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </footer>
  )
}

/* ──────────────── App ──────────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState('simulate')
  const { loading, error, result, arenaResults, sweepData, run, arena, generate, sweep } = useSimulation()

  return (
    <div className="min-h-screen relative" style={{ background: '#050505' }}>
      <AuroraBackground />
      <div className="relative z-10">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="max-w-7xl mx-auto px-6 py-8">

          {/* Hero */}
          <div className="mb-8 animate-fade-in">
            <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">
              Visualize and benchmark CPU scheduling algorithms in real-time. Compare FCFS, SJF, SRTF, Priority, and Round Robin on identical workloads.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-5 py-3.5 rounded-xl text-sm animate-slide-up"
              style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#fca5a5' }}>
              ⚠️ {error} — Make sure the C++ engine is running on port 8080
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl mb-4 animate-fade-in"
              style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <span className="spinner" />
              <span className="text-sm">Running simulation engine...</span>
            </div>
          )}

          {/* ── SIMULATE TAB ── */}
          {activeTab === 'simulate' && (
            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
              <ProcessForm
                onRun={run}
                onArena={(p, q, c) => { setActiveTab('arena'); arena(p, q, c) }}
                onGenerate={generate}
                loading={loading}
              />
              <div className="space-y-4">
                {result ? (
                  <div className="glass rounded-2xl p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }} />
                        Gantt Chart
                      </h2>
                      <span className="text-zinc-500 text-sm font-mono">
                        Algorithm: <b className="text-white">{result.algorithm}</b>
                      </span>
                    </div>
                    <GanttChart result={result} />
                    <StatsPanel result={result} />

                    {/* Per-process table */}
                    <div className="mt-6 overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.03)' }}>
                      <table className="theme-table">
                        <thead>
                          <tr>
                            <th className="text-left">Process</th>
                            <th className="text-right">Arrival</th>
                            <th className="text-right">Burst</th>
                            <th className="text-right">Finish</th>
                            <th className="text-right">Wait</th>
                            <th className="text-right">TAT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.processes?.map(p => (
                            <tr key={p.pid}>
                              <td className="font-medium text-white">{p.name}</td>
                              <td className="text-right font-mono">{p.arrival_time}</td>
                              <td className="text-right font-mono">{p.burst_time}</td>
                              <td className="text-right font-mono">{p.finish_time?.toFixed(2)}</td>
                              <td className="text-right font-mono" style={{ color: '#f59e0b' }}>
                                {p.waiting_time?.toFixed(2)}
                              </td>
                              <td className="text-right font-mono" style={{ color: '#22d3ee' }}>
                                {p.turnaround_time?.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="glass rounded-2xl p-14 flex flex-col items-center justify-center gap-5 text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-float"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Cpu size={28} className="text-zinc-400" />
                  </div>
                    <h3 className="text-white font-semibold text-lg">Ready to Simulate</h3>
                    <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
                      Configure your processes on the left and hit <b className="text-white">Run Simulation</b> to see the Gantt chart and metrics.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ARENA TAB ── */}
          {activeTab === 'arena' && (
            <div className="space-y-6">
              {!arenaResults && !loading && (
                <div className="glass rounded-2xl p-14 flex flex-col items-center justify-center gap-5 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-float"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Zap size={28} className="text-zinc-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg">Arena Mode</h3>
                  <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
                    Go to the <b className="text-white">Simulate</b> tab, configure processes, then click <b className="text-white">Arena Mode</b> to compare all algorithms side-by-side.
                  </p>
                </div>
              )}
              {arenaResults && <ArenaView results={arenaResults} />}
            </div>
          )}

          {/* ── QUANTUM ANALYZER TAB ── */}
          {activeTab === 'quantum' && (
            <QuantumAnalyzer onSweep={sweep} sweepData={sweepData} loading={loading} />
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}
