const { pgPool, redis } = require("../config/database");
const { cacheHitCounter, cacheMissCounter } = require("../config/promMetrics");
const { mongoClient } = require("../config/database");
const { config, statusLog } = require("../config/state");
const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
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
      .db(process.env.MONGO_DB_NAME || "taskdb")
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

router.post("/", async (req, res) => {
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

module.exports = router;
