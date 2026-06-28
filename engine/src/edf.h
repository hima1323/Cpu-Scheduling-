#pragma once
#include "scheduler.h"
#include <vector>
#include <algorithm>

class EarliestDeadlineFirst : public Scheduler {
    std::vector<PCB*> queue_;

    double getAbsoluteDeadline(PCB* p) const {
        return p->arrival_time + p->deadline;
    }

public:
    void enqueue(PCB* p) override { queue_.push_back(p); }

    PCB* pickNext() override {
        if (queue_.empty()) return nullptr;
        
        auto it = std::min_element(queue_.begin(), queue_.end(),
            [this](PCB* a, PCB* b) {
                return getAbsoluteDeadline(a) < getAbsoluteDeadline(b);
            });
            
        PCB* p = *it;
        queue_.erase(it);
        return p;
    }

    bool isPreemptive() const override { return true; }

    bool shouldPreempt(PCB* running, PCB* arrived) const override {
        if (!running || !arrived) return false;
        return getAbsoluteDeadline(arrived) < getAbsoluteDeadline(running);
    }

    bool isEmpty() const override { return queue_.empty(); }
    std::string name() const override { return "EDF"; }
};
