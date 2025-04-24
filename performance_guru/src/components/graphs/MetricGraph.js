import React, { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
const MetricGraph = ({ metric, db, generateGrafanaUrl, grafanaMetrics }) => {
  const { theme } = useContext(ThemeContext);
  const { dashboard, panelId, description } = grafanaMetrics[db][metric];
  const url = generateGrafanaUrl(dashboard, panelId);
  const title = metric
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
  return (
    <div className="border border-gray-500 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className={`mb-4 text-gray-600 ${theme} text-sm`}>{description}</p>
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
