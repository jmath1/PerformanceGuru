import React from "react";
import "./App.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import PerformanceTest from "./pages/PerformanceTest";

function App() {
  return (
    <ThemeProvider>
      <PerformanceTest />
    </ThemeProvider>
  );
}

export default App;
