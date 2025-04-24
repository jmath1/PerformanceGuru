import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const OptimizationTabsNav = ({ optimizations, activeTab, setActiveTab }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="flex border-b mb-6 items-center">
      {optimizations.map((opt) => (
        <button
          key={opt.id}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === opt.id
              ? "border-b-2 border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
          }`}
          onClick={() => setActiveTab(opt.id)}
          aria-label={`Select ${opt.name} optimization`}
        >
          {opt.name}
        </button>
      ))}
      <div className="ml-auto flex items-center">
        <span className="text-sm text-gray-500 dark:text-gray-300 mr-2">
          {theme === "light" ? "Light" : "Dark"}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={theme === "dark"}
            onChange={toggleTheme}
          />
          <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-blue-500 dark:bg-gray-600 rounded-full peer dark:peer-focus:ring-blue-400 peer-checked:bg-blue-400"></div>
          <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white border border-gray-200 rounded-full transition-transform peer-checked:translate-x-4 dark:border-gray-500"></div>
        </label>
      </div>
    </div>
  );
};

export default OptimizationTabsNav;
