import React, { useState, useContext } from "react";
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

const GRAFANA_BASE_URL = "http://localhost:3000/d-solo";
const GRAFANA_PARAMS =
  "orgId=1&from=now-10m&to=now&timezone=browser&refresh=5s";

const PerformanceTest = () => {
  const { theme } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState("indexing");
  const [testStatus, setTestStatus] = useState("Not Testing");
  const [isTesting, setIsTesting] = useState(false);
  const [activeMetricTab, setActiveMetricTab] = useState("mongodb");

  const generateGrafanaUrl = (dashboard, panelId) =>
    `${GRAFANA_BASE_URL}/${dashboard}/performance?${GRAFANA_PARAMS}&panelId=${panelId}&theme=${theme}`;

  const runTest = async (optimized) => {
    setIsTesting(true);
    setTestStatus("Running test...");
    try {
      await axios.post(`http://localhost:3000/config/${activeTab}`, {
        enable: optimized,
      });
      await axios.post("http://localhost:3000/start-test");
      setTestStatus(
        `Test completed! Observe the changes in the ${primaryMetric.metric.replace(
          /([A-Z])/g,
          " $1"
        )} graph below.`
      );
    } catch (err) {
      console.error(err);
      setTestStatus(`Test failed: ${err.message}`);
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
      <div
        className={`container mx-auto p-6 ${
          theme === "dark" ? "dark" : "light"
        }`}
      >
        <h1
          className={`text-3xl font-bold mb-6 ${
            theme === "dark" ? "dark" : "light"
          }`}
        >
          Performance Optimization Demo
        </h1>

        <OptimizationTabsNav
          optimizations={optimizations}
          activeTab={activeTab}
          setActiveTab={(id) => {
            setActiveTab(id);
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

        <div>
          <h2 className={`text-xl font-semibold mb-2 ${theme}`}>
            {currentOpt.name}
          </h2>
          <p className={`mb-6 text-gray-600 ${theme}`}>
            {currentOpt.description}
          </p>

          <TestControls
            runTest={runTest}
            isTesting={isTesting}
            testStatus={testStatus}
          />

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
    </div>
  );
};

export default PerformanceTest;
