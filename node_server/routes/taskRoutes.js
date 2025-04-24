const express = require("express");
const { pgPool, mongoClient, redis } = require("../config/database");
const { config, statusLog } = require("../config/state");

const router = express.Router();

router.post("/indexing", async (req, res) => {
  const { enable } = req.body;
  statusLog.indexing.status = enable ? "Enabling" : "Disabling";
  statusLog.indexing.commands.push(
    enable ? "Creating indexes..." : "Dropping indexes..."
  );
  try {
    if (enable) {
      const pgCommand =
        "CREATE INDEX IF NOT EXISTS idx_user_id ON tasks(user_id)";
      const mongoCommand = "db.comments.createIndex({ task_id: 1 })";
      await pgPool.query(pgCommand);
      await mongoClient
        .db("taskdb")
        .collection("comments")
        .createIndex({ task_id: 1 });
      statusLog.indexing.commands.push(
        `PostgreSQL: ${pgCommand}`,
        `MongoDB: ${mongoCommand}`
      );
    } else {
      const pgCommand = "DROP INDEX IF EXISTS idx_user_id";
      const mongoCommand = "db.comments.dropIndex('task_id_1')";
      await pgPool.query(pgCommand);
      await mongoClient
        .db("taskdb")
        .collection("comments")
        .dropIndex("task_id_1")
        .catch(() => {});
      statusLog.indexing.commands.push(
        `PostgreSQL: ${pgCommand}`,
        `MongoDB: ${mongoCommand}`
      );
    }
    config.indexing = enable;
    statusLog.indexing.status = "Idle";
    res.json({
      message: "Indexing configuration updated",
      statusLog: statusLog.indexing,
    });
  } catch (err) {
    console.error(err);
    statusLog.indexing.status = "Error";
    statusLog.indexing.commands.push(`Error: ${err.message}`);
    res
      .status(500)
      .json({ message: "Configuration error", error: err.message });
  }
});

router.post("/caching", async (req, res) => {
  const { enable } = req.body;
  statusLog.caching.status = enable ? "Enabling" : "Disabling";
  statusLog.caching.commands.push(
    enable ? "Enabling Redis caching..." : "Disabling Redis caching..."
  );
  try {
    if (enable) {
      await redis.config("SET", "maxmemory", "512mb");
      await redis.config("SET", "maxmemory-policy", "allkeys-lru");
      statusLog.caching.commands.push(
        "Redis: CONFIG SET maxmemory 512mb",
        "Redis: CONFIG SET maxmemory-policy allkeys-lru"
      );
    } else {
      await redis.flushall();
      statusLog.caching.commands.push("Redis: FLUSHALL");
    }
    config.caching = enable;
    statusLog.caching.status = "Idle";
    res.json({
      message: "Caching configuration updated",
      statusLog: statusLog.caching,
    });
  } catch (err) {
    console.error(err);
    statusLog.caching.status = "Error";
    statusLog.caching.commands.push(`Error: ${err.message}`);
    res
      .status(500)
      .json({ message: "Configuration error", error: err.message });
  }
});

router.post("/batching", (req, res) => {
  const { enable } = req.body;
  statusLog.batching.status = enable ? "Enabling" : "Disabling";
  statusLog.batching.commands.push(
    enable ? "Enabling batch inserts..." : "Disabling batch inserts..."
  );
  try {
    config.batching = enable;
    statusLog.batching.status = "Idle";
    statusLog.batching.commands.push(
      enable
        ? "Server: Enabled batch INSERT for tasks"
        : "Server: Disabled batch INSERT for tasks"
    );
    res.json({
      message: "Batching configuration updated",
      statusLog: statusLog.batching,
    });
  } catch (err) {
    console.error(err);
    statusLog.batching.status = "Error";
    statusLog.batching.commands.push(`Error: ${err.message}`);
    res
      .status(500)
      .json({ message: "Configuration error", error: err.message });
  }
});

router.post("/pagination", (req, res) => {
  const { enable } = req.body;
  statusLog.pagination.status = enable ? "Enabling" : "Disabling";
  statusLog.pagination.commands.push(
    enable ? "Enabling pagination..." : "Disabling pagination..."
  );
  try {
    config.pagination = enable;
    statusLog.pagination.status = "Idle";
    statusLog.pagination.commands.push(
      enable
        ? "Server: Enabled pagination for tasks query"
        : "Server: Disabled pagination for tasks query"
    );
    res.json({
      message: "Pagination configuration updated",
      statusLog: statusLog.pagination,
    });
  } catch (err) {
    console.error(err);
    statusLog.pagination.status = "Error";
    statusLog.pagination.commands.push(`Error: ${err.message}`);
    res
      .status(500)
      .json({ message: "Configuration error", error: err.message });
  }
});

router.post("/pooling", async (req, res) => {
  const { enable } = req.body;
  statusLog.pooling.status = enable ? "Enabling" : "Disabling";
  statusLog.pooling.commands.push(
    enable
      ? "Enabling connection pooling..."
      : "Disabling connection pooling..."
  );
  try {
    await pgPool.end();
    const poolConfig = {
      host: "postgres",
      user: "admin",
      password: "password",
      database: "mydb",
      port: 5432,
      max: enable ? 20 : 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
    pgPool = new Pool(poolConfig);
    config.pooling = enable;
    statusLog.pooling.status = "Idle";
    statusLog.pooling.commands.push(
      `PostgreSQL: Set connection pool max to ${poolConfig.max}`
    );
    res.json({
      message: "Pooling configuration updated",
      statusLog: statusLog.pooling,
    });
  } catch (err) {
    console.error(err);
    statusLog.pooling.status = "Error";
    statusLog.pooling.commands.push(`Error: ${err.message}`);
    res
      .status(500)
      .json({ message: "Configuration error", error: err.message });
  }
});

router.post("/async", (req, res) => {
  const { enable } = req.body;
  statusLog.async.status = enable ? "Enabling" : "Disabling";
  statusLog.async.commands.push(
    enable ? "Enabling async queries..." : "Disabling async queries..."
  );
  try {
    config.async = enable;
    statusLog.async.status = "Idle";
    statusLog.async.commands.push(
      enable
        ? "Server: Enabled parallel query execution"
        : "Server: Disabled parallel query execution"
    );
    res.json({
      message: "Async configuration updated",
      statusLog: statusLog.async,
    });
  } catch (err) {
    console.error(err);
    statusLog.async.status = "Error";
    statusLog.async.commands.push(`Error: ${err.message}`);
    res
      .status(500)
      .json({ message: "Configuration error", error: err.message });
  }
});

// Status endpoint
router.get("/status", (req, res) => {
  res.json({ config, statusLog });
});

module.exports = router;
