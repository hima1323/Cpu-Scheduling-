#pragma once
#include "scheduler.h"
#include <deque>

class RoundRobin : public Scheduler {
    std::deque<PCB*> queue_;
    double quantum_;
public:
    explicit RoundRobin(double q = 4.0) : quantum_(q) {}

    void enqueue(PCB* p) override { queue_.push_back(p); }

    PCB* pickNext() override {
        if (queue_.empty()) return nullptr;
        PCB* p = queue_.front(); queue_.pop_front(); return p;
    }

    double getQuantum(PCB* p) const override { return quantum_; }
    double quantum() const { return quantum_; }
    bool isPreemptive() const override { return true; }
    bool isEmpty() const override { return queue_.empty(); }
    std::string name() const override { return "RR"; }
};
