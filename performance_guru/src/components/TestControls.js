import React from "react";

const TestControls = ({ runTest, isTesting, testStatus }) => (
  <>
    <div className="mb-6 flex gap-4">
      <button
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        onClick={() => runTest(false)}
        aria-label="Run unoptimized test"
      >
        Run Unoptimized Test
      </button>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        onClick={() => runTest(true)}
        aria-label="Run optimized test"
      >
        Run Optimized Test
      </button>
    </div>
    <p className="mb-6 text-sm text-gray-600 flex items-center">
      {isTesting && (
        <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></span>
      )}
      {testStatus}
    </p>
  </>
);

export default TestControls;
