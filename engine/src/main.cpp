#include "engine.h"
#include "engine.cpp"   // single-TU build
#include "fcfs.h"
#include "sjf.h"
#include "priority.h"
#include "rr.h"
#include "mlq.h"
#include "mlfq.h"
#include "lottery.h"
#include "edf.h"
#include "generators.h"
#include "../vendor/json.hpp"
#include "../vendor/httplib.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <memory>
#include <stdexcept>

using json = nlohmann::json;

// ── Serialize SimulationResult → JSON ────────────────────────────────────────
json resultToJson(const SimulationResult& r, const std::string& algo) {
    json j;
    j["algorithm"]            = algo;
    j["avg_waiting_time"]     = r.avg_waiting_time;
    j["avg_turnaround_time"]  = r.avg_turnaround_time;
    j["cpu_utilization"]      = r.cpu_utilization;
    j["total_ctx_switches"]   = r.total_ctx_switches;
    j["total_time"]           = r.total_time;

    json gantt = json::array();
    for (auto& g : r.gantt) {
        gantt.push_back({
            {"pid",  g.pid},
            {"name", g.name},
            {"start",g.start},
            {"end",  g.end},
            {"is_context_switch", g.is_context_switch},
            {"cpu_id", g.cpu_id}
        });
    }
    j["gantt"] = gantt;

    json procs = json::array();
    for (auto& p : r.processes) {
        procs.push_back({
            {"pid",            p.pid},
            {"name",           p.name},
            {"arrival_time",   p.arrival_time},
            {"burst_time",     p.burst_time},
            {"priority",       p.priority},
            {"deadline",       p.deadline},
            {"tickets",        p.tickets},
            {"finish_time",    p.finish_time},
            {"waiting_time",   p.waiting_time},
            {"turnaround_time",p.turnaround_time}
        });
    }
    j["processes"] = procs;
    return j;
}

// ── Parse processes from JSON body ───────────────────────────────────────────
std::vector<PCB> parseProcesses(const json& body) {
    std::vector<PCB> procs;
    for (auto& item : body["processes"]) {
        int    pid     = item.value("pid", (int)procs.size());
        std::string nm = item.value("name", "P" + std::to_string(pid));
        double arrive  = item.value("arrival_time", 0.0);
        double burst   = item.value("burst_time", 1.0);
        int    prio    = item.value("priority", 0);
        double deadline = item.value("deadline", 100.0);
        int    tickets  = item.value("tickets", 10);
        procs.emplace_back(pid, nm, arrive, burst, prio, deadline, tickets);
    }
    return procs;
}

// ── Build scheduler from string ───────────────────────────────────────────────
std::unique_ptr<Scheduler> makeScheduler(const std::string& algo, double q) {
    if (algo == "FCFS")     return std::make_unique<FCFS>();
    if (algo == "SJF")      return std::make_unique<SJF>();
    if (algo == "SRTF")     return std::make_unique<SRTF>();
    if (algo == "Priority") return std::make_unique<PriorityScheduler>();
    if (algo == "RR")       return std::make_unique<RoundRobin>(q);
    if (algo == "MLQ")      return std::make_unique<MultilevelQueue>();
    if (algo == "MLFQ")     return std::make_unique<MultilevelFeedbackQueue>();
    if (algo == "Lottery")  return std::make_unique<LotteryScheduler>(q);
    if (algo == "EDF")      return std::make_unique<EarliestDeadlineFirst>();
    throw std::invalid_argument("Unknown algorithm: " + algo);
}

// ── CORS helper ───────────────────────────────────────────────────────────────
void addCORS(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin",  "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
}

int main() {
    // ── Phase 1 Validation: write static output.json ─────────────────────────
    {
        std::vector<PCB> demo = {
            {0, "Alpha",   0, 10, 0},
            {1, "Beta",    2,  6, 0},
            {2, "Gamma",   4,  2, 0},
            {3, "Delta",   6,  4, 0},
            {4, "Epsilon", 8,  8, 0},
        };
        FCFS fcfs;
        EngineConfig cfg; cfg.context_switch_cost = 0.5;
        auto res = runSimulation(demo, &fcfs, cfg);
        json j   = resultToJson(res, "FCFS");
        std::ofstream out("output.json");
        out << j.dump(2);
        std::cout << "[Phase 1] output.json written.\n";
    }

    // ── HTTP Server ───────────────────────────────────────────────────────────
    httplib::Server svr;

    // Health check
    svr.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        addCORS(res);
        res.set_content(R"({"status":"ok"})", "application/json");
    });

    // OPTIONS preflight
    svr.Options(".*", [](const httplib::Request&, httplib::Response& res) {
        addCORS(res);
        res.status = 204;
    });

    // POST /run — single algorithm
    svr.Post("/run", [](const httplib::Request& req, httplib::Response& res) {
        addCORS(res);
        try {
            json body  = json::parse(req.body);
            std::string algo = body.value("algorithm", "FCFS");
            double q         = body.value("quantum", 4.0);
            double ctx_cost  = body.value("context_switch_cost", 0.5);

            EngineConfig cfg;
            cfg.context_switch_cost = ctx_cost;
            cfg.time_quantum        = q;

            auto sched    = makeScheduler(algo, q);
            auto procs    = parseProcesses(body);
            auto result   = runSimulation(procs, sched.get(), cfg);
            json j        = resultToJson(result, algo);
            res.set_content(j.dump(), "application/json");
        } catch (std::exception& e) {
            res.status = 400;
            res.set_content(json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // POST /arena — run all 4 algorithms and return array
    svr.Post("/arena", [](const httplib::Request& req, httplib::Response& res) {
        addCORS(res);
        try {
            json body    = json::parse(req.body);
            double q     = body.value("quantum", 4.0);
            double ctx   = body.value("context_switch_cost", 0.5);
            auto procs   = parseProcesses(body);

            EngineConfig cfg;
            cfg.context_switch_cost = ctx;
            cfg.time_quantum        = q;

            std::vector<std::string> algos = {"FCFS", "SJF", "SRTF", "Priority", "RR", "MLQ", "MLFQ", "Lottery", "EDF"};
            json results = json::array();
            for (auto& algo : algos) {
                auto sched  = makeScheduler(algo, q);
                auto p_copy = procs;
                auto r      = runSimulation(p_copy, sched.get(), cfg);
                results.push_back(resultToJson(r, algo));
            }
            res.set_content(results.dump(), "application/json");
        } catch (std::exception& e) {
            res.status = 400;
            res.set_content(json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // GET /generate?type=convoy&n=8
    svr.Get("/generate", [](const httplib::Request& req, httplib::Response& res) {
        addCORS(res);
        std::string type = req.get_param_value("type");
        int n = 8;
        if (req.has_param("n")) n = std::stoi(req.get_param_value("n"));

        std::vector<PCB> procs;
        if      (type == "convoy")     procs = convoiMaker(n);
        else if (type == "starvation") procs = starvationTrap(n);
        else if (type == "cpu_bound")  procs = cpuBound(n);
        else if (type == "io_bound")   procs = ioBound(n);
        else                           procs = randomMixed(n);

        json j = json::array();
        for (auto& p : procs)
            j.push_back({{"pid",p.pid},{"name",p.name},
                         {"arrival_time",p.arrival_time},
                         {"burst_time",p.burst_time},
                         {"priority",p.priority}});
        res.set_content(j.dump(), "application/json");
    });

    // GET /sweep_quantum?n=8&type=random — sweep q from 1..50
    svr.Get("/sweep_quantum", [](const httplib::Request& req, httplib::Response& res) {
        addCORS(res);
        std::string type = req.get_param_value("type");
        int n = 8;
        if (req.has_param("n")) n = std::stoi(req.get_param_value("n"));
        double ctx = 0.5;

        std::vector<PCB> base;
        if      (type == "convoy")     base = convoiMaker(n);
        else if (type == "starvation") base = starvationTrap(n);
        else if (type == "cpu_bound")  base = cpuBound(n);
        else if (type == "io_bound")   base = ioBound(n);
        else                           base = randomMixed(n);

        json arr = json::array();
        for (int q = 1; q <= 50; ++q) {
            RoundRobin rr(q);
            EngineConfig cfg; cfg.context_switch_cost = ctx; cfg.time_quantum = q;
            auto p_copy = base;
            auto r = runSimulation(p_copy, &rr, cfg);
            arr.push_back({
                {"quantum", q},
                {"avg_waiting_time",    r.avg_waiting_time},
                {"avg_turnaround_time", r.avg_turnaround_time},
                {"cpu_utilization",     r.cpu_utilization},
                {"total_ctx_switches",  r.total_ctx_switches}
            });
        }
        res.set_content(arr.dump(), "application/json");
    });

    std::cout << "[Engine] Listening on http://localhost:8080\n";
    svr.listen("0.0.0.0", 8080);
    return 0;
}
