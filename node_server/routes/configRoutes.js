const express = require("express");
const { Pool } = require("pg");
const { pgPool, mongoClient, redis } = require("../config/database");
const { config, statusLog } = require("../config/state");

const router = express.Router();

function disableAllConfig() {
  config.indexing = false;
  config.caching = false;
  config.batching = false;
  config.pagination = false;
  config.pooling = false;
  config.async = false;

  statusLog.indexing.status = "Disabled";
  statusLog.caching.status = "Disabled";
  statusLog.batching.status = "Disabled";
  statusLog.pagination.status = "Disabled";
  statusLog.pooling.status = "Disabled";
  statusLog.async.status = "Disabled";
}

router.post("/indexing", async (req, res) => {
  disableAllConfig();
  const { enable } = req.body;
  console.log(enable);
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
    statusLog.indexing.commands = statusLog.indexing.commands.slice(-10);
    res.json({
      message: "Indexing configuration updated",
      statusLog: statusLog.indexing,
    });
  } catch (err) {
    console.error(err);
    statusLog.indexing.status = "Error";
    statusLog.indexing.commands.push(`Error: ${err.message}`);
    statusLog.indexing.commands = statusLog.indexing.commands.slice(-10);
    res
      .status(500)
      .json({ message: "Configuration error", error: err.message });
  }
});

router.post("/caching", async (req, res) => {
  disableAllConfig();
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
    statusLog.caching.commands = statusLog.caching.commands.slice(-10);
    res.json({
      message: "Caching configuration updated",
      statusLog: statusLog.caching,
    });
  } catch (err) {
    console.error(err);
    statusLog.caching.status = "Error";
    statusLog.caching.commands.push(`Error: ${err.message}`);
    statusLog.caching.commands = statusLog.caching.commands.slice(-10);
    res
      .status(500)
      .json({ message: "Configuration error", error: err.message });
  }
});

router.post("/batching", (req, res) => {
  disableAllConfig();
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
    statusLog.batching.commands = statusLog.batching.commands.slice(-10);
    res.json({
      message: "Batching configuration updated",
      statusLog: statusLog.batching,
    });
  } catch (err) {
    console.error(err);
    statusLog.batching.status = "Error";
    statusLog.batching.commands.push(`Error: ${err.message}`);
    statusLog.batching.commands = statusLog.batching.commands.slice(-10);
    res
      .status(500)
      .json({ message: "Configuration error", error: err.message });
  }
});

router.post("/pagination", (req, res) => {
  disableAllConfig();
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
    statusLog.pagination.commands = statusLog.pagination.commands.slice(-10);
    res.json({
      message: "Pagination configuration updated",
      statusLog: statusLog.pagination,
    });
  } catch (err) {
    console.error(err);
    statusLog.pagination.status = "Error";
    statusLog.pagination.commands.push(`Error: ${err.message}`);
    statusLog.pagination.commands = statusLog.pagination.commands.slice(-10);
    res
      .status(500)
      .json({ message: "Configuration error", error: err.message });
  }
});

router.post("/pooling", async (req, res) => {
  disableAllConfig();
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
      host: process.env.PG_HOST || "postgres",
      user: process.env.PG_USER || "admin",
      password: process.env.PG_PASSWORD || "password",
      database: process.env.PG_DATABASE || "mydb",
      port: parseInt(process.env.PG_PORT, 10) || 5432,
      max: enable ? 20 : 1,
      idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT, 10) || 30000,
      connectionTimeoutMillis:
        parseInt(process.env.PG_CONNECTION_TIMEOUT, 10) || 2000,
    };
    const newPool = new Pool(poolConfig);
    Object.assign(pgPool, newPool);
    config.pooling = enable;
    statusLog.pooling.status = "Idle";
    statusLog.pooling.commands.push(
      `PostgreSQL: Set connection pool max to ${poolConfig.max}`
    );
    statusLog.pooling.commands = statusLog.pooling.commands.slice(-10);
    res.json({
      message: "Pooling configuration updated",
      statusLog: statusLog.pooling,
    });
  } catch (err) {
    console.error(err);
    statusLog.pooling.status = "Error";
    statusLog.pooling.commands.push(`Error: ${err.message}`);
    statusLog.pooling.commands = statusLog.pooling.commands.slice(-10);
    res
      .status(500)
      .json({ message: "Configuration error", error: err.message });
  }
});

router.post("/async", (req, res) => {
  disableAllConfig();
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
    statusLog.async.commands = statusLog.async.commands.slice(-10);
    res.json({
      message: "Async configuration updated",
      statusLog: statusLog.async,
    });
  } catch (err) {
    console.error(err);
    statusLog.async.status = "Error";
    statusLog.async.commands.push(`Error: ${err.message}`);
    statusLog.async.commands = statusLog.async.commands.slice(-10);
    res
      .status(500)
      .json({ message: "Configuration error", error: err.message });
  }
});

router.get("/status", (req, res) => {
  res.json({ config, statusLog });
});

module.exports = router;
