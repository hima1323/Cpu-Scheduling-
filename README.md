# SchedSim — CPU Scheduling Benchmarking Suite

A full-stack CPU scheduling simulator: a **C++ discrete-event engine** + **React + Tailwind CSS** visual dashboard.

---

## Quick Start

```bash
# One-command launch (builds engine + starts both services)
./start.sh
```

- **Dashboard** → http://localhost:5173
- **Engine API** → http://localhost:8080

---

## Architecture

```
job schedler/
├── engine/               # C++ simulation engine
│   ├── src/
│   │   ├── pcb.h         # Process Control Block
│   │   ├── event.h       # Event types & priority queue
│   │   ├── scheduler.h   # Abstract scheduler interface
│   │   ├── fcfs.h        # First-Come, First-Served
│   │   ├── sjf.h         # SJF (non-preemptive) + SRTF (preemptive)
│   │   ├── priority.h    # Priority with anti-starvation aging
│   │   ├── rr.h          # Round Robin (configurable quantum)
│   │   ├── engine.h/.cpp # Discrete-event simulation loop
│   │   ├── generators.h  # Adversarial workload generators
│   │   └── main.cpp      # HTTP server (cpp-httplib) + entry point
│   ├── vendor/
│   │   ├── json.hpp      # nlohmann/json
│   │   └── httplib.h     # cpp-httplib
│   └── CMakeLists.txt
│
├── dashboard/            # React + Tailwind CSS dashboard
│   └── src/
│       ├── App.jsx       # Main app with tabs
│       ├── components/
│       │   ├── GanttChart.jsx      # Animated Gantt chart
│       │   ├── StatsPanel.jsx      # KPI metric cards
│       │   ├── ProcessForm.jsx     # Process table + controls
│       │   ├── ArenaView.jsx       # Side-by-side comparison
│       │   └── QuantumAnalyzer.jsx # RR quantum sweep chart
│       ├── hooks/useSimulation.js  # API state management hook
│       └── utils/
│           ├── api.js    # Engine API client
│           └── colors.js # Process color palette
│
└── start.sh              # One-command launcher
```

---

## Features by Phase

### Phase 1–2 — C++ Engine
- Discrete-event simulation with a `std::priority_queue` min-heap clock
- **FCFS**, **SJF**, **SRTF** (preemptive), **Priority** (with aging), **Round Robin**
- Configurable **context switch cost** (advances global clock on each CPU handoff)
- Priority **aging** every 5 time units to prevent starvation
- JSON export via `nlohmann/json`

### Phase 3 — Dashboard
- Dark glassmorphism UI with animated components
- **Gantt Chart**: colored process blocks, context-switch striped gaps, hover tooltips, time axis
- **Stats Panel**: Avg Wait, Avg Turnaround, CPU Utilization, Context Switches, Total Time
- Per-process breakdown table

### Phase 4 — Live Networking + Arena Mode
- `POST /run` — run any single algorithm
- `POST /arena` — run all 5 algorithms simultaneously, returns array
- **Arena View**: stacked Gantt charts + comparison table with winner (★) highlighted
- Vite proxy transparently forwards API calls to engine

### Phase 5 — Generators + Quantum Analyzer
- **Workload Generators** (`GET /generate?type=...`):
  - `convoy` — one 40-unit burst + many 2-unit bursts (Convoy Effect demo)
  - `starvation` — high-priority arrivals starving a low-priority process
  - `cpu_bound` — large burst distribution (15–40 units)
  - `io_bound` — small burst distribution (1–6 units)
  - `random` — mixed random workload
- **Quantum Sweep** (`GET /sweep_quantum?type=...`) — sweeps q=1..50, returns metric array
- **Quantum Analyzer** tab with Recharts line chart + optimal quantum highlighted

---

## API Reference

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| GET | `/health` | — | Liveness check |
| POST | `/run` | `{processes, algorithm, quantum, context_switch_cost}` | Run one algorithm |
| POST | `/arena` | `{processes, quantum, context_switch_cost}` | Run all 5 algorithms |
| GET | `/generate` | `?type=convoy&n=8` | Generate workload |
| GET | `/sweep_quantum` | `?type=random&n=8` | Sweep RR quantum 1–50 |

### Process Object
```json
{
  "pid": 0,
  "name": "Alpha",
  "arrival_time": 0.0,
  "burst_time": 10.0,
  "priority": 3
}
```

### Algorithms
- `FCFS` — First-Come, First-Served
- `SJF` — Shortest Job First (non-preemptive)
- `SRTF` — Shortest Remaining Time First (preemptive)
- `Priority` — Priority scheduling with aging
- `RR` — Round Robin (uses `quantum` param)

---

## Building Manually

```bash
# Build C++ engine
cd engine
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel

# Run engine
./build/scheduler_engine

# Start dashboard (separate terminal)
cd dashboard
npm install
npm run dev
```

---

## Phase 6 (Stretch Goal — SMP)
Multi-core support is stubbed in `EngineConfig::num_cpus`. The `GanttChart` component supports `cpu_id` per Gantt entry and renders separate lanes per CPU. Full work-stealing implementation is the next step.
