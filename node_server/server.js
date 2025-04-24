const express = require("express");
const { Pool } = require("pg");
const { MongoClient } = require("mongodb");
const Redis = require("ioredis");
const promClient = require("prom-client");
const cors = require("cors");
const { exec } = require("child_process");

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Initialize Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10],
});
const cacheHitCounter = new promClient.Counter({
  name: "cache_hits_total",
  help: "Total number of cache hits",
});
const cacheMissCounter = new promClient.Counter({
  name: "cache_misses_total",
  help: "Total number of cache misses",
});
register.registerMetric(httpRequestDuration);
register.registerMetric(cacheHitCounter);
register.registerMetric(cacheMissCounter);

const pgPool = new Pool({
  host: "postgres",
  user: "admin",
  password: "password",
  database: "mydb",
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// if the relation 'tasks' does not exist, create it
pgPool.query(
  `CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
);

const mongoClient = new MongoClient(
  "mongodb://admin:password@mongodb:27017/taskdb?authSource=admin"
);
const redis = new Redis({ host: "redis", port: 6379 });

let config = {
  indexing: false,
  caching: false,
  batching: false,
  pagination: false,
  pooling: false,
  async: false,
};

// Middleware to measure request duration
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    end({ method: req.method, route: req.path, code: res.statusCode });
  });
  next();
});

// Configuration endpoints
app.post("/config/indexing", async (req, res) => {
  const { enable } = req.body;
  try {
    if (enable) {
      await pgPool.query(
        "CREATE INDEX IF NOT EXISTS idx_user_id ON tasks(user_id)"
      );
      await mongoClient
        .db("taskdb")
        .collection("comments")
        .createIndex({ task_id: 1 });
    } else {
      await pgPool.query("DROP INDEX IF EXISTS idx_user_id");
      await mongoClient
        .db("taskdb")
        .collection("comments")
        .dropIndex("task_id_1")
        .catch(() => {});
    }
    config.indexing = enable;
    res.send("Indexing configuration updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Configuration error");
  }
});

app.post("/config/caching", (req, res) => {
  config.caching = req.body.enable;
  res.send("Caching configuration updated");
});

app.post("/config/batching", (req, res) => {
  config.batching = req.body.enable;
  res.send("Batching configuration updated");
});

app.post("/config/pagination", (req, res) => {
  config.pagination = req.body.enable;
  res.send("Pagination configuration updated");
});

app.post("/config/pooling", async (req, res) => {
  const { enable } = req.body;
  try {
    await pgPool.end();
    poolConfig.max = enable ? 20 : 1;
    pgPool = new Pool(poolConfig);
    config.pooling = enable;
    res.send("Pooling configuration updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Configuration error");
  }
});

app.post("/config/async", (req, res) => {
  config.async = req.body.enable;
  res.send("Async configuration updated");
});

// API endpoints
app.get("/tasks", async (req, res) => {
  try {
    if (config.caching) {
      const cachedTasks = await redis.get("tasks");
      if (cachedTasks) {
        cacheHitCounter.inc();
        return res.json(JSON.parse(cachedTasks));
      }
      cacheMissCounter.inc();
    }

    let query = "SELECT * FROM tasks WHERE user_id = $1";
    const params = [req.query.user_id || 1];
    if (config.pagination) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      query += " ORDER BY created_at DESC LIMIT $2 OFFSET $3";
      params.push(limit, offset);
    }

    const tasksResult = pgPool.query(query, params);
    const commentsResult = mongoClient
      .db("taskdb")
      .collection("comments")
      .find({})
      .limit(100)
      .toArray();
    let tasks, comments;

    if (config.async) {
      [tasks, comments] = await Promise.all([tasksResult, commentsResult]);
      tasks = tasks.rows;
    } else {
      tasks = (await tasksResult).rows;
      comments = await commentsResult;
    }

    for (let task of tasks) {
      task.comments = comments.filter((c) => c.task_id === task.id);
    }

    if (config.caching) {
      await redis.set("tasks", JSON.stringify(tasks), "EX", 60);
    }
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/tasks", async (req, res) => {
  if (config.batching && Array.isArray(req.body)) {
    const tasks = req.body;
    const values = tasks.flatMap(({ title, user_id }, i) => [
      title,
      user_id,
      "pending",
    ]);
    const placeholders = tasks
      .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
      .join(", ");
    try {
      const result = await pgPool.query(
        `INSERT INTO tasks (title, user_id, status) VALUES ${placeholders} RETURNING *`,
        values
      );
      await redis.del("tasks");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  } else {
    const { title, user_id } = req.body;
    try {
      const result = await pgPool.query(
        "INSERT INTO tasks (title, user_id, status) VALUES ($1, $2, $3) RETURNING *",
        [title, user_id, "pending"]
      );
      await redis.del("tasks");
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
});

app.post("/comments", async (req, res) => {
  const { task_id, content } = req.body;
  try {
    const db = mongoClient.db("taskdb");
    const result = await db
      .collection("comments")
      .insertOne({ task_id, content, created_at: new Date() });
    res.json(result.ops[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Test trigger
app.post("/start-test", (req, res) => {
  const batchingFlag = config.batching ? "--batching=true" : "--batching=false";
  exec(
    `locust -f locustfile.py --host=http://${
      process.env.LOCUST_URL || "localhost"
    }:3000 --users=500 --spawn-rate=10 --run-time=60s --headless ${batchingFlag}`,
    (err) => {
      if (err) console.error(err);
    }
  );
  res.send("Test started");
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Start server
const PORT = 3001;
app.listen(PORT, async () => {
  await mongoClient.connect();
  console.log(`Server running on port ${PORT}`);
});
