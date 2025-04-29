import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const TestStatus = ({ currentOpt, activeTab, statusLog }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div>
      <h2 className={`text-xl font-semibold mb-2 ${theme}`}>
        {currentOpt.name}
      </h2>
      <p className={`${theme}`}>{currentOpt.description}</p>

      <div
        className={`mb-6 p-4 bg-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm ${theme}`}
      >
        <h3 className={`text-lg font-semibold mb-2 ${theme}`}>
          Optimization Status
        </h3>
        <div
          className={`h-48 overflow-y-auto font-mono text-sm bg-white p-4 rounded border border-gray-200 dark:border-gray-600 ${theme}
          aria-live="polite"`}
        >
          <p className="mb-2">
            <span className="">[STATUS]</span>{" "}
            {statusLog[activeTab]?.status || "Idle"}
          </p>
          <div>
            <h4 className="text-sm font-medium mb-2">[COMMANDS]</h4>
            {statusLog[activeTab]?.commands?.length > 0 ? (
              <ul className="space-y-1">
                {statusLog[activeTab].commands.map((cmd, index) => (
                  <li key={index} className="flex">
                    <span>{cmd}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No commands executed yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestStatus;
