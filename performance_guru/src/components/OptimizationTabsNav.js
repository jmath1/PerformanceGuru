import React from "react";

const OptimizationTabsNav = ({ optimizations, activeTab, setActiveTab }) => (
  <div className="flex border-b mb-6">
    {optimizations.map((opt) => (
      <button
        key={opt.id}
        className={`px-4 py-2 text-sm font-medium ${
          activeTab === opt.id
            ? "border-b-2 border-blue-500 text-blue-600"
            : "text-gray-600 hover:text-blue-500"
        }`}
        onClick={() => setActiveTab(opt.id)}
        aria-label={`Select ${opt.name} optimization`}
      >
        {opt.name}
      </button>
    ))}
  </div>
);

export default OptimizationTabsNav;
