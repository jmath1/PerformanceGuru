import React from "react";
import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

const DatabaseMetricsTabs = ({
  relevantMetrics,
  activeMetricTab,
  setActiveMetricTab,
}) => {
  const { theme } = useContext(ThemeContext);
  return (
    <div className="flex border-b mb-4">
      {["mongodb", "redis", "postgres"].map(
        (db) =>
          relevantMetrics[db].length > 0 && (
            <button
              key={db}
              className={`px-4 py-2 capitalize text-sm font-medium ${theme} ${
                activeMetricTab === db ? "border-b-2" : "hover:brightness-90"
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
};

export default DatabaseMetricsTabs;
