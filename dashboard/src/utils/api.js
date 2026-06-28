const BASE = 'http://localhost:8080';

export async function runAlgorithm(processes, algorithm, quantum = 4, ctx_cost = 0.5) {
  const res = await fetch(`${BASE}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ processes, algorithm, quantum, context_switch_cost: ctx_cost }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function runArena(processes, quantum = 4, ctx_cost = 0.5) {
  const res = await fetch(`${BASE}/arena`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ processes, quantum, context_switch_cost: ctx_cost }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generateWorkload(type, n = 8) {
  const res = await fetch(`${BASE}/generate?type=${type}&n=${n}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sweepQuantum(type = 'random', n = 8) {
  const res = await fetch(`${BASE}/sweep_quantum?type=${type}&n=${n}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchStaticResult() {
  const res = await fetch('/output.json');
  if (!res.ok) return null;
  return res.json();
}
