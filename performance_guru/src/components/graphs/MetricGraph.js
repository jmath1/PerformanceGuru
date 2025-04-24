import React from "react";

const MetricGraph = ({ metric, db, generateGrafanaUrl, grafanaMetrics }) => {
  const { dashboard, panelId, description } = grafanaMetrics[db][metric];
  const url = generateGrafanaUrl(dashboard, panelId);
  const title = metric
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">{title}</h3>
      <p className="mb-4 text-gray-600 text-sm">{description}</p>
      <iframe
        src={url}
        width="100%"
        height="300"
        frameBorder="0"
        title={`${title} Graph`}
        loading="lazy"
        className="rounded"
      />
    </div>
  );
};

export default MetricGraph;
