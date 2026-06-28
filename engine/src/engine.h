#pragma once
#include "scheduler.h"
#include "event.h"
#include "pcb.h"
#include <vector>
#include <functional>
#include <string>

struct EngineConfig {
    double context_switch_cost = 0.5;
    double time_quantum        = 4.0;   // for RR
    int    num_cpus            = 1;
    double aging_interval      = 5.0;
};

SimulationResult runSimulation(
    std::vector<PCB>   processes,
    Scheduler*         sched,
    const EngineConfig& cfg = {}
);
