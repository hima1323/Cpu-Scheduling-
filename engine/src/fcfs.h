#pragma once
#include "scheduler.h"
#include <deque>

class FCFS : public Scheduler {
    std::deque<PCB*> queue_;
public:
    void enqueue(PCB* p) override { queue_.push_back(p); }
    PCB* pickNext() override {
        if (queue_.empty()) return nullptr;
        PCB* p = queue_.front(); queue_.pop_front(); return p;
    }
    bool isEmpty() const override { return queue_.empty(); }
    std::string name() const override { return "FCFS"; }
};
