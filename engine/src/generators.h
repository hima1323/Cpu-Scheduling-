#pragma once
#include "pcb.h"
#include <vector>
#include <random>
#include <string>

// "The Convoy Maker": one long burst followed by many short ones
inline std::vector<PCB> convoiMaker(int n = 8) {
    std::vector<PCB> procs;
    procs.emplace_back(0, "Convoy", 0.0, 40.0, 0);
    for (int i = 1; i < n; ++i)
        procs.emplace_back(i, "P" + std::to_string(i), (double)i * 0.5, 2.0, 0);
    return procs;
}

// "The Starvation Trap": continuous high-priority arrivals starve a low-priority one
inline std::vector<PCB> starvationTrap(int n = 8) {
    std::vector<PCB> procs;
    procs.emplace_back(0, "LowPrio", 0.0, 20.0, 10);
    for (int i = 1; i < n; ++i)
        procs.emplace_back(i, "HP" + std::to_string(i), (double)i * 3.0, 5.0, 1);
    return procs;
}

// CPU-bound: large bursts
inline std::vector<PCB> cpuBound(int n = 6) {
    std::vector<PCB> procs;
    std::mt19937 rng(42);
    std::uniform_real_distribution<double> burst(15.0, 40.0);
    std::uniform_real_distribution<double> arrive(0.0, 10.0);
    for (int i = 0; i < n; ++i)
        procs.emplace_back(i, "CPU" + std::to_string(i), arrive(rng), burst(rng), 0);
    return procs;
}

// IO-bound: small bursts
inline std::vector<PCB> ioBound(int n = 8) {
    std::vector<PCB> procs;
    std::mt19937 rng(99);
    std::uniform_real_distribution<double> burst(1.0, 6.0);
    std::uniform_real_distribution<double> arrive(0.0, 5.0);
    for (int i = 0; i < n; ++i)
        procs.emplace_back(i, "IO" + std::to_string(i), arrive(rng), burst(rng), 0);
    return procs;
}

// Mixed random
inline std::vector<PCB> randomMixed(int n = 8, unsigned seed = 7) {
    std::vector<PCB> procs;
    std::mt19937 rng(seed);
    std::uniform_real_distribution<double> burst(1.0, 30.0);
    std::uniform_real_distribution<double> arrive(0.0, 15.0);
    std::uniform_int_distribution<int>     prio(0, 9);
    for (int i = 0; i < n; ++i)
        procs.emplace_back(i, "P" + std::to_string(i), arrive(rng), burst(rng), prio(rng));
    return procs;
}
