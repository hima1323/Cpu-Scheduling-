import { useState, useRef } from 'react';
import { processColor } from '../utils/colors';

const LANE_HEIGHT = 44;
const MIN_LABEL_WIDTH = 30; // px — don't render label if block is smaller

export default function GanttChart({ result, label, accentColor = '#6366f1', compact = false }) {
  const [tooltip, setTooltip] = useState(null);
  const containerRef = useRef(null);

  if (!result || !result.gantt || result.gantt.length === 0) return null;

  const totalTime = result.total_time || 1;
  const gantt     = result.gantt;

  // Determine unique CPU lanes (for SMP)
  const cpuIds = [...new Set(gantt.map(g => g.cpu_id ?? 0))].sort();

  const blockWidth = (start, end) => ((end - start) / totalTime) * 100;
  const blockLeft  = (start)      => (start / totalTime) * 100;

  return (
    <div className="animate-fade-in">
      {label && (
        <div className="flex items-center gap-3 mb-3">
          <span className="algo-tag text-white" style={{ background: accentColor }}>{label}</span>
          <div className="flex gap-4 text-xs text-slate-400">
            <span>Avg Wait: <b className="text-slate-200">{result.avg_waiting_time?.toFixed(2)}ms</b></span>
            <span>Avg TAT: <b className="text-slate-200">{result.avg_turnaround_time?.toFixed(2)}ms</b></span>
            <span>CPU: <b className="text-slate-200">{result.cpu_utilization?.toFixed(1)}%</b></span>
            <span>CTX: <b className="text-slate-200">{result.total_ctx_switches}</b></span>
          </div>
        </div>
      )}

      {cpuIds.map(cpuId => (
        <div key={cpuId} className="mb-1">
          {cpuIds.length > 1 && (
            <div className="text-xs text-slate-500 mb-1 font-mono">CPU {cpuId}</div>
          )}
          <div
            ref={containerRef}
            className="relative rounded-lg overflow-visible border border-[#2a2a3d]"
            style={{ height: LANE_HEIGHT, background: '#0d0d1a' }}
          >
            {gantt
              .filter(g => (g.cpu_id ?? 0) === cpuId)
              .map((g, i) => {
                const w    = blockWidth(g.start, g.end);
                const left = blockLeft(g.start);
                const color = g.is_context_switch ? '#1e293b' : processColor(g.pid);
                const tooSmall = w < 1.5;
                return (
                  <div
                    key={i}
                    className="gantt-block"
                    style={{
                      left:   `${left}%`,
                      width:  `${Math.max(w, 0.4)}%`,
                      background: g.is_context_switch
                        ? 'repeating-linear-gradient(45deg,#1e293b,#1e293b 4px,#0f172a 4px,#0f172a 8px)'
                        : color,
                      opacity: g.is_context_switch ? 0.7 : 1,
                      border: g.is_context_switch ? '1px solid #334155' : `1px solid ${color}88`,
                    }}
                    onMouseEnter={e => setTooltip({ g, x: e.currentTarget.getBoundingClientRect().left })}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {!tooSmall && !g.is_context_switch && (
                      <span
                        className="absolute inset-0 flex items-center justify-center text-white font-semibold"
                        style={{ fontSize: compact ? 9 : 11 }}
                      >
                        {g.name}
                      </span>
                    )}
                    {tooltip?.g === g && (
                      <div className="tooltip">
                        <div className="font-bold text-white mb-1">{g.is_context_switch ? 'Context Switch' : g.name}</div>
                        <div className="text-slate-300">Start: {g.start.toFixed(2)}</div>
                        <div className="text-slate-300">End: {g.end.toFixed(2)}</div>
                        <div className="text-slate-300">Duration: {(g.end - g.start).toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
          {/* Time axis */}
          <div className="relative h-5" style={{ fontSize: 10 }}>
            {[0, 0.25, 0.5, 0.75, 1].map(t => (
              <span
                key={t}
                className="absolute text-slate-500 font-mono"
                style={{ left: `${t * 100}%`, transform: 'translateX(-50%)' }}
              >
                {(t * totalTime).toFixed(0)}
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* Process Legend */}
      {!compact && result.processes && (
        <div className="flex flex-wrap gap-2 mt-2">
          {result.processes.map(p => (
            <div key={p.pid} className="flex items-center gap-1.5 text-xs text-slate-300">
              <div className="w-3 h-3 rounded-sm" style={{ background: processColor(p.pid) }} />
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
