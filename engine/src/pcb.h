#pragma once
#include <string>

enum class ProcessState { READY, RUNNING, WAITING, TERMINATED };

struct PCB {
    int     pid;
    std::string name;
    double  arrival_time;
    double  burst_time;
    double  remaining_time;
    int     priority;          // lower = higher priority
    int     effective_priority;
    double  start_time    = -1;
    double  finish_time   = -1;
    double  waiting_time  = 0;
    double  turnaround_time = 0;
    ProcessState state    = ProcessState::READY;

    PCB(int pid, std::string name, double arrival, double burst, int prio = 0)
        : pid(pid), name(std::move(name)),
          arrival_time(arrival), burst_time(burst),
          remaining_time(burst), priority(prio),
          effective_priority(prio) {}
};
