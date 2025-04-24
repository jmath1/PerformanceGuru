const express = require("express");
const { mongoClient } = require("../config/database");

const router = express.Router();

router.post("/", async (req, res) => {
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

module.exports = router;
