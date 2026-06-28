#include "engine.h"
#include "rr.h"
#include <algorithm>
#include <cmath>
#include <map>

SimulationResult runSimulation(
    std::vector<PCB>    processes,
    Scheduler*          sched,
    const EngineConfig& cfg)
{
    SimulationResult result;
    EventQueue       evq;

    // Build pointer list, seed ARRIVAL events
    std::vector<PCB*> ptrs;
    for (auto& p : processes) {
        ptrs.push_back(&p);
        evq.push({p.arrival_time, EventType::ARRIVAL, p.pid});
    }

    auto findPCB = [&](int pid) -> PCB* {
        for (auto* p : ptrs) if (p->pid == pid) return p;
        return nullptr;
    };

    double clock     = 0.0;
    PCB*   running   = nullptr;
    double runStart  = 0.0;   // when the current process started its slice
    bool   in_ctx_sw = false;
    int    ctx_sw    = 0;
    double busy_time = 0.0;

    bool   is_rr  = (dynamic_cast<RoundRobin*>(sched) != nullptr);
    double quantum = is_rr ? dynamic_cast<RoundRobin*>(sched)->quantum() : cfg.time_quantum;

    // Helper: open a new gantt entry and schedule burst-complete
    auto startProcess = [&](PCB* p) {
        running  = p;
        runStart = clock;
        if (p->start_time < 0) p->start_time = clock;
        p->state = ProcessState::RUNNING;

        GanttEntry ge;
        ge.pid = p->pid; ge.name = p->name;
        ge.start = clock; ge.end = -1; ge.cpu_id = 0;
        result.gantt.push_back(ge);

        double run_for = is_rr
            ? std::min(quantum, p->remaining_time)
            : p->remaining_time;
        evq.push({clock + run_for, EventType::BURST_COMPLETE, p->pid});
    };

    // Helper: close current gantt block at 'at'
    auto closeGantt = [&](double at) {
        if (!result.gantt.empty() && result.gantt.back().end < 0) {
            result.gantt.back().end = at;
            busy_time += at - result.gantt.back().start;
        }
    };

    // Helper: emit context switch block + event
    auto doContextSwitch = [&]() {
        if (!sched->isEmpty()) {
            GanttEntry cs;
            cs.pid  = -1; cs.name = "CTX";
            cs.start = clock; cs.end = clock + cfg.context_switch_cost;
            cs.is_context_switch = true;
            result.gantt.push_back(cs);
            evq.push({clock + cfg.context_switch_cost, EventType::CONTEXT_SWITCH_END, -1});
            in_ctx_sw = true;
            ctx_sw++;
        } else {
            in_ctx_sw = false;
        }
    };

    while (!evq.empty()) {
        Event ev = evq.top(); evq.pop();
        clock = ev.time;
        sched->age(clock);

        switch (ev.type) {

        case EventType::ARRIVAL: {
            PCB* p = findPCB(ev.pid);
            if (!p) break;
            p->state = ProcessState::READY;

            if (!running && !in_ctx_sw) {
                // CPU idle — start immediately
                sched->enqueue(p);
                PCB* next = sched->pickNext();
                if (next) startProcess(next);
            } else if (running && sched->isPreemptive() && sched->shouldPreempt(running, p)) {
                // Preempt running: update remaining, close gantt, re-enqueue
                running->remaining_time -= (clock - runStart);
                if (running->remaining_time < 0) running->remaining_time = 0;
                closeGantt(clock);
                sched->enqueue(running);
                sched->enqueue(p);
                running = nullptr;
                doContextSwitch();
            } else {
                sched->enqueue(p);
            }
            break;
        }

        case EventType::BURST_COMPLETE: {
            PCB* p = findPCB(ev.pid);
            if (!p || p != running) break;  // stale event (preempted earlier)

            double sliceDone = clock - runStart;
            p->remaining_time -= sliceDone;
            if (p->remaining_time < 1e-9) p->remaining_time = 0;

            closeGantt(clock);

            if (p->remaining_time == 0) {
                p->finish_time     = clock;
                p->turnaround_time = clock - p->arrival_time;
                p->waiting_time    = p->turnaround_time - p->burst_time;
                if (p->waiting_time < 0) p->waiting_time = 0;
                p->state = ProcessState::TERMINATED;
            } else {
                // RR quantum expired
                p->state = ProcessState::READY;
                sched->enqueue(p);
            }

            running = nullptr;
            doContextSwitch();
            break;
        }

        case EventType::CONTEXT_SWITCH_END: {
            in_ctx_sw = false;
            if (sched->isEmpty()) break;
            PCB* next = sched->pickNext();
            if (next) startProcess(next);
            break;
        }

        default: break;
        }
    }

    // Close any open entry
    closeGantt(clock);

    // Finalise
    result.processes = processes;
    result.total_time = clock;
    result.total_ctx_switches = ctx_sw;
    result.cpu_utilization = (clock > 0) ? (busy_time / clock) * 100.0 : 0.0;

    double sum_wt = 0, sum_tat = 0;
    int done = 0;
    for (auto& p : result.processes) {
        if (p.finish_time >= 0) {
            sum_wt  += p.waiting_time;
            sum_tat += p.turnaround_time;
            done++;
        }
    }
    if (done > 0) {
        result.avg_waiting_time    = sum_wt  / done;
        result.avg_turnaround_time = sum_tat / done;
    }
    return result;
}
