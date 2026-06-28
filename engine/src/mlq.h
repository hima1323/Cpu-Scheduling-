#pragma once
#include "scheduler.h"
#include <deque>
#include <vector>

// Multilevel Queue (MLQ)
// 3 queues mapped by static priority:
// Q0: Priority 0-2 (High)
// Q1: Priority 3-5 (Medium)
// Q2: Priority 6+ (Low)
class MultilevelQueue : public Scheduler {
    std::deque<PCB*> q0_; // High
    std::deque<PCB*> q1_; // Med
    std::deque<PCB*> q2_; // Low

    int getQueueIndex(int priority) const {
        if (priority <= 2) return 0;
        if (priority <= 5) return 1;
        return 2;
    }

public:
    void enqueue(PCB* p) override {
        int qIdx = getQueueIndex(p->priority);
        if (qIdx == 0) q0_.push_back(p);
        else if (qIdx == 1) q1_.push_back(p);
        else q2_.push_back(p);
    }

    PCB* pickNext() override {
        if (!q0_.empty()) {
            PCB* p = q0_.front(); q0_.pop_front(); return p;
        }
        if (!q1_.empty()) {
            PCB* p = q1_.front(); q1_.pop_front(); return p;
        }
        if (!q2_.empty()) {
            PCB* p = q2_.front(); q2_.pop_front(); return p;
        }
        return nullptr;
    }

    bool isEmpty() const override {
        return q0_.empty() && q1_.empty() && q2_.empty();
    }

    bool isPreemptive() const override { return true; }

    bool shouldPreempt(PCB* running, PCB* arrived) const override {
        if (!running || !arrived) return false;
        return getQueueIndex(arrived->priority) < getQueueIndex(running->priority);
    }

    std::string name() const override { return "MLQ"; }
};
