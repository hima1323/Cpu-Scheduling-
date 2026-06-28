# SchedSim — CPU Scheduling Benchmarking Suite

A full-stack CPU scheduling simulator that pairs a high-performance **C++ discrete-event engine** with a beautiful **React + Tailwind CSS** visual dashboard. It allows you to simulate, benchmark, and visualize how different operating system scheduling algorithms behave under various workloads.

---

## 🚀 Quick Start

To launch the simulator locally with a single command, run:

```bash
# Builds the C++ engine and starts the React dashboard automatically
./start.sh
```

- **Dashboard UI** → http://localhost:5180
- **Engine API** → http://localhost:8080

---

## 🏗️ Architecture Overview

The system is decoupled into a robust C++ backend (the engine) and a modern React frontend (the dashboard). They communicate via a REST API.

### 1. The C++ Engine (`/engine`)
The backend is a **discrete-event simulator** built from scratch in C++.
- **Event Queue:** Time is not advanced linearly via a `sleep()` loop. Instead, the simulation jumps from event to event (e.g., `PROCESS_ARRIVAL`, `BURST_COMPLETE`) using a min-heap priority queue (`std::priority_queue`). This guarantees instantaneous simulation times, even for massive workloads spanning hours of simulated time.
- **REST Server:** Uses `cpp-httplib` to host a multithreaded HTTP API and `nlohmann/json` for fast serialization of Gantt charts and telemetry.
- **Schedulers:** Provides 9 distinct algorithms, all deriving from a pure virtual `Scheduler` base class.

### 2. The React Dashboard (`/dashboard`)
The frontend is a Vite-powered single-page application heavily styled with modern glassmorphism UI patterns via Tailwind CSS.
- **Gantt Chart Engine:** Dynamically renders processes over time using proportional block widths. Context switches are visually highlighted as striped penalty gaps.
- **Arena Mode:** A powerful benchmarking view that sends a single workload to all 9 algorithms simultaneously and renders 9 stacked Gantt charts along with a detailed comparison table.
- **Quantum Analyzer:** An interactive line chart built with Recharts that sweeps through 50 different Round Robin quantum values to mathematically identify the optimal time slice for a specific workload.

---

## 🧠 Supported Algorithms

1. **FCFS (First-Come, First-Served):** Non-preemptive. Simple queue based on arrival time.
2. **SJF (Shortest Job First):** Non-preemptive. Always picks the job with the shortest total burst.
3. **SRTF (Shortest Remaining Time First):** Preemptive SJF. Re-evaluates on every new arrival.
4. **Priority Scheduling (w/ Aging):** Preemptive. Schedules based on priority level. To prevent starvation, waiting processes age and gain priority every 5 ticks.
5. **Round Robin (RR):** Preemptive. Rotates through the ready queue, granting each process a maximum time slice (quantum).
6. **MLQ (Multilevel Queue):** Preemptive. Partitions processes into 3 static queues based on priority (High, Medium, Low). Higher priority queues strictly preempt lower ones.
7. **MLFQ (Multilevel Feedback Queue):** Preemptive. Processes start in Q0 (RR q=4). If they exhaust their quantum, they demote to Q1 (RR q=8), and eventually Q2 (FCFS).
8. **Lottery Scheduling:** Preemptive. Proportional-share randomized scheduling. Processes hold tickets; a random ticket is drawn to determine the next process.
9. **EDF (Earliest Deadline First):** Preemptive. Real-time scheduling algorithm. Processes are scheduled based on their absolute deadline (`arrival + deadline`).

---

## 🔌 API Reference

The C++ engine exposes several endpoints for headless usage:

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| GET | `/health` | — | Liveness check |
| POST | `/run` | `{processes, algorithm, quantum, context_switch_cost}` | Run one algorithm |
| POST | `/arena` | `{processes, quantum, context_switch_cost}` | Run all 9 algorithms in parallel |
| GET | `/generate` | `?type=convoy&n=8` | Generate adversarial workloads |
| GET | `/sweep_quantum` | `?type=random&n=8` | Sweep RR quantum 1–50 for charting |

### Workload Generators
You can ask the API to synthesize difficult scenarios via the `/generate` endpoint:
- `convoy` — Demonstrates the Convoy Effect (one massive CPU-bound process blocking many short I/O-bound processes).
- `starvation` — A flood of high-priority processes starving a low-priority job.
- `cpu_bound` — Heavy compute workloads (15–40 units).
- `io_bound` — Lightweight interactive tasks (1–6 units).
- `random` — A balanced, mixed workload.

---

## 🛠️ Building Manually

If you don't want to use `start.sh`, you can build and run the services independently:

```bash
# 1. Build & Run the C++ engine
cd engine
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel
./build/scheduler_engine

# 2. Start the dashboard (in a separate terminal window)
cd dashboard
npm install
npm run dev
```

---

## 🔮 Future Roadmap (Phase 6)
**Multi-Core SMP (Symmetric Multiprocessing)**: Multi-core support is currently stubbed in `EngineConfig::num_cpus`. The `GanttChart` component already supports a `cpu_id` per Gantt entry and can render separate parallel lanes per CPU. Implementing a work-stealing load balancer in the C++ engine is the next major milestone.
