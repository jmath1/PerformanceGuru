import React from "react";

const DatabaseMetricsTabs = ({
  relevantMetrics,
  activeMetricTab,
  setActiveMetricTab,
}) => (
  <div className="flex border-b mb-4">
    {["mongodb", "redis", "postgres"].map(
      (db) =>
        relevantMetrics[db].length > 0 && (
          <button
            key={db}
            className={`px-4 py-2 capitalize text-sm font-medium ${
              activeMetricTab === db
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => setActiveMetricTab(db)}
            aria-label={`View ${db} metrics`}
          >
            {db}
          </button>
        )
    )}
  </div>
);

export default DatabaseMetricsTabs;
