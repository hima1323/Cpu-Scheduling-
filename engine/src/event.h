#pragma once
#include <queue>
#include <vector>

enum class EventType {
    ARRIVAL,
    BURST_COMPLETE,
    PREEMPTION,
    CONTEXT_SWITCH_END,
    QUANTUM_EXPIRE,
    AGING_TICK
};

struct Event {
    double    time;
    EventType type;
    int       pid;

    // min-heap: smallest time first
    bool operator>(const Event& o) const { return time > o.time; }
};

using EventQueue = std::priority_queue<Event, std::vector<Event>, std::greater<Event>>;
