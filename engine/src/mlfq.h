#pragma once
#include "scheduler.h"
#include <deque>
#include <unordered_map>

class MultilevelFeedbackQueue : public Scheduler {
    std::deque<PCB*> q0_; // RR (q=4)
    std::deque<PCB*> q1_; // RR (q=8)
    std::deque<PCB*> q2_; // FCFS

    // Tracks which queue a process is currently in (0, 1, or 2)
    std::unordered_map<int, int> process_queue_;

    int getProcessQueue(PCB* p) const {
        auto it = process_queue_.find(p->pid);
        return (it != process_queue_.end()) ? it->second : 0;
    }

public:
    void enqueue(PCB* p) override {
        int qIdx = getProcessQueue(p);
        // Ensure it's in the map if it wasn't
        process_queue_[p->pid] = qIdx;
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
        // Preempt if newly arrived process is in a higher priority queue
        return getProcessQueue(arrived) < getProcessQueue(running);
    }

    double getQuantum(PCB* p) const override {
        // Can't call non-const getProcessQueue in const method, so use find
        auto it = process_queue_.find(p->pid);
        int qIdx = (it != process_queue_.end()) ? it->second : 0;
        
        if (qIdx == 0) return 4.0;
        if (qIdx == 1) return 8.0;
        return -1.0; // Q2 is FCFS
    }

    void quantumExpired(PCB* p) override {
        int qIdx = getProcessQueue(p);
        if (qIdx < 2) {
            process_queue_[p->pid] = qIdx + 1;
        }
    }

    std::string name() const override { return "MLFQ"; }
};
