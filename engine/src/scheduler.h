#pragma once
#include "pcb.h"
#include <vector>
#include <deque>
#include <string>

struct GanttEntry {
    int         pid;
    std::string name;
    double      start;
    double      end;
    bool        is_context_switch = false;
    int         cpu_id            = 0;
};

struct SimulationResult {
    std::vector<GanttEntry> gantt;
    std::vector<PCB>        processes;
    double avg_waiting_time    = 0;
    double avg_turnaround_time = 0;
    double cpu_utilization     = 0;
    int    total_ctx_switches  = 0;
    double total_time          = 0;
};

// Abstract scheduler interface
class Scheduler {
public:
    virtual ~Scheduler() = default;
    // Called when a new process joins the ready queue
    virtual void enqueue(PCB* p) = 0;
    // Pick the next process to run (returns nullptr if queue empty)
    virtual PCB* pickNext() = 0;
    // Called every AGING_INTERVAL ticks to combat starvation
    virtual void age(double current_time) {}
    // True if this is a preemptive scheduler
    virtual bool isPreemptive() const { return false; }
    // True if the newly arrived process should preempt the running one
    virtual bool shouldPreempt(PCB* running, PCB* arrived) const { return false; }
    virtual std::string name() const = 0;
    virtual bool isEmpty() const = 0;
    
    // Return time quantum for this process. Return -1 to run until completion.
    virtual double getQuantum(PCB* p) const { return -1.0; }
    
    // Called when a process's quantum expires
    virtual void quantumExpired(PCB* p) {}
};
