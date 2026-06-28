#pragma once
#include "scheduler.h"
#include <vector>
#include <random>

class LotteryScheduler : public Scheduler {
    std::vector<PCB*> queue_;
    double quantum_;
    std::mt19937 rng_;

public:
    explicit LotteryScheduler(double q = 4.0, unsigned seed = 42) 
        : quantum_(q), rng_(seed) {}

    void enqueue(PCB* p) override { queue_.push_back(p); }

    PCB* pickNext() override {
        if (queue_.empty()) return nullptr;

        int total_tickets = 0;
        for (auto* p : queue_) {
            total_tickets += p->tickets > 0 ? p->tickets : 1;
        }

        std::uniform_int_distribution<int> dist(0, total_tickets - 1);
        int winning_ticket = dist(rng_);

        int current_sum = 0;
        for (auto it = queue_.begin(); it != queue_.end(); ++it) {
            current_sum += (*it)->tickets > 0 ? (*it)->tickets : 1;
            if (current_sum > winning_ticket) {
                PCB* p = *it;
                queue_.erase(it);
                return p;
            }
        }
        
        // Fallback
        PCB* p = queue_.front();
        queue_.erase(queue_.begin());
        return p;
    }

    double getQuantum(PCB* p) const override { return quantum_; }
    bool isPreemptive() const override { return true; }
    bool isEmpty() const override { return queue_.empty(); }
    std::string name() const override { return "Lottery"; }
};
