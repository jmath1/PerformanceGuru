const express = require("express");
const { exec } = require("child_process");
const util = require("util");
const fs = require("fs").promises;
const execAsync = util.promisify(exec);
const { config, statusLog } = require("../config/state");
const { parseLocustResults } = require("../helpers/locustHelper");
const router = express.Router();

router.post("/start-test", async (req, res) => {
  const { optimization } = req.body;

  if (!optimization) {
    return res
      .status(400)
      .json({ message: `Invalid or missing optimization - ${optimization}` });
  }

  statusLog[optimization].status = "Running test";
  statusLog[optimization].commands.push(
    `Starting Locust test for ${optimization}...`
  );

  try {
    const locustCommand = `/app/locust_tests# /bin/bash -c "source /app/venv/bin/activate && locust -f ${optimization}_test.py --host=${process.env.NODE_HOSTNAME}:${process.env.NODE_PORT} --users=1000 --spawn-rate=10 --run-time=60s --headless --csv=locust_results"`;
    const { stdout, stderr } = await execAsync(locustCommand);

    statusLog[optimization].commands.push(`Locust: ${locustCommand}`);
    if (stderr) {
      statusLog[optimization].commands.push(`Locust stderr: ${stderr}`);
    }

    const results = await parseLocustResults("locust_results_stats.csv");
    statusLog[optimization].status = "Test completed";
    statusLog[optimization].commands.push("Test completed successfully");

    res.json({
      message: "Test completed",
      results,
      statusLog: statusLog[optimization],
    });
  } catch (err) {
    console.error(err);
    statusLog[optimization].status = "Error";
    statusLog[optimization].commands.push(`Error: ${err.message}`);
    res.status(500).json({ message: "Test failed", error: err.message });
  }
});

module.exports = router;
