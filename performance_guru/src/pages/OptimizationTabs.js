import React, { useState } from "react";
import axios from "axios";

const OptimizationTabs = () => {
  const [activeTab, setActiveTab] = useState("indexing");
  const [testStatus, setTestStatus] = useState("");

  const optimizations = [
    {
      id: "indexing",
      name: "Database Indexing",
      description:
        "Indexes speed up data retrieval by avoiding full table scans. We index user_id (PostgreSQL) and task_id (MongoDB).",
      unoptimizedPanelId: 2,
      optimizedPanelId: 3,
    },
    {
      id: "caching",
      name: "Caching with Redis",
      description:
        "Caching stores task lists in Redis to avoid database queries, reducing latency by 50-80%.",
      unoptimizedPanelId: 4,
      optimizedPanelId: 5,
    },
    {
      id: "batching",
      name: "Query Batching",
      description:
        "Batching combines multiple inserts into one query, cutting latency by 50-80% for bulk operations.",
      unoptimizedPanelId: 6,
      optimizedPanelId: 7,
    },
    {
      id: "pagination",
      name: "Pagination",
      description:
        "Pagination limits fetched rows, speeding up queries by 2-10x for large datasets.",
      unoptimizedPanelId: 8,
      optimizedPanelId: 9,
    },
    {
      id: "pooling",
      name: "Connection Pooling",
      description:
        "Connection pooling reuses database connections, reducing latency by 30-50% under high load.",
      unoptimizedPanelId: 10,
      optimizedPanelId: 11,
    },
    {
      id: "async",
      name: "Asynchronous Queries",
      description:
        "Async queries run in parallel, cutting response time by 30-50% for multi-database calls.",
      unoptimizedPanelId: 12,
      optimizedPanelId: 13,
    },
  ];

  const runTest = async (optimized) => {
    setTestStatus("Running...");
    try {
      // Configure backend
      await axios.post(`http://localhost:3000/config/${activeTab}`, {
        enable: optimized,
      });
      // Trigger LocustIO test
      await axios.post("http://localhost:3000/start-test");
      setTestStatus("Test completed!");
    } catch (err) {
      console.error(err);
      setTestStatus("Test failed.");
    }
  };

  const getIframeSrc = (panelId) => {
    return `http://facebook.com/grafana/d-solo/your-dashboard-id?orgId=1&panelId=${panelId}&theme=light&kiosk`;
  };

  const currentOpt = optimizations.find((opt) => opt.id === activeTab);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Performance Optimization Demo</h1>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {optimizations.map((opt) => (
          <button
            key={opt.id}
            className={`px-4 py-2 ${
              activeTab === opt.id ? "border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setActiveTab(opt.id)}
          >
            {opt.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        <h2 className="text-xl font-semibold mb-2">{currentOpt.name}</h2>
        <p className="mb-4">{currentOpt.description}</p>

        {/* Buttons */}
        <div className="mb-4">
          <button
            className="bg-red-500 text-white px-4 py-2 mr-2 rounded"
            onClick={() => runTest(false)}
          >
            Run Unoptimized Test
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => runTest(true)}
          >
            Run Optimized Test
          </button>
        </div>
        <p className="mb-4">{testStatus}</p>

        {/* Grafana Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Unoptimized Metrics</h3>
            <iframe
              src={getIframeSrc(currentOpt.unoptimizedPanelId)}
              width="100%"
              height="400"
              frameBorder="0"
              title="Unoptimized Metrics"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Optimized Metrics</h3>
            <iframe
              src={getIframeSrc(currentOpt.optimizedPanelId)}
              width="100%"
              height="400"
              frameBorder="0"
              title="Optimized Metrics"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationTabs;
