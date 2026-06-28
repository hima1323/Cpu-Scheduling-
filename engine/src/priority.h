#pragma once
#include "scheduler.h"
#include <vector>
#include <algorithm>

class PriorityScheduler : public Scheduler {
    std::vector<PCB*> queue_;
    double last_age_time_ = 0;
    static constexpr double AGING_INTERVAL = 5.0; // every 5 time units
public:
    void enqueue(PCB* p) override { queue_.push_back(p); }

    PCB* pickNext() override {
        if (queue_.empty()) return nullptr;
        // Pick lowest effective_priority (lower number = higher priority)
        auto it = std::min_element(queue_.begin(), queue_.end(),
            [](PCB* a, PCB* b){ return a->effective_priority < b->effective_priority; });
        PCB* p = *it; queue_.erase(it); return p;
    }

    // Aging: bump effective priority of waiting processes
    void age(double current_time) override {
        if (current_time - last_age_time_ >= AGING_INTERVAL) {
            for (auto* p : queue_)
                if (p->effective_priority > 0) p->effective_priority--;
            last_age_time_ = current_time;
        }
    }

    bool isPreemptive() const override { return false; }
    bool isEmpty() const override { return queue_.empty(); }
    std::string name() const override { return "Priority"; }
};
