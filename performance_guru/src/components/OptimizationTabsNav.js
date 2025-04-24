import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext"; // Import ThemeContext

const OptimizationTabsNav = ({ optimizations, activeTab, setActiveTab }) => {
  const { theme, toggleTheme } = useContext(ThemeContext); // Access theme and toggleTheme

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
      <button
        onClick={toggleTheme}
        className="ml-auto px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>
    </div>
  );
};

export default OptimizationTabsNav;
