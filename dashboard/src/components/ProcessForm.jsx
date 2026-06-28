import { useState } from 'react';
import { Plus, Trash2, Play, Zap, Shuffle } from 'lucide-react';

const DEFAULT_PROCESSES = [
  { pid: 0, name: 'Alpha',   arrival_time: 0, burst_time: 10, priority: 3, deadline: 20, tickets: 30 },
  { pid: 1, name: 'Beta',    arrival_time: 2, burst_time:  6, priority: 1, deadline: 15, tickets: 10 },
  { pid: 2, name: 'Gamma',   arrival_time: 4, burst_time:  2, priority: 2, deadline: 10, tickets: 20 },
  { pid: 3, name: 'Delta',   arrival_time: 6, burst_time:  4, priority: 0, deadline: 12, tickets: 50 },
  { pid: 4, name: 'Epsilon', arrival_time: 8, burst_time:  8, priority: 2, deadline: 25, tickets: 10 },
];

const ALGORITHMS = ['FCFS', 'SJF', 'SRTF', 'Priority', 'RR', 'MLQ', 'MLFQ', 'Lottery', 'EDF'];

export default function ProcessForm({ onRun, onArena, onGenerate, loading }) {
  const [processes, setProcesses] = useState(DEFAULT_PROCESSES);
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [quantum, setQuantum]     = useState(4);
  const [ctxCost, setCtxCost]     = useState(0.5);
  const [genType, setGenType]     = useState('random');
  const [genN, setGenN]           = useState(8);

  const update = (idx, field, val) =>
    setProcesses(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));

  const addRow = () =>
    setProcesses(prev => [
      ...prev,
      { pid: prev.length, name: `P${prev.length}`, arrival_time: 0, burst_time: 5, priority: 0, deadline: 50, tickets: 10 }
    ]);

  const removeRow = idx =>
    setProcesses(prev => prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, pid: i })));

  const handleGenerate = async () => {
    const procs = await onGenerate(genType, genN);
    if (procs) setProcesses(procs);
  };

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        Process Configuration
      </h2>

      {/* Generator Bar */}
      <div className="flex flex-wrap gap-3 mb-5 p-4 rounded-xl bg-[#0d0d1a] border border-[#2a2a3d]">
        <select value={genType} onChange={e => setGenType(e.target.value)} className="flex-1 min-w-[130px]">
          <option value="random">Random Mixed</option>
          <option value="convoy">Convoy Maker</option>
          <option value="starvation">Starvation Trap</option>
          <option value="cpu_bound">CPU-Bound</option>
          <option value="io_bound">IO-Bound</option>
        </select>
        <input type="number" value={genN} min={2} max={20}
          onChange={e => setGenN(+e.target.value)} style={{ width: 72 }} placeholder="n" />
        <button className="btn-ghost flex items-center gap-2" onClick={handleGenerate} disabled={loading}>
          <Shuffle size={14} /> Generate
        </button>
      </div>

      {/* Process Table */}
      <div className="overflow-x-auto mb-4 rounded-xl border border-[#2a2a3d]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a3d] text-slate-400 text-xs uppercase tracking-wide">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Arrival</th>
              <th className="py-3 px-4 text-left">Burst</th>
              <th className="py-3 px-4 text-left">Priority</th>
              <th className="py-3 px-4 text-left">Deadline</th>
              <th className="py-3 px-4 text-left">Tickets</th>
              <th className="py-3 px-2" />
            </tr>
          </thead>
          <tbody>
            {processes.map((p, i) => (
              <tr key={i} className="border-b border-[#1a1a28] hover:bg-[#12121a] transition-colors">
                <td className="py-2 px-4">
                  <input type="text" value={p.name} onChange={e => update(i, 'name', e.target.value)}
                    style={{ width: '100%', fontFamily: 'JetBrains Mono, monospace' }} />
                </td>
                <td className="py-2 px-4">
                  <input type="number" value={p.arrival_time} min={0} step={0.5}
                    onChange={e => update(i, 'arrival_time', +e.target.value)} style={{ width: 72 }} />
                </td>
                <td className="py-2 px-4">
                  <input type="number" value={p.burst_time} min={0.5} step={0.5}
                    onChange={e => update(i, 'burst_time', +e.target.value)} style={{ width: 72 }} />
                </td>
                <td className="py-2 px-4">
                  <input type="number" value={p.priority} min={0} max={20}
                    onChange={e => update(i, 'priority', +e.target.value)} style={{ width: 72 }} />
                </td>
                <td className="py-2 px-4">
                  <input type="number" value={p.deadline ?? 100} min={1}
                    onChange={e => update(i, 'deadline', +e.target.value)} style={{ width: 72 }} />
                </td>
                <td className="py-2 px-4">
                  <input type="number" value={p.tickets ?? 10} min={1}
                    onChange={e => update(i, 'tickets', +e.target.value)} style={{ width: 72 }} />
                </td>
                <td className="py-2 px-2">
                  <button className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    onClick={() => removeRow(i)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn-ghost flex items-center gap-2 mb-5 text-xs" onClick={addRow}>
        <Plus size={14} /> Add Process
      </button>

      {/* Config Row */}
      <div className="flex flex-wrap gap-4 mb-5 p-4 rounded-xl bg-[#0d0d1a] border border-[#2a2a3d]">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">Algorithm</label>
          <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
            {ALGORITHMS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        {algorithm === 'RR' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Quantum (q)</label>
            <input type="number" value={quantum} min={1} max={100} step={1}
              onChange={e => setQuantum(+e.target.value)} style={{ width: 80 }} />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">Ctx Switch Cost</label>
          <input type="number" value={ctxCost} min={0} max={5} step={0.1}
            onChange={e => setCtxCost(+e.target.value)} style={{ width: 80 }} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button className="btn-primary flex items-center gap-2"
          onClick={() => onRun(processes, algorithm, quantum, ctxCost)} disabled={loading}>
          {loading ? <span className="spinner scale-75" /> : <Play size={16} />}
          Run Simulation
        </button>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border transition-all"
          style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', color: 'white', border: 'none' }}
          onClick={() => onArena(processes, quantum, ctxCost)} disabled={loading}>
          <Zap size={16} /> Arena Mode
        </button>
      </div>
    </div>
  );
}
