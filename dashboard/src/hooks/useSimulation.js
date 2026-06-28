import { useState, useCallback } from 'react';
import { runAlgorithm, runArena, generateWorkload, sweepQuantum } from '../utils/api';

export function useSimulation() {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [result, setResult]     = useState(null);
  const [arenaResults, setArena] = useState(null);
  const [sweepData, setSweep]   = useState(null);

  const run = useCallback(async (processes, algorithm, quantum, ctx_cost) => {
    setLoading(true); setError(null);
    try {
      const r = await runAlgorithm(processes, algorithm, quantum, ctx_cost);
      setResult(r); setArena(null); setSweep(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const arena = useCallback(async (processes, quantum, ctx_cost) => {
    setLoading(true); setError(null);
    try {
      const r = await runArena(processes, quantum, ctx_cost);
      setArena(r); setResult(null); setSweep(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const generate = useCallback(async (type, n) => {
    setLoading(true); setError(null);
    try { return await generateWorkload(type, n); }
    catch (e) { setError(e.message); return null; }
    finally { setLoading(false); }
  }, []);

  const sweep = useCallback(async (type, n) => {
    setLoading(true); setError(null);
    try {
      const r = await sweepQuantum(type, n);
      setSweep(r); setResult(null); setArena(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  return { loading, error, result, arenaResults, sweepData, run, arena, generate, sweep };
}
