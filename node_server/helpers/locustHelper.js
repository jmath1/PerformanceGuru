const fs = require("fs").promises;

async function parseLocustResults(file) {
  try {
    const data = await fs.readFile(file, "utf-8");
    const lines = data.split("\n").slice(1); // Skip header
    return lines
      .filter((line) => line)
      .map((line) => {
        const [method, name, requests, failures, median, avg, min, max, rps] =
          line.split(",");
        return { method, name, requests, failures, median, avg, min, max, rps };
      });
  } catch (err) {
    console.error("Error parsing Locust results:", err);
    return [];
  }
}

module.exports = { parseLocustResults };
