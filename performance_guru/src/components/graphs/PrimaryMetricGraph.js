import React from "react";
import grafanaMetrics from "../../config/grafanaMetrics";

const PrimaryMetricGraph = ({ primaryMetric, generateGrafanaUrl }) => {
  if (!primaryMetric) return null;
  const { db, metric } = primaryMetric;
  const { dashboard, panelId } = grafanaMetrics[db][metric];
  const url = generateGrafanaUrl(dashboard, panelId);
  const title = metric
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2 ">Primary Metric: {title}</h3>
      <iframe
        src={url}
        width="100%"
        height="400"
        frameBorder="0"
        title={`${title} Graph`}
        loading="lazy"
        className="rounded shadow"
      />
    </div>
  );
};

export default PrimaryMetricGraph;
