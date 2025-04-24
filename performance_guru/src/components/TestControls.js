import React from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { useContext } from "react";

const TestControls = ({ runTest, isTesting, testStatus }) => {
  const { theme } = useContext(ThemeContext);
  const buttonStyles = {
    unoptimized:
      theme === "dark"
        ? "bg-red-700 hover:bg-red-800"
        : "bg-red-500 hover:bg-red-600",
    optimized:
      theme === "dark"
        ? "bg-green-700 hover:bg-green-800"
        : "bg-green-500 hover:bg-green-600",
  };

  return (
    <>
      <div className="mb-6 flex gap-4">
        <button
          className={`${buttonStyles.unoptimized} text-white px-4 py-2 rounded transition-colors`}
          onClick={() => runTest(false)}
          aria-label="Run unoptimized test"
        >
          Run Unoptimized Test
        </button>
        <button
          className={`${buttonStyles.optimized} text-white px-4 py-2 rounded transition-colors`}
          onClick={() => runTest(true)}
          aria-label="Run optimized test"
        >
          Run Optimized Test
        </button>
      </div>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 flex items-center">
        {isTesting && (
          <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></span>
        )}
        {testStatus}
      </p>
    </>
  );
};

export default TestControls;
