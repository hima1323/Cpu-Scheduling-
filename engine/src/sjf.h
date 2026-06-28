#pragma once
#include "scheduler.h"
#include <vector>
#include <algorithm>

// Non-preemptive SJF
class SJF : public Scheduler {
    std::vector<PCB*> queue_;
public:
    void enqueue(PCB* p) override { queue_.push_back(p); }
    PCB* pickNext() override {
        if (queue_.empty()) return nullptr;
        auto it = std::min_element(queue_.begin(), queue_.end(),
            [](PCB* a, PCB* b){ return a->burst_time < b->burst_time; });
        PCB* p = *it; queue_.erase(it); return p;
    }
    bool isEmpty() const override { return queue_.empty(); }
    std::string name() const override { return "SJF"; }
};

// Preemptive SJF (Shortest Remaining Time First)
class SRTF : public Scheduler {
    std::vector<PCB*> queue_;
public:
    void enqueue(PCB* p) override { queue_.push_back(p); }
    PCB* pickNext() override {
        if (queue_.empty()) return nullptr;
        auto it = std::min_element(queue_.begin(), queue_.end(),
            [](PCB* a, PCB* b){ return a->remaining_time < b->remaining_time; });
        PCB* p = *it; queue_.erase(it); return p;
    }
    bool isPreemptive() const override { return true; }
    bool shouldPreempt(PCB* running, PCB* arrived) const override {
        return arrived && arrived->remaining_time < running->remaining_time;
    }
    bool isEmpty() const override { return queue_.empty(); }
    std::string name() const override { return "SRTF"; }
};
