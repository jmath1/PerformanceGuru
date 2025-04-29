import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ThemeContext } from "../contexts/ThemeContext";
import OptimizationTabsNav from "../components/OptimizationTabsNav";
import TestControls from "../components/TestControls";
import PrimaryMetricGraph from "../components/graphs/PrimaryMetricGraph";
import DatabaseMetricsTabs from "../components/graphs/DatabaseMetricsTabs";
import MetricGraph from "../components/graphs/MetricGraph";
import optimizationMetrics from "../config/optimizationMetrics";
import grafanaMetrics from "../config/grafanaMetrics";
import optimizations from "../config/optimizations";
import TestStatus from "../components/TestStatus";

const GRAFANA_BASE_URL = `http://${
  process.env.REACT_APP_GRAFANA_URL || "localhost"
}:3000/d-solo`;
const GRAFANA_PARAMS =
  "orgId=1&from=now-10m&to=now&timezone=browser&refresh=5s";
const API_BASE_URL = `http://${process.env.NODE_HOSTNAME || "0.0.0.0"}:${
  process.env.NODE_PORT || 3001
}`;

const PerformanceTest = () => {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("indexing");
  const [testStatus, setTestStatus] = useState("Not Testing");
  const [isTesting, setIsTesting] = useState(false);
  const [activeMetricTab, setActiveMetricTab] = useState("mongodb");
  const [statusLog, setStatusLog] = useState({});
  const [testResults, setTestResults] = useState(null);

  const generateGrafanaUrl = (dashboard, panelId) =>
    `${GRAFANA_BASE_URL}/${dashboard}/performance?${GRAFANA_PARAMS}&panelId=${panelId}&theme=${theme}`;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/config/status`);
        setStatusLog(data.statusLog);
      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const runTest = async (optimized) => {
    setIsTesting(true);
    setTestStatus("Configuring optimization...");
    setTestResults(null);

    try {
      const configResponse = await axios.post(
        `${API_BASE_URL}/config/${activeTab}`,
        { enable: optimized }
      );
      setTestStatus(configResponse.data.message);
      setStatusLog((prev) => ({
        ...prev,
        [activeTab]: configResponse.data.statusLog,
      }));

      setTestStatus("Running performance test...");
      const testResponse = await axios.post(`${API_BASE_URL}/test/start-test`, {
        optimization: activeTab,
        testType: "performance",
      });
      setTestStatus(
        `Test completed! Observe the changes in the ${
          primaryMetric
            ? primaryMetric.metric.replace(/([A-Z])/g, " $1")
            : "metrics"
        } graph below.`
      );
      setTestResults(testResponse.data.testResults);
    } catch (err) {
      console.error(err);
      setTestStatus(
        `Test failed: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setIsTesting(false);
    }
  };

  const currentOpt =
    optimizations.find((opt) => opt.id === activeTab) || optimizations[0];
  const relevantMetrics = optimizationMetrics[activeTab];

  const primaryMetric = (() => {
    if (relevantMetrics.mongodb.length)
      return { db: "mongodb", metric: relevantMetrics.mongodb[0] };
    if (relevantMetrics.redis.length)
      return { db: "redis", metric: relevantMetrics.redis[0] };
    if (relevantMetrics.postgres.length)
      return { db: "postgres", metric: relevantMetrics.postgres[0] };
    return null;
  })();

  return (
    <div className={`min-h-screen bg-gray-100 ${theme}`}>
      <div className={`container mx-auto p-6 ${theme}`}>
        <h1 className={`text-3xl font-bold mb-6 ${theme}`}>
          Performance Optimization Demo
        </h1>

        <OptimizationTabsNav
          optimizations={optimizations}
          activeTab={activeTab}
          setActiveTab={(id) => {
            setActiveTab(id);
            setTestResults(null);
            const metrics = optimizationMetrics[id];
            setActiveMetricTab(
              metrics.mongodb.length
                ? "mongodb"
                : metrics.redis.length
                ? "redis"
                : "postgres"
            );
          }}
        />

        <TestStatus
          currentOpt={currentOpt}
          activeTab={activeTab}
          statusLog={statusLog}
        />

        <TestControls
          runTest={runTest}
          isTesting={isTesting}
          testStatus={testStatus}
        />

        {testResults && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Performance Test Results
            </h3>
            {testResults.length > 0 ? (
              <table className="w-full text-sm text-gray-600 dark:text-gray-400">
                <thead>
                  <tr>
                    <th className="text-left p-2">Endpoint</th>
                    <th className="text-left p-2">Requests</th>
                    <th className="text-left p-2">Median (ms)</th>
                    <th className="text-left p-2">Avg (ms)</th>
                    <th className="text-left p-2">RPS</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr key={index}>
                      <td className="p-2">{result.name}</td>
                      <td className="p-2">{result.requests}</td>
                      <td className="p-2">{result.median}</td>
                      <td className="p-2">{result.avg}</td>
                      <td className="p-2">{result.rps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No results available.
              </p>
            )}
          </div>
        )}

        <PrimaryMetricGraph
          primaryMetric={primaryMetric}
          generateGrafanaUrl={generateGrafanaUrl}
        />

        <DatabaseMetricsTabs
          relevantMetrics={relevantMetrics}
          activeMetricTab={activeMetricTab}
          setActiveMetricTab={setActiveMetricTab}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {relevantMetrics[activeMetricTab].map((metric) => (
            <MetricGraph
              key={metric}
              metric={metric}
              db={activeMetricTab}
              generateGrafanaUrl={generateGrafanaUrl}
              grafanaMetrics={grafanaMetrics}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTest;
