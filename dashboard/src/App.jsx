import { useState } from 'react'
import { useSimulation } from './hooks/useSimulation'
import ProcessForm from './components/ProcessForm'
import GanttChart from './components/GanttChart'
import StatsPanel from './components/StatsPanel'
import ArenaView from './components/ArenaView'
import QuantumAnalyzer from './components/QuantumAnalyzer'
import { Cpu, Zap, BarChart3, Settings } from 'lucide-react'

const TABS = [
  { id: 'simulate', label: 'Simulate',    icon: Cpu },
  { id: 'arena',    label: 'Arena',       icon: Zap },
  { id: 'quantum',  label: 'Quantum Analyzer', icon: BarChart3 },
]

function Header() {
  return (
    <header className="border-b border-[#2a2a3d] glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center glow-accent"
            style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
            <Cpu size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">SchedSim</h1>
            <p className="text-slate-500 text-xs mt-0.5">CPU Scheduling Benchmarking Suite</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: '#0d1a0d', border: '1px solid #166534', color: '#4ade80' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Engine Live
          </div>
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('simulate')
  const { loading, error, result, arenaResults, sweepData, run, arena, generate, sweep } = useSimulation()

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #0f0f2e 0%, #0a0a0f 50%)' }}>
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Hero */}
        <div className="mb-8 animate-fade-in">
          <p className="text-slate-400 text-sm max-w-xl">
            Visualize and benchmark CPU scheduling algorithms in real-time. Compare FCFS, SJF, SRTF, Priority, and Round Robin on identical workloads.
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-[#12121a] border border-[#2a2a3d] w-fit">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id}
                className={`tab-btn flex items-center gap-2 ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}>
                <Icon size={14} /> {t.label}
              </button>
            )
          })}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm animate-slide-up"
            style={{ background: '#2d0a0a', border: '1px solid #7f1d1d', color: '#fca5a5' }}>
            ⚠️ {error} — Make sure the C++ engine is running on port 8080
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 animate-fade-in"
            style={{ background: '#0a0a2d', border: '1px solid #1e1b4b', color: '#818cf8' }}>
            <span className="spinner" />
            <span className="text-sm">Running simulation engine...</span>
          </div>
        )}

        {/* ── SIMULATE TAB ── */}
        {activeTab === 'simulate' && (
          <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6">
            <ProcessForm
              onRun={run}
              onArena={(p, q, c) => { setActiveTab('arena'); arena(p, q, c) }}
              onGenerate={generate}
              loading={loading}
            />
            <div className="space-y-4">
              {result ? (
                <div className="glass rounded-2xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: '#22d3ee' }} />
                      Gantt Chart
                    </h2>
                    <span className="text-slate-400 text-sm font-mono">
                      Algorithm: <b className="text-white">{result.algorithm}</b>
                    </span>
                  </div>
                  <GanttChart result={result} />
                  <StatsPanel result={result} />

                  {/* Per-process table */}
                  <div className="mt-6 overflow-x-auto rounded-xl border border-[#2a2a3d]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#2a2a3d] text-slate-400 text-xs uppercase tracking-wide">
                          <th className="py-3 px-4 text-left">Process</th>
                          <th className="py-3 px-4 text-right">Arrival</th>
                          <th className="py-3 px-4 text-right">Burst</th>
                          <th className="py-3 px-4 text-right">Finish</th>
                          <th className="py-3 px-4 text-right">Wait</th>
                          <th className="py-3 px-4 text-right">TAT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.processes?.map(p => (
                          <tr key={p.pid} className="border-b border-[#1a1a28] hover:bg-[#12121a] transition-colors">
                            <td className="py-3 px-4 font-medium text-white">{p.name}</td>
                            <td className="py-3 px-4 text-right font-mono text-slate-300">{p.arrival_time}</td>
                            <td className="py-3 px-4 text-right font-mono text-slate-300">{p.burst_time}</td>
                            <td className="py-3 px-4 text-right font-mono text-slate-300">{p.finish_time?.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-mono" style={{ color: '#f59e0b' }}>
                              {p.waiting_time?.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono" style={{ color: '#22d3ee' }}>
                              {p.turnaround_time?.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <Cpu size={28} style={{ color: '#6366f1' }} />
                  </div>
                  <h3 className="text-white font-semibold text-lg">Ready to Simulate</h3>
                  <p className="text-slate-400 text-sm max-w-xs">
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
              <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)' }}>
                  <Zap size={28} style={{ color: '#ec4899' }} />
                </div>
                <h3 className="text-white font-semibold text-lg">Arena Mode</h3>
                <p className="text-slate-400 text-sm max-w-xs">
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
    </div>
  )
}
